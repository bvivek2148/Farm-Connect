import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Leaf, Heart } from "lucide-react";

const HeroSection = () => {
  return (
    <motion.section
      className="bg-pattern relative overflow-hidden py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              opacity: 0
            }}
            animate={{
              y: -100,
              opacity: [0, 1, 0],
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            <Leaf className="w-4 h-4 text-primary/20" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
        <motion.div
          className="md:w-1/2 mb-8 md:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-neutral-dark mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Nurturing
            </motion.span>{" "}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-primary relative"
            >
              growth
              <motion.div
                className="absolute -top-2 -right-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <Sparkles className="w-6 h-6 text-secondary" />
              </motion.div>
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-gray-600 mb-6 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            Connecting farmers directly with consumers for fresh, sustainable, and locally-grown produce.
          </motion.p>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link href="/shop">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-full text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    Discover our products
                  </motion.span>
                  <motion.div
                    className="ml-2 inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 gap-6 w-full relative">
            <motion.div
              className="rounded-container shadow-md overflow-hidden relative"
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              whileHover={{
                scale: 1.02,
                rotateY: -5,
                transition: { duration: 0.3 }
              }}
            >
              <motion.img
                src="https://cdn.pixabay.com/photo/2016/08/11/08/04/vegetables-1584999_1280.jpg"
                alt="Fresh colorful fruits and vegetables"
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              />

              {/* Floating badges */}
              <motion.div
                className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Heart className="w-4 h-4 inline mr-1" />
                Fresh
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <Leaf className="w-4 h-4 inline mr-1" />
                Organic
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Animated decorative elements */}
      <motion.div
        className="absolute bottom-0 left-0 w-20 h-20 text-primary/30 transform -translate-y-12"
        initial={{ opacity: 0, x: -50, rotate: -45 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
      >
        <motion.div
          className="angled-bar w-full"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </motion.div>

      <motion.div
        className="absolute top-0 right-0 w-32 h-32 text-secondary/20 transform translate-y-8"
        initial={{ opacity: 0, x: 50, rotate: 45 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 1, delay: 1.8 }}
      >
        <motion.div
          className="angled-bar w-full"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </motion.div>

      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
    </motion.section>
  );
};

export default HeroSection;
