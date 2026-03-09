/**
 * Shopping Items Data
 * 
 * This is the product catalog for the shopping assistant demo.
 * 
 * These items are:
 * 1. Displayed in the UI as product cards
 * 2. Passed to Tavus as conversational_context (so the AI knows what's available)
 * 3. Used by the add_to_cart tool handler to find items by name
 * 
 * To add new products, simply add them to this array. The AI will automatically
 * know about them through the conversational context.
 */
import { ShoppingItem } from '@/types/shopping'

export const shoppingItems: ShoppingItem[] = [
  {
    id: '1',
    name: 'Fresh Bananas',
    price: 2.99,
    category: 'Fruits',
    image: '🍌',
    description: 'Fresh organic bananas, perfect for smoothies and snacks'
  },
  {
    id: '2',
    name: 'Whole Milk',
    price: 4.49,
    category: 'Dairy',
    image: '🥛',
    description: 'Fresh whole milk, 1 gallon'
  },
  {
    id: '3',
    name: 'Sourdough Bread',
    price: 3.99,
    category: 'Bakery',
    image: '🍞',
    description: 'Artisan sourdough bread, freshly baked'
  },
  {
    id: '4',
    name: 'Free Range Eggs',
    price: 5.99,
    category: 'Dairy',
    image: '🥚',
    description: 'Farm fresh free-range eggs, dozen'
  },
  {
    id: '5',
    name: 'Organic Apples',
    price: 6.99,
    category: 'Fruits',
    image: '🍎',
    description: 'Crisp organic Honeycrisp apples, 3 lbs'
  },
  {
    id: '6',
    name: 'Ground Coffee',
    price: 12.99,
    category: 'Beverages',
    image: '☕',
    description: 'Premium ground coffee beans, medium roast'
  },
  {
    id: '7',
    name: 'Greek Yogurt',
    price: 4.99,
    category: 'Dairy',
    image: '🥛',
    description: 'Plain Greek yogurt, high protein, 32oz'
  },
  {
    id: '8',
    name: 'Fresh Salmon',
    price: 18.99,
    category: 'Seafood',
    image: '🐟',
    description: 'Atlantic salmon fillet, 1 lb, wild caught'
  },
  {
    id: '9',
    name: 'Mixed Greens',
    price: 3.49,
    category: 'Vegetables',
    image: '🥬',
    description: 'Organic mixed salad greens, 5oz container'
  },
  {
    id: '10',
    name: 'Olive Oil',
    price: 8.99,
    category: 'Pantry',
    image: '🫒',
    description: 'Extra virgin olive oil, cold pressed, 500ml'
  }
]
