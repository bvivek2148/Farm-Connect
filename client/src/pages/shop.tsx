import { useState } from "react";
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

// Sample product data
const products = [
  {
    id: 1,
    name: "Organic Tomatoes",
    category: "vegetables",
    price: 3.99,
    unit: "lb",
    image: "https://cdn.pixabay.com/photo/2011/03/16/16/01/tomatoes-5356_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2018/05/26/10/54/strawberries-3431122_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2015/11/07/11/41/honey-1031057_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2016/07/23/15/24/egg-1536990_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2018/01/10/21/46/kale-3074000_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2020/05/03/13/09/cheese-5125021_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2017/09/26/13/21/apples-2788599_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2016/03/05/19/23/meat-1238262_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2015/03/14/14/00/carrots-673184_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2016/07/11/18/42/bread-1510155_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2016/04/13/07/18/blueberries-1326154_1280.jpg",
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
    image: "https://cdn.pixabay.com/photo/2016/05/09/10/42/poultry-1381637_1280.jpg",
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
  return (
    <Card className="h-full flex flex-col">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover rounded-t-lg" 
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
        <div className="font-semibold">${product.price} / {product.unit}</div>
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
  const { addToCart, getTotalItems } = useCart();
  
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