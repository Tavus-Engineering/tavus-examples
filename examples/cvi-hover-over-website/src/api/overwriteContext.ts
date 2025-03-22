/**
 * Overwrites the conversational context for a specific conversation
 * @param conversationId - The ID of the conversation to update
 * @param token - Tavus API token
 * @param context - The new context to set
 */
export const overwriteConversationContext = async (
  conversationId: string,
  token: string,
  context: string
): Promise<void> => {
  const payload = {
    message_type: "conversation",
    event_type: "conversation.overwrite_llm_context",
    conversation_id: conversationId,
    properties: {
      context
    }
  };

  const response = await fetch("https://tavusapi.com/v2/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to overwrite context: ${response.statusText}`);
  }
}; 