'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingItem } from '@/types/shopping'

interface ShoppingItemCardProps {
  item: ShoppingItem
}

export function ShoppingItemCard({ item }: ShoppingItemCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-4xl mb-2">{item.image}</div>
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
        </div>
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-center">
          <span className="text-xl font-bold text-green-600">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
