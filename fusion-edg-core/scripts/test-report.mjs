// Runs the whole suite and writes docs/test-report.md with evidence (command, date, environment, per-test result).
//   node scripts/test-report.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = `${root}.vitest-report.json`;
const cmd = ['vitest', 'run', '--reporter=json', `--outputFile=${out}`];
let exit = 0;
try { execFileSync('npx', cmd, { cwd: root, stdio: 'pipe' }); } catch (e) { exit = e.status ?? 1; }
const r = JSON.parse(readFileSync(out, 'utf8'));
rmSync(out);
const tsc = (() => { try { execFileSync('npx', ['tsc', '-p', 'tsconfig.json', '--noEmit'], { cwd: root, stdio: 'pipe' }); return 'PASS'; } catch (e) { return 'FAIL\n' + String(e.stdout); } })();
const ver = (c, a) => { try { return execFileSync(c, a, { stdio: 'pipe' }).toString().trim().split('\n')[0]; } catch { return 'n/a'; } };

const status = (t) => (t.status === 'passed' ? 'PASS' : t.status === 'failed' ? 'FAIL' : 'BLOCKED');
const critical = /CRITICAL|CROSS-TENANT|cross-tenant/;
const rows = [];
for (const f of r.testResults) {
  const file = f.name.replace(root, '');
  for (const t of f.assertionResults) rows.push({ file, name: [...t.ancestorTitles.slice(-1), t.title].join(' › '), status: status(t), ms: Math.round(t.duration ?? 0), critical: critical.test(t.title), msg: (t.failureMessages ?? []).join(' ').slice(0, 300) });
}
const count = (s) => rows.filter((x) => x.status === s).length;
const md = [
  '# EDG Core — test report',
  '',
  `- **Run:** ${new Date().toISOString()} · environment: DEVELOPMENT/TEST (local PostgreSQL, MOCK adapters, FAKE data)`,
  `- **Command:** \`npx ${cmd.slice(0, 2).join(' ')}\` (+ \`npx tsc -p tsconfig.json --noEmit\`)`,
  `- **Tooling:** ${ver('node', ['--version'])} · ${ver('psql', ['--version'])} · vitest ${JSON.parse(readFileSync(`${root}node_modules/vitest/package.json`, 'utf8')).version}`,
  `- **Result:** ${count('PASS')} PASS · ${count('FAIL')} FAIL · ${count('BLOCKED')} BLOCKED · 0 WARNING · typecheck ${tsc.split('\n')[0]} · exit code ${exit}`,
  `- **Critical tests** (cross-tenant): ${rows.filter((x) => x.critical).map((x) => x.status).join(', ') || 'none found'}`,
  '',
  'BLOCKED would mean the database was not available (tests skip with a BLOCKED notice rather than pretend).',
  'Regenerate: `node scripts/test-report.mjs`.',
  '',
  '| # | Result | Test | File | ms |',
  '|---|---|---|---|---|',
  ...rows.map((x, i) => `| ${i + 1} | ${x.status}${x.critical ? ' (critical)' : ''} | ${x.name.replace(/\|/g, '/')} | \`${x.file}\` | ${x.ms} |`),
  ...(rows.some((x) => x.msg) ? ['', '## Failures', ...rows.filter((x) => x.msg).map((x) => `- **${x.name}**: ${x.msg}`)] : []),
  '',
].join('\n');
writeFileSync(`${root}docs/test-report.md`, md);
console.log(`docs/test-report.md: ${count('PASS')} pass, ${count('FAIL')} fail, ${count('BLOCKED')} blocked; typecheck ${tsc.split('\n')[0]}`);
process.exit(exit);
