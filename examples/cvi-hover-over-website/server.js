// Minimal backend for this example.
//
// The Tavus API key is a server-side secret: it lives in TAVUS_API_KEY (no
// VITE_ prefix) and is only read here. The browser calls the /api routes
// below, and this server calls https://tavusapi.com with the key.
//
// `npm run dev` starts this server next to Vite, which proxies /api to it
// (see vite.config.ts). `npm run build && npm start` serves the built app and
// the API from this one process.
import express from "express";

try {
  process.loadEnvFile(); // Load .env if present (Node 20.12+).
} catch {
  // No .env file: use the process environment.
}

const TAVUS_API = "https://tavusapi.com/v2";
const PORT = Number(process.env.PORT) || 3001;

// Persona this example creates. It gives the replica a clickElement tool,
// which the app handles in src/App.tsx.
const PERSONA = {
  persona_name: "Interactive Assistant",
  system_prompt:
    "You are an AI assistant that can help users interact with the webpage. You can click elements when users request it.",
  context: "You have the ability to click elements on the page when users ask you to.",
  default_replica_id: "rc8992fe8e8e",
  layers: {
    llm: {
      model: "tavus-llama",
      tools: [
        {
          type: "function",
          function: {
            name: "clickElement",
            description: "Click an element on the webpage based on the provided selector or description",
            parameters: {
              type: "object",
              properties: {
                selector: {
                  type: "string",
                  description: "CSS selector or description of the element to click",
                },
                elementType: {
                  type: "string",
                  description: "Type of element to click",
                  enum: ["button", "link", "input", "any"],
                },
              },
              required: ["selector"],
            },
          },
        },
      ],
    },
  },
};

const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

class TavusError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function callTavus(path, body) {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    throw new TavusError(500, "TAVUS_API_KEY is not set in the server environment. Add it to .env.");
  }
  const res = await fetch(`${TAVUS_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    throw new TavusError(res.status, `Tavus API ${path} failed: ${res.status} ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const app = express();
app.use(express.json());

// Same request shape as the route installed by `npx @tavus/cvi-ui add tavus-api`:
// { action: "create", params } or { action: "end", conversationId }.
app.post("/api/tavus", async (req, res) => {
  const { action, params = {}, conversationId } = req.body ?? {};

  if (action === "create") {
    // Only forward the fields this app needs; the server decides the rest.
    const personaId = typeof params.persona_id === "string" ? params.persona_id : undefined;
    if (personaId !== undefined && !ID_PATTERN.test(personaId)) {
      return res.status(400).json({ error: "Invalid persona_id" });
    }
    const conversation = await callTavus(
      "/conversations",
      personaId ? { persona_id: personaId, properties: { apply_greenscreen: true } } : {},
    );
    // Return only what the browser needs.
    return res.json({
      conversation_id: conversation.conversation_id,
      conversation_url: conversation.conversation_url,
    });
  }

  if (action === "end") {
    if (typeof conversationId !== "string" || !ID_PATTERN.test(conversationId)) {
      return res.status(400).json({ error: "Invalid conversationId" });
    }
    await callTavus(`/conversations/${conversationId}/end`);
    return res.status(204).end();
  }

  return res.status(400).json({ error: "Unknown action" });
});

app.post("/api/persona", async (_req, res) => {
  const persona = await callTavus("/personas", PERSONA);
  res.json({ persona_id: persona.persona_id });
});

// Serves the production build (`npm run build`). In development Vite serves the app.
app.use(express.static("dist"));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
