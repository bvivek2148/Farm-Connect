import { Link } from "wouter";
import { useState } from "react";
import { Menu, X, Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/HybridAuthContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  const cartItemCount = getTotalItems();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => {
                  // Set flag to show animation when clicking logo
                  sessionStorage.setItem('showHomeAnimation', 'true');
                }}
              >
                <div className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">FC</span>
                </div>
                <span className="font-bold text-lg">FarmConnect</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="py-2 font-medium hover:text-gray-200">Home</Link>
              <Link href="/shop" className="py-2 font-medium hover:text-gray-200">Shop</Link>
              <Link href="/pricing" className="py-2 font-medium hover:text-gray-200">Pricing</Link>
              <Link href="/about-us" className="py-2 font-medium hover:text-gray-200">About Us</Link>
              <Link href="/farmer" className="py-2 font-medium hover:text-gray-200">Are You A Farmer</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated && (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-white" aria-label="Cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden md:block py-2 font-medium hover:text-gray-200">Login</Link>
            )}
            <Link href="/contact" className="hidden md:block bg-secondary hover:bg-secondary/90 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
              Contact Us
            </Link>
            <button 
              className="md:hidden text-white"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-600">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="py-2 font-medium hover:text-gray-200">Home</Link>
              <Link href="/shop" className="py-2 font-medium hover:text-gray-200">Shop</Link>
              <Link href="/pricing" className="py-2 font-medium hover:text-gray-200">Pricing</Link>
              <Link href="/about-us" className="py-2 font-medium hover:text-gray-200">About Us</Link>
              <Link href="/farmer" className="py-2 font-medium hover:text-gray-200">Are You A Farmer</Link>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="py-2 font-medium text-gray-200">
                    Welcome, {user?.username}!
                  </div>
                  <Link href="/profile" className="py-2 font-medium hover:text-gray-200 flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link href="/orders" className="py-2 font-medium hover:text-gray-200 flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="py-2 font-medium hover:text-gray-200 flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="py-2 font-medium hover:text-gray-200">Login</Link>
              )}
              <Link href="/contact" className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition w-fit">
                Contact Us
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
