// Tool call types for Tavus CVI integration

export interface AddToCartParams {
  item_name: string
  quantity?: number
}

// Tool call properties that come from Tavus - matching the AppMessageToolCall structure
export interface ToolCallProperties {
  name: string
  arguments: string
}
