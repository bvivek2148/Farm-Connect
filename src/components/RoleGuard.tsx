import React from 'react';
import { useAuth } from '@/context/HybridAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'wouter';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'farmer' | 'admin';
  allowedRoles?: Array<'customer' | 'farmer' | 'admin'>;
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles, 
  fallback 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, this should be handled by AuthGuard first
  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  const hasRequiredRole = () => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // Check specific role requirement
    if (requiredRole && user.role !== requiredRole) {
      return false;
    }
    
    // Check if user role is in allowed roles
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return false;
    }
    
    return true;
  };

  // If user has required role, render children
  if (hasRequiredRole()) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied screen
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <div className="space-y-1">
                <p><strong>Your role:</strong> <span className="capitalize">{user?.role}</span></p>
                {requiredRole && (
                  <p><strong>Required role:</strong> <span className="capitalize">{requiredRole}</span></p>
                )}
                {allowedRoles && (
                  <p><strong>Allowed roles:</strong> {allowedRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}</p>
                )}
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600 mb-6">
              Contact an administrator if you believe you should have access to this page.
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleGuard;