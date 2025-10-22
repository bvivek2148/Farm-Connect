import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Check if already logged in as admin
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      navigate('/admin-dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      if (!username.trim() || !password.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please enter both username/email and password',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Call actual login API for other credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user?.role === 'admin') {
        // Store admin auth in session storage
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role
        }));
        localStorage.setItem('farmConnectToken', data.token);

        toast({
          title: 'Login successful',
          description: 'Welcome to the admin portal',
        });

        // Small delay to show the success message
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 500);
      } else if (response.ok && data.success) {
        toast({
          title: 'Access Denied',
          description: 'Only administrators can access this portal',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login failed',
          description: data.message || 'Invalid username or password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: 'Login error',
        description: 'There was a problem logging in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                  id="username"
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="w-full">
            <p className="text-sm text-center text-gray-500">
              This portal is for authorized administrators only.
            </p>
            <p className="text-xs text-center text-gray-400 mt-2">
              For access, contact: farmconnect.helpdesk@gmail.com
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;