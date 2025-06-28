import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Users, Leaf, Award, Calendar, BarChart } from "lucide-react";

// Service component with icon
const ServiceFeature = ({ 
  icon: Icon, 
  title, 
  description 
}: {
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

// Main service card component
const ServiceCard = ({
  title,
  description,
  price,
  features,
  primaryAction,
  secondaryAction,
  popular = false
}: {
  title: string;
  description: string;
  price: string;
  features: string[];
  primaryAction: string;
  secondaryAction: string;
  popular?: boolean;
}) => {
  return (
    <Card className={`${popular ? 'border-primary shadow-lg' : 'border-gray-200'} h-full flex flex-col`}>
      {popular && (
        <div className="bg-primary text-white text-center py-1.5 text-sm font-medium">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-gray-600 mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-gray-500 ml-1">/month</span>}
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="text-green-500 mr-2 mt-1">✓</div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 mt-auto">
        <Button className="w-full bg-primary hover:bg-primary/90">
          {primaryAction}
        </Button>
        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
          {secondaryAction}
        </Button>
      </CardFooter>
    </Card>
  );
};

const ServicesPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-dark mb-3">Our Services</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a range of services to help connect farmers with consumers and build a more sustainable local food system.
          </p>
        </div>
        
        {/* Farmer and Consumer Tabs */}
        <Tabs defaultValue="consumers" className="max-w-5xl mx-auto mb-16">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-96 grid-cols-2">
              <TabsTrigger value="consumers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                For Consumers
              </TabsTrigger>
              <TabsTrigger value="farmers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                For Farmers
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Consumer Services */}
          <TabsContent value="consumers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ServiceCard
                title="Standard"
                description="Perfect for individual consumers looking for fresh produce."
                price="$9.99"
                features={[
                  "Weekly local produce deliveries",
                  "Direct messaging with farmers",
                  "Access to seasonal products",
                  "Order history tracking",
                  "Basic customer support"
                ]}
                primaryAction="Start Free Trial"
                secondaryAction="Learn More"
              />
              
              <ServiceCard
                title="Family Plan"
                description="Ideal for families who want regular deliveries of fresh, local food."
                price="$19.99"
                features={[
                  "All Standard features",
                  "Larger produce quantities",
                  "Customizable delivery schedule",
                  "Recipe suggestions",
                  "Multiple delivery locations",
                  "Priority customer support"
                ]}
                primaryAction="Start Free Trial"
                secondaryAction="Learn More"
                popular={true}
              />
              
              <ServiceCard
                title="Community"
                description="For neighborhood groups, offices, or small organizations."
                price="Custom"
                features={[
                  "All Family Plan features",
                  "Bulk deliveries",
                  "Dedicated account manager",
                  "Community events access",
                  "Farm tours",
                  "Custom integration options",
                  "24/7 premium support"
                ]}
                primaryAction="Contact Sales"
                secondaryAction="Schedule Demo"
              />
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8 text-center">What Consumers Get</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ServiceFeature
                  icon={Truck}
                  title="Doorstep Delivery"
                  description="Fresh produce delivered directly to your door on your schedule, saving you time and ensuring peak freshness."
                />
                
                <ServiceFeature
                  icon={Leaf}
                  title="Seasonal Freshness"
                  description="Access to seasonal, locally grown produce that's harvested at peak ripeness for maximum flavor and nutrition."
                />
                
                <ServiceFeature
                  icon={Users}
                  title="Connect with Farmers"
                  description="Build relationships with the people who grow your food and learn about their sustainable farming practices."
                />
                
                <ServiceFeature
                  icon={Award}
                  title="Quality Guarantee"
                  description="Every product meets our rigorous quality standards or we'll replace it or refund your purchase."
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Farmer Services */}
          <TabsContent value="farmers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ServiceCard
                title="Starter"
                description="For small farmers just beginning to sell directly to consumers."
                price="$29.99"
                features={[
                  "Basic online storefront",
                  "Customer messaging system",
                  "Simple inventory management",
                  "Weekly payout processing",
                  "Standard support"
                ]}
                primaryAction="Start Free Trial"
                secondaryAction="Learn More"
              />
              
              <ServiceCard
                title="Growth"
                description="For established farms looking to expand their direct-to-consumer sales."
                price="$69.99"
                features={[
                  "All Starter features",
                  "Advanced storefront customization",
                  "Subscription management",
                  "Detailed analytics dashboard",
                  "Marketing tools",
                  "Priority customer support",
                  "Twice-weekly payouts"
                ]}
                primaryAction="Start Free Trial"
                secondaryAction="Learn More"
                popular={true}
              />
              
              <ServiceCard
                title="Enterprise"
                description="For large farming operations with complex distribution needs."
                price="Custom"
                features={[
                  "All Growth features",
                  "Multi-location management",
                  "Advanced inventory forecasting",
                  "API access for integrations",
                  "Dedicated account manager",
                  "Custom marketing campaigns",
                  "Daily payout option",
                  "24/7 premium support"
                ]}
                primaryAction="Contact Sales"
                secondaryAction="Schedule Demo"
              />
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8 text-center">What Farmers Get</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ServiceFeature
                  icon={Users}
                  title="Direct Customer Access"
                  description="Connect directly with consumers who value locally-grown, sustainable products, building loyal customer relationships."
                />
                
                <ServiceFeature
                  icon={BarChart}
                  title="Sales Analytics"
                  description="Detailed data on sales trends, customer preferences, and inventory management to help optimize your business."
                />
                
                <ServiceFeature
                  icon={Calendar}
                  title="Harvest Planning"
                  description="Tools to plan your planting and harvesting schedule based on customer demand and seasonal patterns."
                />
                
                <ServiceFeature
                  icon={Award}
                  title="Brand Development"
                  description="Build your farm's brand and reputation through our platform with customizable profiles and customer reviews."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">How does delivery work?</h3>
              <p className="text-gray-600 mt-2">We coordinate with local farmers to arrange deliveries in your area on specific days of the week. You can select your preferred delivery day during checkout.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">Can I change my subscription?</h3>
              <p className="text-gray-600 mt-2">Yes, you can upgrade, downgrade, pause, or cancel your subscription at any time through your account settings. Changes will be applied to your next billing cycle.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">How do farmers get paid?</h3>
              <p className="text-gray-600 mt-2">Farmers receive payments directly for their products, with our platform taking a small service fee. Depending on the plan, payouts are processed weekly or more frequently.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg">What if I'm not satisfied with a product?</h3>
              <p className="text-gray-600 mt-2">We stand behind every product sold through our platform. If you're not satisfied, we offer replacements or refunds for any products that don't meet your expectations.</p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;