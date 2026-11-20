// Minimal backend for this example.
//
// The Tavus API key is a server-side secret: it lives in TAVUS_API_KEY (no
// VITE_ prefix) and is only read here. The browser calls /api/tavus, and this
// server calls https://tavusapi.com with the key.
//
// `npm run dev` starts this server next to Vite, which proxies /api to it
// (see vite.config.ts). `npm run build && npm start` serves the built app and
// the API from this one process.
import express from 'express';

try {
  process.loadEnvFile(); // Load .env if present (Node 20.12+).
} catch {
  // No .env file: use the process environment.
}

const TAVUS_API = 'https://tavusapi.com/v2';
const PORT = Number(process.env.PORT) || 3001;
const PERSONA_ID = 'p9a95912'; // Stock Demo Persona

const app = express();
app.use(express.json());

// Same request shape as the route installed by `npx @tavus/cvi-ui add tavus-api`:
// { action: "create" } or { action: "end", conversationId }.
app.post('/api/tavus', async (req, res) => {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'TAVUS_API_KEY is not set in the server environment. Add it to .env.',
    });
  }

  const { action, conversationId } = req.body ?? {};

  if (action === 'create') {
    const tavusRes = await fetch(`${TAVUS_API}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ persona_id: PERSONA_ID }),
    });
    if (!tavusRes.ok) {
      return res
        .status(tavusRes.status)
        .json({ error: `Tavus create failed: ${await tavusRes.text()}` });
    }
    const { conversation_id, conversation_url } = await tavusRes.json();
    // Return only what the browser needs.
    return res.json({ conversation_id, conversation_url });
  }

  if (action === 'end') {
    if (
      typeof conversationId !== 'string' ||
      !/^[A-Za-z0-9_-]+$/.test(conversationId)
    ) {
      return res.status(400).json({ error: 'Invalid conversationId' });
    }
    const tavusRes = await fetch(
      `${TAVUS_API}/conversations/${conversationId}/end`,
      { method: 'POST', headers: { 'x-api-key': apiKey } },
    );
    if (!tavusRes.ok) {
      return res
        .status(tavusRes.status)
        .json({ error: `Tavus end failed: ${await tavusRes.text()}` });
    }
    return res.status(204).end();
  }

  return res.status(400).json({ error: 'Unknown action' });
});

// Serves the production build (`npm run build`). In development Vite serves the app.
app.use(express.static('dist'));

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
