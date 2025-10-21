import { useState } from "react";
import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { convertUsdToInr, formatINR } from "@/lib/utils";

const PricingFeature = ({ feature, included = true, tooltip }: { 
  feature: string; 
  included?: boolean;
  tooltip?: string;
}) => {
  return (
    <div className="flex items-start gap-2">
      <div className={`mt-1 ${included ? "text-primary" : "text-gray-300"}`}>
        <Check className="h-4 w-4" />
      </div>
      <div className="flex items-center">
        <span className={included ? "text-gray-700" : "text-gray-400"}>
          {feature}
        </span>
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto ml-1">
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
};

const PricingTier = ({
  name,
  price,
  monthlyPrice,
  annualPrice,
  description,
  features,
  popular,
  isAnnual,
}: {
  name: string;
  price: {
    monthly: number;
    annual: number;
  };
  monthlyPrice: string;
  annualPrice: string;
  description: string;
  features: {
    text: string;
    included: boolean;
    tooltip?: string;
  }[];
  popular?: boolean;
  isAnnual: boolean;
}) => {
  return (
    <div className={`rounded-xl border bg-white p-6 shadow-sm ${popular ? "border-primary ring-1 ring-primary" : ""}`}>
      {popular && (
        <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary w-fit mb-4">
          Most Popular
        </div>
      )}
      
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="mt-1 text-gray-500 text-sm">{description}</p>
      
      <div className="mt-4 flex items-baseline">
        <span className="text-3xl font-bold">
          {formatINR(convertUsdToInr(isAnnual ? price.annual : price.monthly))}
        </span>
        <span className="ml-1 text-gray-500">/{isAnnual ? 'year' : 'month'}</span>
      </div>

      {isAnnual && (
        <div className="mt-1 text-sm text-green-600">
          Save {formatINR(convertUsdToInr(price.monthly * 12 - price.annual))} annually
        </div>
      )}
      
      <Button className={`mt-6 w-full ${popular ? "bg-primary hover:bg-primary/90" : ""}`}>
        Get Started
      </Button>
      
      <div className="mt-6 space-y-3">
        {features.map((feature, i) => (
          <PricingFeature 
            key={i} 
            feature={feature.text} 
            included={feature.included}
            tooltip={feature.tooltip}
          />
        ))}
      </div>
    </div>
  );
};

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  // Pricing tiers data
  const tiers = [
    {
      name: "Basic",
      price: {
        monthly: 29.99,
        annual: 299.99,
      },
      monthlyPrice: "29.99",
      annualPrice: "299.99",
      description: "Essential tools for small farmers just starting out",
      features: [
        { text: "Online store profile", included: true },
        { text: "Up to 25 product listings", included: true },
        { text: "Basic sales analytics", included: true, tooltip: "Includes weekly summary of sales and inventory" },
        { text: "Customer messaging", included: true },
        { text: "Weekly payouts", included: true },
        { text: "Standard support", included: true },
        { text: "Marketing tools", included: false },
        { text: "Priority placement", included: false },
        { text: "Custom branding", included: false },
        { text: "API access", included: false },
      ],
      popular: false,
    },
    {
      name: "Growth",
      price: {
        monthly: 79.99,
        annual: 799.99,
      },
      monthlyPrice: "79.99",
      annualPrice: "799.99",
      description: "Advanced features for scaling farm businesses",
      features: [
        { text: "Online store profile", included: true },
        { text: "Unlimited product listings", included: true },
        { text: "Advanced analytics & reports", included: true, tooltip: "Detailed insights on customer behavior, sales trends, and inventory management" },
        { text: "Customer messaging", included: true },
        { text: "Daily payouts", included: true },
        { text: "Priority support", included: true },
        { text: "Marketing tools", included: true, tooltip: "Email campaigns, social media integration, and promotional tools" },
        { text: "Priority placement", included: true },
        { text: "Custom branding", included: true },
        { text: "API access", included: false },
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: {
        monthly: 199.99,
        annual: 1999.99,
      },
      monthlyPrice: "199.99",
      annualPrice: "1,999.99",
      description: "Complete solution for large-scale farm operations",
      features: [
        { text: "Online store profile", included: true },
        { text: "Unlimited product listings", included: true },
        { text: "Enterprise analytics & reports", included: true, tooltip: "Advanced business intelligence tools with customizable dashboards and predictive analytics" },
        { text: "Customer messaging", included: true },
        { text: "Real-time payouts", included: true },
        { text: "24/7 dedicated support", included: true },
        { text: "Marketing tools plus services", included: true, tooltip: "Complete marketing suite plus dedicated marketing manager for campaign planning" },
        { text: "Featured placement", included: true },
        { text: "Custom branding", included: true },
        { text: "API access", included: true, tooltip: "Full API access for custom integrations with your existing systems" },
      ],
      popular: false,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-dark mb-3">Simple, Transparent Pricing</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for your farm. All plans include access to our platform connecting you directly with local consumers.
          </p>
          
          {/* Billing period toggle */}
          <div className="mt-6 flex items-center justify-center space-x-3">
            <Label htmlFor="billing-toggle" className={`text-sm ${!isAnnual ? "font-medium" : ""}`}>Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <div className="flex items-center">
              <Label htmlFor="billing-toggle" className={`text-sm ${isAnnual ? "font-medium" : ""}`}>Annual</Label>
              <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Save 16%
              </span>
            </div>
          </div>
        </div>
        
        {/* Pricing tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <PricingTier 
              key={tier.name} 
              {...tier} 
              isAnnual={isAnnual} 
            />
          ))}
        </div>
        
        {/* Additional information */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-xl border p-8">
          <h2 className="text-2xl font-bold mb-4">All Plans Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <PricingFeature feature="Secure payment processing" />
            <PricingFeature feature="Customer reviews and ratings" />
            <PricingFeature feature="Inventory management" />
            <PricingFeature feature="Order tracking and history" />
            <PricingFeature feature="Mobile-optimized store" />
            <PricingFeature feature="Sales tax calculation" />
            <PricingFeature feature="Delivery zone management" />
            <PricingFeature feature="Product photo uploads" />
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Need a custom solution?</h3>
            <p className="text-gray-600 text-sm mb-4">
              For farming cooperatives, large-scale operations, or specialized needs, we offer custom solutions tailored to your requirements.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Contact Sales
            </Button>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade, downgrade, or cancel your plan at any time. When upgrading, you'll be prorated for the remainder of your billing period. When downgrading, changes will take effect at the start of your next billing period.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">How do payment processing fees work?</h3>
              <p className="text-gray-600">
                All plans include payment processing at a standard rate of 2.9% + $0.30 per transaction. These fees are separate from your subscription cost and are deducted from each sale before payout.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Is there a contract or commitment?</h3>
              <p className="text-gray-600">
                There's no long-term contract. Monthly plans can be canceled anytime. Annual plans offer savings but are non-refundable after the first 30 days. You can still cancel an annual plan, but won't receive a prorated refund.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Do you offer a free trial?</h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day free trial for all plans. No credit card is required to start your trial. You'll be prompted to select a plan and enter payment details before your trial ends.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to grow your farm business?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Join thousands of farmers already connecting directly with local consumers through our platform.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90">
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;