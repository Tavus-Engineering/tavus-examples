// import { REPLICATE_API_TOKEN } from "@/config";
import type { IConversation } from "@/types";

export const createConversation = async (): Promise<IConversation> => {
  try {
    // const DEPLOYMENT = "realtime-replica-phoenix2";
    const response = await fetch(`http://localhost:3000/api/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Prediction ID:", data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
