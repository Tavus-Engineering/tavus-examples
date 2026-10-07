# Tavus Examples

Welcome to our collection of demos and projects showcasing the Tavus conversational video interface! 🚀

## 💻 Examples

- [CVI Quickstart React](./examples/cvi-quickstart-react)
- [CVI Transparent Background](./examples/cvi-transparent-background)
- [Replica Recording](./examples/replica-recording)
- [CVI UI Conversation](./examples/cvi-ui-conversation)
- [CVI UI Haircheck and Conversation](./examples/cvi-ui-haircheck-conversation)

### Embed (`<tavus-embed>`)

Each demo is a neutral product page built on the [`@tavus/embed`](https://www.npmjs.com/package/@tavus/embed) package. One shared prompt, [examples/embed-prompt.md](./examples/embed-prompt.md), is behind every "Build this" button: paste it into a coding agent (Cursor, Claude Code, Lovable, Replit), it asks what you want to build and explains what `<tavus-embed>` can do. No backend and no API key; a deployment id is all the browser needs. When the id is already known, for example in a link from the PAL Maker, put a line above the prompt: `Deployment id: <id>. Keep the @tavus/embed dependency on the "latest" tag.` and the prompt will not ask for it. The same goes for the PAL's tools: list them above the prompt (`Tools the agent can call on the page: add_to_cart(product_id), open_product(slug)`) and the agent builds the handlers without asking. Reference: [Embed](https://docs.tavus.io/sections/deployments/embed), [Host communication](https://docs.tavus.io/sections/deployments/host-communication), and the [documentation index for agents](https://docs.tavus.io/llms.txt).

- [Embed on a landing page](./examples/embed-landing-page) — one element in its own section, the simplest integration
- [Embed as a preview card that opens into a modal](./examples/embed-preview-to-modal) — `expand-options` on a product page
- [Embed driven from the host page](./examples/embed-programmatic) — your own button opens a modal and starts the call, `TavusIntegration` events and methods
- [Embed on a page of its own](./examples/embed-full-screen) — a three-step flow where the call is the middle step on its own route, `layout="full-screen"`, warm room created during the intake step
- [Embed on an unattended screen](./examples/embed-unattended-screen) — a kiosk, lobby or trade-show screen; portrait check-in totem, the element's own Check-in button, resets itself between visitors
- [Embed in a three-screen session flow](./examples/embed-session-flow) — name step, live transcript from protocol events, summary with transcript download

## 🎄 Showcases

- [Tavus Santa Demo](./showcase/santa-demo)

## 📚 Learn More

Ready to dive deeper? Check out these resources:

- 📖 [Developer Documentation](https://docs.tavus.io/)
- 🔧 [API Reference](https://docs.tavus.io/api-reference/)
- 🚀 [Tavus Platform](https://platform.tavus.io/)

Start exploring and happy coding! 🎉

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
