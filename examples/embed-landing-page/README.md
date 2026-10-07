# Embed on a landing page

A neutral marketing page (placeholder brand, lorem ipsum copy) with a Tavus agent living in its own section. This is the plainest integration there is: one npm package, one import, one `<tavus-embed>` element inside a 16:9 container. Everything the visitor sees inside the frame (preview, start button, device check, call) comes from the deployment settings in the Tavus portal.

![Screenshot](./screenshot.png)

## How it behaves

![The agent section: preview, Start, the call, the after-call screen](./demo.gif)

The recording scrolls to the agent section, presses Start, stays in the call while the agent speaks, ends it, and lands on the element's after-call screen. The visitor's camera in the recording is a fake device.

## Run it

```bash
npm install
npm run dev
```

Paste your deployment id into `src/constants.ts` (create a deployment at [maker.tavus.io](https://maker.tavus.io) if you do not have one). Without an id the page renders a notice where the embed would be.

## What to look at

- `src/main.tsx` imports `@tavus/embed` once. That registers the custom element and, because the package ships JSX typings, `<tavus-embed>` is type-checked in React.
- `src/App.tsx` renders the element inside `.embed-frame`, a container with a definite width and `aspect-ratio: 16 / 9`. The element fills its parent, so the parent decides the size.
- `src/constants.ts` holds the deployment id and an optional `override-config`. The override only changes the preview copy for this page; delete it to use the portal copy.

## Build it with a coding agent

Copy [the embed prompt](../embed-prompt.md) into your agent (Cursor, Claude Code, Lovable, Replit). It asks what you want to build, explains what `<tavus-embed>` can do, and points at the docs and these examples. Say you want to start from this one. The same prompt is behind the "Build this" button on the page.

## Stack

Vite, React 19, TypeScript, Oxlint. `npm run lint` and `npm run build` (which runs `tsc -b`) both pass clean.

Docs: [Embed](https://docs.tavus.io/sections/deployments/embed).
