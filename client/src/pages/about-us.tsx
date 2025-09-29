import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Award, 
  Leaf, 
  Users, 
  Heart, 
  Sprout, 
  Globe 
} from "lucide-react";

// Team member component
const TeamMember = ({ name, role, bio, image }: {
  name: string;
  role: string;
  bio: string;
  image: string;
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-base font-semibold">{name}</h3>
      <p className="text-primary font-medium text-xs mb-2">{role}</p>
      <p className="text-gray-600 text-xs leading-relaxed">{bio}</p>
    </div>
  );
};

// Value component
const Value = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Milestone component
const Milestone = ({ year, title, description }: {
  year: string;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex">
      <div className="mr-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
          {year}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const AboutUsPage = () => {
  // Team members data
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former farmer with 15 years of experience who recognized the need to connect local farms directly with consumers.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Tech expert passionate about using technology to solve real-world problems in agriculture and sustainability.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      bio: "Operations specialist with experience in logistics and supply chain management for agricultural products.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Marcus Williams",
      role: "Farmer Relations",
      bio: "Third-generation farmer who understands the challenges and needs of small-scale agricultural producers.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Dr. Priya Patel",
      role: "Agricultural Scientist",
      bio: "PhD in Agricultural Sciences with expertise in sustainable farming practices and crop optimization for small-scale farmers.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Our Mission</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Revolutionizing how people access fresh, local food by creating direct connections between farmers and consumers.
          </p>
        </div>
      </div>
      
      {/* Story section */}
      <div className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Farm Connect began in 2018 when our founder, Sarah Johnson, a small-scale organic farmer, 
                experienced the challenges of getting her fresh produce directly to consumers. Despite growing 
                the highest quality vegetables, she struggled to compete with large agricultural corporations 
                that dominated supermarket supply chains.
              </p>
              <p>
                Sarah envisioned a platform that would eliminate middlemen and allow farmers like her to connect 
                directly with people who care about where their food comes from. She joined forces with Michael Chen, 
                a technologist with a passion for sustainable food systems, and Farm Connect was born.
              </p>
              <p>
                What started as a small pilot program with 12 farms in California has grown into a nationwide 
                network of over 5,000 farmers serving hundreds of thousands of consumers who value fresh, local, 
                sustainably-grown food.
              </p>
              <p>
                Today, Farm Connect continues to innovate at the intersection of technology and agriculture, 
                making it easier than ever for farmers to thrive and for consumers to access the freshest 
                produce from nearby farms.
              </p>
            </div>
            
            <div className="mt-8">
              <Link href="/contact">
                <Button className="bg-primary hover:bg-primary/90">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden h-64">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop"
                  alt="Farm field"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-64">
                <img
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop"
                  alt="Farmer with produce"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-64">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"
                  alt="Fresh vegetables"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden h-64">
                <img
                  src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop"
                  alt="Family farm"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Values section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Value 
              icon={Leaf}
              title="Sustainability"
              description="We promote farming practices that protect the environment and enhance soil health for future generations."
            />
            
            <Value 
              icon={Users}
              title="Community"
              description="We believe in building strong connections between the people who grow our food and those who eat it."
            />
            
            <Value 
              icon={Award}
              title="Quality"
              description="We prioritize the freshest, most nutritious food harvested at peak ripeness and delivered quickly."
            />
            
            <Value 
              icon={Heart}
              title="Accessibility"
              description="We work to make fresh, local food available to everyone, regardless of location or income."
            />
            
            <Value 
              icon={Sprout}
              title="Innovation"
              description="We continuously improve our platform to better serve farmers and consumers with cutting-edge technology."
            />
            
            <Value 
              icon={Globe}
              title="Transparency"
              description="We provide complete information about farming practices, pricing, and the journey from farm to table."
            />
          </div>
        </div>
      </div>
      
      {/* Timeline section */}
      <div className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Our Journey</h2>
        
        <div className="max-w-3xl mx-auto space-y-10">
          <Milestone 
            year="2018"
            title="The Beginning"
            description="Farm Connect launches with 12 farms in California's Central Valley, connecting them with local consumers through a basic online platform."
          />
          
          <Milestone 
            year="2019"
            title="First Expansion"
            description="Farm Connect expands to Oregon and Washington, growing to over 200 participating farms and introducing the mobile app."
          />
          
          <Milestone 
            year="2020"
            title="Pandemic Response"
            description="During COVID-19, Farm Connect rapidly scales to meet increased demand for direct farm deliveries, helping many small farms survive when traditional markets closed."
          />
          
          <Milestone 
            year="2021"
            title="Nationwide Growth"
            description="Farm Connect expands to 35 states with over 2,000 farms, and introduces subscription options for regular deliveries."
          />
          
          <Milestone 
            year="2022"
            title="Technology Innovation"
            description="Launch of advanced analytics for farmers and AI-powered seasonal planning tools to optimize planting schedules."
          />
          
          <Milestone 
            year="2023"
            title="Today"
            description="Farm Connect now connects over 5,000 farms with hundreds of thousands of consumers nationwide, with continual innovation in technology and service offerings."
          />
        </div>
      </div>
      
      {/* Team section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-4">Join Our Team</h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              We're always looking for passionate individuals who want to make a difference in our food system.
              Check out our current opportunities.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              View Open Positions
            </Button>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Movement?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-gray-600">
            Whether you're a farmer looking to connect with customers or a consumer seeking fresh, local food,
            Farm Connect is here to bring you together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;