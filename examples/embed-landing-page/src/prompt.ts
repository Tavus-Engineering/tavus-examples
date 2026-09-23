import type { PromptVariant } from "./components/PromptSection.tsx";

const SHARED = `
Add a Tavus conversational video agent to the page as an inline section. The agent is a <tavus-embed> custom element from the @tavus/embed npm package. Do not build any video UI yourself; the element renders the whole experience (preview, start button, call, captions) in its own shadow DOM, styled from the Tavus portal.

Steps:
1. Install the package: npm install @tavus/embed
2. Import it once, at the app entry (for example main.tsx): import "@tavus/embed"; The import registers the <tavus-embed> element and ships JSX typings for React, so the tag is type-checked.
3. Add a dedicated section to the page with a short heading and one sentence of copy, then the element inside a wrapper that has these CSS rules (as a class in your stylesheet; in JSX the style attribute takes an object, not a string):
   .embed-frame { width: 100%; max-width: 1040px; aspect-ratio: 16 / 9; margin: 0 auto; }
   <div className="embed-frame">
     <tavus-embed deployment-id={DEPLOYMENT_ID} />
   </div>
   The element fills its parent, so the parent must have a definite width. Keep 16:9 on desktop; under 28rem wide the element switches to a portrait layout on its own.
4. Keep the deployment id in one place: src/constants.ts with export const DEPLOYMENT_ID = "…" (from the Tavus portal, Deployments → Embed). Render a visible notice instead of the element when it is empty.
5. Do not put CSS, children, or wrappers with padding inside <tavus-embed>. Colors, radius, fonts and copy come from the deployment settings in the Tavus portal.
6. Optional: to give the preview screen page-specific copy, pass the override-config attribute with a JSON string. It is deep-merged over the portal settings:
   override-config='{"customization":{"preview":{"title":"Talk to our agent","description":"Ask anything, live on camera.","btn_title":"Start a conversation"}}}'
7. The element has more attributes than this page uses (conversational-context, custom-greeting, memory-stores, layout). They are documented at the reference link; use them only if the page needs them.

For a static HTML page without a bundler use the CDN instead of npm:
   <script src="https://unpkg.com/@tavus/embed@latest"></script>

Reference: https://docs.tavus.io/sections/deployments/embed
`.trim();

export const PROMPT_VARIANTS: PromptVariant[] = [
  {
    id: "existing",
    label: "Add to an existing site",
    text: `I have an existing web app. ${SHARED}`,
  },
  {
    id: "new",
    label: "Start a new project",
    text: `Create a new landing page as a Vite + React + TypeScript project (npm create vite@latest my-site -- --template react-ts). Design a simple, tasteful marketing page with a hero, a features row and a footer, using placeholder copy (lorem ipsum is fine), then ${SHARED.charAt(0).toLowerCase()}${SHARED.slice(1)}`,
  },
];
