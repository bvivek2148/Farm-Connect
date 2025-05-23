import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Award, TrendingUp, Users, Clock, Truck } from "lucide-react";
import { Link } from "wouter";

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
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
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
              <Button size="lg" className="bg-primary hover:bg-primary/90">
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
            image="https://cdn.pixabay.com/photo/2018/07/05/09/33/people-3518354_1280.jpg"
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
            image="https://cdn.pixabay.com/photo/2019/06/22/14/42/horses-4291699_1280.jpg"
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
            image="https://cdn.pixabay.com/photo/2021/07/05/09/25/apple-orchard-6389053_1280.jpg"
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
              image="https://cdn.pixabay.com/photo/2017/11/02/14/26/farmer-2911382_1280.jpg"
            />
            
            <Testimonial 
              name="Maria Sanchez"
              location="Sanchez Organics, California"
              quote="The platform is incredibly easy to use, even for someone like me who isn't tech-savvy. I can manage my listings, communicate with customers, and track orders all from my phone while working in the fields."
              image="https://cdn.pixabay.com/photo/2018/03/16/16/43/woman-3231957_1280.jpg"
            />
            
            <Testimonial 
              name="David Thompson"
              location="Morning Glory Farm, Vermont"
              quote="What I appreciate most is the direct relationship with customers. I know exactly what to harvest, when to harvest it, and for whom—virtually eliminating waste while maximizing our revenue."
              image="https://cdn.pixabay.com/photo/2016/11/29/13/14/agriculture-1869993_1280.jpg"
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
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
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