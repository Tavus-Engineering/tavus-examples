// Paste the id of a deployment from the Tavus PAL Maker (https://maker.tavus.io).
export const DEPLOYMENT_ID = "";

// The page owns the start button, so the call goes straight in; the preview
// copy is the page's too, since the element is hidden until the call screen.
export const OVERRIDE_CONFIG = JSON.stringify({
  customization: {
    show_haircheck: false,
    preview: { title: "Your session", description: "Starting in a moment.", btn_title: "Start" },
  },
});

/** Per-call context forwarded to /start; the agent reads it before speaking. */
export function conversationalContext(firstName: string): string {
  return `The visitor's first name is ${firstName}. Address them by name. This is a short guided session; keep answers concise.`;
}

export function customGreeting(firstName: string): string {
  return `Hi ${firstName}, welcome. What would you like to go through today?`;
}

/**
 * Create the room while the visitor is still typing so Start joins it at once.
 * Each creation is a real conversation on the backend, one per visit here, so
 * a visitor who types a name and leaves still counts. Set to false to create
 * only on Start.
 */
export const WARM_ROOM_WHILE_TYPING = true;
