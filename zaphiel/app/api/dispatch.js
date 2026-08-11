/* Voice → worker bridge.
 *
 * Ryan says "build me X" out loud. The app POSTs {task} here. This wakes a real
 * Claude session — the Routine, with every connector attached — which goes and
 * builds it while he carries on with his day.
 *
 * Why this proxy exists at all: firing a Routine needs a bearer token, and the
 * voice app is a public page. A token shipped in client-side JavaScript is a
 * token anyone can read and use to spend Ryan's usage. So the token lives here,
 * in a Vercel environment variable, and never reaches the browser.
 *
 * Required environment variables (Vercel → Project → Settings → Environment Variables):
 *   ROUTINE_FIRE_URL  https://api.anthropic.com/v1/claude_code/routines/<id>/fire
 *   ROUTINE_TOKEN     the bearer token from the Routine's API trigger modal
 *                     (shown once — copy it there and then)
 *   DISPATCH_KEY      any long random string you also put in the app, so a
 *                     stranger who finds this endpoint cannot fire Ryan's routine
 */

const FIRE_BETA = "experimental-cc-routine-2026-04-01";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Dispatch-Key");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { ROUTINE_FIRE_URL, ROUTINE_TOKEN, DISPATCH_KEY } = process.env;
  if (!ROUTINE_FIRE_URL || !ROUTINE_TOKEN) {
    /* Not wired up yet. Say so plainly rather than pretending the work started. */
    return res.status(503).json({
      error: "not_configured",
      message: "No Routine is wired up yet. Set ROUTINE_FIRE_URL and ROUTINE_TOKEN in Vercel.",
    });
  }
  if (DISPATCH_KEY && req.headers["x-dispatch-key"] !== DISPATCH_KEY) {
    return res.status(401).json({ error: "bad_key" });
  }

  const task = (req.body && req.body.task ? String(req.body.task) : "").trim();
  if (!task) return res.status(400).json({ error: "no_task" });
  if (task.length > 4000) return res.status(413).json({ error: "task_too_long" });

  /* Fire text arrives at the Routine wrapped as untrusted data, so the Routine's
     own prompt has to opt into acting on it. Say explicitly that this came from
     Ryan's voice and is the task for this run. */
  const text =
    "SPOKEN TASK FROM RYAN, captured by the Zaphiel voice app. This is the job for this run — " +
    "do it instead of picking your own work from the open loops, but keep every hard rule in " +
    "your instructions (no publishing, no invented numbers, compliance absolute).\n\n" +
    "Do not reply with questions — Ryan is not at a keyboard and nobody will answer. Make the " +
    "call, build the thing, and name your assumptions at the end.\n\n" +
    "If the task is about ads, creative, product images or video, follow " +
    "zaphiel/playbooks/ad-lab.md exactly — it is the procedure for scanning a brand and " +
    "producing finished creative, and it carries the compliance gate. If it is about a " +
    "website with scroll animation, follow zaphiel/playbooks/cinematic-3d-sites.md. " +
    "Report the exact credit cost of any generation.\n\nRyan said: " + task;

  try {
    const r = await fetch(ROUTINE_FIRE_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + ROUTINE_TOKEN,
        "anthropic-beta": FIRE_BETA,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(502).json({ error: "fire_failed", status: r.status, detail: data });
    }
    return res.status(200).json({
      ok: true,
      sessionUrl: data.claude_code_session_url || null,
      sessionId: data.claude_code_session_id || null,
    });
  } catch (e) {
    return res.status(502).json({ error: "unreachable", message: String(e && e.message) });
  }
}
