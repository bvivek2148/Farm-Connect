import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

// Form schema for validation
const signInSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormValues) => {
      const response = await apiRequest("POST", "/api/auth/signin", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "You have successfully signed in",
      });
      setIsSubmitting(false);
      // Redirect to home page or dashboard
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });
  
  function onSubmit(data: SignInFormValues) {
    setIsSubmitting(true);
    signInMutation.mutate(data);
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
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
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            {...field} 
                          />
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
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center text-sm">
                <Link href="/forgot-password">
                  <a className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/sign-up">
                  <a className="text-primary font-medium hover:underline">
                    Sign up
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

export default SignInPage;