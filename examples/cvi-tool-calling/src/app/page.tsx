/**
 * Main Shopping Assistant Page
 * 
 * This is the entry point for the CVI Tool Calling demo. It demonstrates:
 * - Initializing a Tavus conversation with context about available products
 * - Handling cart state that can be modified via voice commands (tool calls)
 * - Integrating the video avatar with a shopping interface
 */
'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { VideoBox } from '@/components/VideoBox'
import { ShoppingItemCard } from '@/components/ShoppingItemCard'
import { Cart } from '@/components/Cart'
import { shoppingItems } from '@/data/shopping-items'
import { ShoppingItem, CartItem } from '@/types/shopping'
import { useTavusConversation } from '@/hooks/useTavusConversation'
import { formatShoppingItemsForContext } from '@/lib/conversation-context'

export default function Home() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Cart state - this will be modified by both UI clicks AND voice commands via tool calls
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Tavus conversation hook - manages connection state and provides startConversation function
  const { conversationState, startConversation } = useTavusConversation()

  // ============================================
  // TAVUS CONVERSATION INITIALIZATION
  // ============================================
  
  /**
   * Initialize Tavus conversation when the page loads.
   * 
   * Key configuration options:
   * - replica_id: The visual avatar to use (from Tavus platform)
   * - persona_id: The AI persona with tool definitions (configured in Tavus platform)
   * - conversational_context: Product catalog info so the AI knows what's available
   * - custom_greeting: What the AI says when the conversation starts
   */
  useEffect(() => {
    const initializeTavusConversation = async () => {
      try {
        // Format our product catalog into a string the AI can understand
        const conversationalContext = formatShoppingItemsForContext(shoppingItems)
        
        await startConversation({
          replica_id: process.env.TAVUS_REPLICA_ID || 'rf4703150052',
          persona_id: process.env.TAVUS_PERSONA_ID || '',
          conversational_context: conversationalContext,
          custom_greeting: "Hi I am tavus Shopping assistance, I can help you with your shopping needs."
        })
      } catch (error) {
        console.error('Failed to initialize Tavus conversation:', error)
      }
    }

    initializeTavusConversation()
  }, [startConversation])

  // ============================================
  // CART OPERATIONS
  // These functions are called from BOTH:
  // 1. UI interactions (clicking buttons)
  // 2. Tool calls from the AI (voice commands)
  // ============================================

  /**
   * Add item to cart - This is the function that gets called when the AI
   * processes an "add_to_cart" tool call. It's passed to VideoBox component.
   * 
   * @param item - The shopping item to add
   * @param quantity - How many to add (defaults to 1)
   */
  const addToCart = (item: ShoppingItem, quantity: number = 1) => {
    console.log('🛒 Adding to cart:', item.name, 'quantity:', quantity)
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id)
      
      // If item already in cart, increase quantity
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        // Otherwise, add new item to cart
        return [...prevItems, { ...item, quantity }]
      }
    })
  }

  /** Update the quantity of an existing cart item */
  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  /** Remove an item from the cart entirely */
  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  // Calculate total items for the cart badge
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with cart icon */}
      <Header 
        cartItemCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      {/* 
        VideoBox - The Tavus video avatar component
        
        Key props:
        - conversationUrl: The Daily.js room URL returned by Tavus API
        - isLoading: Shows loading state while conversation initializes
        - onAddToCart: Callback function that tool calls will invoke
        
        This component handles:
        1. Rendering the video stream from Tavus
        2. Listening for tool call events via Daily.js app-message
        3. Executing tool calls and sending responses back
      */}
      <VideoBox 
        conversationUrl={conversationState.conversationUrl}
        isLoading={conversationState.status === 'loading'}
        onAddToCart={addToCart}
      />
      
      {/* Product catalog grid */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Fresh Groceries & More
          </h2>
          <p className="text-gray-600">
            Discover our selection of fresh, high-quality products
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shoppingItems.map((item) => (
            <ShoppingItemCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </main>

      {/* Sliding cart panel */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  )
}

