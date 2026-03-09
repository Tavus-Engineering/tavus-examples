/**
 * Conversation Context Utilities
 * 
 * This module helps format data into "conversational context" that gets
 * passed to Tavus when creating a conversation.
 * 
 * The conversational_context is additional information that the AI knows
 * about during the conversation. It's like giving the AI a "cheat sheet"
 * of relevant information before the conversation starts.
 * 
 * Use cases:
 * - Product catalogs (like this example)
 * - User account information
 * - Order history
 * - Company policies
 * - Any dynamic data the AI should reference
 */
import { ShoppingItem } from '@/types/shopping'

/**
 * Formats shopping items into a conversational context string for Tavus AI.
 * 
 * This function creates a text-based "knowledge base" that the AI can reference
 * when helping customers. The AI will know about all products, prices, and
 * descriptions, enabling it to answer questions and use the add_to_cart tool.
 * 
 * @param items - Array of shopping items from your product catalog
 * @returns Formatted string to pass as `conversational_context` to Tavus API
 * 
 * @example
 * const context = formatShoppingItemsForContext(shoppingItems)
 * await startConversation({
 *   replica_id: '...',
 *   persona_id: '...',
 *   conversational_context: context,  // <-- AI now knows about products
 * })
 */
export function formatShoppingItemsForContext(items: ShoppingItem[]): string {
  const contextIntro = "You are a helpful shopping assistant. Here are the available products in our store:"
  
  // Format each product as a readable list item
  const itemsList = items.map(item => 
    `- ${item.name}: $${item.price.toFixed(2)} (${item.category}) - ${item.description}`
  ).join('\n')
  
  // Instructions for how the AI should behave
  const contextInstructions = `

You can help customers:
1. Find products by name, category, or description
2. Compare prices and features
3. Make recommendations based on their needs
4. Answer questions about product details
5. Help them add items to their cart

Please be friendly, helpful, and knowledgeable about these products. If a customer asks about a product not in this list, politely let them know it's not currently available and suggest similar alternatives from the available items.`

  return `${contextIntro}\n\n${itemsList}${contextInstructions}`
}
