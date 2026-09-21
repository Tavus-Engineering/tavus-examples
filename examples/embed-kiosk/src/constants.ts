// Paste the id of a deployment from the Tavus portal (Deployments → Embed).
export const DEPLOYMENT_ID = "";

// The element's own preview bar is the totem's start control, so it carries
// the check-in copy. Deep-merged over the portal settings.
export const OVERRIDE_CONFIG = JSON.stringify({
  customization: {
    show_haircheck: false,
    preview: { title: "Check in with Ada", description: "", btn_title: "Check in" },
    after_call: { title: "Thanks for visiting", description: "" },
    magic_canvas: { accent_color: "#f3a6c3" },
  },
});

export const AGENT_NAME = "Ada";

/**
 * After a call ends the element shows its after-call screen. A kiosk has no
 * one to dismiss it, so the page recreates the element after this pause and
 * the next visitor gets the fresh preview.
 */
export const RESET_AFTER_CALL_MS = 8000;
