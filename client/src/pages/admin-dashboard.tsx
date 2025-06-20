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
  Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

// Enhanced Statistics data with trends
const statistics = {
  totalUsers: 5842,
  activeUsers: 3127,
  totalFarms: 248,
  totalOrders: 15429,
  totalRevenue: 528947.89,
  uniqueVisitors: 15749,
  // New metrics
  monthlyGrowth: 12.5,
  conversionRate: 3.2,
  avgOrderValue: 34.28,
  customerSatisfaction: 4.7,
  systemUptime: 99.9,
  activeConnections: 1247,
  // Trends (percentage change)
  usersTrend: 8.2,
  farmsTrend: 15.3,
  ordersTrend: -2.1,
  revenueTrend: 22.7,
  visitorsTrend: 5.8
};

const AdminDashboard = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate online status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    toast({
      title: 'Logged out',
      description: 'You have been logged out of the admin portal',
    });
    navigate('/admin-login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast({
      title: 'Data refreshed',
      description: 'Dashboard data has been updated',
    });
  };

  const clearNotifications = () => {
    setNotifications(0);
    toast({
      title: 'Notifications cleared',
      description: 'All notifications have been marked as read',
    });
  };
  
  // If not authorized, don't render the dashboard
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Farm Connect Admin</h1>
                  <p className="text-sm text-slate-500">Management Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time clock */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>

              {/* System status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-600">{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" onClick={clearNotifications} className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Refresh button */}
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
            <TabsList className="grid grid-cols-6 w-full h-auto p-2 bg-transparent">
              <TabsTrigger value="overview" className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <BarChart className="h-4 w-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" /> Users
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Layers className="h-4 w-4 mr-2" /> Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <ShoppingBag className="h-4 w-4 mr-2" /> Orders
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center justify-center py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Database className="h-4 w-4 mr-2" /> System
              </TabsTrigger>
            </TabsList>
          </div>
        
          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-blue-800">Total Users</CardTitle>
                      <CardDescription className="text-blue-600">Registered customers and farmers</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">{statistics.totalUsers.toLocaleString()}</div>
                  <div className="flex items-center mt-2">
                    <div className={`flex items-center ${statistics.usersTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {statistics.usersTrend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="text-sm font-medium">{Math.abs(statistics.usersTrend)}%</span>
                    </div>
                    <span className="text-sm text-blue-600 ml-2">vs last month</span>
                  </div>
                  <Progress value={(statistics.activeUsers / statistics.totalUsers) * 100} className="mt-3" />
                  <p className="text-xs text-blue-600 mt-1">{statistics.activeUsers.toLocaleString()} active users</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-green-800">Total Farms</CardTitle>
                      <CardDescription className="text-green-600">Registered farm partners</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800">{statistics.totalFarms.toLocaleString()}</div>
                  <div className="flex items-center mt-2">
                    <div className={`flex items-center ${statistics.farmsTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {statistics.farmsTrend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="text-sm font-medium">{Math.abs(statistics.farmsTrend)}%</span>
                    </div>
                    <span className="text-sm text-green-600 ml-2">vs last month</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <Zap className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">12 new this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-purple-800">Total Revenue</CardTitle>
                      <CardDescription className="text-purple-600">All time sales</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-800">${statistics.totalRevenue.toLocaleString()}</div>
                  <div className="flex items-center mt-2">
                    <div className={`flex items-center ${statistics.revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {statistics.revenueTrend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      <span className="text-sm font-medium">{Math.abs(statistics.revenueTrend)}%</span>
                    </div>
                    <span className="text-sm text-purple-600 ml-2">vs last month</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <Target className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600">${statistics.avgOrderValue} avg order</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-orange-800">System Health</CardTitle>
                      <CardDescription className="text-orange-600">Uptime & Performance</CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800">{statistics.systemUptime}%</div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-green-600">
                      <Wifi className="h-4 w-4" />
                      <span className="text-sm font-medium ml-1">Excellent</span>
                    </div>
                    <span className="text-sm text-orange-600 ml-2">uptime</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <Globe className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600">{statistics.activeConnections} active connections</span>
                  </div>
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

        {/* New Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-sm text-green-600 font-semibold">{statistics.conversionRate}%</span>
                  </div>
                  <Progress value={statistics.conversionRate * 10} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-green-600 font-semibold">{statistics.customerSatisfaction}/5.0</span>
                  </div>
                  <Progress value={statistics.customerSatisfaction * 20} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Growth</span>
                    <span className="text-sm text-green-600 font-semibold">{statistics.monthlyGrowth}%</span>
                  </div>
                  <Progress value={statistics.monthlyGrowth * 4} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Real-time Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Real-time Activity
                </CardTitle>
                <CardDescription>Live system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                      <span className="text-sm">Active Users Online</span>
                    </div>
                    <span className="font-semibold text-blue-600">{statistics.activeConnections}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                      <span className="text-sm">Orders Today</span>
                    </div>
                    <span className="font-semibold text-green-600">47</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse mr-3"></div>
                      <span className="text-sm">Revenue Today</span>
                    </div>
                    <span className="font-semibold text-purple-600">$1,247</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-3"></div>
                      <span className="text-sm">New Signups</span>
                    </div>
                    <span className="font-semibold text-orange-600">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Device Analytics
              </CardTitle>
              <CardDescription>User device breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Monitor className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">62%</div>
                  <div className="text-sm text-gray-600">Desktop</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">34%</div>
                  <div className="text-sm text-gray-600">Mobile</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold">4%</div>
                  <div className="text-sm text-gray-600">Tablet</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage customers and farmers</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
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

        {/* New System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  System Health
                </CardTitle>
                <CardDescription>Real-time system monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Server Status</div>
                      <div className="text-sm text-gray-600">All systems operational</div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500">Online</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-blue-600 font-semibold">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-orange-600 font-semibold">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm text-green-600 font-semibold">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Security & Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Security & Logs
                </CardTitle>
                <CardDescription>Security events and system logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm">Failed login attempts</span>
                    </div>
                    <span className="font-semibold text-yellow-600">3</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Successful logins</span>
                    </div>
                    <span className="font-semibold text-green-600">247</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm">Database queries</span>
                    </div>
                    <span className="font-semibold text-blue-600">1,247</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm">API requests</span>
                    </div>
                    <span className="font-semibold text-purple-600">5,432</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Configuration
              </CardTitle>
              <CardDescription>Manage system settings and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="font-medium">Database</div>
                  <div className="text-sm text-gray-600">Manage database settings</div>
                </div>

                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="font-medium">Security</div>
                  <div className="text-sm text-gray-600">Security configurations</div>
                </div>

                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="font-medium">API</div>
                  <div className="text-sm text-gray-600">API configurations</div>
                </div>

                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-gray-600">Notification settings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;