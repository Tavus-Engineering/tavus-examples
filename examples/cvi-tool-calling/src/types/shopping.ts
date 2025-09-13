export interface ShoppingItem {
  id: string
  name: string
  price: number
  category: string
  image: string
  description: string
}

export interface CartItem extends ShoppingItem {
  quantity: number
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}
