import HeroSection from "@/components/HeroSection";
import ConnectingSection from "@/components/ConnectingSection";
import StatsSection from "@/components/StatsSection";
import AnimatedBackground from "@/components/AnimatedBackground";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const FarmFeature = ({ title, description, image, index }: {
  title: string;
  description: string;
  image: string;
  index: number;
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(title)}`;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="h-48 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2 text-neutral-dark">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link href="/learn-more">
          <motion.span
            className="inline-flex items-center text-primary font-medium hover:underline cursor-pointer"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Learn more <ArrowRight className="ml-1 h-4 w-4" />
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Check if we came from clicking the FarmConnect logo
    // We'll use sessionStorage to track this
    const shouldShowAnimation = sessionStorage.getItem('showHomeAnimation');
    if (shouldShowAnimation === 'true') {
      setShowAnimation(true);
      setIsLoading(true);
      sessionStorage.removeItem('showHomeAnimation'); // Clear it after use
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && showAnimation && (
          <PageLoader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {(!isLoading || !showAnimation) && (
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ScrollProgress />
          <AnimatedBackground />
          <div className="relative z-10">
            <HeroSection />

      <motion.section
        className="py-16 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-neutral-dark mb-3">Our Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover fresh, locally-grown produce and sustainable farming products
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FarmFeature
              title="Seasonal Vegetables"
              description="Fresh, organic vegetables harvested at peak ripeness for maximum flavor and nutrition."
              image="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop"
              index={0}
            />

            <FarmFeature
              title="Organic Fruits"
              description="Sweet, juicy fruits grown without synthetic pesticides or fertilizers."
              image="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop"
              index={1}
            />

            <FarmFeature
              title="Farm-Fresh Dairy"
              description="Locally produced milk, cheese, and yogurt from pasture-raised animals."
              image="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop"
              index={2}
            />
          </div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/shop">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-secondary hover:bg-secondary/90 text-white">
                  View All Products
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <ConnectingSection />

      <motion.section
        className="py-16 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-neutral-dark mb-3">Sustainable Farming</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to environmentally friendly farming practices
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="rounded-container overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop"
                alt="Sustainable farming practices"
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400x300/22c55e/ffffff?text=Sustainable+Farming";
                }}
                loading="lazy"
              />
            </motion.div>

            <motion.div
              className="rounded-container overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop"
                alt="Organic crop fields"
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400x300/22c55e/ffffff?text=Organic+Crops";
                }}
                loading="lazy"
              />
            </motion.div>

            <motion.div
              className="rounded-container overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop"
                alt="Modern farming equipment"
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400x300/22c55e/ffffff?text=Farm+Equipment";
                }}
                loading="lazy"
              />
            </motion.div>
          </div>

          <motion.div
            className="mt-12 bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h3
              className="text-2xl font-bold text-neutral-dark mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join our Farm-to-Table Movement
            </motion.h3>
            <motion.p
              className="text-gray-600 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Whether you're a consumer looking for fresh, local food or a farmer wanting to connect
              with customers, we have a place for you in our community.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/sign-up">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Sign up as a Customer
                  </Button>
                </motion.div>
              </Link>
              <Link href="/farmer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Join as a Farmer
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Farm Connect Statistics Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <StatsSection />
          </motion.div>
        </div>
      </motion.section>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Home;
