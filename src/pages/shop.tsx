import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ApiService } from "@/lib/api";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Filter, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/HybridAuthContext";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { convertUsdToInr, formatINR } from "@/lib/utils";


// Product type definition
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  farmer: string;
  distance: number;
  organic: boolean;
  featured: boolean;
};

// Product card component
const ProductCard = ({ product, onAddToCart }: {
  product: Product,
  onAddToCart: (product: Product) => void
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(product.name)}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={handleImageError}
          loading="lazy"
        />
        {product.organic && (
          <Badge className="absolute top-2 right-2 bg-primary">Organic</Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{product.farmer}</span>
          <span className="text-sm">{product.distance} miles away</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-500">Category: {product.category}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="font-semibold">{formatINR(convertUsdToInr(product.price))} / {product.unit}</div>
        <Button
          size="sm"
          onClick={() => onAddToCart(product)}
          className="bg-secondary hover:bg-secondary/90"
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardFooter>
    </Card>
  );
};

const ShopPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, getTotalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await ApiService.getProducts();
        const anyResult = result as any;
        if (anyResult.success) {
          // Transform API products to match component structure
          const apiProducts = (anyResult.products || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            category: product.category.toLowerCase(),
            price: typeof product.price === 'string' ? parseFloat(product.price.replace('$', '')) : product.price,
            unit: product.unit,
            image: product.image,
            farmer: product.farmer,
            distance: product.distance || 0,
            organic: product.organic || false,
            featured: product.featured || false
          }));
          setProducts(apiProducts);
        } else {
          // Clear error and show empty state instead
          setError(null);
          setProducts([]);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        // For network errors or server issues, show empty state instead of error
        const result = error as unknown;
        setError(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Convert product to cart item and add to cart
  // Helper function to add products to cart
const handleAddToCart = (product: any) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart. Click here to login.",
        variant: "destructive",
      });
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
      return;
    }
    
    // User is authenticated, add to cart
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      quantity: 1,
      image: product.image,
      category: product.category,
      unit: product.unit
    });
    
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  // Filter products based on active tab and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeTab === "all" || product.category === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.farmer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get featured products
  const featuredProducts = products.filter(product => product.featured);
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-primary text-white p-6 rounded-xl mb-8">
          <h1 className="text-3xl font-bold mb-2">Fresh, Local Products</h1>
          <p className="text-gray-100">
            Browse and shop from local farms in your area. All products are freshly harvested and delivered straight to your door.
          </p>
        </div>
        
        {/* Search and filter section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products or farms..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Filter by:</span>
              <Button size="sm" variant="outline">Distance</Button>
              <Button size="sm" variant="outline">Price</Button>
            </div>
            {isAuthenticated && (
              <Link href="/cart" className="ml-auto">
                <div className="text-sm flex items-center hover:text-primary transition-colors">
                  <ShoppingCart className="h-5 w-5 mr-1 text-primary" />
                  <span className="font-semibold">{getTotalItems()} items</span>
                </div>
              </Link>
            )}
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        )}
        
        {/* Error State - Only show for actual server connection errors */}
        {error && (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm p-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry Connection
            </Button>
          </div>
        )}
        
        {/* Products Content - only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Featured products section - only shown when no search is active */}
            {!searchTerm && activeTab === "all" && featuredProducts.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart} 
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Product tabs and grid */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <TabsList className="w-full justify-start gap-2 bg-transparent">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                All Products
              </TabsTrigger>
              <TabsTrigger 
                value="vegetables" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Vegetables
              </TabsTrigger>
              <TabsTrigger 
                value="fruits" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Fruits
              </TabsTrigger>
              <TabsTrigger 
                value="dairy" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Dairy & Eggs
              </TabsTrigger>
              <TabsTrigger 
                value="meat" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Meat
              </TabsTrigger>
              <TabsTrigger 
                value="bakery" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Bakery
              </TabsTrigger>
            </TabsList>
          </div>
          
            <TabsContent value={activeTab} className="mt-0">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  {products.length === 0 ? (
                    <div>
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l3-3 3 3" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Available</h3>
                      <p className="text-gray-500 mb-4">Currently there are no products or items available.</p>
                      <p className="text-sm text-gray-400">Check back soon for fresh products from local farmers!</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                      <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
                      <Button 
                        onClick={() => { setSearchTerm(""); setActiveTab("all"); }}
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;