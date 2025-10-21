import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Check, Award, TrendingUp, Users, Clock, Truck, User, MapPin, Phone, Mail, Upload, Camera, Video, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";

// Form schema for farmer registration
const farmerRegistrationSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters long",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number",
  }),
  farmName: z.string().min(2, {
    message: "Farm name must be at least 2 characters long",
  }),
  farmAddress: z.string().min(10, {
    message: "Please enter a complete farm address",
  }),
  farmSize: z.string().min(1, {
    message: "Please select your farm size",
  }),
  farmType: z.string().min(1, {
    message: "Please select your farm type",
  }),
  yearsExperience: z.string().min(1, {
    message: "Please select your years of experience",
  }),
  productsGrown: z.string().min(10, {
    message: "Please describe the products you grow (minimum 10 characters)",
  }),
  farmingPractices: z.string().min(1, {
    message: "Please select your farming practices",
  }),
  certifications: z.string().optional(),
  farmerProofImage: z.any().refine(val => val !== null && val !== undefined, {
    message: "Farmer proof image is required",
  }),
  farmAreaVideo: z.any().refine(val => val !== null && val !== undefined, {
    message: "Farm area video is required",
  }),
  businessLicense: z.boolean().refine(val => val === true, {
    message: "You must have a valid business license to join",
  }),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type FarmerRegistrationFormValues = z.infer<typeof farmerRegistrationSchema>;

// Farmer Registration Form Component
const FarmerRegistrationForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmerImagePreview, setFarmerImagePreview] = useState<string | null>(null);
  const [farmVideoPreview, setFarmVideoPreview] = useState<string | null>(null);

  const form = useForm<FarmerRegistrationFormValues>({
    resolver: zodResolver(farmerRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      farmName: "",
      farmAddress: "",
      farmSize: "",
      farmType: "",
      yearsExperience: "",
      productsGrown: "",
      farmingPractices: "",
      certifications: "",
      farmerProofImage: null,
      farmAreaVideo: null,
      businessLicense: false,
      agreeTerms: false,
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setFarmerImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("farmerProofImage", file);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: "Please select a video smaller than 50MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFarmVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("farmAreaVideo", file);
    }
  };

  function onSubmit(data: FarmerRegistrationFormValues) {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest! We'll review your application and get back to you within 2-3 business days.",
      });
      setIsSubmitting(false);
      form.reset();
      setFarmerImagePreview(null);
      setFarmVideoPreview(null);
    }, 2000);
  }

  return (
    <div className="bg-white py-16" id="farmer-registration">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Join as a Farmer</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill out the form below to start your journey with Farm Connect. Our team will review your application and get back to you soon.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Registration Form</CardTitle>
              <CardDescription>
                Please provide accurate information about yourself and your farm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Personal Information
                    </h3>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Farm Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      Farm Information
                    </h3>

                    <FormField
                      control={form.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your farm name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="farmAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Address *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter complete farm address including city, state, and zip code"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="farmSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Size *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select farm size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">Small (Under 10 acres)</SelectItem>
                                <SelectItem value="medium">Medium (10-50 acres)</SelectItem>
                                <SelectItem value="large">Large (50-200 acres)</SelectItem>
                                <SelectItem value="enterprise">Enterprise (200+ acres)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="farmType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Farm Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select farm type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="vegetables">Vegetable Farm</SelectItem>
                                <SelectItem value="fruits">Fruit Farm/Orchard</SelectItem>
                                <SelectItem value="dairy">Dairy Farm</SelectItem>
                                <SelectItem value="livestock">Livestock/Ranch</SelectItem>
                                <SelectItem value="grains">Grain Farm</SelectItem>
                                <SelectItem value="mixed">Mixed/Diversified</SelectItem>
                                <SelectItem value="specialty">Specialty Crops</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Experience and Products */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Experience & Products</h3>

                    <FormField
                      control={form.control}
                      name="yearsExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Farming Experience *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0-2">0-2 years (New Farmer)</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="6-10">6-10 years</SelectItem>
                              <SelectItem value="11-20">11-20 years</SelectItem>
                              <SelectItem value="20+">20+ years (Veteran)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productsGrown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Products You Grow *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the products you grow (e.g., tomatoes, lettuce, apples, grass-fed beef, etc.)"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Please list the main products you grow and plan to sell through our platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="farmingPractices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farming Practices *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your farming practices" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="organic-certified">Certified Organic</SelectItem>
                              <SelectItem value="organic-transitioning">Transitioning to Organic</SelectItem>
                              <SelectItem value="sustainable">Sustainable/Natural</SelectItem>
                              <SelectItem value="conventional">Conventional</SelectItem>
                              <SelectItem value="regenerative">Regenerative Agriculture</SelectItem>
                              <SelectItem value="biodynamic">Biodynamic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certifications (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., USDA Organic, GAP, Animal Welfare Approved, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            List any relevant certifications your farm has
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Verification Documents */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-primary" />
                      Verification Documents
                    </h3>

                    {/* Farmer Proof Image */}
                    <FormField
                      control={form.control}
                      name="farmerProofImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farmer Proof Image *</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  id="farmer-image-upload"
                                />
                                <label htmlFor="farmer-image-upload" className="cursor-pointer">
                                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Click to upload farmer proof image
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG up to 5MB
                                  </p>
                                </label>
                              </div>

                              {farmerImagePreview && (
                                <div className="mt-4">
                                  <img
                                    src={farmerImagePreview}
                                    alt="Farmer proof preview"
                                    className="max-w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a clear photo of yourself at your farm or with your farming equipment
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Farm Area Video */}
                    <FormField
                      control={form.control}
                      name="farmAreaVideo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Area Video *</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={handleVideoUpload}
                                  className="hidden"
                                  id="farm-video-upload"
                                />
                                <label htmlFor="farm-video-upload" className="cursor-pointer">
                                  <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    Click to upload farm area video
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    MP4, MOV up to 50MB
                                  </p>
                                </label>
                              </div>

                              {farmVideoPreview && (
                                <div className="mt-4">
                                  <video
                                    src={farmVideoPreview}
                                    controls
                                    className="max-w-full h-48 rounded-lg border"
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a short video (2-5 minutes) showing your farm area, crops, or livestock
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Legal Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Legal Requirements</h3>

                    <FormField
                      control={form.control}
                      name="businessLicense"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I have a valid business license for my farm operation *
                            </FormLabel>
                            <FormDescription>
                              A valid business license is required to sell through our platform
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="agreeTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the Terms of Service and Privacy Policy *
                            </FormLabel>
                            <FormDescription>
                              By checking this box, you agree to our terms and conditions
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Benefit component with icon
const Benefit = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex gap-4">
      <div className="bg-primary/10 p-3 rounded-full h-fit">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Testimonial component
const Testimonial = ({ name, location, quote, image }: {
  name: string;
  location: string;
  quote: string;
  image: string;
}) => {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-gray-500 text-sm">{location}</p>
          </div>
        </div>
        <div className="relative">
          <p className="italic text-gray-600">"{quote}"</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Success story component
const SuccessStory = ({ title, description, image, stats }: {
  title: string;
  description: string;
  image: string;
  stats: {
    label: string;
    value: string;
  }[];
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border">
      <div className="h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-primary text-2xl font-bold">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FarmerPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-white text-primary mb-4">For Farmers</Badge>
            <h1 className="text-4xl font-bold mb-6">Grow Your Farm Business with Direct-to-Consumer Sales</h1>
            <p className="text-xl mb-8">
              Join thousands of farmers who are increasing their profits by selling directly to local consumers through Farm Connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => {
                  document.getElementById('farmer-registration')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                Join as a Farmer
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-4xl font-bold text-primary mb-2">5,000+</p>
            <p className="text-gray-600">Farmers on our platform</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-4xl font-bold text-primary mb-2">30%</p>
            <p className="text-gray-600">Average profit increase</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-4xl font-bold text-primary mb-2">250K+</p>
            <p className="text-gray-600">Active consumers</p>
          </div>
        </div>
      </div>
      
      {/* Benefits section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Farmers Choose Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Farm Connect provides the tools and platform you need to reach more customers, streamline operations, and grow your business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <Benefit 
            icon={TrendingUp}
            title="Higher Profit Margins"
            description="Sell directly to consumers without middlemen, increasing your profit margins by 20-40% compared to traditional distribution channels."
          />
          
          <Benefit 
            icon={Users}
            title="Access to Local Customers"
            description="Connect with thousands of consumers in your area who are actively seeking fresh, local produce from farms like yours."
          />
          
          <Benefit 
            icon={Clock}
            title="Reduced Food Waste"
            description="Our pre-order system helps you harvest exactly what you need, reducing waste and maximizing efficiency on your farm."
          />
          
          <Benefit 
            icon={Truck}
            title="Simplified Logistics"
            description="Our integrated delivery management system helps coordinate deliveries and pickups, saving you time and reducing transportation costs."
          />
          
          <Benefit 
            icon={Award}
            title="Brand Recognition"
            description="Build your farm's brand and reputation with customizable profiles, product listings, and customer reviews."
          />
          
          <Benefit 
            icon={Check}
            title="Easy to Use Platform"
            description="Our farmer-friendly tools make it simple to list products, manage inventory, and process orders - even if you're not tech-savvy."
          />
        </div>
      </div>
      
      {/* How it works section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started with Farm Connect is simple, and our team is here to help every step of the way.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-primary/20 hidden md:block"></div>
              
              <div className="space-y-12">
                <div className="relative flex flex-col md:flex-row gap-8">
                  <div className="md:w-16 md:h-16 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                    1
                  </div>
                  <div className="flex-1 md:pt-3">
                    <h3 className="text-xl font-bold mb-2">Sign Up & Create Your Profile</h3>
                    <p className="text-gray-600">
                      Register on Farm Connect and create your farm's profile, showcasing your story, practices, and what makes your farm unique. Our team will verify your information to ensure consumer trust.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex flex-col md:flex-row gap-8">
                  <div className="md:w-16 md:h-16 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                    2
                  </div>
                  <div className="flex-1 md:pt-3">
                    <h3 className="text-xl font-bold mb-2">List Your Products</h3>
                    <p className="text-gray-600">
                      Add your products with descriptions, photos, pricing, and availability. Our system helps you manage inventory and automatically notifies customers when new products are available.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex flex-col md:flex-row gap-8">
                  <div className="md:w-16 md:h-16 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                    3
                  </div>
                  <div className="flex-1 md:pt-3">
                    <h3 className="text-xl font-bold mb-2">Receive & Fulfill Orders</h3>
                    <p className="text-gray-600">
                      Customers place orders through our platform, and you receive notifications immediately. Prepare the orders for pickup at your farm or market, or use our integrated delivery options.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex flex-col md:flex-row gap-8">
                  <div className="md:w-16 md:h-16 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl z-10 mx-auto md:mx-0">
                    4
                  </div>
                  <div className="flex-1 md:pt-3">
                    <h3 className="text-xl font-bold mb-2">Get Paid & Grow</h3>
                    <p className="text-gray-600">
                      Receive payments directly to your account, with transparent fees and fast processing. Use our analytics tools to track sales, understand customer preferences, and grow your business over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  document.getElementById('farmer-registration')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                Start Selling Today
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success stories */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Farmer Success Stories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from farmers who have transformed their businesses by connecting directly with consumers through our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <SuccessStory
            title="Green Valley Organics"
            description="A small family farm that increased their customer base by 200% in just six months after joining Farm Connect."
            image="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop"
            stats={[
              { label: "Revenue Increase", value: "78%" },
              { label: "New Customers", value: "320+" },
              { label: "Food Waste Reduction", value: "45%" },
              { label: "Time Saved Weekly", value: "12 hrs" }
            ]}
          />

          <SuccessStory
            title="Hillside Ranch"
            description="A medium-sized livestock farm that eliminated dependence on wholesalers by building a direct consumer base."
            image="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop"
            stats={[
              { label: "Profit Margin Increase", value: "32%" },
              { label: "Direct Customers", value: "180+" },
              { label: "Monthly Orders", value: "250+" },
              { label: "Years with Farm Connect", value: "3" }
            ]}
          />

          <SuccessStory
            title="Sunshine Orchard"
            description="An apple orchard that diversified their product offerings and built a year-round customer base despite a seasonal crop."
            image="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop"
            stats={[
              { label: "Off-Season Sales", value: "+125%" },
              { label: "Product Varieties", value: "15" },
              { label: "Subscription Customers", value: "95" },
              { label: "Rating on Platform", value: "4.9/5" }
            ]}
          />
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Farmers Are Saying</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear directly from the farmers using our platform every day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Testimonial
              name="Robert Wilson"
              location="Wilson Family Farms, Oregon"
              quote="Farm Connect has completely changed how we do business. We've gone from struggling to sell through farmers markets to having a thriving direct business with customers who value our practices and products."
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
            />

            <Testimonial
              name="Maria Sanchez"
              location="Sanchez Organics, California"
              quote="The platform is incredibly easy to use, even for someone like me who isn't tech-savvy. I can manage my listings, communicate with customers, and track orders all from my phone while working in the fields."
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
            />

            <Testimonial
              name="David Thompson"
              location="Morning Glory Farm, Vermont"
              quote="What I appreciate most is the direct relationship with customers. I know exactly what to harvest, when to harvest it, and for whom—virtually eliminating waste while maximizing our revenue."
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
            />
          </div>
        </div>
      </div>
      
      {/* Plans & Pricing tab section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Plans for Every Farm</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Whether you're just starting out or running a large operation, we have a plan that fits your needs and budget.
          </p>
        </div>
        
        <Tabs defaultValue="small" className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 w-96">
              <TabsTrigger value="small" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Small Farm
              </TabsTrigger>
              <TabsTrigger value="medium" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Mid-Size
              </TabsTrigger>
              <TabsTrigger value="large" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Large Farm
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="small">
            <Card>
              <CardHeader>
                <CardTitle>Basic Plan</CardTitle>
                <CardDescription>Perfect for small farms just starting with direct-to-consumer sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$29.99</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Up to 25 product listings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Basic farm profile</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Customer messaging</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Order management</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Weekly payouts (2.9% + $0.30 per transaction)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="medium">
            <Card>
              <CardHeader>
                <CardTitle>Growth Plan</CardTitle>
                <CardDescription>Ideal for established farms looking to expand their customer base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$79.99</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Unlimited product listings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Enhanced farm profile with photo gallery</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Priority placement in search results</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Marketing tools (email campaigns, promotions)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Daily payouts (2.7% + $0.30 per transaction)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="large">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Plan</CardTitle>
                <CardDescription>Comprehensive solution for large farming operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$199.99</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>All Growth Plan features</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Multi-location management</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Customizable delivery zones</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>API access for system integration</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Inventory forecasting tools</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>24/7 premium support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Daily payouts (2.5% + $0.30 per transaction)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90">Contact Sales</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-8">
          <p className="text-gray-600">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Farm Business?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Join thousands of successful farmers who are thriving by connecting directly with consumers through Farm Connect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => {
                document.getElementById('farmer-registration')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              Join as a Farmer
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Farmer Registration Form */}
      <FarmerRegistrationForm />

      {/* FAQ section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about joining and selling through Farm Connect.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">How long does it take to get started?</h3>
            <p className="text-gray-600 mt-2">
              Most farms can complete the signup process and be approved within 1-3 business days. Once approved, you can start listing products and receiving orders immediately.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">What types of farms can join?</h3>
            <p className="text-gray-600 mt-2">
              We welcome all types of farms - from small family operations to large commercial farms. This includes produce farms, dairy operations, ranches, orchards, vineyards, flower farms, and more.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">How do payments work?</h3>
            <p className="text-gray-600 mt-2">
              Customers pay through our secure platform when placing orders. We process these payments and transfer the funds to your linked bank account according to your plan's payout schedule, minus our transaction fee.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">Do I need to offer delivery?</h3>
            <p className="text-gray-600 mt-2">
              No, delivery is optional. You can choose to offer farm pickup, delivery, or both. Many farmers also set up convenient pickup points at local farmers' markets or other community locations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">Is there a contract or commitment?</h3>
            <p className="text-gray-600 mt-2">
              No long-term contract is required. All our plans are month-to-month, and you can cancel anytime. Annual plans are available at a discount for farms that prefer that option.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerPage;