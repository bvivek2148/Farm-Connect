import { Switch, Route } from "wouter";
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
import { HybridAuthProvider } from "@/context/HybridAuthContext";
import { SocketProvider } from "@/context/SocketContext";
import ChatWidget from "@/components/chat/ChatWidget";

// Lazy load pages for better performance
const Shop = lazy(() => import("@/pages/shop"));
const Pricing = lazy(() => import("@/pages/pricing"));
const AboutUs = lazy(() => import("@/pages/about-us"));
const Farmer = lazy(() => import("@/pages/farmer"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Login = lazy(() => import("@/pages/login"));
const SignUp = lazy(() => import("@/pages/sign-up"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const FarmerDashboard = lazy(() => import("@/pages/farmer-dashboard"));
const Profile = lazy(() => import("@/pages/profile"));
const Orders = lazy(() => import("@/pages/orders"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));
const Community = lazy(() => import("@/pages/community"));

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
            <Route path="/pricing" component={Pricing} />
            <Route path="/about-us" component={AboutUs} />
            <Route path="/farmer" component={Farmer} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/login" component={Login} />
            <Route path="/sign-up" component={SignUp} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/profile" component={Profile} />
            <Route path="/orders" component={Orders} />
            <Route path="/admin-login" component={AdminLogin} />
            <Route path="/admin-dashboard" component={AdminDashboard} />
            <Route path="/farmer-dashboard" component={FarmerDashboard} />
            <Route path="/auth/callback" component={AuthCallback} />
            <Route path="/community" component={Community} />
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
      <HybridAuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <StatisticsProvider>
              <CartProvider>
                <Toaster />
                <Router />
                <ChatWidget />
              </CartProvider>
            </StatisticsProvider>
          </TooltipProvider>
        </SocketProvider>
      </HybridAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
