import type { IConversation } from "../types";

export const createConversation = async (
  token: string,
  personaId?: string
): Promise<IConversation> => {
  console.log(personaId)
  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token,
    },
    body: JSON.stringify(personaId ? { persona_id: personaId, properties: { apply_greenscreen: true } } : {}),
  });

  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.statusText}`);
    console.log(response)
  }

  return response.json();
};
