// Paste the id of a deployment from the Tavus PAL Maker (https://maker.tavus.io).
export const DEPLOYMENT_ID = "";

// Page-specific preview copy, deep-merged over the portal settings.
export const OVERRIDE_CONFIG = JSON.stringify({
  customization: {
    preview: {
      title: "Ask a specialist",
      description: "Lorem ipsum dolor sit amet. Live, right here.",
      btn_title: "Start",
    },
  },
});

/**
 * `expand-options` is a JSON attribute on <tavus-embed>. While the element is
 * idle it stays inline in its slot; when a conversation starts, the card
 * morphs into a centered modal on the browser's top layer and morphs back when
 * the call ends.
 */
export const EXPAND_OPTIONS = JSON.stringify({ enabled: true });
