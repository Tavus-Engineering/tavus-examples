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
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { conversationState, startConversation } = useTavusConversation()

  // Initialize Tavus conversation on page load
  useEffect(() => {
    const initializeTavusConversation = async () => {
      try {
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

  // Add to cart functionality for both UI and tool calls
  const addToCart = (item: ShoppingItem, quantity: number = 1) => {
    console.log('🛒 Adding to cart:', item.name, 'quantity:', quantity)
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        return [...prevItems, { ...item, quantity }]
      }
    })
  }

  // Update quantity of item in cart
  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }


  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <VideoBox 
        conversationUrl={conversationState.conversationUrl}
        isLoading={conversationState.status === 'loading'}
        onAddToCart={addToCart}
      />
      
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

      {/* Cart Component */}
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

