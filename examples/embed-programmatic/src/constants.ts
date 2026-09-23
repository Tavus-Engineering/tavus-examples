// Paste the id of a deployment from the Tavus portal (Deployments → Embed).
export const DEPLOYMENT_ID = "";

// The host button is the only start control on this page, so the call goes
// straight in instead of stopping at the device check first.
export const OVERRIDE_CONFIG = JSON.stringify({
  customization: { show_haircheck: false },
});

export const SUGGESTED_QUESTIONS = [
  "What can you help me with?",
  "Tell me about your pricing.",
  "How do I get started?",
];
