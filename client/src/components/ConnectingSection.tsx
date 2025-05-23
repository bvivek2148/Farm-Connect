import { Link } from "wouter";

const ConnectingSection = () => {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/3 mb-8 md:mb-0">
            <div className="rounded-container overflow-hidden shadow-lg">
              <img 
                src="https://cdn.pixabay.com/photo/2017/10/09/19/29/eat-2834549_1280.jpg" 
                alt="Colorful vegetables and fruits" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="md:w-1/3 text-center py-6">
            <h2 className="text-3xl font-bold mb-6 text-neutral-dark">
              Connecting You to Fresh, Local Food
            </h2>
            <p className="text-gray-600 mb-6">
              Farm Connect bridges the gap between local farmers and consumers, bringing fresh, 
              seasonal produce straight to your table. We support sustainable farming practices while 
              making it easier for you to access healthy, locally grown food. Sign up to build a more 
              connected, transparent food system.
            </p>
            <Link href="/signup">
              <a className="inline-block text-primary hover:underline font-medium">
                Join our community →
              </a>
            </Link>
          </div>
          
          <div className="md:w-1/3">
            <div className="rounded-container overflow-hidden shadow-lg">
              <img 
                src="https://cdn.pixabay.com/photo/2017/07/24/22/25/sunset-2535803_1280.jpg" 
                alt="Farming equipment in a green field" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 right-0 w-16 h-64 text-primary/20">
        <div className="angled-bar w-full"></div>
      </div>
      <div className="absolute top-20 left-0 w-48 h-32 text-secondary/10">
        <div className="angled-bar w-full"></div>
      </div>
    </section>
  );
};

export default ConnectingSection;
