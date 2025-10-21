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
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">

        {/* Highly visible test animations */}
        <motion.div
          className="absolute top-20 left-20 w-12 h-12 rounded-full"
          style={{ backgroundColor: '#023436' }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-32 right-32 w-10 h-10 rounded-full"
          style={{ backgroundColor: '#03B5AA' }}
          animate={{
            x: [0, 30, 0],
            y: [0, -25, 0],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <motion.div
          className="absolute bottom-32 left-1/2 w-14 h-14 rounded-full"
          style={{ backgroundColor: '#FF8552' }}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Additional floating elements */}
        <motion.div
          className="absolute top-1/2 left-10 w-6 h-6 rounded-full"
          style={{ backgroundColor: '#023436' }}
          animate={{
            x: [0, 50, 0],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <motion.div
          className="absolute top-1/4 right-1/4 w-8 h-8 rounded-full"
          style={{ backgroundColor: '#FF8552' }}
          animate={{
            y: [0, -60, 0],
            x: [0, 20, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        {/* Floating leaves - simplified and more visible */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            className="absolute"
            style={{
              left: `${20 + i * 15}%`,
              top: '100%',
            }}
            initial={{
              y: 0,
              opacity: 0,
              rotate: 0
            }}
            animate={{
              y: -800,
              opacity: [0, 0.8, 0.6, 0],
              x: [0, 30, -30, 0],
              rotate: 360
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
          >
            <Leaf className="w-8 h-8" style={{ color: '#023436', opacity: 0.6 }} />
          </motion.div>
        ))}

        {/* Floating sparkles - simplified and more visible */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: '100%',
            }}
            initial={{
              y: 0,
              opacity: 0,
              scale: 0
            }}
            animate={{
              y: -700,
              opacity: [0, 1, 0.8, 0],
              scale: [0, 1.5, 1, 0],
              x: [0, 25, -25, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-6 h-6" style={{ color: '#03B5AA', opacity: 0.7 }} />
          </motion.div>
        ))}

        {/* Floating hearts with coral accent */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 5}%`,
            }}
            initial={{
              y: 0,
              opacity: 0,
              scale: 0
            }}
            animate={{
              y: -window.innerHeight - 50,
              opacity: [0, 0.9, 0.7, 0],
              scale: [0, 1.3, 1, 0],
              x: [-15, 15, -8, 8]
            }}
            transition={{
              duration: 10 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          >
            <Heart className="w-5 h-5 text-accent/50" />
          </motion.div>
        ))}

        {/* Visible floating circles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              backgroundColor:
                i % 3 === 0
                  ? 'rgba(2, 52, 54, 0.15)'
                  : i % 3 === 1
                  ? 'rgba(3, 181, 170, 0.15)'
                  : 'rgba(255, 133, 82, 0.15)',
            }}
            initial={{
              scale: 0,
              opacity: 0
            }}
            animate={{
              scale: [0, 1, 1.2, 1, 0],
              opacity: [0, 0.6, 0.8, 0.6, 0],
              y: [0, -20, -40, -60, -80]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Gradient orbs with new color scheme */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-lg"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              width: `${100 + Math.random() * 50}px`,
              height: `${100 + Math.random() * 50}px`,
              background:
                i % 3 === 0
                  ? 'radial-gradient(circle, rgba(2, 52, 54, 0.12) 0%, transparent 70%)'
                  : i % 3 === 1
                  ? 'radial-gradient(circle, rgba(3, 181, 170, 0.12) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255, 133, 82, 0.12) 0%, transparent 70%)',
            }}
            initial={{
              scale: 0,
              opacity: 0
            }}
            animate={{
              scale: [0, 1, 0.8, 1, 0.6],
              opacity: [0, 0.8, 1, 0.8, 0]
            }}
            transition={{
              duration: 15 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating dots */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              opacity: 0
            }}
            animate={{
              y: -20,
              opacity: [0, 0.4, 0],
              x: Math.random() * window.innerWidth
            }}
            transition={{
              duration: 15 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 12,
              ease: "linear"
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  i % 3 === 0
                    ? 'rgba(2, 52, 54, 0.15)'
                    : i % 3 === 1
                    ? 'rgba(3, 181, 170, 0.15)'
                    : 'rgba(255, 133, 82, 0.15)'
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-20">
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

              {/* Additional floating elements around "growth" text */}
              <motion.div
                className="absolute -top-4 -left-4"
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 0.6, 0.4, 0.6],
                  scale: [0, 1, 0.8, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: 2,
                  ease: "easeInOut"
                }}
              >
                <Leaf className="w-4 h-4 text-accent/40" />
              </motion.div>

              <motion.div
                className="absolute -bottom-3 -right-6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.5, 0.3, 0.5],
                  scale: [0, 1.2, 0.9, 1.2],
                  y: [0, -5, 0, -3, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 3,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-3 h-3 text-primary/30" />
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
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop"
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

        {/* Subtle pulsing elements around content area */}
        <motion.div
          className="absolute top-1/4 left-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.3, 0.1, 0.3],
            scale: [0, 1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 4,
            ease: "easeInOut"
          }}
        >
          <div className="w-8 h-8 rounded-full bg-secondary/10 blur-sm" />
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 right-16"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0.2, 0.4],
            scale: [0, 1.5, 1, 1.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: 6,
            ease: "easeInOut"
          }}
        >
          <div className="w-6 h-6 rounded-full bg-accent/8 blur-sm" />
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.2, 0.05, 0.2],
            scale: [0, 2, 1.5, 2]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: 8,
            ease: "easeInOut"
          }}
        >
          <div className="w-12 h-12 rounded-full bg-primary/5 blur-md" />
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

      {/* Enhanced animated background gradients */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />

      {/* Additional subtle gradient layers */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent/3 via-transparent to-primary/3"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.7, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Animated mesh gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(2, 52, 54, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(3, 181, 170, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 133, 82, 0.02) 0%, transparent 50%)
          `
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.8, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </motion.section>
  );
};

export default HeroSection;
