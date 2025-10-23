import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/HybridAuthContext';
import AuthGuard from '@/components/AuthGuard';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShoppingBag, CreditCard, Smartphone, Wallet, Building } from 'lucide-react';
import { formatINR } from "@/lib/utils";

// Checkout form schema with conditional validation
const checkoutFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid 10-digit phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zipCode: z.string().min(6, { message: "Please enter a valid 6-digit PIN code" }),
  paymentMethod: z.string().min(1, { message: "Please select a payment method" }),
  // Card fields - only required when card payment is selected
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
  // UPI field
  upiId: z.string().optional(),
  // Net banking
  bankName: z.string().optional(),
}).refine((data) => {
  // If card payment is selected, validate card fields
  if (data.paymentMethod === "card") {
    return data.cardNumber && data.expiryDate && data.cvv && data.cardholderName;
  }
  // If UPI is selected, validate UPI ID
  if (data.paymentMethod === "upi") {
    return data.upiId && data.upiId.includes("@");
  }
  // If net banking is selected, validate bank name
  if (data.paymentMethod === "netbanking") {
    return data.bankName;
  }
  return true;
}, {
  message: "Please fill in all required payment details",
  path: ["paymentMethod"]
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Format the price in Indian Rupees
  const formatPrice = (price: number) => {
    return formatINR(price);
  };
  
  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      upiId: "",
      bankName: "",
    },
  });

  // Handle form submission
  async function onSubmit(data: CheckoutFormValues) {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Validate payment method specific fields
      if (data.paymentMethod === "card") {
        if (!data.cardNumber || !data.expiryDate || !data.cvv || !data.cardholderName) {
          throw new Error("Please fill in all card details");
        }
      } else if (data.paymentMethod === "upi") {
        if (!data.upiId || !data.upiId.includes("@")) {
          throw new Error("Please enter a valid UPI ID");
        }
      } else if (data.paymentMethod === "netbanking") {
        if (!data.bankName) {
          throw new Error("Please select a bank");
        }
      }

      // Prepare order data
      const orderData = {
        cartItems,
        shippingInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
        paymentMethod: data.paymentMethod,
        paymentDetails: {
          ...(data.paymentMethod === "card" && {
            cardNumber: data.cardNumber,
            cardholderName: data.cardholderName,
            expiryDate: data.expiryDate,
          }),
          ...(data.paymentMethod === "upi" && {
            upiId: data.upiId,
          }),
          ...(data.paymentMethod === "netbanking" && {
            bankName: data.bankName,
          }),
        }
      };

      // Simulate payment processing with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call the order API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const result = await response.json();

      // Simulate random payment failure for demo (5% chance)
      if (Math.random() < 0.05) {
        throw new Error("Payment failed. Please try again.");
      }

      // Store order details and show success message
      setOrderDetails(result.data);
      setOrderCompleted(true);
      clearCart();
    } catch (error) {
      console.error("Error processing payment:", error);
      setPaymentError(error instanceof Error ? error.message : "Payment failed. Please try again.");
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
            <p className="mb-4 text-gray-600">We've received your order and will begin processing it right away.</p>

            {orderDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 w-full max-w-md">
                <h3 className="font-semibold text-green-800 mb-2">Order Details</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Order ID:</strong> #{orderDetails.id}</p>
                  <p><strong>Total:</strong> {formatPrice(orderDetails.total)}</p>
                  <p><strong>Payment Method:</strong> {orderDetails.paymentMethod.toUpperCase()}</p>
                  <p><strong>Status:</strong> {orderDetails.status}</p>
                </div>
              </div>
            )}

            <p className="mb-6 text-gray-600">You will receive an email confirmation shortly.</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/orders')}>
                View Orders
              </Button>
              <Button onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shipping Information Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Please fill out your shipping details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Card */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Choose your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedPaymentMethod(value);
                              }}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-5 gap-3"
                            >
                              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="card" id="card" className="sr-only" />
                                <Label htmlFor="card" className="flex flex-col items-center cursor-pointer text-center w-full">
                                  <CreditCard className="h-8 w-8 mb-2 text-blue-600" />
                                  <div className="font-medium text-sm">Credit/Debit Card</div>
                                  <div className="text-xs text-gray-500">Visa, Mastercard</div>
                                </Label>
                              </div>

                              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="upi" id="upi" className="sr-only" />
                                <Label htmlFor="upi" className="flex flex-col items-center cursor-pointer text-center w-full">
                                  <Smartphone className="h-8 w-8 mb-2 text-green-600" />
                                  <div className="font-medium text-sm">UPI Payment</div>
                                  <div className="text-xs text-gray-500">PhonePe, GPay</div>
                                </Label>
                              </div>

                              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="wallet" id="wallet" className="sr-only" />
                                <Label htmlFor="wallet" className="flex flex-col items-center cursor-pointer text-center w-full">
                                  <Wallet className="h-8 w-8 mb-2 text-purple-600" />
                                  <div className="font-medium text-sm">Digital Wallet</div>
                                  <div className="text-xs text-gray-500">Paytm, Amazon Pay</div>
                                </Label>
                              </div>

                              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="netbanking" id="netbanking" className="sr-only" />
                                <Label htmlFor="netbanking" className="flex flex-col items-center cursor-pointer text-center w-full">
                                  <Building className="h-8 w-8 mb-2 text-orange-600" />
                                  <div className="font-medium text-sm">Net Banking</div>
                                  <div className="text-xs text-gray-500">All major banks</div>
                                </Label>
                              </div>

                              <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="cod" id="cod" className="sr-only" />
                                <Label htmlFor="cod" className="flex flex-col items-center cursor-pointer text-center w-full">
                                  <ShoppingBag className="h-8 w-8 mb-2 text-green-600" />
                                  <div className="font-medium text-sm">Cash on Delivery</div>
                                  <div className="text-xs text-gray-500">Pay on delivery</div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Card Details Form - Show only when card is selected */}
                    {selectedPaymentMethod === "card" && (
                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Card Details</h4>
                        <FormField
                          control={form.control}
                          name="cardholderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="1234 5678 9012 3456"
                                  {...field}
                                  maxLength={19}
                                  onChange={(e) => {
                                    // Format card number with spaces
                                    const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="MM/YY"
                                    {...field}
                                    maxLength={5}
                                    onChange={(e) => {
                                      // Format expiry date MM/YY
                                      let value = e.target.value.replace(/\D/g, '');
                                      if (value.length >= 2) {
                                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                      }
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="123"
                                    {...field}
                                    maxLength={4}
                                    onChange={(e) => {
                                      // Only allow numbers for CVV
                                      const value = e.target.value.replace(/\D/g, '');
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* UPI Details - Show only when UPI is selected */}
                    {selectedPaymentMethod === "upi" && (
                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">UPI Payment</h4>
                        <FormField
                          control={form.control}
                          name="upiId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UPI ID</FormLabel>
                              <FormControl>
                                <Input placeholder="yourname@paytm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Enter your UPI ID or you will be redirected to your UPI app to complete the payment.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Wallet Details - Show only when wallet is selected */}
                    {selectedPaymentMethod === "wallet" && (
                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Digital Wallet</h4>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-800">
                            You will be redirected to your selected wallet to complete the payment.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Net Banking Details - Show only when net banking is selected */}
                    {selectedPaymentMethod === "netbanking" && (
                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Net Banking</h4>
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Your Bank</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Choose your bank</option>
                                  <option value="sbi">State Bank of India</option>
                                  <option value="hdfc">HDFC Bank</option>
                                  <option value="icici">ICICI Bank</option>
                                  <option value="axis">Axis Bank</option>
                                  <option value="kotak">Kotak Mahindra Bank</option>
                                  <option value="pnb">Punjab National Bank</option>
                                  <option value="bob">Bank of Baroda</option>
                                  <option value="canara">Canara Bank</option>
                                  <option value="union">Union Bank of India</option>
                                  <option value="other">Other Banks</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-orange-800">
                            You will be redirected to your bank's website to complete the payment.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cash on Delivery Details - Show only when COD is selected */}
                    {selectedPaymentMethod === "cod" && (
                      <div className="space-y-4 border-t pt-4">
                        <h4 className="font-medium">Cash on Delivery</h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-800">
                            Pay with cash when your order is delivered to your doorstep. Please keep exact change ready.
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> COD orders may take 1-2 additional days for delivery.
                          </p>
                        </div>
                      </div>
                    )}
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
                  <CardFooter className="flex flex-col space-y-4">
                    {paymentError && (
                      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{paymentError}</p>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        `Pay ${formatPrice(getTotalPrice() * 1.07)}`
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Your payment information is secure and encrypted
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AuthGuard>
  );
}