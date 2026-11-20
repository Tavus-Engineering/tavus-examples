# Tavus Conversational Video Interface with Transparent Background

This example demonstrates how to use the Tavus Conversational Video Interface (CVI) with a transparent background effect.

## 🚀 Features

- Simple interface to start a video conversation
- Transparent background effect using Tavus's greenscreen technology
- Basic audio controls (mute/unmute)
- Built with React and Daily.co for video calling

## 🎮 Try it Live

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Tavus-Engineering/tavus-examples/tree/main/examples/cvi-transparent-background?file=src%2FApp.tsx)

## 🛠 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your Tavus API key:
   ```
   TAVUS_API_KEY=your_api_key_here
   ```
   > You can create an API key at https://platform.tavus.io/api-keys

3. Start the development server:
   ```bash
   npm run dev
   ```
   This starts the Vite app and the small API server in `server.js`. Vite forwards `/api` requests to it.

To run a production build: `npm run build && npm start`. `server.js` then serves the built app and the API on port 3001 (or `PORT`).

## 🔐 Keeping your API key on the server

Your Tavus API key must never reach the browser. Vite bundles every `VITE_*` variable into the client JavaScript, so anyone visiting the page could read the key.

In this example:
- `TAVUS_API_KEY` has no `VITE_` prefix and is read only by `server.js`.
- The browser calls `/api/tavus` and `/api/persona` on its own backend. `server.js` calls `https://tavusapi.com` with the key and returns only the IDs and URL the page needs.

When you deploy, set `TAVUS_API_KEY` in your server's environment, and add your own authentication to the `/api` routes before exposing them publicly.

## 📚 Learn More

- [Developer Documentation](https://docs.tavus.io/)
- [API Reference](https://docs.tavus.io/api-reference/)
- [Tavus Platform](https://platform.tavus.io/)
- [Daily React Reference](https://docs.daily.co/reference/daily-react)
