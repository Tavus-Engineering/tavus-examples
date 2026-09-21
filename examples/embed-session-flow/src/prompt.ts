import type { PromptVariant } from "./components/PromptSection.tsx";

const SHARED = `
Add a three-screen guided session with a Tavus conversational video agent: (1) an intro screen that asks for the visitor's first name and has a Start button, (2) a call screen with the video on the left and a live transcript on the right plus an End button, (3) a summary screen with "Nice work, {name}", the duration, the full transcript, a Download .txt button and Back to start. The agent is the <tavus-embed> custom element from the @tavus/embed npm package; the same package exports a typed TavusIntegration helper.

Steps:
1. Install: npm install @tavus/embed
2. Import once at the app entry (main.tsx): import "@tavus/embed"; This registers the element and ships JSX typings for React.
3. Mount the element once, from page load, inside a hidden wrapper (the wrapper gets the hidden attribute while the screen is not the call screen; do not unmount it between screens). Mounting early means the element fetches its config and fires tavus:ready long before the visitor finishes typing, so the Start click can call startConversation() directly from the click. Never call startConversation() inside the tavus:ready handler itself.
   <div className="stage"><tavus-embed deployment-id={DEPLOYMENT_ID} override-config='{"customization":{"show_haircheck":false}}' conversational-context={context} custom-greeting={greeting} /></div>
   The wrapper has a definite width and aspect-ratio: 16 / 9; the element gets display: block; width: 100%; height: 100%. Use CSS classes; in JSX the style attribute takes an object, not a string.
4. Pass the name to the agent through two attributes, updated as the visitor types so they are already on the element when Start is clicked:
   conversational-context: "The visitor's first name is {name}. Address them by name." (forwarded to the call as context)
   custom-greeting: "Hi {name}, welcome. What would you like to go through today?" (the agent's first line)
5. Model the page state as one union and derive everything from it: intro | call (firstName, startedAt: number | null) | summary (firstName, durationMs). Keep a separate ready boolean and a transcript array.
6. Wire the helper in an effect after the element is in the DOM:
   import { TavusIntegration } from "@tavus/embed";
   const tavus = new TavusIntegration("tavus-embed");
   tavus.on("tavus:ready", () => ready = true);                    // enables the Start button
   tavus.on("tavus:conversation-started", () => set startedAt = Date.now());
   tavus.on("tavus:conversation-ended", () => go to summary with durationMs from startedAt; the event carries only conversationId);
   tavus.on("tavus:error", () => same as ended);
   tavus.on("tavus:protocol-message", (e) => { if (e.detail.event_type === "conversation.utterance" && typeof e.detail.properties.final !== "boolean") push { role: e.detail.properties.role, speech: e.detail.properties.speech } });
   protocol-message detail is typed unknown in the helper; write a small guard that checks event_type === "conversation.utterance", properties.role is "user" or "replica", properties.speech is a string, and properties.final is absent. Streaming partials (one growing line per word) arrive under the same event_type with a boolean final; skipping them leaves one line per finished utterance, which is what the element's own chat panel shows.
   Unsubscribe with tavus.off in the effect cleanup.
7. Start button: disabled until ready and until the name is non-empty; on submit set the screen to call and call tavus.startConversation(). End button: tavus.endConversation(); enabled once startedAt is set.
   Warm-up (@tavus/embed 0.14+): about a second after the visitor pauses on a name of two or more characters, call tavus.createConversation() once per visit. It creates the room without joining, so the later startConversation() joins an already warm conversation and the call opens without the usual wait. Every creation is a real conversation on the backend, so never create on each keystroke or each pause: remember the name you warmed for, and if it differs at Start, call createConversation() again there and start when it settles (the element ends the room nobody joined). It rejects if the room could not be created (also reported as tavus:error); clear the remembered name in the catch and the next start creates one as usual.
8. Transcript list: one row per utterance, label "Agent" for role replica and the visitor's name for role user, auto-scroll to the newest line. The summary reuses the same list and offers Download .txt built from the lines with a Blob and a temporary <a download>.
9. Back to start: clear the transcript and the name, go to intro, and recreate the element by bumping a session counter used as the React key on the element's wrapper, so the next session starts from a fresh preview. Re-subscribe after the remount (the effect depends on the counter).
10. Keep the deployment id in one place: src/constants.ts with export const DEPLOYMENT_ID = "…" (from the Tavus portal, Deployments → Embed). Render a visible notice instead of the flow when it is empty.
11. Do not style anything inside <tavus-embed>; it renders in its own shadow DOM and follows the deployment's theme from the Tavus portal.
12. The package README only covers the CDN drop-in. The host API (TavusIntegration, TavusEventMap, TavusInteraction) is fully typed in node_modules/@tavus/embed/dist/index.d.ts and integration.d.ts; read those for exact signatures.

For a static HTML page without a bundler use the CDN instead of npm (<script src="https://unpkg.com/@tavus/embed@latest"></script>); the same methods and events exist on the element itself: el.addEventListener("tavus:protocol-message", ...), el.startConversation().

Reference: https://docs.tavus.io/sections/deployments/host-communication
`.trim();

export const PROMPT_VARIANTS: PromptVariant[] = [
  {
    id: "existing",
    label: "Add to an existing site",
    text: `I have an existing React app and want this as a dedicated route or page. ${SHARED}`,
  },
  {
    id: "new",
    label: "Start a new project",
    text: `Create a new Vite + React + TypeScript project (npm create vite@latest my-session -- --template react-ts) with a light, neutral look (placeholder brand, lorem ipsum copy). Then ${SHARED.charAt(0).toLowerCase()}${SHARED.slice(1)}`,
  },
];
