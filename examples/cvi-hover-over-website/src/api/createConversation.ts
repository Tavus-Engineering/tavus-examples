import type { IConversation } from "../types";

// Calls this app's own backend (server.js), which holds the Tavus API key.
// Never call https://tavusapi.com from the browser: the key would ship in
// the client bundle.
export const createConversation = async (personaId?: string): Promise<IConversation> => {
  const response = await fetch("/api/tavus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      params: personaId ? { persona_id: personaId } : {},
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${await response.text()}`);
  }

  return response.json();
};
