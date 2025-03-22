import { IPersonaResponse, IPersonaConfig } from "../types";

/**
 * Creates a new persona for the Conversational Video Interface with click action capabilities
 * @param token - Tavus API token
 * @param config - Optional persona configuration to override defaults
 * @returns Promise with the created persona details
 */
export const createPersona = async (
  token: string,
  customConfig?: Partial<IPersonaConfig>
): Promise<IPersonaResponse> => {
  // Default configuration with click action tool
  const defaultConfig: IPersonaConfig = {
    persona_name: "Interactive Assistant",
    system_prompt: "You are an AI assistant that can help users interact with the webpage. You can click elements when users request it.",
    context: "You have the ability to click elements on the page when users ask you to.",
    default_replica_id: "r6e055828f63",
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
                    description: "CSS selector or description of the element to click"
                  },
                  elementType: {
                    type: "string",
                    description: "Type of element to click",
                    enum: ["button", "link", "input", "any"]
                  }
                },
                required: ["selector"]
              }
            }
          }
        ]
      },
    }
  };

  // Merge custom config with defaults
  const config = customConfig ? {
    ...defaultConfig,
    layers: {
      ...defaultConfig.layers,
      llm: {
        ...defaultConfig.layers.llm,
        tools: [
          ...(defaultConfig.layers.llm.tools || []),
        ]
      }
    }
  } : defaultConfig;

  const response = await fetch("https://tavusapi.com/v2/personas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token,
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Failed to create persona: ${response.statusText}`);
  }

  return response.json();
}; 