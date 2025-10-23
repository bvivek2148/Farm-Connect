import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/HybridAuthContext';
import AuthGuard from '@/components/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Calendar, MapPin, CreditCard, Eye, Repeat } from 'lucide-react';
import { Link } from 'wouter';
import { formatINR } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch orders from API
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/orders', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        if (data.success && data.orders) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        setError(error.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadOrders();
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return formatINR(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return '✓';
      case 'shipped':
        return '🚚';
      case 'processing':
        return '⏳';
      case 'cancelled':
        return '✗';
      default:
        return '📦';
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-gray-600 mt-2">Track and manage your orders</p>
            </div>
            <Button asChild>
              <Link href="/shop">
                <Package className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <Card>
              <CardContent className="pt-10 pb-10 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Loading Your Orders...</h3>
                <p className="text-gray-600">Please wait while we fetch your order history.</p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="pt-10 pb-10 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
                <Button asChild>
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-1" />
                              {formatPrice(order.total)}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.status)}>
                          <span className="mr-1">{getStatusIcon(order.status)}</span>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-md overflow-hidden border">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://via.placeholder.com/100x100/22c55e/ffffff?text=${encodeURIComponent(item.name.charAt(0))}`;
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Shipping Address */}
                    <div className="flex items-start space-x-2 mb-4">
                      <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Shipping Address</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            <Repeat className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                      {order.status === 'shipped' && (
                        <Button size="sm">
                          Track Package
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default OrdersPage;
