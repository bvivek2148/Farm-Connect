import { Link } from "wouter";
import { useState } from "react";
import { Menu, X, Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
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
              <a
                className="flex items-center space-x-2"
                onClick={() => {
                  // Set flag to show animation when clicking logo
                  sessionStorage.setItem('showHomeAnimation', 'true');
                }}
              >
                <div className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">FC</span>
                </div>
                <span className="font-bold text-lg">FarmConnect</span>
              </a>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/">
                <a className="py-2 font-medium hover:text-gray-200">Home</a>
              </Link>
              <Link href="/shop">
                <a className="py-2 font-medium hover:text-gray-200">Shop</a>
              </Link>
              <Link href="/services">
                <a className="py-2 font-medium hover:text-gray-200">Services</a>
              </Link>
              <Link href="/pricing">
                <a className="py-2 font-medium hover:text-gray-200">Pricing</a>
              </Link>
              <Link href="/about-us">
                <a className="py-2 font-medium hover:text-gray-200">About Us</a>
              </Link>
              <Link href="/farmer">
                <a className="py-2 font-medium hover:text-gray-200">Are You A Farmer</a>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm">
              <span>+1 (970) 403-0492</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/cart">
              <a className="relative">
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
              </a>
            </Link>
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
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <Link href="/profile">
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <Link href="/orders">
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
              <Link href="/sign-in">
                <a className="hidden md:block py-2 font-medium hover:text-gray-200">Login</a>
              </Link>
            )}
            <Link href="/contact">
              <a className="hidden md:block bg-secondary hover:bg-secondary/90 text-white px-4 py-1.5 rounded-full text-sm font-medium transition">
                Contact Us
              </a>
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
              <Link href="/">
                <a className="py-2 font-medium hover:text-gray-200">Home</a>
              </Link>
              <Link href="/shop">
                <a className="py-2 font-medium hover:text-gray-200">Shop</a>
              </Link>
              <Link href="/services">
                <a className="py-2 font-medium hover:text-gray-200">Services</a>
              </Link>
              <Link href="/pricing">
                <a className="py-2 font-medium hover:text-gray-200">Pricing</a>
              </Link>
              <Link href="/about-us">
                <a className="py-2 font-medium hover:text-gray-200">About Us</a>
              </Link>
              <Link href="/farmer">
                <a className="py-2 font-medium hover:text-gray-200">Are You A Farmer</a>
              </Link>
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="py-2 font-medium text-gray-200">
                    Welcome, {user?.username}!
                  </div>
                  <button
                    onClick={logout}
                    className="py-2 font-medium hover:text-gray-200 flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/sign-in">
                  <a className="py-2 font-medium hover:text-gray-200">Login</a>
                </Link>
              )}
              <Link href="/contact">
                <a className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition w-fit">
                  Contact Us
                </a>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
