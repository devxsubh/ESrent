import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Mail, Phone } from 'lucide-react';
import { SiSnapchat } from 'react-icons/si';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="flex flex-col gap-3">
            <Image
              src="/images/ES logo (1).svg"
              alt="ES Rent a Car Logo"
              width={80}
              height={80}
              className="w-20 h-20 mb-2"
              style={{ filter: 'invert(89%) sepia(90%) saturate(1352%) hue-rotate(127deg) brightness(103%) contrast(97%)' }}
              priority
            />
            <p className="text-sm text-muted-foreground mb-2">
              Your premier destination for luxury and exotic car rentals.
            </p>
            <div className="text-sm text-muted-foreground mb-2">
              <p>Dubai, UAE</p>
              <a 
                href="mailto:info@esrent.com" 
                className="hover:text-foreground transition-colors"
              >
                info@esrent.com
              </a>
            </div>
            {/* Social Links Row */}
            <div className="flex flex-row gap-6 mt-2">
              <a href="https://snapchat.com/t/JyDBbZS1" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                <SiSnapchat size={22} className="text-white" />
              </a>
              <a href="https://www.instagram.com/esrent.ae/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={22} className="text-white" />
              </a>
              <a href="mailto:info@esrent.com" aria-label="Email">
                <Mail size={22} className="text-white" />
              </a>
              <a href="tel:+971553553626" aria-label="Phone">
                <Phone size={22} className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">Quick Links</h3>
            <nav className="grid grid-cols-2 gap-2">
              <Link 
                href="/categories" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Categories
              </Link>
              <Link 
                href="/brands" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Brands
              </Link>
              <Link 
                href="/faq" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQ
              </Link>
              <Link 
                href="/about" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">Support</h3>
            <nav className="space-y-2">
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                Terms & Conditions
              </Link>
              <Link 
                href="/privacy-policy" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/contact" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              {currentYear} ES Rentals. All rights reserved.
            </div>
           
          </div>
        </div>
        {/* <div className="text-center text-sm text-muted-foreground mt-4">
          <span>Made with 💙 by Pro Quo</span>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
