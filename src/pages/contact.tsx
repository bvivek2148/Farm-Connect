import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-dark mb-3">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out with any questions about our services, 
            products, or how to join our community of farmers and customers.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 max-w-5xl mx-auto">
          <div className="md:w-1/2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 border border-gray-100 h-full">
              <h3 className="text-2xl font-bold text-neutral-dark mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-neutral-dark">Our Location</h4>
                    <p className="text-gray-600">
                      123 Farm Lane<br />
                      Harvest Valley, CA 95123
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-neutral-dark">Phone</h4>
                    <p className="text-gray-600">+1 (970) 403-0492</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-neutral-dark">Email</h4>
                    <p className="text-gray-600">farmconnect.helpdesk@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-neutral-dark">Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 8am - 6pm<br />
                      Saturday: 9am - 4pm<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 rounded-xl overflow-hidden h-64 bg-gray-200">
                {/* Map placeholder - in a real app, would use Google Maps or similar */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  Interactive Map Would Go Here
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
