export interface IConversation {
  conversation_id: string;
  conversation_url: string;
}

export interface IToolFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export interface ILLMTool {
  type: "function";
  function: IToolFunction;
}

export interface ILLMLayer {
  model: string;
  tools?: ILLMTool[];
}

export interface IPerceptionTool {
  name: string;
  description: string;
}

export interface IPerceptionLayer {
  perception_model: "raven-0" | "basic" | "off";
  ambient_awareness_queries?: string[];
  perception_tool_prompt?: string;
  perception_tools?: IPerceptionTool[];
}

export interface IPersonaConfig {
  persona_name: string;
  system_prompt: string;
  context?: string;
  default_replica_id: string;
  layers: {
    llm: ILLMLayer;
  };
}

export interface IPersonaResponse {
  persona_id: string;
  persona_name: string;
  created_at: string;
} 