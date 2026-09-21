import type { PromptVariant } from "./components/PromptSection.tsx";

const SHARED = `
Add a Tavus conversational video agent as an "Ask a specialist" card on the right side of the product hero, next to the product copy. While idle, the card shows the agent's preview inline. When the visitor starts a conversation, the card must morph into a centered modal over the whole page, and morph back into the sidebar when the call ends. The element does this itself; do not build a modal, a dialog, or an overlay.

The agent is the <tavus-embed> custom element from the @tavus/embed npm package.

Steps:
1. Install: npm install @tavus/embed
2. Import once at the app entry (main.tsx): import "@tavus/embed"; This registers the element and ships JSX typings for React.
3. Render the element inside a container in the hero's right column, roughly 480 to 560px wide with aspect-ratio: 16 / 9; the modal animation starts from that box. Give the wrapper a CSS class (in JSX the style attribute takes an object, not a string):
   .embed-card { width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; }
   <div className="embed-card">
     <tavus-embed deployment-id={DEPLOYMENT_ID} expand-options='{"enabled":true}' />
   </div>
4. expand-options is a JSON string. Supported keys:
   - enabled: boolean. true expands into a modal on start; false keeps the call inline.
   - aspect: "horizontal" (default, 16:9) or "vertical" (9:16).
   - custom_aspect: a ratio like "4/3" that overrides aspect.
   - fullscreen: true fills the viewport edge to edge and ignores aspect and caps. Supported by the 0.9 runtime, but not yet listed in the package's type doc comment, so do not be surprised when the .d.ts does not mention it.
   - max_width, max_height: pixel caps for the expanded card.
   Changing the attribute after mount is not supported; re-create the element (in React, change its key) to change it.
5. Keep the deployment id in one place: src/constants.ts with export const DEPLOYMENT_ID = "…" (from the Tavus portal, Deployments → Embed). Render a visible notice instead of the element when it is empty.
6. Do not style anything inside <tavus-embed>; it renders in its own shadow DOM and follows the deployment's theme from the Tavus portal. Optional page copy for the preview screen goes through override-config, a JSON string deep-merged over the portal settings: override-config='{"customization":{"preview":{"title":"Ask a specialist","description":"Ask anything about this product.","btn_title":"Start"}}}'

Note: expand-options is an experimental attribute. It works in @tavus/embed 0.9 and later, but its shape may still change.

For a static HTML page without a bundler use the CDN instead of npm:
   <script src="https://unpkg.com/@tavus/embed@latest"></script>

Reference: https://docs.tavus.io/sections/deployments/embed
`.trim();

export const PROMPT_VARIANTS: PromptVariant[] = [
  {
    id: "existing",
    label: "Add to an existing site",
    text: `I have an existing web app with a product page. ${SHARED}`,
  },
  {
    id: "new",
    label: "Start a new project",
    text: `Create a new Vite + React + TypeScript project (npm create vite@latest my-shop -- --template react-ts) with a single product page: a hero with product copy on the left (headline, a short paragraph, colour options and an add-to-cart button) and room for the agent on the right, all with placeholder copy (lorem ipsum is fine). Then ${SHARED.charAt(0).toLowerCase()}${SHARED.slice(1)}`,
  },
];
