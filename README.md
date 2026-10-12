# Tavus Examples

Welcome to our collection of demos and projects showcasing the Tavus conversational video interface! 🚀

## 💻 Examples

### 🎬 Basic CVI Examples
- **[CVI Quickstart React](./examples/cvi-quickstart-react)** - Complete React app with welcome screen, hair check, and video calling interface. Includes device selection and Tavus API integration. [📹 Demo Video](https://www.loom.com/share/b4e3ef661e264260a8d8f4cede48aaa8?sid=ada64974-5495-4c52-b635-7ac76b543208)
- **[CVI Transparent Background](./examples/cvi-transparent-background)** - Simple React interface demonstrating transparent background effects using Tavus's greenscreen technology. [🚀 Try Live](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/examples/cvi-transparent-background?file=src%2FApp.tsx)
- **[CVI UI Conversation](./examples/cvi-ui-conversation)** - Step-by-step guide to embedding Tavus CVI UI components in React with conversation management. [🚀 Try Live](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/examples/cvi-ui-conversation?file=src%2FApp.tsx)
- **[CVI UI Haircheck and Conversation](./examples/cvi-ui-haircheck-conversation)** - Enhanced version with hair check component for device permissions before starting conversations. [🚀 Try Live](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/examples/cvi-ui-haircheck-conversation?file=src%2FApp.tsx)

### 🎮 Interactive Examples
- **[Red or Black Card Game](./examples/red_or_black)** - Interactive card game demonstrating tool calls with Tavus CVI. AI dealer responds to user guesses through function calls. [🎯 Play Live](https://andy-tavus.github.io/red_or_black/)
- **[Interactions Protocol Playground](./examples/interactions-protocol-playground)** - Comprehensive testing environment for Tavus replica interactions with real-time event logging and controls. [🔧 Try Live](https://andy-tavus.github.io/interactions-protocol-playground/)

### 🎥 Video & Recording
- **[Replica Recording](./examples/replica-recording)** - Demonstrates webcam recording and media device selection for creating Tavus replicas. [🚀 Try Live](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/examples/replica-recording?file=src%2FApp.tsx)
- **[Start/Stop Recording](./examples/start-stop-recording)** - Shows how to programmatically control cloud recording in Tavus conversations with S3 integration. [📹 Try Live](https://andy-tavus.github.io/start-stop-recording/)
- **[CVI Greenscreen WebGL](./examples/CVI-greenscreen-webGL)** - Real-time green screen removal using WebGL with dynamic background color changes. [🎬 Try Live](https://andy-tavus.github.io/CVI-greenscreen-webGL/)

### 💬 Chat & Communication
- **[Text Chat Only CVI](./examples/text_chat_only_cvi)** - Minimal text-only chat interface using conversation-respond events, no microphone required. [💬 Try Live](https://andy-tavus.github.io/text_chat_only_cvi/)
- **[Microphone-Only CVI](./examples/microphone-only-cvi)** - Voice-only interface for conversing with Tavus replicas using microphone input. [🎤 Try Live](https://andy-tavus.github.io/microphone-only-cvi/)

### 🔧 Technical Examples
- **[Custom LLM with Backend](./examples/cvi-custom-llm-with-backend)** - Flask application providing custom LLM backend for Tavus CVI with real-time ISS location data integration
- **[Frontend-Backend Tools](./examples/cvi-frontend-backend-tools)** - Complete example integrating frontend and backend with LLM tools for shopping cart functionality
- **[CVI Hover Over Website](./examples/cvi-hover-over-website)** - Implementation showing how to overlay CVI on existing websites
- **[Join Raw Stream](./examples/join_raw_stream)** - Technical demo for directly subscribing to participant streams, bypassing standard Daily.co UI. [🔗 Try Live](https://andy-tavus.github.io/join_raw_stream/)
- **[Custom Ending Message](./examples/custom_ending_message)** - Shows how to implement custom end messages for video meetings using Daily.co's JavaScript SDK. [🎯 Try Live](https://andy-tavus.github.io/custom_ending_message/)

### Build a deployment with a coding agent

Two prompts, one per element, are the way in for Cursor, Claude Code, Codex, Lovable, Replit, Bolt or v0: [examples/embed-prompt.md](./examples/embed-prompt.md) for `<tavus-embed>`, a conversation inside the layout (it is behind every "Build this" button in the demos below), and [examples/widget-prompt.md](./examples/widget-prompt.md) for `<tavus-widget>`, a floating launcher on every page. Each asks what you want to build, where it goes, for your deployment id and whether the PAL has page tools, explains what the element can and cannot do, and points at the reference. No backend and no API key; a deployment id is all the browser needs. When the id or the tools are already known, for example in a link from the PAL Maker, put a line above the prompt (`Deployment id: <id>. Keep the @tavus/embed dependency on the "latest" tag.` or `Tools the agent can call on the page: add_to_cart(product_id), open_product(slug)`) and the prompt will not ask. Reference: [Build with a coding agent](https://docs.tavus.io/sections/deployments/coding-agents), [Embed](https://docs.tavus.io/sections/deployments/embed), [Widget](https://docs.tavus.io/sections/deployments/widget), [Host communication](https://docs.tavus.io/sections/deployments/host-communication), and the [documentation index for agents](https://docs.tavus.io/llms.txt).

### Embed (`<tavus-embed>`)

Each demo is a neutral product page built on the [`@tavus/embed`](https://www.npmjs.com/package/@tavus/embed) package.

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
