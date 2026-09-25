Prepare the website build brief for this prospect.

Tenant: {{tenant_id}}
Lead id: {{lead_id}}
Now (UTC): {{now}}

Contact details as given:
- Name: {{contact_name}}
- Company: {{company_name}}
- Industry: {{industry}}
- Email: {{email}}
- Phone: {{phone}}

Sales consultant's summary of the lead:
{{sales_summary}}

Facts the sales consultant extracted (JSON, null = unknown):
{{extracted_json}}

Conversation with the customer (oldest first; the last customer message is the current one):
{{conversation}}

Current customer message:
"""
{{message}}
"""

Return the JSON object now.
