/**
 * Tool Call Type Definitions
 * 
 * These types define the structure of tool calls received from Tavus AI.
 * 
 * When a user speaks to the AI and the AI decides to call a tool,
 * Tavus sends a 'conversation.tool_call' event with these properties.
 * 
 * @see https://docs.tavus.io/sections/event-schemas/conversation-toolcall
 */

/**
 * Parameters for the 'add_to_cart' tool.
 * 
 * This matches the tool definition configured in your Tavus persona:
 * ```json
 * {
 *   "name": "add_to_cart",
 *   "parameters": {
 *     "properties": {
 *       "item_name": { "type": "string" },
 *       "quantity": { "type": "number" }
 *     }
 *   }
 * }
 * ```
 */
export interface AddToCartParams {
  /** The name of the product to add (e.g., "Bananas", "Whole Milk") */
  item_name: string
  /** Number of items to add (defaults to 1 if not specified) */
  quantity?: number
}

/**
 * Properties from a Tavus tool call event.
 * 
 * When you receive a 'conversation.tool_call' app-message, the event.data
 * contains these properties:
 * 
 * ```typescript
 * {
 *   message_type: 'conversation',
 *   event_type: 'conversation.tool_call',
 *   conversation_id: 'c123456',
 *   properties: {
 *     name: 'add_to_cart',
 *     arguments: '{"item_name": "Bananas", "quantity": 2}'  // JSON string!
 *   }
 * }
 * ```
 */
export interface ToolCallProperties {
  /** The name of the tool being called (e.g., 'add_to_cart') */
  name: string
  /** JSON string containing the tool parameters - must be parsed with JSON.parse() */
  arguments: string
}
