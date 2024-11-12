// const productNames = [
//   "T-Shirt",
//   "Jeans",
//   "Sneakers",
//   "Watch",
//   "Backpack",
//   "Laptop",
//   "Smartphone",
//   "Headphones",
//   "Tablet",
//   "Camera",
// ];

// const generateProducts = (count: number): Product[] => {
//   return Array.from({ length: count }, (_, i) => ({
//     id: i + 1,
//     name: `${productNames[i % productNames.length]} ${Math.floor(i / productNames.length) + 1}`,
//     price: Number((Math.random() * 100 + 10).toFixed(2)),
//     category: categories[Math.floor(Math.random() * categories.length)].name,
//     amount: Math.floor(Math.random() * 50) + 1, // Random amount between 1 and 50
//   }));
// };

import productsData from './products.json';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  amount: number;
  description: string;
  rating: number;
  image: string;
}
  
export const PRODUCTS: Product[] = productsData as Product[];
