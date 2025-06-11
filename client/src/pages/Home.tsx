import HeroSection from "@/components/HeroSection";
import ConnectingSection from "@/components/ConnectingSection";
import StatsSection from "@/components/StatsSection";
import AnimatedBackground from "@/components/AnimatedBackground";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const FarmFeature = ({ title, description, image, index }: {
  title: string;
  description: string;
  image: string;
  index: number;
}) => {
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
        />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2 text-neutral-dark">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link href="/learn-more">
          <motion.a
            className="inline-flex items-center text-primary font-medium hover:underline"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            Learn more <ArrowRight className="ml-1 h-4 w-4" />
          </motion.a>
        </Link>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <PageLoader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
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
              image="https://cdn.pixabay.com/photo/2016/09/10/17/47/vegetables-1659784_1280.jpg"
              index={0}
            />

            <FarmFeature
              title="Organic Fruits"
              description="Sweet, juicy fruits grown without synthetic pesticides or fertilizers."
              image="https://cdn.pixabay.com/photo/2017/05/11/19/44/fresh-fruits-2305192_1280.jpg"
              index={1}
            />

            <FarmFeature
              title="Farm-Fresh Dairy"
              description="Locally produced milk, cheese, and yogurt from pasture-raised animals."
              image="https://cdn.pixabay.com/photo/2017/03/27/14/21/cheese-2179759_1280.jpg"
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
                src="https://cdn.pixabay.com/photo/2016/10/27/17/50/farm-1775892_1280.jpg"
                alt="Sustainable farming practices"
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
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
                src="https://cdn.pixabay.com/photo/2020/06/20/17/36/wheat-5321890_1280.jpg"
                alt="Organic crop fields"
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
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
                src="https://cdn.pixabay.com/photo/2020/05/14/19/36/tractor-5171589_1280.jpg"
                alt="Modern farming equipment"
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
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
