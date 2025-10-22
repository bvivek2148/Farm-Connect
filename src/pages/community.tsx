import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Sprout, TrendingUp, MessageCircle, Calendar, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

const Community = () => {
  const benefits = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect with Local Farmers",
      description: "Build direct relationships with farmers in your area and learn about their growing practices."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Support Local Agriculture",
      description: "Your purchases directly support local farmers and strengthen your community's food system."
    },
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Access Fresh Produce",
      description: "Get the freshest seasonal produce delivered straight from farm to your table."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Fair Pricing",
      description: "Farmers get fair prices for their hard work, and you get quality food at reasonable rates."
    }
  ];

  const activities = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Community Forums",
      description: "Share recipes, farming tips, and connect with other members"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Farm Visits & Events",
      description: "Participate in farm tours, harvest festivals, and workshops"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Rewards Program",
      description: "Earn points for purchases and refer friends to unlock benefits"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Local Food Maps",
      description: "Discover farmers markets and farm stands near you"
    }
  ];

  const stats = [
    { value: "2,500+", label: "Active Members" },
    { value: "150+", label: "Local Farmers" },
    { value: "50,000+", label: "Products Delivered" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-neutral-dark">
              Join the Farm Connect{" "}
              <span className="text-primary">Community</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Be part of a movement that's transforming how we connect with local food. Support sustainable farming, eat healthier, and build lasting relationships with the people who grow your food.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/about-us">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-neutral-dark">
              Why Join Our Community?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Become part of a network that values quality, sustainability, and community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-2xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Activities */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-neutral-dark">
              Community Activities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Engage, learn, and grow with fellow community members
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 text-secondary">
                  {activity.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-neutral-dark">
                  {activity.title}
                </h3>
                <p className="text-gray-600 text-sm">{activity.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-neutral-dark">
              What Our Members Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Home Chef",
                quote: "Farm Connect has transformed how I shop for groceries. The quality is unmatched!"
              },
              {
                name: "Mike Chen",
                role: "Farmer",
                quote: "Finally, a platform that truly connects me with customers who value fresh, local produce."
              },
              {
                name: "Emily Rodriguez",
                role: "Community Member",
                quote: "Love being part of this community. It feels good to support local farmers!"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-neutral-dark">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of members who are already enjoying fresh, local food and supporting sustainable agriculture.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Join Farm Connect Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Community;
