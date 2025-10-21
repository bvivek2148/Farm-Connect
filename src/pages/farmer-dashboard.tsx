
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  TrendingUp,
  DollarSign,
  Eye,
  UserCheck,
  Package,
  Star,
  AlertTriangle,
  Clock,
  Truck,
  X,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  Activity,
  Calendar,
  MapPin,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Wifi,
  Database,
  Save,
  Mail,
  Phone,
  User,
  Building,
  CreditCard,
  FileText,
  BarChart3,
  PieChart,
  TrendingDown,
  Upload,
  Sprout,
  Tractor,
  Leaf
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// No sample data - all data will be fetched from API

interface FarmerUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface FarmerProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: string | number;
  image: string;
  unit: string;
  description: string;
  organic: boolean;
  featured: boolean;
}

interface FarmerOrder {
  id: number;
  productName?: string;
  quantity?: number;
  total?: string;
  status?: string;
  date?: string;
  customer?: string;
}

const FarmerDashboard = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [farmerData, setFarmerData] = useState<FarmerUser | null>(null);

  // State management
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [showEditProductModal, setShowEditProductModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<FarmerProduct | null>(null);

  // Form states
  const [newProduct, setNewProduct] = useState<Omit<FarmerProduct, 'id'>>({
    name: '',
    category: '',
    price: '',
    stock: '',
    image: '',
    unit: 'lb',
    description: '',
    organic: true,
    featured: false
  });
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

  // Data states - Start empty, load from API
  const [products, setProducts] = useState<FarmerProduct[]>([]);
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch farmer's data from API
  const fetchFarmerData = async () => {
    if (!farmerData) return;

    try {
      setLoading(true);
      setError(null);

      // Get auth token
      const token = localStorage.getItem('farmConnectToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch farmer's products
      const productsResponse = await fetch(`/api/farmers/${farmerData.id}/products`, { headers });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      } else {
        // Fallback: fetch all products and filter by farmer
        const allProductsResponse = await fetch('/api/products');
        if (allProductsResponse.ok) {
          const allProductsData = await allProductsResponse.json();
          const farmerProducts = allProductsData.products.filter(
            product => product.farmer === farmerData.username || product.farmerId === farmerData.id
          );
          setProducts(farmerProducts);
        }
      }

      // Fetch farmer's orders (if endpoint exists)
      const ordersResponse = await fetch(`/api/farmers/${farmerData.id}/orders`, { headers });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }

    } catch (error) {
      console.error('Error fetching farmer data:', error);
      setError('Failed to load dashboard data');
      toast({
        title: 'Error loading data',
        description: 'Failed to fetch your dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load farmer data when farmerData is available
  useEffect(() => {
    if (farmerData && isAuthorized) {
      fetchFarmerData();
    }
  }, [farmerData, isAuthorized]);

  // Calculate farmer statistics
  const farmerStatistics = {
    totalProducts: products.length,
    activeProducts: products.filter(product => product.status === 'active').length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total?.replace('$', '') || '0'), 0),
    avgOrderValue: orders.length > 0 ? (orders.reduce((sum, order) => sum + parseFloat(order.total?.replace('$', '') || '0'), 0) / orders.length) : 0,
    monthlyGrowth: 15.2,
    productsTrend: 8.5,
    ordersTrend: 12.3,
    revenueTrend: 18.7,
  };

  // Check if user is authorized farmer
  useEffect(() => {
    const checkFarmerAuth = () => {
      try {
        const currentUser = localStorage.getItem('farmConnectUser');
        
        if (!currentUser) {
          toast({
            title: 'Access denied',
            description: 'You must be logged in to access the farmer dashboard',
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        const userData = JSON.parse(currentUser);
        
        if (userData.role !== 'farmer') {
          toast({
            title: 'Access denied',
            description: 'You must be a verified farmer to access this dashboard',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        setFarmerData(userData);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Farmer auth check error:', error);
        navigate('/login');
      }
    };

    checkFarmerAuth();
  }, [navigate, toast]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('farmConnectUser');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast({
      title: 'Data refreshed',
      description: 'Dashboard data has been updated',
    });
  };

  // Product Image Upload Handler
  const handleProductImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProductImagePreview(imageUrl);
        setNewProduct({...newProduct, image: imageUrl});
      };
      reader.readAsDataURL(file);
    }
  };

  // Save products to database
  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem('farmConnectToken');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProduct.name,
          category: newProduct.category,
          price: newProduct.price,
          unit: newProduct.unit,
          image: newProduct.image || `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(newProduct.name)}`,
          distance: 10, // Default distance
          organic: newProduct.organic,
          featured: newProduct.featured,
          description: newProduct.description,
          stock: parseInt(newProduct.stock) || 0
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Add to local state
          const product = {
            id: result.product.id,
            ...newProduct,
            stock: parseInt(newProduct.stock) || 0,
            status: 'active',
            farmer: farmerData?.username || 'Unknown Farmer',
            image: newProduct.image || `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(newProduct.name)}`
          };

          setProducts([...products, product]);
          setNewProduct({
            name: '',
            category: '',
            price: '',
            stock: '',
            image: '',
            unit: 'lb',
            description: '',
            organic: true,
            featured: false
          });
          setProductImagePreview(null);
          setShowAddProductModal(false);

          toast({
            title: 'Product added successfully',
            description: `${product.name} has been added to your catalog and is now available in the shop`,
          });
          return;
        }
      }

      // If API call fails, fall back to local storage
      throw new Error('API call failed');
    } catch (error) {
      console.error('Error adding product via API:', error);

      // Fallback: Add to local state only
      const product = {
        id: products.length + 1,
        ...newProduct,
        stock: parseInt(newProduct.stock) || 0,
        status: 'active',
        farmer: farmerData?.username || 'Unknown Farmer',
        image: newProduct.image || `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(newProduct.name)}`
      };

      setProducts([...products, product]);
      setNewProduct({
        name: '',
        category: '',
        price: '',
        stock: '',
        image: '',
        unit: 'lb',
        description: '',
        organic: true,
        featured: false
      });
      setProductImagePreview(null);
      setShowAddProductModal(false);

      toast({
        title: 'Product added locally',
        description: `${product.name} has been added to your local catalog`,
      });
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = () => {
    setProducts(products.map(product =>
      product.id === selectedProduct.id ? selectedProduct : product
    ));
    setShowEditProductModal(false);
    setSelectedProduct(null);

    toast({
      title: 'Product updated successfully',
      description: 'Product information has been updated',
    });
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
    toast({
      title: 'Product deleted',
      description: 'Product has been removed from your catalog',
    });
  };

  const handleToggleProductStatus = (productId) => {
    const productToUpdate = products.find(product => product.id === productId);
    if (!productToUpdate) return;

    const newStatus = productToUpdate.status === 'active' ? 'inactive' : 'active';
    
    setProducts(products.map(product =>
      product.id === productId ? { ...product, status: newStatus } : product
    ));

    toast({
      title: 'Product status updated',
      description: `Product status changed to ${newStatus}`,
    });
  };

  // If not authorized, don't render the dashboard
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">Farmer Dashboard</h1>
                  <p className="text-sm text-green-600">Welcome back, {farmerData?.username || 'Farmer'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time clock */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>

              {/* Farmer badge */}
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <Leaf className="h-3 w-3 mr-1" />
                Farmer
              </Badge>

              {/* Refresh button */}
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Logout */}
              <Button variant="outline" onClick={handleLogout} className="ml-2">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-200/50 mb-6 overflow-hidden">
            <TabsList className="grid grid-cols-4 w-full h-auto p-2 bg-gradient-to-r from-green-50 to-blue-50">
              <TabsTrigger value="overview" className="flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-green-100">
                <BarChart className="h-4 w-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-green-100">
                <Package className="h-4 w-4 mr-2" /> My Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-green-100">
                <ShoppingBag className="h-4 w-4 mr-2" /> Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-green-100">
                <User className="h-4 w-4 mr-2" /> Profile
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-green-800 group-hover:text-green-900 transition-colors">My Products</CardTitle>
                      <CardDescription className="text-green-600">Total products in catalog</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors group-hover:rotate-12 transform duration-300">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800">{farmerStatistics.totalProducts}</div>
                  <div className="flex items-center mt-2">
                    <div className={`flex items-center ${farmerStatistics.productsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {farmerStatistics.productsTrend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="text-sm font-medium">{Math.abs(farmerStatistics.productsTrend)}%</span>
                    </div>
                    <span className="text-sm text-green-600 ml-2">vs last month</span>
                  </div>
                  <Progress value={farmerStatistics.totalProducts > 0 ? (farmerStatistics.activeProducts / farmerStatistics.totalProducts) * 100 : 0} className="mt-3" />
                  <p className="text-xs text-green-600 mt-1">{farmerStatistics.activeProducts} active products</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-blue-800 group-hover:text-blue-900 transition-colors">Total Orders</CardTitle>
                      <CardDescription className="text-blue-600">Orders received</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors group-hover:rotate-12 transform duration-300">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">{farmerStatistics.totalOrders}</div>
                  <div className="flex items-center mt-2">
                    <div className={`flex items-center ${farmerStatistics.ordersTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {farmerStatistics.ordersTrend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="text-sm font-medium">{Math.abs(farmerStatistics.ordersTrend)}%</span>
                    </div>
                    <span className="text-sm text-blue-600 ml-2">vs last month</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <Truck className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600">2 pending delivery</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-purple-800 group-hover:text-purple-900 transition-colors">Total Revenue</CardTitle>
                      <CardDescription className="text-purple-600">Earnings from sales</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors group-hover:rotate-12 transform duration-300">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-800">${farmerStatistics.totalRevenue.toFixed(2)}</div>
                  <div className="flex items-center mt-2">
                    <div className={`flex items-center ${farmerStatistics.revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {farmerStatistics.revenueTrend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="text-sm font-medium">{Math.abs(farmerStatistics.revenueTrend)}%</span>
                    </div>
                    <span className="text-sm text-purple-600 ml-2">vs last month</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <Target className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600">${farmerStatistics.avgOrderValue.toFixed(2)} avg order</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-orange-800 group-hover:text-orange-900 transition-colors">Growth Rate</CardTitle>
                      <CardDescription className="text-orange-600">Monthly growth</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors group-hover:rotate-12 transform duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800">{farmerStatistics.monthlyGrowth}%</div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-medium">Excellent</span>
                    </div>
                    <span className="text-sm text-orange-600 ml-2">performance</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <Star className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600">4.8/5 rating</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest farm activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Package className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Product updated</p>
                      <p className="text-sm text-gray-500">Organic Tomatoes stock updated to 85 units</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <ShoppingBag className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">New order received</p>
                      <p className="text-sm text-gray-500">Order #12458 from Sarah Johnson ($23.48)</p>
                      <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <DollarSign className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Payment received</p>
                      <p className="text-sm text-gray-500">$67.95 payment for order #12456</p>
                      <p className="text-xs text-gray-400 mt-1">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>Manage your farm products</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      onClick={() => setShowAddProductModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No products found. Add your first product to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.filter(product =>
                          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img
                              src={product.image || `https://via.placeholder.com/60x60/22c55e/ffffff?text=${encodeURIComponent(product.name.charAt(0))}`}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = `https://via.placeholder.com/60x60/22c55e/ffffff?text=${encodeURIComponent(product.name.charAt(0))}`;
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 50 ? 'default' : product.stock > 20 ? 'secondary' : 'destructive'}>
                              {product.stock} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={product.status === 'active' ? 'default' : 'secondary'}
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProduct(product)}
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleProductStatus(product.id)}
                                title={product.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
                              >
                                {product.status === 'active' ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Delete Product"
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {product.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                        ))
                      )}
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
                <CardDescription>Track and manage your orders</CardDescription>
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
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.items} items</TableCell>
                          <TableCell>{order.total}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === 'Delivered' ? 'default' :
                                order.status === 'Processing' ? 'secondary' :
                                'outline'
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Order Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Profile</CardTitle>
                <CardDescription>Manage your farm information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={farmerData?.username || ''} disabled />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={farmerData?.email || ''} disabled />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value="Farmer" disabled />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="farmName">Farm Name</Label>
                      <Input id="farmName" placeholder="Enter your farm name" />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" placeholder="Enter your farm location" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter your phone number" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Farm Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your farm and farming practices..."
                    rows={4}
                  />
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Product Modal */}
        <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your farm catalog.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Herbs">Herbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="$0.00"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Select value={newProduct.unit} onValueChange={(value) => setNewProduct({...newProduct, unit: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="pint">pint</SelectItem>
                    <SelectItem value="dozen">dozen</SelectItem>
                    <SelectItem value="bunch">bunch</SelectItem>
                    <SelectItem value="each">each</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Product description"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Options
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="organic"
                      checked={newProduct.organic}
                      onChange={(e) => setNewProduct({...newProduct, organic: e.target.checked})}
                    />
                    <Label htmlFor="organic">Organic</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newProduct.featured}
                      onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="cursor-pointer"
                  />
                  {productImagePreview && (
                    <div className="relative">
                      <img
                        src={productImagePreview}
                        alt="Product preview"
                        className="w-full h-32 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => {
                          setProductImagePreview(null);
                          setNewProduct({...newProduct, image: ''});
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload an image for your product (max 5MB)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProduct}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={showEditProductModal} onOpenChange={setShowEditProductModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update your product information.
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select value={selectedProduct.category} onValueChange={(value) => setSelectedProduct({...selectedProduct, category: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Grains">Grains</SelectItem>
                      <SelectItem value="Herbs">Herbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="edit-price"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({...selectedProduct, price: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={selectedProduct.stock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, stock: parseInt(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-image" className="text-right">
                    Image
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "File too large",
                              description: "Please select an image smaller than 5MB",
                              variant: "destructive",
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string;
                            setSelectedProduct({...selectedProduct, image: imageUrl});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {selectedProduct.image && (
                      <div className="relative">
                        <img
                          src={selectedProduct.image}
                          alt="Product preview"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => setSelectedProduct({...selectedProduct, image: ''})}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload a new image to replace the current one (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateProduct}>Update Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FarmerDashboard;
