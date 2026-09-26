---
type: tenant_template
status: designed
tags: [tenant, template, p0]
---
# _TEMPLATE_Client — one folder per client, never mixed

Copy this folder to `80_Clients/<Client_Name>/` when a client is onboarded (step 8 of [[50_Client_Onboarding/Onboarding_Workflow]]). The folder name is the tenant slug used as `tenant_id` everywhere.

```
80_Clients/<Client_Name>/
   README.md                (this file, filled: tenant_id, owner, modules, environments, status)
   Company_Map.md           (the finished Client Digital Company Map)
   Data_Sources.md          (the connect / import / index / leave plan with statuses)
   Integrations.md          (this client's entries; secrets stay in n8n, per-client credentials)
   Approvals.md             (who approves what for this client, limits)
   KPIs.md                  (this client's KPI targets, from the KPI Dictionary)
   Decisions.md             (client-specific decisions)
   Changelog.md
```

## Tenant record (fill in)
| Field | Value |
|---|---|
| tenant_id | `<slug>` |
| Client owner (approver) | |
| FusionTech owner | Ryan |
| Modules | CEO Dashboard · Sales Brain · … (only what discovery chose) |
| Environments | staging: … · production: … |
| Credential boundary | n8n credentials named `<slug> — <tool>`; never shared with another tenant |
| Default policies | least privilege; approvals per [[30_Platform_Services/Approval_Service]]; retention per tenant |
| Status | discovering → provisioned → staging → live |

Rules: [[00_CEO_Brain/00_Master_Rules]] #10. Provisioning: [[30_Platform_Services/Identity_Tenant]].

`website/` — output folder of the Website Intelligence & Conversion Strategist ([[10_Agents/05a_Website_Intelligence]]); see its README.
