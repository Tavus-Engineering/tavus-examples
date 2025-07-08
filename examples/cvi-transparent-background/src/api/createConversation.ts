import type { IConversation } from "../types";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token,
    },
    body: JSON.stringify({
      // Stock Demo Persona
      persona_id: "p48fdf065d6b",
      properties: {
        // Apply greenscreen to the background
        apply_greenscreen: true,
      },
    }),
  });

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
