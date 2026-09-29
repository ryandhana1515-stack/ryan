// Prints the `files` list for mcp__Vercel__create_deployment for one mock-up folder, so a deploy needs no git:
//   node ceo-brain/site-kit/scripts/deploy-plan.mjs mockups/<slug>
// - "byRef": the kit's build files (their SHA-1 is in kit-files.json and they are already uploaded to Vercel):
//   pass them as { "file", "sha", "size" }.
// - "fetched": engine files identical to the kit; leave them out, the build fetches them (scripts/kit.mjs).
// - "inline": the files you wrote for this customer: pass them as { "file", "data": <their text>, "encoding": "utf-8" }.
//   node ceo-brain/site-kit/scripts/deploy-plan.mjs mockups/<slug> --b64 <file>   prints one file as base64
//   node ceo-brain/site-kit/scripts/deploy-plan.mjs --write-kit                   refreshes kit-files.json
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const kitRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const SKIP = new Set(['node_modules', 'dist', '.media-cache', '.vercel', 'package-lock.json', '.gitignore']);
const SKIP_REL = new Set(['README.md', 'kit-files.json', 'scripts/deploy-plan.mjs', 'scripts/higgsfield-host.sh']); // kit-only, never deployed

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const rel = relative(base, p).split('\\').join('/');
    if (rel === 'public/film' || rel.startsWith('public/film/') || SKIP_REL.has(rel)) continue;
    if (statSync(p).isDirectory()) walk(p, base, out);
    else out.push(rel);
  }
  return out.sort();
}

const sha1 = buf => createHash('sha1').update(buf).digest('hex');
const UPLOADED = ['package.json', 'vercel.json', 'vite.config.js', 'scripts/kit.mjs'];
const ENGINE = ['scripts/media.mjs', 'src/engine/film.js', 'src/engine/fx.js', 'src/engine/index.js',
  'src/engine/motion.js', 'src/engine/sequence.js', 'src/styles/engine.css'];

const args = process.argv.slice(2);
if (args[0] === '--write-kit') {
  const kit = Object.fromEntries(UPLOADED.map(f => {
    const buf = readFileSync(join(kitRoot, f));
    return [f, { sha: sha1(buf), size: buf.length }];
  }));
  writeFileSync(join(kitRoot, 'kit-files.json'), JSON.stringify(kit, null, 2) + '\n');
  console.log('kit-files.json updated');
  process.exit(0);
}

const dir = resolve(args[0] || '.');
if (!existsSync(join(dir, 'index.html'))) { console.error('usage: deploy-plan.mjs <mockup folder with index.html>'); process.exit(1); }
if (args[1] === '--b64') { process.stdout.write(readFileSync(join(dir, args[2])).toString('base64')); process.exit(0); }

const kit = JSON.parse(readFileSync(join(kitRoot, 'kit-files.json'), 'utf8'));
const byRef = [], fetched = [], inline = [];
for (const f of walk(dir)) {
  const buf = readFileSync(join(dir, f));
  const s = sha1(buf);
  if (kit[f] && kit[f].sha === s) byRef.push({ file: f, sha: s, size: buf.length });
  else if (ENGINE.includes(f) && existsSync(join(kitRoot, f)) && sha1(readFileSync(join(kitRoot, f))) === s) fetched.push(f);
  else inline.push({ file: f, size: buf.length, binary: /\.(png|jpe?g|webp|gif|ico|woff2?|glb|mp4)$/i.test(f) });
}
console.log(JSON.stringify({ byRef, fetched, inline }, null, 2));
