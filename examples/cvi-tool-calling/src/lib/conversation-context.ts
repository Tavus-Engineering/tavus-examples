import { ShoppingItem } from '@/types/shopping'

/**
 * Formats shopping items into a conversational context string for Tavus AI
 */
export function formatShoppingItemsForContext(items: ShoppingItem[]): string {
  const contextIntro = "You are a helpful shopping assistant. Here are the available products in our store:"
  
  const itemsList = items.map(item => 
    `- ${item.name}: $${item.price.toFixed(2)} (${item.category}) - ${item.description}`
  ).join('\n')
  
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
