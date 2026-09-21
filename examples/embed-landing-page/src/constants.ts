// Paste the id of a deployment from the Tavus portal (Deployments → Embed).
export const DEPLOYMENT_ID = "";

// Optional: page-specific copy for the preview screen, deep-merged over the
// deployment settings from the portal. Remove to use the portal copy as-is.
export const OVERRIDE_CONFIG = JSON.stringify({
  customization: {
    preview: {
      title: "Talk to our agent",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      btn_title: "Start a conversation",
    },
  },
});
