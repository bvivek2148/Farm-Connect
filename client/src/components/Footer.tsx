import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">FarmConnect</h3>
            <p className="text-gray-100 text-sm">
              Our platform connects local farmers with consumers, bringing fresh, 
              seasonal produce straight to your table while supporting sustainable 
              farming practices.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/"><a className="text-gray-100 hover:text-white">Home</a></Link></li>
              <li><Link href="/shop"><a className="text-gray-100 hover:text-white">Shop</a></Link></li>
              <li><Link href="/services"><a className="text-gray-100 hover:text-white">Services</a></Link></li>
              <li><Link href="/pricing"><a className="text-gray-100 hover:text-white">Pricing</a></Link></li>
              <li><Link href="/about-us"><a className="text-gray-100 hover:text-white">About Us</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Farmers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/farmer-signup"><a className="text-gray-100 hover:text-white">Join as a Farmer</a></Link></li>
              <li><Link href="/farm-resources"><a className="text-gray-100 hover:text-white">Resources</a></Link></li>
              <li><Link href="/sustainability"><a className="text-gray-100 hover:text-white">Sustainability</a></Link></li>
              <li><Link href="/community"><a className="text-gray-100 hover:text-white">Community</a></Link></li>
              <li><Link href="/faq"><a className="text-gray-100 hover:text-white">FAQs</a></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (970) 403-0492</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>farmconnect.helpdesk@gmail.com</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <span>123 Farm Lane<br />Harvest Valley, CA 95123</span>
              </li>
            </ul>
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-white hover:text-gray-200" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-200" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-200" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-200" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-green-600 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-100 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} FarmConnect. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy-policy"><a className="text-gray-100 hover:text-white">Privacy Policy</a></Link>
            <Link href="/terms"><a className="text-gray-100 hover:text-white">Terms of Service</a></Link>
            <Link href="/cookies"><a className="text-gray-100 hover:text-white">Cookies</a></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
