// Calls this app's own backend (server.js), which holds the Tavus API key.
export const endConversation = async (conversationId: string) => {
  try {
    const response = await fetch("/api/tavus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", conversationId }),
    });

    if (!response.ok) {
      throw new Error("Failed to end conversation");
    }

    return null;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
