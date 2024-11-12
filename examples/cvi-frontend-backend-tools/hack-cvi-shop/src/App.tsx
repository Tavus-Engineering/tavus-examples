import React from 'react';
import { useStore, } from './store/useStore';
import type { Product } from './store/useStore';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import * as Icons from 'lucide-react';

import './index.css';
import { CallScreen } from './components/Call';
import { AppMessageHandler } from './components/AppMessageHandler';
import Confetti from 'react-confetti'

function App() {
  const { products, cart, selectedCategory, categories, addToCart, removeFromCart, updateCartItemQuantity, setSelectedCategory, clearCart } = useStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    setIsCheckoutOpen(false);
    clearCart(); // Clear the cart after successful purchase
    setIsSuccessOpen(true);
  };

  const IconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as keyof typeof Icons];
    return Icon ? <Icon className="w-5 h-5 mr-2" /> : null;
  };

  const getCategoryColor = (categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.color || 'bg-gray-100';
  };

  const isInCart = (productId: number) => {
    return cart.some(item => item.id === productId);
  };

  const highlightProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const element = document.getElementById(`product-${productId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight');
        setTimeout(() => {
          element.classList.remove('highlight');
        }, 10000);
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Shopping App</h1>
      {/* Shopping Cart */}
      <AppMessageHandler handleCheckout={handleCheckout} highlightProduct={highlightProduct} />
      <div className="mb-8 p-4 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Shopping Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => {
              const product = products.find(p => p.id === item.id);
              const isMaxQuantity = item.quantity === product?.amount;
              return (
                <div key={item.id} className="flex justify-between items-center mb-2">
                  <span>{item.name}</span>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      disabled={isMaxQuantity}
                    >
                      +
                    </Button>
                    <span className="ml-4 mr-4 w-20">${(item.price * item.quantity).toFixed(2)}</span>
                    <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="font-bold mt-4">Total: ${totalPrice.toFixed(2)}</div>
            <Button onClick={handleCheckout} className="mt-4">
              Complete Purchase
            </Button>
          </>
        )}
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <Button onClick={() => setSelectedCategory('')} variant={selectedCategory === '' ? 'default' : 'outline'}>
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            className={`ml-2 ${category.color}`}
          >
            <IconComponent name={category.icon} />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredProducts.map((product: Product) => (
          <Card key={product.id} className={`${getCategoryColor(product.category)} bg-opacity-30`} id={`product-${product.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconComponent name={categories.find(c => c.name === product.category)?.icon || 'Package'} />
                {product.name}
              </CardTitle>
              <CardDescription>Category: {product.category}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 h-40">
              <div className="flex flex-col items-start gap-2">
                <p className="text-lg font-semibold">Price: ${product.price.toFixed(2)}</p>
                <p>Available: {product.amount}</p>
              </div>
              {product.image && product.image !== 'image.jpg' && <img src={product.image} alt={product.name} className="w-full max-h-40 object-contain rounded-md max-w-40" />}
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                onClick={() => addToCart(product)}
                variant={isInCart(product.id) ? "secondary" : "default"}
                disabled={isInCart(product.id) && cart.find(item => item.id === product.id)?.quantity === product.amount}
              >
                {isInCart(product.id) ? "Update Cart" : "Add to Cart"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="font-bold mt-4">Total: ${totalPrice.toFixed(2)}</div>
          </div>
          <DialogFooter>
            <Button onClick={handleCheckout}>Complete Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Successful!</DialogTitle>
          </DialogHeader>
          <p className="py-4">Thank you for your purchase. Your order has been placed successfully.</p>
          <DialogFooter>
            <Button onClick={() => setIsSuccessOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isSuccessOpen && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={2000}
        />
      )}

      <CallScreen />
    </div>
  );
}

export default App;
