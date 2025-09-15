'use client'

import { useState } from 'react'
import { CartItem } from '@/types/shopping'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

interface CartProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onUpdateQuantity: (itemId: string, newQuantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export function Cart({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}: CartProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find(item => item.id === itemId)
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change)
      if (newQuantity === 0) {
        onRemoveItem(itemId)
      } else {
        onUpdateQuantity(itemId, newQuantity)
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {totalItems > 0 
              ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`
              : 'Your cart is empty'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-4">
                Add some items to get started!
              </p>
              <Button onClick={onClose} variant="outline">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="text-2xl">{item.image}</div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-green-600">
                          ${item.price.toFixed(2)} each
                        </span>
                        <span className="text-sm text-gray-500">
                          Total: ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 border rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total Items: {totalItems}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    Total: ${totalPrice.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={onClose}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
