import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Mail, Facebook, Phone, ArrowLeft } from "lucide-react";

// Form schema for validation
const signUpSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpOption, setShowOtpOption] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const { signup, loginWithSocial } = useAuth();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const sendOtp = async (email: string) => {
    try {
      // Simulate OTP sending
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP for', email, ':', otp);

      // In a real app, you would send this via email/SMS
      toast({
        title: "OTP Sent",
        description: `OTP sent to ${email}. For demo: ${otp}`,
      });

      // Store OTP for verification (in real app, store on server)
      sessionStorage.setItem('signup_otp', otp);
      sessionStorage.setItem('signup_email', email);
      setOtpSent(true);

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyOtp = () => {
    const storedOtp = sessionStorage.getItem('signup_otp');

    if (enteredOtp === storedOtp) {
      toast({
        title: "Success",
        description: "Email verified successfully!",
      });
      sessionStorage.removeItem('signup_otp');
      sessionStorage.removeItem('signup_email');
      return true;
    } else {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  async function onSubmit(data: SignUpFormValues) {
    setIsSubmitting(true);

    // If OTP verification is enabled and not yet verified
    if (showOtpOption && !otpSent) {
      const otpSentSuccess = await sendOtp(data.email);
      setIsSubmitting(false);
      return;
    }

    // If OTP was sent, verify it first
    if (showOtpOption && otpSent) {
      if (!verifyOtp()) {
        setIsSubmitting(false);
        return;
      }
    }

    const success = await signup(data);

    if (success) {
      setLocation("/");
    }

    setIsSubmitting(false);
  }

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'phone') => {
    const success = await loginWithSocial(provider);

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
              <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
              <CardDescription className="text-center">
                Create an account to start shopping for fresh, local produce
              </CardDescription>
              <div className="text-xs text-center text-blue-700 mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>ℹ️ Note:</strong> All new accounts start as customers.
                Contact admin to upgrade to farmer status if you want to sell products.
              </div>
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
                          <Input placeholder="Enter a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email address" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* OTP Verification Option */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="otp-option"
                        checked={showOtpOption}
                        onCheckedChange={setShowOtpOption}
                      />
                      <label htmlFor="otp-option" className="text-sm font-medium">
                        Verify email with OTP (recommended)
                      </label>
                    </div>

                    {showOtpOption && otpSent && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Enter OTP</label>
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          maxLength={6}
                        />
                        <p className="text-xs text-gray-500">
                          Check your email for the OTP code
                        </p>
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm your password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the <Link href="/terms"><a className="text-primary hover:underline">Terms of Service</a></Link> and <Link href="/privacy-policy"><a className="text-primary hover:underline">Privacy Policy</a></Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (showOtpOption && !otpSent ? "Sending OTP..." : "Creating account...")
                      : (showOtpOption && !otpSent ? "Send OTP" :
                         showOtpOption && otpSent ? "Verify & Create Account" : "Create Account")
                    }
                  </Button>
                </form>
              </Form>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignup('google')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignup('facebook')}
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialSignup('phone')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/sign-in">
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

export default SignUpPage;