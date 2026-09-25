#!/usr/bin/env node
// Splits zaphiel/memory.md into an Obsidian vault of linked notes.
//   node zaphiel/obsidian/build-vault.js [outDir]   (default: zaphiel/vault)
// Safe to re-run: it rewrites generated notes only (files it created, marked in frontmatter).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'zaphiel', 'memory.md');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'zaphiel', 'vault'));
const today = new Date().toISOString().slice(0, 10);

const md = fs.readFileSync(SRC, 'utf8');
const lastUpdated = (md.match(/^Last updated:\s*(.+)$/m) || [, 'unknown'])[1].trim();
const parts = md.split(/^## /m);
const preamble = parts.shift();
const sections = parts.map((chunk) => {
  const nl = chunk.indexOf('\n');
  const heading = chunk.slice(0, nl).trim();
  const body = chunk.slice(nl + 1).trim();
  const m = heading.match(/^(\d+[a-z]?)\.\s+(.*)$/);
  const num = m ? m[1] : '';
  const title = (m ? m[2] : heading).replace(/[\\/:*?"<>|]/g, '-').trim();
  const file = (num ? num.padStart(2, '0') + ' ' : '') + title;
  return { heading, title, file, body };
});
const safe = (t) => t.replace(/[\\/:*?"<>|#^\[\]]/g, '-');
const fm = (o) => '---\n' + Object.entries(o).map(([k, v]) => `${k}: ${Array.isArray(v) ? '[' + v.join(', ') + ']' : v}`).join('\n') + '\n---\n';

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) {
  const p = path.join(OUT, f);
  if (f.endsWith('.md') && fs.readFileSync(p, 'utf8').includes('generated_by: build-vault.js')) fs.unlinkSync(p);
}
// Rewrite "§4b"-style cross references into wikilinks where a matching section exists.
const byNum = Object.fromEntries(sections.map((s) => [s.file.split(' ')[0].replace(/^0/, ''), s.file]));
const link = (text) => text.replace(/§\s?(\d+[a-z]?)\b/g, (all, n) => (byNum[n] ? `[[${safe(byNum[n])}|§${n}]]` : all));

for (const s of sections) {
  const note = fm({ generated_by: 'build-vault.js', source: 'zaphiel/memory.md', source_last_updated: lastUpdated, built: today, tags: ['zaphiel', 'memory'] })
    + `# ${s.title}\n\n` + link(s.body) + '\n\nUp: [[00 Home]]\n';
  fs.writeFileSync(path.join(OUT, safe(s.file) + '.md'), note);
}
const home = fm({ generated_by: 'build-vault.js', source: 'zaphiel/memory.md', source_last_updated: lastUpdated, built: today, tags: ['zaphiel', 'moc'] })
  + `# Zaphiel — Home\n\n${preamble.replace(/^# .*\n/, '').trim()}\n\n## Sections\n`
  + sections.map((s) => `- [[${safe(s.file)}]]`).join('\n')
  + `\n\n## Linked systems\n- [[CEO Brain]] — AI Lead & Sales Agent (Phase 1 live, Phase 2 on hold)\n- Board dossiers: \`board/dossiers/\` in the repo\n- Ops manual: \`.claude/skills/zaphiel/SKILL.md\`\n`;
fs.writeFileSync(path.join(OUT, '00 Home.md'), home);
const ceo = fm({ generated_by: 'build-vault.js', source: 'ceo-brain/README.md', built: today, tags: ['zaphiel', 'ceo-brain'] })
  + '# CEO Brain\n\nAI Company Operating System. Phase 1 (lead intake + Sales Qualification Agent) is live on n8n workflow `b7kbJpnKLN2uQxyn`. Phase 2 waits for Ryan\'s approval.\n\n- Repo docs: `ceo-brain/README.md`, `ceo-brain/docs/architecture.md`, `ceo-brain/docs/phase-2-plan.md`\n- Data tables: ceo_leads, ceo_messages, ceo_agent_runs, ceo_tasks, ceo_audit_logs\n\nUp: [[00 Home]]\n';
fs.writeFileSync(path.join(OUT, 'CEO Brain.md'), ceo);
console.log(`vault written to ${path.relative(ROOT, OUT)}: ${sections.length + 2} notes`);
