# Tavus Conversational Video Interface

## 🚀 Features

This app includes:
- Welcome screen featuring a "Start Conversation" button to initiate the CVI
- Hair check screen with custom select options to manage audio and video devices
- Video call interface powered by Daily.co
- Integration with Tavus API for conversation management

|                                                                    |                                                                                              |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| ![Prejoin UI](https://cdn.replica.tavus.io/git-examples/scr-1.png) | ![Hair check UI](https://cdn.replica.tavus.io/git-examples/scr-2.png) |
| ![in-call UI](https://cdn.replica.tavus.io/git-examples/scr-3.png) |


## 🎥 Demo Video

Check out our demo video to see the Conversational Video Interface in action:

[Watch the Demo](https://www.loom.com/share/b4e3ef661e264260a8d8f4cede48aaa8?sid=ada64974-5495-4c52-b635-7ac76b543208)



## 🛠 Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` in the root directory and add your Tavus API key:
   ```
   TAVUS_API_KEY=your_api_key_here
   ```
   You can create an API key at https://platform.tavus.io/

3. Start the development server:
   ```
   npm run dev
   ```
   This starts the Vite app and the small API server in `server.js`. Vite forwards `/api` requests to it.

To run a production build: `npm run build && npm start`. `server.js` then serves the built app and the API on port 3001 (or `PORT`).

## 🔐 Keeping your API key on the server

Your Tavus API key must never reach the browser. Vite bundles every `VITE_*` variable into the client JavaScript, so anyone visiting the page could read the key.

In this example:
- `TAVUS_API_KEY` has no `VITE_` prefix and is read only by `server.js`.
- The browser calls `/api/tavus` on its own backend to create and end conversations. `server.js` calls `https://tavusapi.com` with the key and returns only `conversation_id` and `conversation_url`.

When you deploy, set `TAVUS_API_KEY` in your server's environment, and add your own authentication to `/api/tavus` before exposing it publicly.

## 📚 Learn More

- [Developer Documentation](https://docs.tavus.io/)
- [API Reference](https://docs.tavus.io/api-reference/)
- [Tavus Platform](https://platform.tavus.io/)
- [Daily React Reference](https://docs.daily.co/reference/daily-react)
