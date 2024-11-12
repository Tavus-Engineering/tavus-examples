export const endConversation = async (conversationId: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/conversations/${conversationId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to end conversation: ${response.status}`);
    }

    return null;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
