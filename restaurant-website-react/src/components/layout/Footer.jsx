import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="contact" className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-2xl">
                🍽️
              </div>
              <span className="font-display text-2xl text-dark">Bites</span>
            </Link>
            <p className="text-dark-gray mb-6">
              Enjoy delicious food from the best restaurants. Order online and
              get it delivered to your door.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-cream rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                📘
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-cream rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                🐦
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-cream rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                📷
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-cream rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xl mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-dark-gray hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#menu" className="text-dark-gray hover:text-primary transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="#reviews" className="text-dark-gray hover:text-primary transition-colors">
                  Reviews
                </a>
              </li>
              <li>
                <a href="#blog" className="text-dark-gray hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#contact" className="text-dark-gray hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-xl mb-6">Our Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-dark-gray hover:text-primary transition-colors">
                  Online Order
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-gray hover:text-primary transition-colors">
                  Pre-Reservation
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-gray hover:text-primary transition-colors">
                  24/7 Service
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-gray hover:text-primary transition-colors">
                  Catering
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-gray hover:text-primary transition-colors">
                  Party Orders
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-xl mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">📍</span>
                <span className="text-dark-gray">
                  123 Food Street, Flavor Town, FT 12345
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">📧</span>
                <span className="text-dark-gray">hello@bites.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">📞</span>
                <span className="text-dark-gray">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-dark/10 pt-8 text-center">
          <p className="text-dark-gray">
            © 2026 Bites Restaurant. All rights reserved. | Crafted with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
