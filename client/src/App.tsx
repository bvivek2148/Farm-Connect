import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Contact from "@/pages/contact";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { StatisticsProvider } from "@/context/StatisticsContext";
import { AuthProvider } from "@/context/AuthContext";
import ChatWidget from "@/components/chat/ChatWidget";

// Lazy load pages for better performance
const Shop = lazy(() => import("@/pages/shop"));
const Services = lazy(() => import("@/pages/services"));
const Pricing = lazy(() => import("@/pages/pricing"));
const AboutUs = lazy(() => import("@/pages/about-us"));
const Farmer = lazy(() => import("@/pages/farmer"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const SignIn = lazy(() => import("@/pages/sign-in"));
const SignUp = lazy(() => import("@/pages/sign-up"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const FarmerDashboard = lazy(() => import("@/pages/farmer-dashboard"));
const Profile = lazy(() => import("@/pages/profile"));
const Orders = lazy(() => import("@/pages/orders"));

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/contact" component={Contact} />
            <Route path="/shop" component={Shop} />
            <Route path="/services" component={Services} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/about-us" component={AboutUs} />
            <Route path="/farmer" component={Farmer} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/sign-in" component={SignIn} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/profile" component={Profile} />
            <Route path="/orders" component={Orders} />
            <Route path="/admin-login" component={AdminLogin} />
            <Route path="/admin-dashboard" component={AdminDashboard} />
            <Route path="/farmer-dashboard" component={FarmerDashboard} />
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <StatisticsProvider>
            <CartProvider>
              <Toaster />
              <Router />
              <ChatWidget />
            </CartProvider>
          </StatisticsProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
