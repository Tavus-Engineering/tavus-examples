import type { PromptVariant } from "./components/PromptSection.tsx";

const SHARED = `
Add a Tavus conversational video agent that is opened from my own button. Nothing from Tavus should be on the page until the button is pressed. On click, mount the agent inside a modal that I own, wait until the agent reports ready, start the conversation programmatically, and remove everything again when the modal closes. The agent is the <tavus-embed> custom element from the @tavus/embed npm package; the same package exports a typed TavusIntegration helper for talking to it.

Steps:
1. Install: npm install @tavus/embed (0.9.2 or later; earlier versions stalled when startConversation() was called inside the tavus:ready handler)
2. Import once at the app entry (main.tsx): import "@tavus/embed"; This registers the element and ships JSX typings for React.
3. Model the page state as one discriminated union and derive every label from it; do not keep separate booleans:
   idle | opening | starting | live (with conversationId and startedAt) | ended (with durationMs) | error (with message)
   The element is mounted whenever the state is not idle.
4. The page shows a headline, a status pill derived from the state, and a "Start a call" button. Clicking it sets the state to opening, which mounts a native <dialog> (call showModal() in an effect after mount) containing:
   <tavus-embed deployment-id={DEPLOYMENT_ID} override-config='{"customization":{"show_haircheck":false}}' />
   inside a wrapper with width: 100% and aspect-ratio: 16 / 9 (use a CSS class; in JSX the style attribute takes an object, not a string). The override skips the device-check screen so the call starts without a second click. Do not render the element anywhere else, and do not hide it with CSS; mount and unmount it.
5. In an effect that runs when the element mounts, create the helper and subscribe. TavusIntegration looks the element up with document.querySelector, so it must be created after the element is in the DOM:
   import { TavusIntegration } from "@tavus/embed";
   const tavus = new TavusIntegration("tavus-embed");
   tavus.on("tavus:ready", () => { set state starting; tavus.startConversation(); });
   tavus.on("tavus:conversation-started", (e) => set state live, record Date.now() as startedAt; e.detail.conversationId is the id);
   tavus.on("tavus:conversation-ended", () => set state ended with the duration computed from startedAt; the event carries only conversationId);
   tavus.on("tavus:error", (e) => set state error with e.detail.message);
   Unsubscribe with tavus.off in the effect cleanup. The element's methods are installed only when tavus:ready fires, so never call startConversation() before it.
6. A bar under the video, wired to the helper. The element already has its own end-call and device controls, so do not duplicate them:
   - The status pill from step 4, showing the elapsed time while live.
   - Suggested-question chips, enabled only while live: tavus.sendMessage({ event_type: "conversation.respond", properties: { text } }); the agent answers the text as if the visitor asked it. Give the pill and the chips the same height so they read as one row.
   - When the state is ended or error, show a panel over the video with the outcome and a Close button. Close sets the state back to idle, which unmounts the dialog and the element. Unmounting the element ends any live call on its own.
   - Handle the dialog's onClose (Escape key) the same way as Close.
7. Keep the deployment id in one place: src/constants.ts with export const DEPLOYMENT_ID = "…" (from the Tavus portal, Deployments → Embed). Render a visible notice instead of the button when it is empty.
8. Do not style anything inside <tavus-embed>; it renders in its own shadow DOM and follows the deployment's theme from the Tavus portal.
9. The package README only covers the CDN drop-in. The host API (TavusIntegration, TAVUS_EVENT_NAMES, TavusEventMap, TavusInteraction) is fully typed in node_modules/@tavus/embed/dist/index.d.ts and integration.d.ts; read those for exact signatures.

Without a bundler, the same methods and events exist on the element directly: create the element with document.createElement("tavus-embed"), append it, listen for "tavus:ready", then call el.startConversation(). Load it with <script src="https://unpkg.com/@tavus/embed@latest"></script>.

Keep the page copy about the product; the wiring above stays in code. While debugging, TAVUS_EVENT_NAMES lists every event the element dispatches, so a temporary listener over all of them shows the real sequence.

Reference: https://docs.tavus.io/sections/deployments/host-communication
`.trim();

export const PROMPT_VARIANTS: PromptVariant[] = [
  {
    id: "existing",
    label: "Add to an existing site",
    text: `I have an existing React app with a support page. ${SHARED}`,
  },
  {
    id: "new",
    label: "Start a new project",
    text: `Create a new Vite + React + TypeScript project (npm create vite@latest my-support -- --template react-ts) with a single support page: a headline, a status line and one button, placeholder copy is fine. Then ${SHARED.charAt(0).toLowerCase()}${SHARED.slice(1)}`,
  },
];
