import { Link, useLocation } from 'wouter';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/HybridAuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon, Lock, UserPlus } from 'lucide-react';
import { convertUsdToInr, formatINR } from "@/lib/utils";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Format the price in Indian Rupees
  const formatPrice = (price: number) => {
    return formatINR(convertUsdToInr(price));
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      // Redirect to login page with return URL
      navigate('/login');
    }
  };
  
  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };
  
  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  // If cart is empty, show a message
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>
        <Card className="w-full">
          <CardContent className="pt-6 text-center flex flex-col items-center py-10">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-xl mb-4">Your cart is empty</p>
            <p className="text-gray-500 mb-6">Add some products to your cart</p>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>
      
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Cart Items ({getTotalItems()})</CardTitle>
          <CardDescription>Review your items before checkout</CardDescription>
        </CardHeader>
        
        <CardContent>
          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center py-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatPrice(parseFloat(item.price.replace(/[^0-9.]/g, '')))} / {item.unit}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center mt-4 md:mt-0">
                <div className="flex items-center border rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <span className="px-2">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 text-red-500"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 md:mt-0 font-medium text-right min-w-[80px]">
                {formatPrice(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity)}
              </div>
            </div>
          ))}
        </CardContent>
        
        <CardFooter className="flex flex-col items-end">
          <div className="w-full">
            <Separator className="my-4" />
            <div className="flex justify-between my-2">
              <span>Subtotal</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between my-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between my-2 font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full mt-6">
            <Button variant="outline" className="w-full sm:w-auto" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            {isAuthenticated ? (
              <Button className="w-full sm:w-auto" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/login">
                    <Lock className="h-4 w-4 mr-2" />
                    Login to Checkout
                  </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/sign-up">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}