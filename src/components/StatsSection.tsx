import { useStatistics } from "@/context/StatisticsContext";
import { Users, Building2, Activity, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Counter animation component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setIsVisible(true)}
      viewport={{ once: true }}
    >
      {count.toLocaleString()}
    </motion.div>
  );
};

const StatsSection = () => {
  const { statistics } = useStatistics();

  const stats = [
    {
      icon: Building2,
      value: statistics.totalFarms.toLocaleString(),
      label: "Partner Farms",
      description: "Trusted local farms"
    },
    {
      icon: Users,
      value: statistics.totalCustomers.toLocaleString(),
      label: "Happy Customers",
      description: "Satisfied buyers"
    },
    {
      icon: Activity,
      value: statistics.activeUsers.toLocaleString(),
      label: "Active Users",
      description: "Daily active community"
    },
    {
      icon: Eye,
      value: statistics.uniqueVisitors.toLocaleString(),
      label: "Unique Visitors",
      description: "Total site visitors"
    }
  ];

  return (
    <motion.div
      className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl font-bold text-neutral-dark mb-2">
          Farm Connect by the Numbers
        </h3>
        <p className="text-gray-600">
          Building a stronger connection between farmers and consumers
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const numericValue = parseInt(stat.value.replace(/,/g, ''));
          return (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="flex justify-center mb-3"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
              </motion.div>
              <div className="text-2xl md:text-3xl font-bold text-neutral-dark mb-1">
                <AnimatedCounter value={numericValue} duration={2000 + index * 200} />
              </div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500">
                {stat.description}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StatsSection;
