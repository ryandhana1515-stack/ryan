---
tags: [zaphiel, knowledge, architecture]
---
# How the brain feeds the agents

This vault is one living brain. Two directions, both automatic:

## Agents READ the vault live (no redeploy)
- **John (Sales Agent)** loads, on every message: [[FusionTech AI — Master Company Brain]] and
  [[John — Sales playbook]]. Edit either note in Obsidian and John knows it on his next reply.
  If GitHub is unreachable for a moment, John falls back to the copy compiled into the workflow.
- The **Website Builder** and future agents follow the same pattern (n8n GitHub node → note text →
  system prompt).

## Agents WRITE to the vault after every conversation
- Every lead John talks to gets a note in `Leads/` (test conversations in `Leads/Test/`): contact,
  company, status, temperature, what was extracted, and the running conversation log.
- Every company gets a note in `Companies/` linking to its leads, so the graph view grows with the
  business: Company ⟷ Leads ⟷ Industry ⟷ Automations wanted.
- Written by the n8n workflow **CEO Brain — Vault Writer** through the GitHub credential; Obsidian
  Git pulls it to Ryan's computer within 10 minutes.

## What Ryan edits, and what happens
| You edit | Effect |
|---|---|
| [[FusionTech AI — Master Company Brain]] | John and the Website Builder use the new text on the next message |
| [[John — Sales playbook]] | John's tone, answers and lessons change immediately |
| `05 Decisions log`, `07 Open loops` | Every Claude session reads them first and acts on them |
| A lead note in `Leads/` | Your notes stay; the agent appends below, never overwrites your lines |

## Rules
- No secrets in the vault, ever (it syncs to GitHub).
- Health/compliance language rules still apply to anything customer-facing.
