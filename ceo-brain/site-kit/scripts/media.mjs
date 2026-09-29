// Media build step: runs on Vercel's build machine (open internet), never in the Zaphiel container.
// Reads media.json, downloads each film (Kling or Higgsfield MP4 URLs), crops Kling's corner watermark,
// and cuts the film into scroll frames for desktop and phones plus a poster. Also downloads the
// customer's own photos listed under "stills". Fails the build loudly when a download fails, so a
// broken film is never published.
//
// media.json:
// {
//   "films":  [{ "id": "hero", "src": "https://...mp4" | ["leg1.mp4", "leg2.mp4"], "crop": "kling", "frames": 150 }],
//   (the kit demo marks its sample film "optional": true so an expired sample link never fails a build)
//   "stills": [{ "src": "https://.../shopfront.jpg", "out": "assets/shopfront.jpg" }]
// }
// Output: public/film/<id>/{d,m}/0001.<ext>, public/film/<id>/poster.<ext>, public/film/<id>/manifest.json
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const cfgPath = join(root, 'media.json');
if (!existsSync(cfgPath)) { console.log('[media] no media.json, nothing to do'); process.exit(0); }
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const films = cfg.films || [];
const stills = cfg.stills || [];
if (!films.length && !stills.length) { console.log('[media] media.json is empty'); process.exit(0); }

const CROPS = {
  kling: 'crop=iw*0.94:ih*0.94:iw*0.03:0', // Kling's watermark sits in a bottom corner
  none: null,
};
const SIZES = { d: 1600, m: 820 };
const cache = join(root, '.media-cache');
mkdirSync(cache, { recursive: true });

async function download(url, file) {
  if (existsSync(url)) { copyFileSync(url, file); return; }
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return;
    } catch (e) { last = e; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
  }
  throw new Error(`[media] download failed for ${url}: ${last && last.message}`);
}

let ffmpeg;
async function getFfmpeg() {
  if (!ffmpeg) ffmpeg = (await import('ffmpeg-static')).default;
  if (!ffmpeg || !existsSync(ffmpeg)) throw new Error('[media] ffmpeg-static binary missing');
  return ffmpeg;
}

function duration(bin, file) {
  let out = '';
  try { execFileSync(bin, ['-hide_banner', '-i', file], { stdio: 'pipe' }); }
  catch (e) { out = String(e.stderr || ''); }
  const m = out.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) throw new Error(`[media] cannot read duration of ${file}`);
  return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
}

function run(bin, args) { execFileSync(bin, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' }); }

function framesOut(bin, file, vfBase, fps, width, dir, ext, startNo) {
  const tmp = join(dir, '_tmp');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const vf = [vfBase, `fps=${fps.toFixed(4)}`, `scale=${width}:-2:flags=lanczos`].filter(Boolean).join(',');
  const q = ext === 'webp' ? ['-c:v', 'libwebp', '-quality', '72', '-compression_level', '4'] : ['-q:v', '4'];
  run(bin, ['-i', file, '-vf', vf, ...q, join(tmp, `%04d.${ext}`)]);
  const names = readdirSync(tmp).filter(f => f.endsWith(`.${ext}`)).sort();
  names.forEach((n, i) => copyFileSync(join(tmp, n), join(dir, `${String(startNo + i).padStart(4, '0')}.${ext}`)));
  rmSync(tmp, { recursive: true, force: true });
  return names.length;
}

function canWebp(bin) {
  try { return execFileSync(bin, ['-hide_banner', '-encoders'], { stdio: 'pipe' }).toString().includes('libwebp'); }
  catch { return false; }
}

async function buildFilm(film) {
  const id = String(film.id || 'hero').replace(/[^a-z0-9-]/gi, '-');
  const legs = Array.isArray(film.src) ? film.src : [film.src];
  const want = Math.max(24, Math.min(360, film.frames || 150));
  const vfBase = CROPS[film.crop || 'kling'] ?? null;
  const bin = await getFfmpeg();
  const ext = canWebp(bin) ? 'webp' : 'jpg';
  const outDir = join(root, 'public', 'film', id);
  rmSync(outDir, { recursive: true, force: true });
  const files = [];
  for (let i = 0; i < legs.length; i++) {
    const f = join(cache, `${id}-${i}.mp4`);
    console.log(`[media] ${id} leg ${i + 1}/${legs.length}: downloading`);
    await download(legs[i], f);
    files.push({ f, d: duration(bin, f) });
  }
  const total = files.reduce((s, x) => s + x.d, 0);
  const fps = want / total;
  const counts = {};
  for (const key of Object.keys(SIZES)) {
    const dir = join(outDir, key);
    mkdirSync(dir, { recursive: true });
    let n = 1;
    for (const { f } of files) n += framesOut(bin, f, vfBase, fps, SIZES[key], dir, ext, n);
    counts[key] = n - 1;
  }
  copyFileSync(join(outDir, 'd', `0001.${ext}`), join(outDir, `poster.${ext}`));
  const last = String(counts.d).padStart(4, '0');
  copyFileSync(join(outDir, 'd', `${last}.${ext}`), join(outDir, `end.${ext}`));
  const count = Math.min(counts.d, counts.m);
  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({ id, count, ext, legs: legs.length, seconds: +total.toFixed(2) }));
  console.log(`[media] ${id}: ${count} frames (${ext}) from ${total.toFixed(1)}s of film`);
}

async function main() {
  for (const film of films) {
    try { await buildFilm(film); }
    catch (e) {
      if (!film.optional) throw e; // a customer's film must build, or nothing is published
      console.warn(`[media] optional film ${film.id} skipped: ${e.message || e}`);
    }
  }
  for (const s of stills) {
    const out = join(root, 'public', s.out);
    mkdirSync(dirname(out), { recursive: true });
    await download(s.src, out);
    console.log(`[media] still ${s.out}`);
  }
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
