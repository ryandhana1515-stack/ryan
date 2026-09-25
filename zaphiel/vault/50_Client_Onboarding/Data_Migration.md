---
type: platform_process
priority: P0
name: Data Migration
status: designed
owner_agent: "[[10_Agents/07_CRM_Architect]]"
worker: "[[20_Specialist_Workers/Data_Migration_Worker]]"
last_reviewed: 2026-09-25
tags: [onboarding, migration, p0]
---
# Data Migration (P0 #6) — spreadsheets and exports into the CEO Brain, safely

## Purpose
Move IMPORT-class data (CSV / Excel / exports) into the tenant's CRM/ERP tables without duplicates, without loss, and with a way back.

## Steps
1. **Mapping** — each source column → target field ([[40_Registries/System_of_Record_Registry]] entity); unmapped columns listed, not silently dropped.
2. **Dedupe** — rules: email, phone (normalized +65), company name + postal code; conflicts kept in a review list, never auto-merged when unsure.
3. **Validation** — required fields, formats (email, phone, dates), referential checks; a row that fails is quarantined with the reason.
4. **Dry run** — full run into a staging tenant; report: rows in, rows accepted, duplicates, quarantined, samples.
5. **Client sign-off** — the client owner reviews the report and the samples; nothing is written to production before sign-off.
6. **Production import** — idempotent (import batch id + source row id); can be re-run without duplicates.
7. **Reconciliation** — counts and sums match the source; report stored with the tenant.
8. **Rollback** — every batch can be reversed (batch id on every imported row); tested on staging before first use.

## Data model
`import_batches` (tenant_id, batch_id, source_file, mapping, status, counts), `import_rows` (batch_id, source_row, target_table, target_id, status, reason). Imported rows carry `import_batch_id`.

## Client sign-off checklist
- [ ] Mapping reviewed · [ ] duplicates decided · [ ] quarantined rows decided · [ ] sample of 20 records checked · [ ] source file archived · [ ] rollback tested · [ ] signed by client owner (name, date)

## Tests
Dry run on the pilot client's real spreadsheet; re-running the same batch creates zero new rows; rollback leaves the tenant exactly as before.

## Status
Designed. Build in backlog Phase 3 with the CRM Architect.
