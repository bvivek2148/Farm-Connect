import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Link } from "wouter";
import { convertUsdToInr, formatINR } from "@/lib/utils";

// Sample product data (will be merged with API data)
const sampleProducts = [
  {
    id: 1,
    name: "Organic Tomatoes",
    category: "vegetables",
    price: 3.99,
    unit: "lb",
    image: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&h=300&fit=crop",
    farmer: "Green Valley Farm",
    distance: 12,
    organic: true,
    featured: true
  },
  {
    id: 2,
    name: "Fresh Strawberries",
    category: "fruits",
    price: 4.99,
    unit: "pint",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop",
    farmer: "Berry Fields",
    distance: 8,
    organic: true,
    featured: true
  },
  {
    id: 3,
    name: "Local Honey",
    category: "dairy",
    price: 7.99,
    unit: "jar",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop",
    farmer: "Sweet Meadows",
    distance: 15,
    organic: true,
    featured: false
  },
  {
    id: 4,
    name: "Free-Range Eggs",
    category: "dairy",
    price: 5.49,
    unit: "dozen",
    image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400&h=300&fit=crop",
    farmer: "Happy Hen Farm",
    distance: 10,
    organic: true,
    featured: false
  },
  {
    id: 5,
    name: "Organic Kale",
    category: "vegetables",
    price: 2.99,
    unit: "bunch",
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&h=300&fit=crop",
    farmer: "Green Leaf Gardens",
    distance: 5,
    organic: true,
    featured: false
  },
  {
    id: 6,
    name: "Artisan Cheese",
    category: "dairy",
    price: 8.99,
    unit: "8 oz",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop",
    farmer: "Hillside Creamery",
    distance: 20,
    organic: false,
    featured: true
  },
  {
    id: 7,
    name: "Fresh Apples",
    category: "fruits",
    price: 1.99,
    unit: "lb",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop",
    farmer: "Orchard Hills",
    distance: 18,
    organic: true,
    featured: false
  },
  {
    id: 8,
    name: "Grass-Fed Beef",
    category: "meat",
    price: 12.99,
    unit: "lb",
    image: "https://images.unsplash.com/photo-1588347818133-38c4106ca7b4?w=400&h=300&fit=crop",
    farmer: "Greener Pastures",
    distance: 25,
    organic: true,
    featured: true
  },
  {
    id: 9,
    name: "Organic Carrots",
    category: "vegetables",
    price: 2.49,
    unit: "bunch",
    image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=300&fit=crop",
    farmer: "Roots Farm",
    distance: 15,
    organic: true,
    featured: false
  },
  {
    id: 10,
    name: "Fresh Bread",
    category: "bakery",
    price: 4.99,
    unit: "loaf",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
    farmer: "Stone Mill Bakery",
    distance: 8,
    organic: false,
    featured: true
  },
  {
    id: 11,
    name: "Blueberries",
    category: "fruits",
    price: 5.99,
    unit: "pint",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop",
    farmer: "Blue Sky Farms",
    distance: 12,
    organic: true,
    featured: false
  },
  {
    id: 12,
    name: "Pasture-Raised Chicken",
    category: "meat",
    price: 9.99,
    unit: "lb",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop",
    farmer: "Freedom Range",
    distance: 22,
    organic: true,
    featured: false
  }
];

// Product card component
const ProductCard = ({ product, onAddToCart }: {
  product: typeof products[0],
  onAddToCart: (product: typeof products[0]) => void
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
  const [products, setProducts] = useState(sampleProducts);
  const { addToCart, getTotalItems } = useCart();

  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Merge API products with sample products
            const apiProducts = result.products.map(product => ({
              id: product.id,
              name: product.name,
              category: product.category.toLowerCase(),
              price: parseFloat(product.price.replace('$', '')),
              unit: product.unit,
              image: product.image,
              farmer: product.farmer,
              distance: product.distance,
              organic: product.organic,
              featured: product.featured
            }));
            setProducts([...sampleProducts, ...apiProducts]);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Keep using sample products if API fails
      }
    };

    fetchProducts();
  }, []);
  
  // Convert product to cart item and add to cart
  // Helper function to add products to cart
const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      quantity: 1,
      image: product.image,
      category: product.category,
      unit: product.unit
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
            <Link href="/cart" className="ml-auto">
              <div className="text-sm flex items-center hover:text-primary transition-colors">
                <ShoppingCart className="h-5 w-5 mr-1 text-primary" />
                <span className="font-semibold">{getTotalItems()} items</span>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Featured products section - only shown when no search is active */}
        {!searchTerm && activeTab === "all" && (
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
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(""); setActiveTab("all"); }}
                  variant="outline"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShopPage;