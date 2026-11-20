/**
 * Creates the example's click-action persona.
 * The persona config and the Tavus API key both live in server.js.
 * @returns Promise with the created persona's ID
 */
export const createPersona = async (): Promise<{ persona_id: string }> => {
  const response = await fetch("/api/persona", { method: "POST" });

  if (!response.ok) {
    throw new Error(`Failed to create persona: ${await response.text()}`);
  }

  return response.json();
};
