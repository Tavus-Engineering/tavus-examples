export const endConversation = async (
  token: string,
  conversationId: string,
) => {
  try {
    const response = await fetch(
      `https://tavusapi.com/v2/conversations/${conversationId}/end`,
      {
        method: "POST",
        headers: {
          "x-api-key": token ?? "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to end conversation");
    }

    return null;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
