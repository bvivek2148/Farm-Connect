import HeroSection from "@/components/HeroSection";
import ConnectingSection from "@/components/ConnectingSection";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const FarmFeature = ({ title, description, image }: {
  title: string;
  description: string;
  image: string;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2 text-neutral-dark">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link href="/learn-more">
          <a className="inline-flex items-center text-primary font-medium hover:underline">
            Learn more <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <>
      <HeroSection />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-dark mb-3">Our Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover fresh, locally-grown produce and sustainable farming products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FarmFeature 
              title="Seasonal Vegetables" 
              description="Fresh, organic vegetables harvested at peak ripeness for maximum flavor and nutrition."
              image="https://cdn.pixabay.com/photo/2016/09/10/17/47/vegetables-1659784_1280.jpg"
            />
            
            <FarmFeature 
              title="Organic Fruits" 
              description="Sweet, juicy fruits grown without synthetic pesticides or fertilizers."
              image="https://cdn.pixabay.com/photo/2017/05/11/19/44/fresh-fruits-2305192_1280.jpg"
            />
            
            <FarmFeature 
              title="Farm-Fresh Dairy" 
              description="Locally produced milk, cheese, and yogurt from pasture-raised animals."
              image="https://cdn.pixabay.com/photo/2017/03/27/14/21/cheese-2179759_1280.jpg"
            />
          </div>
          
          <div className="text-center mt-10">
            <Link href="/shop">
              <Button className="bg-secondary hover:bg-secondary/90 text-white">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <ConnectingSection />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-dark mb-3">Sustainable Farming</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to environmentally friendly farming practices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-container overflow-hidden shadow-md">
              <img 
                src="https://cdn.pixabay.com/photo/2016/10/27/17/50/farm-1775892_1280.jpg" 
                alt="Sustainable farming practices" 
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="rounded-container overflow-hidden shadow-md">
              <img 
                src="https://cdn.pixabay.com/photo/2020/06/20/17/36/wheat-5321890_1280.jpg" 
                alt="Organic crop fields" 
                className="w-full h-64 object-cover"
              />
            </div>
            
            <div className="rounded-container overflow-hidden shadow-md">
              <img 
                src="https://cdn.pixabay.com/photo/2020/05/14/19/36/tractor-5171589_1280.jpg" 
                alt="Modern farming equipment" 
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
          
          <div className="mt-12 bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-dark mb-4">Join our Farm-to-Table Movement</h3>
            <p className="text-gray-600 mb-6">
              Whether you're a consumer looking for fresh, local food or a farmer wanting to connect 
              with customers, we have a place for you in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Sign up as a Customer
                </Button>
              </Link>
              <Link href="/farmer">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Join as a Farmer
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Farm Connect Statistics Section */}
          <StatsSection />
        </div>
      </section>
    </>
  );
};

export default Home;
