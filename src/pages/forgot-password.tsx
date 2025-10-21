import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";

// Form schema for validation
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsSubmitting(true);

    try {
      console.log('Sending forgot password request for:', data.email);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      console.log('Forgot password response status:', response.status);
      const result = await response.json();
      console.log('Forgot password response data:', result);

      if (response.ok) {
        setIsSuccess(true);

        toast({
          title: "Reset Instructions Sent",
          description: "Password reset instructions have been sent to your email address.",
        });

        // In development, show the reset token
        if (result.resetToken) {
          console.log('Reset token (development only):', result.resetToken);
          toast({
            title: "Development Mode",
            description: `Reset token: ${result.resetToken}`,
            variant: "default",
          });
        }
      } else {
        // Handle specific error cases
        if (result.action === 'signup') {
          toast({
            title: "Account Not Found",
            description: result.message,
            variant: "destructive",
            action: undefined
          });
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to send reset instructions. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center mb-2">
                <Link href="/login">
                  <a className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </a>
                </Link>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              </div>
              <CardDescription>
                Enter your email address and we'll send you instructions to reset your password
              </CardDescription>
              <div className="text-xs text-center text-amber-700 mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                <strong>⚠️ Important:</strong> This feature only works for existing accounts.
                If you don't have an account yet, please <a href="/sign-up" className="text-amber-800 underline font-medium">create one first</a>.
              </div>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">Check your email</h3>
                  <p className="text-gray-600">
                    We've sent you instructions on how to reset your password. Please check your inbox.
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button 
                      className="text-primary hover:underline"
                      onClick={() => setIsSuccess(false)}
                    >
                      try again
                    </button>
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="Enter your email address" 
                                type="email"
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link href="/login">
                  <a className="text-primary font-medium hover:underline">
                    Login
                  </a>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;