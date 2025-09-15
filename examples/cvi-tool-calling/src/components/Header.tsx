'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  cartItemCount: number
  onCartClick: () => void
}

export function Header({ cartItemCount, onCartClick }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Tavus Shopping Experience
          </h1>
        </div>
        
        <div className="flex items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onCartClick}
            className="relative flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
