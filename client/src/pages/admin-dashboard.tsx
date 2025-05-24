import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Users,
  ShoppingBag,
  Layers,
  LogOut,
  CheckCircle,
  XCircle,
  Edit,
  Trash,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Sample data for demonstration
const sampleUsers = [
  { id: 1, username: 'sarah_johnson', email: 'sarah@example.com', role: 'customer', status: 'active', joinDate: '2023-04-15' },
  { id: 2, username: 'mike_smith', email: 'mike@example.com', role: 'farmer', status: 'active', joinDate: '2023-05-02' },
  { id: 3, username: 'emily_davis', email: 'emily@example.com', role: 'customer', status: 'inactive', joinDate: '2023-06-10' },
  { id: 4, username: 'john_brown', email: 'john@example.com', role: 'farmer', status: 'active', joinDate: '2023-03-22' },
  { id: 5, username: 'lisa_wong', email: 'lisa@example.com', role: 'customer', status: 'active', joinDate: '2023-07-08' },
  { id: 6, username: 'david_miller', email: 'david@example.com', role: 'customer', status: 'inactive', joinDate: '2023-02-17' },
  { id: 7, username: 'jennifer_lee', email: 'jennifer@example.com', role: 'farmer', status: 'active', joinDate: '2023-06-29' },
  { id: 8, username: 'robert_chen', email: 'robert@example.com', role: 'customer', status: 'active', joinDate: '2023-05-14' },
];

const sampleProducts = [
  { id: 1, name: 'Organic Tomatoes', category: 'Vegetables', farmer: 'Green Valley Farm', price: '$3.99', stock: 85 },
  { id: 2, name: 'Fresh Strawberries', category: 'Fruits', farmer: 'Berry Fields', price: '$4.99', stock: 120 },
  { id: 3, name: 'Local Honey', category: 'Dairy', farmer: 'Sweet Meadows', price: '$7.99', stock: 45 },
  { id: 4, name: 'Free-Range Eggs', category: 'Dairy', farmer: 'Happy Hen Farm', price: '$5.49', stock: 72 },
  { id: 5, name: 'Organic Kale', category: 'Vegetables', farmer: 'Green Leaf Gardens', price: '$2.99', stock: 60 },
  { id: 6, name: 'Artisan Cheese', category: 'Dairy', farmer: 'Hillside Creamery', price: '$8.99', stock: 38 },
];

const sampleOrders = [
  { id: 1, customer: 'Sarah Johnson', items: 3, total: '$45.97', status: 'Delivered', date: '2023-07-15' },
  { id: 2, customer: 'Mike Smith', items: 2, total: '$23.48', status: 'Processing', date: '2023-07-16' },
  { id: 3, customer: 'Emily Davis', items: 5, total: '$67.95', status: 'Shipped', date: '2023-07-14' },
  { id: 4, customer: 'John Brown', items: 1, total: '$12.99', status: 'Delivered', date: '2023-07-12' },
  { id: 5, customer: 'Lisa Wong', items: 4, total: '$53.96', status: 'Processing', date: '2023-07-16' },
];

// Statistics data
const statistics = {
  totalUsers: 5842,
  activeUsers: 3127,
  totalFarms: 248,
  totalOrders: 15429,
  totalRevenue: 528947.89,
  uniqueVisitors: 15749
};

const AdminDashboard = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Check if user is authorized to view admin dashboard
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      toast({
        title: 'Access denied',
        description: 'You must be logged in as an administrator',
        variant: 'destructive',
      });
      navigate('/admin-login');
    } else {
      setIsAuthorized(true);
    }
  }, [navigate, toast]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    toast({
      title: 'Logged out',
      description: 'You have been logged out of the admin portal',
    });
    navigate('/admin-login');
  };
  
  // If not authorized, don't render the dashboard
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center">
            <Layers className="h-4 w-4 mr-2" /> Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2" /> Orders
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
                <CardDescription>Registered customers and farmers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.totalUsers.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-primary font-medium">{statistics.activeUsers.toLocaleString()}</span> active users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Farms</CardTitle>
                <CardDescription>Registered farm partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.totalFarms.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-primary font-medium">+12</span> new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
                <CardDescription>All time sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${statistics.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-primary font-medium">{statistics.totalOrders.toLocaleString()}</span> orders processed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Unique Visitors</CardTitle>
                <CardDescription>Total unique site visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.uniqueVisitors.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-primary font-medium">+324</span> this week
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">New user registered</p>
                    <p className="text-sm text-gray-500">Jennifer Lee (jennifer@example.com) joined as a farmer</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <ShoppingBag className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">New order placed</p>
                    <p className="text-sm text-gray-500">Order #12458 was placed by Lisa Wong ($53.96)</p>
                    <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <Layers className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">New product added</p>
                    <p className="text-sm text-gray-500">Organic Carrots was added by Green Leaf Gardens</p>
                    <p className="text-xs text-gray-400 mt-1">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage customers and farmers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'farmer' ? 'outline' : 'secondary'}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === 'active' ? (
                              <Button variant="ghost" size="icon">
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.farmer}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.stock > 50 ? 'default' : (product.stock > 20 ? 'outline' : 'destructive')}
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>{order.total}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === 'Delivered' 
                                ? 'default' 
                                : order.status === 'Shipped' 
                                  ? 'outline' 
                                  : 'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;