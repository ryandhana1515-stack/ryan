/* Regression test for the Zaphiel free-voice loop.
 *
 * Reproduces exactly what Ryan hit on 2026-08-11: the greeting plays, then the
 * microphone never comes back. Recognition ends after every utterance on every
 * browser, so the engine dying is normal — what matters is that it always restarts.
 *
 *   npm i playwright && node zaphiel/app/test/voice-loop.test.mjs
 *
 * Both Web Speech APIs are stubbed, so this runs headless with no audio hardware
 * and no speech service. It asserts the microphone is live after: the greeting,
 * a reply, a second reply, and an utterance the browser silently drops.
 */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const APP = path.join(import.meta.dirname, "..", "index.html");
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(fs.readFileSync(APP));
});
await new Promise(r => server.listen(8099, r));

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const ctx = await browser.newContext({ permissions: ["microphone"] });

/* Stub the two Web Speech APIs so we control their timing and can count calls. */
await ctx.addInitScript(() => {
  window.__log = { starts: 0, speaks: 0, errors: [] };
  class FakeRec {
    constructor() { this.running = false; window.__rec = this; }
    start() {
      if (this.running) throw new DOMException("already started", "InvalidStateError");
      this.running = true; window.__log.starts++;
      setTimeout(() => this.onstart && this.onstart(), 0);
    }
    stop()  { if (!this.running) return; this.running = false; setTimeout(() => this.onend && this.onend(), 0); }
    abort() { if (!this.running) return; this.running = false; setTimeout(() => this.onend && this.onend(), 0); }
    /* helper the test drives */
    say(text) {
      this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: text }], { isFinal: true })] });
      this.stop();                       /* real engines end the session after a final result */
    }
  }
  window.SpeechRecognition = FakeRec;
  window.webkitSpeechRecognition = FakeRec;

  const voices = [
    { name: "Google UK English Male", lang: "en-GB", localService: false },
    { name: "Samantha", lang: "en-US", localService: true },
  ];
  /* speechSynthesis is a read-only accessor on window; plain assignment is a no-op. */
  const synth = {
    getVoices: () => voices,
    cancel() {},
    speak(u) {
      window.__log.speaks++;
      window.__lastUtterance = u;
      if (window.__muteSynth) return;                 /* simulate Safari dropping it silently */
      setTimeout(() => u.onstart && u.onstart(), 5);
      setTimeout(() => u.onend && u.onend(), 60);     /* short utterance */
    },
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
});

const page = await ctx.newPage();
page.on("pageerror", e => console.log("PAGE ERROR:", e.message));
page.on("console", m => { if (m.type() === "error") console.log("CONSOLE ERROR:", m.text()); });

await page.goto("http://localhost:8099/");
await page.waitForTimeout(400);

/* JACK IN */
await page.evaluate(() => document.getElementById("initb").click());
await page.waitForTimeout(900);          /* greeting speaks and finishes */

const afterGreeting = await page.evaluate(() => ({
  starts: window.__log.starts, speaks: window.__log.speaks,
  live: window.__rec && window.__rec.running,
}));
console.log("after greeting:", afterGreeting);

/* Ryan speaks. Zaphiel answers. Does the mic come back? */
await page.evaluate(() => window.__rec.say("what should I do today"));
await page.waitForTimeout(900);

const afterReply = await page.evaluate(() => ({
  starts: window.__log.starts, speaks: window.__log.speaks,
  live: window.__rec.running,
  heard: document.getElementById("capU").textContent,
  said: document.getElementById("capA").textContent.slice(0, 60),
}));
console.log("after reply:  ", afterReply);

/* And a second turn, to prove it is a loop and not a one-shot. */
await page.evaluate(() => window.__rec.say("what about pricing"));
await page.waitForTimeout(900);
const afterSecond = await page.evaluate(() => ({
  starts: window.__log.starts, live: window.__rec.running,
  said: document.getElementById("capA").textContent.slice(0, 60),
}));
console.log("after 2nd:    ", afterSecond);

/* Worst case: the browser accepts the utterance and then silently never speaks it
   (Safari autoplay rules, backgrounded tab). The mic must still come back. */
await page.evaluate(() => { window.__muteSynth = true; });
await page.evaluate(() => window.__rec.say("tell me about the board"));
await page.waitForTimeout(2200);          /* past the 1400ms start-guard */
const afterSilent = await page.evaluate(() => ({
  starts: window.__log.starts, live: window.__rec.running,
  hint: document.getElementById("hint").textContent,
}));
console.log("after silent: ", afterSilent);

const pass = afterGreeting.live && afterReply.live && afterSecond.live && afterSilent.live
  && afterReply.speaks >= 2 && afterSecond.said !== afterReply.said;
console.log(pass ? "\nPASS — mic is live after every reply" : "\nFAIL — mic died");

await browser.close();
server.close();
process.exit(pass ? 0 : 1);
