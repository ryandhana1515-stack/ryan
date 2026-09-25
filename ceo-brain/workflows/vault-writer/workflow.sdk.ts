// CEO Brain — Vault Writer. Fire-and-forget sub-workflow called by Lead Intake after every
// conversation turn. Writes/updates the lead's note and the company's note in Ryan's Obsidian
// vault (zaphiel/vault/ in the GitHub repo, default branch) through n8n's GitHub credential.
// Obsidian Git on Ryan's computer pulls it within 10 minutes, so the graph grows by itself.
import { workflow, node, trigger, sticky, ifElse, expr } from '@n8n/workflow-sdk';

const OWNER = { __rl: true, mode: 'name', value: 'ryandhana1515-stack' };
const REPO = { __rl: true, mode: 'name', value: 'ryan' };
const GITHUB_CRED = { githubOAuth2Api: { id: 'lZqYskCh7zVfXsc7', name: 'GitHub account' } };
const COMMITTER = { committer: { name: 'Zaphiel (n8n)', email: 'ryandhana1515@gmail.com' } };

const whenCalled = trigger({
  type: 'n8n-nodes-base.executeWorkflowTrigger',
  version: 1.2,
  config: {
    name: 'When Called by Lead Intake',
    parameters: { inputSource: 'workflowInputs', workflowInputs: { values: [{ name: 'tenant_id', type: 'string' }, { name: 'lead_id', type: 'string' }, { name: 'contact_name', type: 'string' }, { name: 'company_name', type: 'string' }, { name: 'industry', type: 'string' }, { name: 'channel', type: 'string' }, { name: 'lead_source', type: 'string' }, { name: 'status', type: 'string' }, { name: 'temperature', type: 'string' }, { name: 'intent', type: 'string' }, { name: 'summary', type: 'string' }, { name: 'extracted_json', type: 'string' }, { name: 'message', type: 'string' }, { name: 'reply', type: 'string' }, { name: 'next_action', type: 'string' }, { name: 'handoffs_json', type: 'string' }, { name: 'provider', type: 'string' }, { name: 'execution_id', type: 'string' }, { name: 'ts', type: 'string' }, { name: 'test_mode', type: 'boolean' }] } },
    position: [0, 300]
  },
  output: [{ tenant_id: 'fusiontech', lead_id: 'lead_x', contact_name: 'Marcus Lim', company_name: 'SwiftMove Logistics Pte Ltd', industry: 'logistics', channel: 'email', lead_source: 'website', status: 'QUALIFYING', temperature: 'warm', intent: 'ai_automation_enquiry', summary: 's', extracted_json: '{}', message: 'Hi', reply: 'Hello', next_action: 'ask_qualifying_questions', handoffs_json: '[]', provider: 'anthropic', execution_id: '1', ts: '2026-01-01T00:00:00.000Z', test_mode: true }]
});

const plan = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Plan Vault Notes',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const inp = $input.first().json || {};
const s = (v, max) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max || 4000));
const test = inp.test_mode === true || inp.test_mode === 'true';
const leadId = s(inp.lead_id, 120) || ('lead_unknown_' + Date.now().toString(36));
const safeName = (t) => s(t, 80).replace(/[\\\\/:*?"<>|#^\\[\\]]/g, '-').replace(/\\s+/g, ' ').trim();
const company = safeName(inp.company_name);
const industry = safeName(inp.industry);
const contact = s(inp.contact_name, 80) || 'Unknown contact';
let extracted = {}; try { extracted = JSON.parse(inp.extracted_json || '{}') || {}; } catch (e) {}
let handoffs = []; try { handoffs = JSON.parse(inp.handoffs_json || '[]') || []; } catch (e) {}
const ts = s(inp.ts, 40) || new Date().toISOString();
const day = ts.slice(0, 10);
const leadPath = 'zaphiel/vault/Leads/' + (test ? 'Test/' : '') + leadId + '.md';
const companyPath = company ? 'zaphiel/vault/Companies/' + company + '.md' : '';
const wants = Array.isArray(extracted.desired_automation) ? extracted.desired_automation : [];
const tools = Array.isArray(extracted.current_tools) ? extracted.current_tools : [];
const links = [];
if (company) links.push('[[Companies/' + company + '|' + company + ']]');
if (industry) links.push('[[Industries/' + industry + '|' + industry + ']]');
for (const w of wants) links.push('[[Automations/' + safeName(String(w).replace(/_/g, ' ')) + '|' + String(w).replace(/_/g, ' ') + ']]');
const fm = [
  '---',
  'type: lead', 'lead_id: ' + leadId, 'contact: "' + contact.replace(/"/g, "'") + '"',
  'company: "' + (company || '') + '"', 'industry: "' + (industry || '') + '"',
  'status: ' + s(inp.status, 40), 'temperature: ' + s(inp.temperature, 20), 'intent: ' + s(inp.intent, 40),
  'channel: ' + s(inp.channel, 30), 'source: ' + s(inp.lead_source, 30), 'test_mode: ' + test,
  'first_contact: ' + day, 'updated: ' + ts, 'tags: [lead' + (test ? ', test' : '') + ']',
  '---'
].join('\\n');
const header = fm + '\\n# ' + contact + (company ? ' @ ' + company : '') + '\\n\\n' + (links.length ? 'Links: ' + links.join(' · ') + '\\n\\n' : '')
  + '## Facts John has extracted\\n' + '(updated automatically — newest run wins)\\n\\n' + '## Conversation log\\n';
const facts = '- Company size: ' + (extracted.company_size ?? '-') + ' · Users: ' + (extracted.users_needed ?? '-') + ' · Decision maker: ' + (extracted.decision_maker ?? '-') + '\\n'
  + '- Problem: ' + (extracted.problem || '-') + '\\n' + '- Wants: ' + (wants.join(', ') || '-') + '\\n' + '- Tools: ' + (tools.join(', ') || '-') + '\\n'
  + '- Budget: ' + (extracted.budget || '-') + ' · Timeline: ' + (extracted.timeline || '-') + '\\n' + '- Outcome wanted: ' + (extracted.desired_outcome || '-') + '\\n';
const entry = '\\n### ' + ts.replace('T', ' ').slice(0, 16) + ' UTC · ' + s(inp.status, 40) + ' / ' + s(inp.temperature, 20) + ' · next: ' + s(inp.next_action, 40) + (handoffs.length ? ' · hand-off: ' + handoffs.join(', ') : '') + ' · ' + s(inp.provider, 20) + '\\n'
  + '**Prospect:** ' + s(inp.message, 3000).replace(/\\n+/g, ' ') + '\\n\\n'
  + '**John:** ' + (s(inp.reply, 3000).replace(/\\n+/g, ' ') || '(no reply — held for human)') + '\\n\\n'
  + '_Summary:_ ' + s(inp.summary, 600) + '\\n';
return [{ json: {
  lead_id: leadId, test, contact, company, industry, ts, day,
  lead_path: leadPath, company_path: companyPath,
  lead_header: header, lead_facts: facts, lead_entry: entry,
  status: s(inp.status, 40), temperature: s(inp.temperature, 20),
  commit_lead: 'vault: John ↔ ' + contact + (company ? ' @ ' + company : '') + ' (' + s(inp.status, 40) + ')',
  commit_company: 'vault: company note ' + company,
  company_new: company ? '---\\ntype: company\\nname: "' + company.replace(/"/g, "'") + '"\\nindustry: "' + (industry || '') + '"\\ncreated: ' + day + '\\ntags: [company]\\n---\\n# ' + company + '\\n\\n' + (industry ? 'Industry: [[Industries/' + industry + '|' + industry + ']]\\n\\n' : '') + '## Leads\\n- [[Leads/' + (test ? 'Test/' : '') + leadId + '|' + contact + ']] — ' + day + '\\n' : '',
  company_lead_line: '- [[Leads/' + (test ? 'Test/' : '') + leadId + '|' + contact + ']] — ' + day
} }];`
    },
    position: [220, 300]
  },
  output: [{ lead_id: 'lead_x', test: true, contact: 'Marcus Lim', company: 'SwiftMove Logistics Pte Ltd', industry: 'logistics', ts: '2026-01-01T00:00:00.000Z', day: '2026-01-01', lead_path: 'zaphiel/vault/Leads/Test/lead_x.md', company_path: 'zaphiel/vault/Companies/SwiftMove Logistics Pte Ltd.md', lead_header: '---', lead_facts: '- Problem', lead_entry: '### entry', status: 'QUALIFYING', temperature: 'warm', commit_lead: 'vault: John', commit_company: 'vault: company', company_new: '---', company_lead_line: '- [[Leads/Test/lead_x|Marcus Lim]] — 2026-01-01' }]
});

const getLead = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Get Lead Note',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER, repository: REPO, filePath: expr("{{ $('Plan Vault Notes').item.json.lead_path }}"), asBinaryProperty: false, additionalParameters: {} },
    credentials: GITHUB_CRED,
    position: [440, 300]
  },
  output: [{ content: 'LS0t', encoding: 'base64', sha: 'abc', path: 'zaphiel/vault/Leads/Test/lead_x.md' }]
});

const mergeLead = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Merge Lead Note',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const p = $('Plan Vault Notes').first().json;
const got = ($input.first() && $input.first().json) || {};
const decode = (b64) => { try { return Buffer.from(String(b64).replace(/\\n/g, ''), 'base64').toString('utf8'); } catch (e) { return null; } };
const existing = got && got.content && !got.error ? decode(got.content) : null;
let content, mode;
if (existing) {
  mode = 'edit';
  let c = existing;
  // refresh the frontmatter fields that change, keep everything Ryan wrote
  c = c.replace(/^status: .*$/m, 'status: ' + p.status).replace(/^temperature: .*$/m, 'temperature: ' + p.temperature).replace(/^updated: .*$/m, 'updated: ' + p.ts);
  // replace the facts block (between the facts heading and the conversation log heading)
  const i = c.indexOf('## Facts John has extracted'), k = c.indexOf('## Conversation log');
  if (i !== -1 && k !== -1 && k > i) c = c.slice(0, i) + '## Facts John has extracted\\n(updated automatically — newest run wins)\\n\\n' + p.lead_facts + '\\n' + c.slice(k);
  content = c.replace(/\\s+$/, '') + '\\n' + p.lead_entry;
} else {
  mode = 'create';
  content = p.lead_header.replace('## Facts John has extracted\\n(updated automatically — newest run wins)\\n\\n', '## Facts John has extracted\\n(updated automatically — newest run wins)\\n\\n' + p.lead_facts + '\\n') + p.lead_entry;
}
return [{ json: { mode, path: p.lead_path, content, commit: p.commit_lead } }];`
    },
    position: [660, 300]
  },
  output: [{ mode: 'create', path: 'zaphiel/vault/Leads/Test/lead_x.md', content: '---', commit: 'vault: John' }]
});

const leadExists = ifElse({
  version: 2.3,
  config: {
    name: 'Lead Note Exists?',
    parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'm', leftValue: expr('{{ $json.mode }}'), rightValue: 'edit', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
    position: [880, 300]
  }
});

const editLead = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Update Lead Note',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'edit', owner: OWNER, repository: REPO, filePath: expr("{{ $('Merge Lead Note').item.json.path }}"), binaryData: false, fileContent: expr("{{ $('Merge Lead Note').item.json.content }}"), commitMessage: expr("{{ $('Merge Lead Note').item.json.commit }}"), additionalParameters: COMMITTER },
    credentials: GITHUB_CRED,
    position: [1100, 200]
  },
  output: [{ commit: { sha: 'x' } }]
});

const createLead = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Create Lead Note',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'create', owner: OWNER, repository: REPO, filePath: expr("{{ $('Merge Lead Note').item.json.path }}"), binaryData: false, fileContent: expr("{{ $('Merge Lead Note').item.json.content }}"), commitMessage: expr("{{ $('Merge Lead Note').item.json.commit }}"), additionalParameters: COMMITTER },
    credentials: GITHUB_CRED,
    position: [1100, 400]
  },
  output: [{ commit: { sha: 'x' } }]
});

const hasCompany = ifElse({
  version: 2.3,
  config: {
    name: 'Has Company?',
    parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'c', leftValue: expr("{{ $('Plan Vault Notes').item.json.company_path }}"), rightValue: '', operator: { type: 'string', operation: 'notEmpty', singleValue: true } }], combinator: 'and' } },
    position: [1320, 300]
  }
});

const getCompany = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Get Company Note',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'get', owner: OWNER, repository: REPO, filePath: expr("{{ $('Plan Vault Notes').item.json.company_path }}"), asBinaryProperty: false, additionalParameters: {} },
    credentials: GITHUB_CRED,
    position: [1540, 200]
  },
  output: [{ content: 'LS0t', encoding: 'base64', sha: 'abc' }]
});

const mergeCompany = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Merge Company Note',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const p = $('Plan Vault Notes').first().json;
const got = ($input.first() && $input.first().json) || {};
const decode = (b64) => { try { return Buffer.from(String(b64).replace(/\\n/g, ''), 'base64').toString('utf8'); } catch (e) { return null; } };
const existing = got && got.content && !got.error ? decode(got.content) : null;
if (existing) {
  if (existing.indexOf('[[Leads/' + (p.test ? 'Test/' : '') + p.lead_id) !== -1) return [{ json: { mode: 'skip', path: p.company_path } }];
  let c = existing.replace(/\\s+$/, '');
  if (c.indexOf('## Leads') === -1) c += '\\n\\n## Leads';
  c += '\\n' + p.company_lead_line + '\\n';
  return [{ json: { mode: 'edit', path: p.company_path, content: c, commit: p.commit_company } }];
}
return [{ json: { mode: 'create', path: p.company_path, content: p.company_new, commit: p.commit_company } }];`
    },
    position: [1760, 200]
  },
  output: [{ mode: 'create', path: 'zaphiel/vault/Companies/X.md', content: '---', commit: 'vault: company' }]
});

const companyEdit = ifElse({
  version: 2.3,
  config: {
    name: 'Company Note Exists?',
    parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'e', leftValue: expr('{{ $json.mode }}'), rightValue: 'edit', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
    position: [1980, 200]
  }
});

const companyCreate = ifElse({
  version: 2.3,
  config: {
    name: 'Company Note Missing?',
    parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'c', leftValue: expr('{{ $json.mode }}'), rightValue: 'create', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
    position: [1980, 400]
  }
});

const editCompany = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Update Company Note',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'edit', owner: OWNER, repository: REPO, filePath: expr("{{ $('Merge Company Note').item.json.path }}"), binaryData: false, fileContent: expr("{{ $('Merge Company Note').item.json.content }}"), commitMessage: expr("{{ $('Merge Company Note').item.json.commit }}"), additionalParameters: COMMITTER },
    credentials: GITHUB_CRED,
    position: [2200, 100]
  },
  output: [{ commit: { sha: 'x' } }]
});

const createCompany = node({
  type: 'n8n-nodes-base.github',
  version: 1.1,
  config: {
    name: 'Create Company Note',
    onError: 'continueRegularOutput',
    parameters: { authentication: 'oAuth2', resource: 'file', operation: 'create', owner: OWNER, repository: REPO, filePath: expr("{{ $('Merge Company Note').item.json.path }}"), binaryData: false, fileContent: expr("{{ $('Merge Company Note').item.json.content }}"), commitMessage: expr("{{ $('Merge Company Note').item.json.commit }}"), additionalParameters: COMMITTER },
    credentials: GITHUB_CRED,
    position: [2200, 300]
  },
  output: [{ commit: { sha: 'x' } }]
});

const done = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Done',
    parameters: { mode: 'manual', includeOtherFields: false, assignments: { assignments: [
      { id: 'ok', name: 'ok', value: true, type: 'boolean' },
      { id: 'lead', name: 'lead_path', value: expr("{{ $('Plan Vault Notes').item.json.lead_path }}"), type: 'string' },
      { id: 'mode', name: 'lead_mode', value: expr("{{ $('Merge Lead Note').item.json.mode }}"), type: 'string' }
    ] } },
    position: [2420, 300]
  },
  output: [{ ok: true, lead_path: 'zaphiel/vault/Leads/Test/lead_x.md', lead_mode: 'create' }]
});

const note = sticky('## CEO Brain — Vault Writer\nCalled fire-and-forget by Lead Intake after every turn. Writes the lead note (Leads/, or Leads/Test/ for test leads) and the company note (Companies/) in the Obsidian vault inside the GitHub repo, default branch, via the GitHub credential.\n\nThe lead note keeps Ryan\'s own lines: only the frontmatter status/temperature/updated fields and the "Facts" block are refreshed; every turn is appended to the conversation log.\n\nSource of truth: repo ryan/ceo-brain/workflows/vault-writer/workflow.sdk.ts', [whenCalled, plan, getLead, mergeLead], { color: 4 });

export default workflow('ceo-brain-vault-writer', 'CEO Brain — Vault Writer')
  .add(whenCalled)
  .to(plan)
  .to(getLead)
  .to(mergeLead)
  .to(leadExists
    .onTrue(editLead.to(hasCompany))
    .onFalse(createLead.to(hasCompany)))
  .add(hasCompany
    .onTrue(getCompany.to(mergeCompany).to(companyEdit))
    .onFalse(done))
  .add(companyEdit
    .onTrue(editCompany.to(done))
    .onFalse(companyCreate))
  .add(companyCreate
    .onTrue(createCompany.to(done))
    .onFalse(done))
  .add(note);
