import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Users, Truck, Leaf } from "lucide-react";

const ConnectingSection = () => {
  return (
    <motion.section
      className="py-16 bg-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div
            className="md:w-1/3 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="rounded-container overflow-hidden shadow-lg relative group"
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop"
                alt="Colorful vegetables and fruits"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Overlay with icon */}
              <motion.div
                className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-full p-4 shadow-lg"
                >
                  <Users className="w-8 h-8 text-primary" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="md:w-1/3 text-center py-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl font-bold mb-6 text-neutral-dark"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Connecting You to{" "}
              <motion.span
                className="text-primary relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                Fresh, Local Food
                <motion.div
                  className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  viewport={{ once: true }}
                />
              </motion.span>
            </motion.h2>

            <motion.p
              className="text-gray-600 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              viewport={{ once: true }}
            >
              Farm Connect bridges the gap between local farmers and consumers, bringing fresh,
              seasonal produce straight to your table. We support sustainable farming practices while
              making it easier for you to access healthy, locally grown food.
            </motion.p>

            {/* Feature icons */}
            <motion.div
              className="flex justify-center space-x-8 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-gray-600">Fast Delivery</span>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Leaf className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm text-gray-600">Organic</span>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-gray-600">Community</span>
              </motion.div>
            </motion.div>

            <Link href="/community">
              <motion.span
                className="inline-flex items-center text-primary hover:underline font-medium group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                Join our community
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            className="md:w-1/3"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="rounded-container overflow-hidden shadow-lg relative group"
              whileHover={{ scale: 1.02, rotateY: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=400&fit=crop&crop=center&auto=format&q=60"
                alt="Farming equipment in a green field"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Overlay with icon */}
              <motion.div
                className="absolute inset-0 bg-secondary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-full p-4 shadow-lg"
                >
                  <Leaf className="w-8 h-8 text-secondary" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Animated decorative elements */}
      <motion.div
        className="absolute bottom-10 right-0 w-16 h-64 text-primary/20"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="angled-bar w-full"
          animate={{
            scaleY: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </motion.div>

      <motion.div
        className="absolute top-20 left-0 w-48 h-32 text-secondary/10"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 2.0 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="angled-bar w-full"
          animate={{
            scaleX: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </motion.div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              opacity: 0
            }}
            animate={{
              y: -50,
              opacity: [0, 0.3, 0],
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "linear"
            }}
          >
            <div className="w-2 h-2 bg-primary/20 rounded-full" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default ConnectingSection;
