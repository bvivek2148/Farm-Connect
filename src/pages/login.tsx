import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Mail, Facebook, Phone, Chrome, CheckCircle, Github, Apple, MessageSquare, Linkedin } from "lucide-react";

// Form schema for validation
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const { login, resetPassword, loginWithGoogle, isLoading } = useAuth();
  
  // Cancel login function
  const cancelLogin = () => {
    console.log('User cancelled login');
    setIsSubmitting(false);
    setShowCancelButton(false);
    toast({
      title: "Login Cancelled",
      description: "Login process was cancelled by user.",
    });
  };
  
  // Removed problematic connection test that was causing errors
  
  // Check if user just came from signup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromSignup = urlParams.get('from') === 'signup';
    const newAccount = sessionStorage.getItem('newAccountCreated');
    
    if (fromSignup || newAccount) {
      setShowWelcomeMessage(true);
      // Clear the session storage
      sessionStorage.removeItem('newAccountCreated');
      // Remove URL parameter
      if (fromSignup) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    console.log('🚀 Form submitted with:', { email: data.email, passwordLength: data.password.length });
    setIsSubmitting(true);
    setShowCancelButton(false);
    
    
    // Show cancel button after 3 seconds
    const cancelTimer = setTimeout(() => {
      setShowCancelButton(true);
    }, 3000);

    try {
      console.log('🔑 Starting login process...');
      
      // Add timeout to prevent hanging
      const loginPromise = login({
        email: data.email,
        password: data.password
      });
      
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout after 15 seconds')), 15000)
      );

      const success = await Promise.race([loginPromise, timeoutPromise]);
      console.log('🎉 Login result:', success);
      
      clearTimeout(cancelTimer);

      if (success) {
        console.log('Login successful, redirecting to home...');
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          setLocation("/");
        }, 100);
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login form error:', error);
      
      let errorMessage = "An unexpected error occurred during login.";
      if (error instanceof Error && error.message.includes('timeout')) {
        errorMessage = "Login timed out. Please check your connection and try again.";
      }
      
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('🔄 Cleaning up login process...');
      clearTimeout(cancelTimer);
      setIsSubmitting(false);
      setShowCancelButton(false);
    }
  }

  const handleForgotPassword = async () => {
    const email = form.getValues('email');
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    const success = await resetPassword(email);
    // Success/error messages are handled in the resetPassword function
  };
  
  const handleGoogleLogin = async () => {
    // Check if Google OAuth is configured
    const hasGoogleConfig = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                           import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your-google-client-id-here';
    
    if (!hasGoogleConfig) {
      toast({
        title: "Google Login Not Configured",
        description: "Google OAuth is not set up yet. Please use email login for now.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await loginWithGoogle();
    if (success) {
      setLocation("/");
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center">
                Login to your Farm Connect account
              </CardDescription>
              {showWelcomeMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">
                        Account Created Successfully!
                      </h4>
                      <p className="text-sm text-green-600 mt-1">
                        Welcome to Farm Connect! Please login with your credentials to get started.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                    
                    <Link href="/sign-up" className="text-sm text-primary hover:underline">
                      New user? Create account
                    </Link>
                  </div>
                  
                  {!showCancelButton ? (
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={true}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Logging in...</span>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelLogin}
                        className="w-full"
                      >
                        Cancel Login
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
              
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              {/* Primary OAuth Providers */}
              <div className="space-y-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
                
              </div>
              
              {/* Note: Additional OAuth providers available - configure in Supabase Dashboard */}
              <div className="mt-3 text-xs text-center text-muted-foreground">
                More login options (Facebook, GitHub, Apple, etc.) available when configured
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-primary hover:underline font-medium">
                  Create account
                </Link>
              </div>
              <div className="text-center text-xs text-gray-500">
                By logging in, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
