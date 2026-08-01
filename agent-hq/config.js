/* BIOGREEN Agent HQ — n8n wiring.
   All endpoints below are the PRODUCTION webhooks of the live n8n instance.
   Chat triggers accept POST {base}/webhook/{webhookId}/chat
   with { action:"sendMessage", sessionId, chatInput }. */

window.HQ_CONFIG = {
  n8nBase: "https://ryan1515.app.n8n.cloud",
  n8nEditor: "https://ryan1515.app.n8n.cloud/home/workflows",

  // Per-agent chat routing.
  // kind "chat"      → n8n chat trigger (streaming hosted chat webhook)
  // kind "inbound"   → Omnichannel AI Hub universal inbox (JSON reply)
  // kind "affiliate" → Affiliate signup webhook (JSON welcome_message)
  agents: {
    manager: {
      kind: "chat",
      webhookId: "8f39034f-cc75-4c63-92cf-280920986421",
      workflowId: "cVOaVg8smx6412Kq",
      hint: "Real AI Manager — delegates to Content, Copy/Ads and Research specialists.",
    },
    support: {
      kind: "chat",
      webhookId: "6f50a145-b276-41f4-965e-98bb469c5246",
      workflowId: "0er3heB5espW8eEK",
      hint: "Real 24/7 support chat with conversation memory.",
    },
    web: {
      kind: "chat",
      webhookId: "875bb362-ce60-4579-8212-5f52e6d39bde",
      workflowId: "wWtVDcMhL0mXvmjf",
      hint: "Describe a website — FORGE returns a build-ready package (3D plan, Kling prompts, Lovable brief).",
    },
    // These three route through the AI Manager, which owns the matching
    // specialist sub-agent tools in n8n.
    content: {
      kind: "chat",
      webhookId: "8f39034f-cc75-4c63-92cf-280920986421",
      workflowId: "25JpHXIZXIyAvwLG",
      prefix: "Delegate this to the Content Specialist and return their output: ",
      hint: "Routed via the AI Manager to its real Content Specialist.",
    },
    ads: {
      kind: "chat",
      webhookId: "8f39034f-cc75-4c63-92cf-280920986421",
      workflowId: "mVa6ZEvC5w0xxef0",
      prefix: "Delegate this to the Copy and Ads Specialist and return their output: ",
      hint: "Routed via the AI Manager to its real Copy & Ads Specialist.",
    },
    research: {
      kind: "chat",
      webhookId: "8f39034f-cc75-4c63-92cf-280920986421",
      workflowId: "E3EeEIq9274TzbE4",
      prefix: "Delegate this to the Research Specialist and return their output: ",
      hint: "Routed via the AI Manager to its real Research Specialist.",
    },
    omni: {
      kind: "inbound",
      path: "/webhook/c3d6dde7-7150-486a-a4b1-5b47eb9f606f/inbound-message",
      channel: "hq-console",
      workflowId: "JVGDhhmPFSATl7B7",
      hint: "Real universal inbox — replies are logged to Leads CRM in n8n.",
    },
    whatsapp: {
      kind: "inbound",
      path: "/webhook/c3d6dde7-7150-486a-a4b1-5b47eb9f606f/inbound-message",
      channel: "whatsapp",
      workflowId: "eS8K8Si0VqToZajp",
      hint: "Simulates a WhatsApp customer via the universal inbox.",
    },
    voice: {
      kind: "inbound",
      path: "/webhook/c3d6dde7-7150-486a-a4b1-5b47eb9f606f/inbound-message",
      channel: "voice-desk",
      workflowId: "xDrtylIHseMy1vle",
      callPath: "/webhook/da8e8096-45ab-4c89-91d9-58b08e99d818/call-me",
      hint: "Chat via the inbox, or use ☎ REQUEST CALL to trigger a real ElevenLabs outbound call.",
    },
    affiliate: {
      kind: "affiliate",
      path: "/webhook/5dfd3464-4649-44c1-82a9-0e5cac7852ee/affiliate-signup",
      fallbackPath: "/webhook/c3d6dde7-7150-486a-a4b1-5b47eb9f606f/inbound-message",
      workflowId: "2UEt08SHOgBw8Kp3",
      hint: "Type: name, email, followers — runs a REAL signup and returns the AI welcome message.",
    },
  },
};
