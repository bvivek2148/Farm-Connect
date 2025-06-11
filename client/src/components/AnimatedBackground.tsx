import { motion } from "framer-motion";
import { Leaf, Sparkles, Heart } from "lucide-react";

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating leaves */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 100,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            y: -100,
            opacity: [0, 0.6, 0],
            x: Math.random() * window.innerWidth,
            rotate: 360
          }}
          transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
        >
          <Leaf className="w-6 h-6 text-primary/20" />
        </motion.div>
      ))}

      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 50,
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            y: -50,
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.random() * window.innerWidth
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-4 h-4 text-secondary/30" />
        </motion.div>
      ))}

      {/* Floating hearts */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 30,
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            y: -30,
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0],
            x: Math.random() * window.innerWidth
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut"
          }}
        >
          <Heart className="w-5 h-5 text-red-300/40" />
        </motion.div>
      ))}

      {/* Gradient orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-xl"
          style={{
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
            width: 200 + Math.random() * 100,
            height: 200 + Math.random() * 100,
          }}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            scale: 0
          }}
          animate={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0.5, 1, 0]
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
