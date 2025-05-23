import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const HeroSection = () => {
  return (
    <section className="bg-pattern relative overflow-hidden py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-dark mb-6">
            Nurturing growth
          </h1>
          <div className="mt-8">
            <Link href="/shop">
              <Button className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-full text-sm font-medium transition">
                Discover our products
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2 flex justify-center">
          <div className="grid grid-cols-1 gap-6 w-full">
            <div className="rounded-container shadow-md overflow-hidden">
              <img 
                src="https://cdn.pixabay.com/photo/2016/08/11/08/04/vegetables-1584999_1280.jpg" 
                alt="Fresh colorful fruits and vegetables" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-20 h-20 text-primary/30 transform -translate-y-12">
        <div className="angled-bar w-full"></div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 text-secondary/20 transform translate-y-8">
        <div className="angled-bar w-full"></div>
      </div>
    </section>
  );
};

export default HeroSection;
