import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import { useDailyEvent } from "@daily-co/daily-react";
import { useCallback } from "react";

const events = {
  add_to_cart: 'add_to_cart',
  get_cart: 'get_cart',
  checkout: 'checkout',
  recommend: 'recommend',
}

export const AppMessageHandler = ({ handleCheckout, highlightProduct }) => {
  const { addToCart, products, removeFromCart, updateCartItemQuantity, clearCart } = useStore();
  const { toast } = useToast()

  useDailyEvent(
    'app-message',
    useCallback((ev: any) => {
      console.log('ev', ev)
      if (events[ev.data?.event]) {
        console.log('event', ev)
      }
      if (ev.data?.event_type === 'conversation.utterance') {
        console.log('utterance', ev)
      }
      if (ev.data?.event === events.add_to_cart) {
        const product = products.find(p => p.id === ev.data.data.id);
        if (product) {
          addToCart(product);
          toast({
            title: `${product.name} added to cart`,
            description: 'Product successfully added to cart',
          })
        }
      }
      // checkout
      if (ev.data?.event === events.checkout) {
        handleCheckout()
      }

      if (ev.data?.event === events.recommend) {
        const product = products.find(p => p.id === ev.data.data.id);
        if (product) {
          highlightProduct(product.id)
        }
      }

      // if (ev.data?.event_type === 'conversation.utterance' && ev.data?.role === 'replica') {
      //   const speech = ev.data.properties.speech;
      //   if (speech?.includes('added to cart')) {
      //     const match = speech.match(/added to cart; id=(\d+)/);
      //     if (match) {
      //       const productId = Number.parseInt(match[1], 10);
      //       const product = products.find(p => p.id === productId);
      //       if (product) {
      //         addToCart(product);
      //         console.log(`Added product ${product.name} to cart`);
      //       }
      //     }
      //   }
      // }
    }, [products, addToCart])
  );


  return null
}