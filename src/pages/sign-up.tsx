import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { User, Lock, Mail, Phone, ArrowLeft, CheckCircle, Send, Chrome, Loader2 } from "lucide-react";
import SuccessMessage from "@/components/SuccessMessage";

// Email signup schema
const emailSignUpSchema = z.object({
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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Phone signup schema
const phoneSignUpSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// OTP verification schema
const otpSchema = z.object({
  otp: z.string().length(6, {
    message: "OTP must be 6 digits",
  }),
});

type EmailSignUpFormValues = z.infer<typeof emailSignUpSchema>;
type PhoneSignUpFormValues = z.infer<typeof phoneSignUpSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

const SignUpPage = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupType, setSignupType] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ title: string; description: string }>({ title: '', description: '' });
  const { signupWithEmail, signupWithPhone, verifyOTP, resendOTP, loginWithGoogle } = useAuth();

  const emailForm = useForm<EmailSignUpFormValues>({
    resolver: zodResolver(emailSignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const phoneForm = useForm<PhoneSignUpFormValues>({
    resolver: zodResolver(phoneSignUpSchema),
    defaultValues: {
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });
  
  // Debug: Monitor state changes
  useEffect(() => {
    console.log('OTP State changed:', { showOTPInput, signupType, userEmail, userPhone });
  }, [showOTPInput, signupType, userEmail, userPhone]);

  async function onEmailSubmit(data: EmailSignUpFormValues) {
    setIsSubmitting(true);

    try {
      const result = await signupWithEmail(data);
      console.log('Email signup result:', result);

      if (result.success) {
        // Show success message component
        setSuccessData({
          title: "Account Created Successfully! 🎉",
          description: result.message || "Your account has been created successfully. Please login to continue and start exploring fresh, local products!"
        });
        setShowSuccess(true);
      } else {
        // Handle specific field errors from backend
        const errorMessage = result.error || "Failed to create account. Please try again.";
        const fieldError = result.field;
        
        // Set field-specific error if available
        if (fieldError && fieldError === 'username') {
          emailForm.setError('username', {
            type: 'manual',
            message: 'This username is already taken. Please choose a different one.'
          });
        } else if (fieldError && fieldError === 'email') {
          emailForm.setError('email', {
            type: 'manual',
            message: 'This email is already in use. Please use a different email or sign in.'
          });
        }
        
        toast({
          title: "Signup Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  }

  async function onPhoneSubmit(data: PhoneSignUpFormValues) {
    setIsSubmitting(true);

    try {
      const result = await signupWithPhone(data);
      console.log('Phone signup result:', result);

      if (result.success) {
        // Show success message component
        setSuccessData({
          title: "Account Created Successfully! 🎉",
          description: result.message || "Your account has been created successfully. Please login to continue and start exploring fresh, local products!"
        });
        setShowSuccess(true);
      } else {
        // Handle specific field errors from backend
        const errorMessage = result.error || "Failed to create account. Please try again.";
        const fieldError = result.field;
        
        // Set field-specific error if available
        if (fieldError && fieldError === 'username') {
          phoneForm.setError('username', {
            type: 'manual',
            message: 'This username is already taken. Please choose a different one.'
          });
        } else if (fieldError && fieldError === 'email') {
          phoneForm.setError('phone', {
            type: 'manual',
            message: 'This phone number is already in use. Please use a different number or sign in.'
          });
        }
        
        toast({
          title: "Signup Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Phone signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  }

  async function onOTPSubmit(data: OTPFormValues) {
    setIsSubmitting(true);

    const success = await verifyOTP(
      data.otp,
      signupType as 'email' | 'sms',
      signupType === 'email' ? userEmail : undefined,
      signupType === 'phone' ? userPhone : undefined
    );

    if (success) {
      setSuccessData({
        title: "Email Verified! 🎉",
        description: "Your email has been verified successfully. Please login to continue and start exploring fresh, local products!"
      });
      setShowSuccess(true);
    }

    setIsSubmitting(false);
  }

  const handleGoogleSignup = async () => {
    // Check if Google OAuth is configured
    const hasGoogleConfig = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                           import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your-google-client-id-here';
    
    if (!hasGoogleConfig) {
      toast({
        title: "Google Login Not Configured",
        description: "Google OAuth is not set up yet. Please use email or phone signup for now.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await loginWithGoogle();
    if (success) {
      setSuccessData({
        title: "Account Created with Google! 🎉",
        description: "Your account has been created successfully using Google. Please login to continue and start exploring fresh, local products!"
      });
      setShowSuccess(true);
    }
  };
  
  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    // Verify OTP with Supabase
    const success = await verifyOTP(
      otpValue,
      signupType as 'email' | 'sms',
      signupType === 'email' ? userEmail : undefined,
      signupType === 'phone' ? userPhone : undefined
    );
    
    if (success) {
      setSuccessData({
        title: "Account Verified! 🎉",
        description: "Your account has been verified successfully. Please login to continue and start exploring fresh, local products!"
      });
      setShowSuccess(true);
    } else {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsVerifying(false);
  };
  
  const handleResendOTP = async () => {
    const success = await resendOTP(
      signupType === 'email' ? userEmail : '',
      signupType === 'phone' ? userPhone : '',
      signupType as 'email' | 'sms'
    );
    // Success/error messages are handled in the resendOTP function
  };
  
  // Show success message if account creation was successful
  if (showSuccess) {
    return (
      <SuccessMessage
        title={successData.title}
        description={successData.description}
        redirectPath="/login"
        redirectText="Continue to Login"
        onRedirect={() => setLocation('/login')}
        countdown={3}
      />
    );
  }
  
  if (step === 'verify') {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep('signup')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl font-bold">
                    Verify Your {signupType === 'email' ? 'Email' : 'Phone'}
                  </CardTitle>
                </div>
                <CardDescription>
                  We've sent a verification code to{" "}
                  <strong>
                    {signupType === 'email' ? userEmail : userPhone}
                  </strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              {...field}
                              className="text-center text-lg tracking-widest"
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
                      {isSubmitting ? "Verifying..." : "Verify & Create Account"}
                      {!isSubmitting && <CheckCircle className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                </Form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    className="text-sm"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Resend Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join Farm Connect to access fresh, local produce
              </CardDescription>
              <div className="text-xs text-center text-blue-700 mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>🌱 Note:</strong> All accounts start as customers.
                Contact admin to upgrade to farmer status.
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone">
                    <Phone className="mr-2 h-4 w-4" />
                    Phone
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="email">
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a unique username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={emailForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your@email.com" 
                                {...field} 
                                disabled={showOTPInput && signupType === 'email'}
                              />
                            </FormControl>
                            <FormDescription>
                              You'll receive a verification email
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* OTP Input for Email */}
                      {showOTPInput && signupType === 'email' && (
                        <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm text-blue-700 font-medium">
                            📧 Verification code sent to {userEmail}
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Enter 6-digit code"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value)}
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={handleVerifyOTP}
                              disabled={isVerifying || otpValue.length !== 6}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isVerifying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          </div>
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={handleResendOTP}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Didn't receive code? Resend
                            </button>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a strong password" 
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
                        control={emailForm.control}
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
                      
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating Account..." : "Create Account with Email"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="phone">
                  <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                      <FormField
                        control={phoneForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a unique username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={phoneForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={phoneForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={phoneForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="+1234567890" 
                                {...field} 
                                disabled={showOTPInput && signupType === 'phone'}
                              />
                            </FormControl>
                            <FormDescription>
                              You'll receive an SMS verification code
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* OTP Input for Phone */}
                      {showOTPInput && signupType === 'phone' && (
                        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm text-green-700 font-medium">
                            📱 Verification code sent to {userPhone}
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Enter 6-digit code"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value)}
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={handleVerifyOTP}
                              disabled={isVerifying || otpValue.length !== 6}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isVerifying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          </div>
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={handleResendOTP}
                              className="text-sm text-green-600 hover:underline"
                            >
                              Didn't receive code? Resend
                            </button>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={phoneForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a strong password" 
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
                        control={phoneForm.control}
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
                      
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating Account..." : "Create Account with Phone"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              
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
              
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-center text-sm">
                Already have an account?{" "}
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

export default SignUpPage;