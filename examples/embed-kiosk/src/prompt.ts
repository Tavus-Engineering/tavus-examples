import type { PromptVariant } from "./components/PromptSection.tsx";

const SHARED = `
Build a check-in totem: a portrait (9:16) kiosk screen with our branding where a Tavus video agent sits in a card in the middle and a greeting like "Hi, I'm Ada." sits under it. The agent's own preview button, relabelled "Check in", starts the conversation. After the call the screen resets on its own for the next visitor. The agent is the <tavus-embed> custom element from the @tavus/embed npm package; the same package exports a typed TavusIntegration helper.

Steps:
1. Install: npm install @tavus/embed
2. Import once at the app entry (main.tsx): import "@tavus/embed"; This registers the element and ships JSX typings for React.
3. Kiosk page basics: html and body at height 100%, margin 0, overflow hidden, user-select none, viewport meta with viewport-fit=cover. Set html { font-size: clamp(16px, 1.35dvh, 28px) }: the element's portrait layout switches under 28rem of container width and its type scale is rem-based, so a root size that grows with the screen gives a bigger card and bigger controls on a large totem while the element keeps its native shape. The totem is a flex column with height 100dvh and width min(100vw, 100dvh * 9 / 16), centered on black, so it fills a portrait screen and shows as a device-shaped column on a landscape monitor. Use container units (cqw) for type and spacing so it scales with the screen.
4. Layout, top to bottom: a slim top bar (brand left, small text right); a portrait card with aspect-ratio 9 / 16 and width: min(100%, 27rem, 60dvh * 9 / 16), centered, rounded corners, overflow hidden, containing the element. Under 28rem of width the element switches to its own portrait layout, so this is its native shape and nothing is cropped; a greeting block (h1 "Hi, I'm Ada.", one line of copy); a slim bottom bar with a status line. Give the element display: block; width: 100%; height: 100%:
   <tavus-embed deployment-id={DEPLOYMENT_ID} override-config={OVERRIDE_CONFIG} />
   OVERRIDE_CONFIG is a JSON string deep-merged over the portal settings; give the element's preview bar the check-in copy and skip the device check so a tap on Check in goes straight into the call:
   JSON.stringify({ customization: { show_haircheck: false, preview: { title: "Check in with Ada", description: "", btn_title: "Check in" }, after_call: { title: "Thanks for visiting", description: "" }, magic_canvas: { accent_color: "#f3a6c3" } } })
   magic_canvas.accent_color (0.9.4+) tints Magic Canvas cards with the page's accent.
   An empty preview title falls back to the default copy, so keep a short title.
5. Never cover any part of the card. The element's preview bar is the start control, its call controls sit at the bottom during the call, and its after-call screen (with its own restart button) shows until the reset.
6. Model the state as one union: loading | attract | in-call | wrapping-up. The page only listens; wire it with the helper, created after the element is in the DOM:
   import { TavusIntegration } from "@tavus/embed";
   const tavus = new TavusIntegration("tavus-embed");
   tavus.on("tavus:ready", () => attract);
   tavus.on("tavus:conversation-started", () => in-call);
   tavus.on("tavus:conversation-ended", () => wrapping-up);
   tavus.on("tavus:error", () => wrapping-up);
7. Reset between visitors: when the state is wrapping-up, wait about 8 seconds, then recreate the element (in React keep a session counter in state and use it as the key on the card; bumping it unmounts the old element and mounts a fresh one that shows the preview again) and go back to loading until the new element reports ready. Re-subscribe after each remount (the effect depends on the counter).
8. Add a small Fullscreen button (document.documentElement.requestFullscreen()) for demoing on a laptop; kiosk browsers usually run fullscreen already.
9. Keep the deployment id in one place: src/constants.ts with export const DEPLOYMENT_ID = "…" (from the Tavus portal, Deployments → Embed). Render a visible notice instead of the totem when it is empty.
10. Do not style anything inside <tavus-embed>; it renders in its own shadow DOM and follows the deployment's theme from the Tavus portal.

Deployment settings that matter for a kiosk (in the Tavus portal, not in code): turn bot protection off for a kiosk in a staffed room, since the check is friction with no upside there. If the agent uses Magic Canvas cards on a portrait screen, open the page with ?kiosk=1 in the URL so tall cards scroll instead of being scaled down.

For a static HTML page without a bundler use the CDN instead of npm:
   <script src="https://unpkg.com/@tavus/embed@latest"></script>
   and the same events on the element itself: document.querySelector("tavus-embed").addEventListener("tavus:conversation-ended", ...).

Reference: https://docs.tavus.io/sections/deployments/host-communication
`.trim();

export const PROMPT_VARIANTS: PromptVariant[] = [
  {
    id: "existing",
    label: "Add to an existing site",
    text: `I have an existing React app and want a dedicated kiosk route in it. ${SHARED}`,
  },
  {
    id: "new",
    label: "Start a new project",
    text: `Create a new Vite + React + TypeScript project (npm create vite@latest my-kiosk -- --template react-ts) with a single page and no other content. Then ${SHARED.charAt(0).toLowerCase()}${SHARED.slice(1)}`,
  },
];
