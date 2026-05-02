import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Play,
  BookOpen,
  FileText,
  Search,
  Heart,
  ArrowUp,
  Send,
  Sparkles,
  Zap
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'IELTS Games', icon: <Play className="w-4 h-4" /> },
    { name: 'PDF Converter', icon: <FileText className="w-4 h-4" /> },
    { name: 'Word Search', icon: <Search className="w-4 h-4" /> },
    { name: 'Study Guide', icon: <BookOpen className="w-4 h-4" /> }
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', name: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, color: 'from-sky-400 to-sky-500', name: 'Twitter' },
    { icon: <Instagram className="w-5 h-5" />, color: 'from-pink-500 to-rose-500', name: 'Instagram' },
    { icon: <Linkedin className="w-5 h-5" />, color: 'from-blue-600 to-blue-700', name: 'LinkedIn' },
    { icon: <Youtube className="w-5 h-5" />, color: 'from-red-500 to-red-600', name: 'YouTube' }
  ];

  const companyInfo = [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Press', href: '#press' },
    { name: 'Blog', href: '#blog' }
  ];

  const support = [
    { name: 'Help Center', href: '#help' },
    { name: 'Contact Us', href: '#contact' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg p-2">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Eleegon
              </h3>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Revolutionizing language learning with intelligent automation and interactive experiences for IELTS preparation.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg p-2">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg p-2">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span>hello@eduapp.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg p-2">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span>+880 1234 567890</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
            <div className="space-y-3">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors duration-300 group"
                >
                  <div className="text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </div>
                  <span className="text-sm">{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Company & Support */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
            <div className="space-y-3 mb-6">
              {companyInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block text-gray-300 hover:text-purple-400 transition-colors duration-300 text-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>
            
            <h4 className="text-lg font-bold mb-4 text-white">Support</h4>
            <div className="space-y-3">
              {support.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="block text-gray-300 hover:text-emerald-400 transition-colors duration-300 text-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold mb-4 text-white">Stay Updated</h4>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and IELTS tips.
            </p>
            
            <div className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors duration-300"
                />
                <button
                  onClick={handleSubscribe}
                  className="absolute right-2 top-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg p-2 hover:scale-105 transition-transform duration-300"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {isSubscribed && (
              <div className="bg-gradient-to-r from-emerald-400/20 to-teal-400/20 border border-emerald-400/30 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-medium">Successfully subscribed!</span>
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={`bg-gradient-to-br ${social.color} rounded-lg p-2 hover:scale-110 transition-transform duration-300 group`}
                  title={social.name}
                >
                  <div className="text-white group-hover:animate-pulse">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span>by EduApp Team</span>
            </div>
            
            <div className="text-gray-300 text-sm">
              © 2025 EduApp. All rights reserved.
            </div>
            
            <button
              onClick={scrollToTop}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full p-2 hover:scale-110 transition-transform duration-300 group"
            >
              <ArrowUp className="w-4 h-4 text-white group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;