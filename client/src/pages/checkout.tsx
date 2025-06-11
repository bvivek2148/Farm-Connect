import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/context/CartContext';
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { convertUsdToInr, formatINR } from "@/lib/utils";

// Checkout form schema
const checkoutFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  state: z.string().min(2, { message: "State must be at least 2 characters" }),
  zipCode: z.string().min(5, { message: "Zip code must be at least 5 characters" }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [location, navigate] = useLocation();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Format the price in Indian Rupees
  const formatPrice = (price: number) => {
    return formatINR(convertUsdToInr(price));
  };
  
  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });
  
  // Handle form submission
  async function onSubmit(data: CheckoutFormValues) {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Once "payment" is complete, show the success message
      setOrderCompleted(true);
      clearCart();
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsProcessing(false);
    }
  }
  
  // Redirect to cart if there are no items
  if (cartItems.length === 0 && !orderCompleted) {
    navigate('/cart');
    return null;
  }
  
  // Show order completed screen
  if (orderCompleted) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Card className="w-full">
          <CardContent className="pt-10 pb-10 text-center flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Thank you for your order!</h1>
            <p className="mb-6 text-gray-600">We've received your order and will begin processing it right away.</p>
            <p className="mb-6 text-gray-600">You will receive an email confirmation shortly.</p>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Information Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Please fill out your shipping details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Farm Lane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Springfield" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="IL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="62701" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Payment Method Card (placeholder) */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose your payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded text-center">
                <p>Payment Processing</p>
                <p className="text-sm text-gray-500 mt-2">
                  For this demo, we're simulating payment processing.
                  In a production environment, this would be integrated with a payment processor like Stripe.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm font-medium">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping</span>
                  <span className="text-sm font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tax</span>
                  <span className="text-sm font-medium">{formatPrice(getTotalPrice() * 0.07)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-base font-medium">Total</span>
                  <span className="text-base font-bold">{formatPrice(getTotalPrice() * 1.07)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}