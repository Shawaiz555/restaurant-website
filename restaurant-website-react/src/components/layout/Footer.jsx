import React from "react";
import { Link } from "react-router-dom";
import useSettings from "../../hooks/useSettings";
import {
  ArrowRight,
  Check,
  MapPin,
  Mail,
  Phone,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const {
    restaurantName,
    restaurantPhone,
    restaurantEmail,
    restaurantAddress,
    openingTime,
    closingTime,
  } = useSettings();

  // Format "09:00" → "9:00 AM", "23:00" → "11:00 PM"
  const fmt12 = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const addressLine = [restaurantAddress].filter(Boolean).join(", ");

  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com",
      hoverColor: "hover:bg-blue-600",
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      name: "Instagram",
      url: "https://instagram.com",
      hoverColor: "hover:bg-pink-600",
      icon: <Instagram className="w-5 h-5" />,
    },
    {
      name: "Twitter",
      url: "https://twitter.com",
      hoverColor: "hover:bg-sky-500",
      icon: <Twitter className="w-5 h-5" />,
    },
    {
      name: "YouTube",
      url: "https://youtube.com",
      hoverColor: "hover:bg-red-600",
      icon: <Youtube className="w-5 h-5" />,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      hoverColor: "hover:bg-blue-700",
      icon: <Linkedin className="w-5 h-5" />,
    },
  ];

  return (
    <footer
      id="contact"
      className="bg-gradient-to-br from-white via-cream-light to-white py-10 lg:py-20"
    >
      <div className="container mx-auto px-3 sm:px-6 lg:px-10 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <Link to="/" className="max-w-xs mb-6">
              <img
                src="/assets/images/BitesLogo.png"
                alt={`${restaurantName} Logo`}
                className="h-28 w-32 lg:w-52 lg:h-20 object-contain transition-all"
              />
            </Link>
            <p className="text-dark-gray text-sm sm:text-base mb-6 leading-relaxed">
              Enjoy delicious food from the best restaurants. Order online and
              get it delivered to your door.
            </p>

            {/* Social Media Links */}
            <div className="mb-4">
              <h5 className="font-bold text-dark mb-3">Follow Us</h5>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:text-white transition-all hover:scale-110 shadow-md hover:shadow-xl ${social.hoverColor}`}
                    title={social.name}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="py-1 md:py-10">
            <h4 className="font-sans font-bold text-xl mb-6 text-dark">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-dark-gray text-sm sm:text-base hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-primary" /> Home
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="text-dark-gray text-sm sm:text-base hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-primary" /> Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-dark-gray text-sm sm:text-base hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-primary" /> About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-dark-gray text-sm sm:text-base hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-primary" /> Services
                </Link>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="text-dark-gray text-sm sm:text-base hover:text-primary transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-primary" /> FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div className="py-1 md:py-10">
            <h4 className="font-sans font-bold text-xl mb-6 text-dark">
              Our Services
            </h4>
            <ul className="space-y-3">
              <li className="text-dark-gray text-sm sm:text-base flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1" /> Fast Delivery
              </li>
              <li className="text-dark-gray text-sm sm:text-base flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1" /> Dine-In
                Experience
              </li>
              <li className="text-dark-gray text-sm sm:text-base flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1" /> Takeaway Service
              </li>
              <li className="text-dark-gray text-sm sm:text-base flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1" /> Event Catering
              </li>
              <li className="text-dark-gray text-sm sm:text-base flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1" /> Private Chef
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="py-1 md:py-10">
            <h4 className="font-sans font-bold text-xl mb-6 text-dark">
              Contact Us
            </h4>
            <ul className="space-y-4">
              {addressLine && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-dark-gray text-sm sm:text-base">
                    {addressLine}
                  </span>
                </li>
              )}
              {restaurantEmail && (
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href={`mailto:${restaurantEmail}`}
                    className="text-dark-gray text-sm sm:text-base hover:text-primary transition-colors"
                  >
                    {restaurantEmail}
                  </a>
                </li>
              )}
              {restaurantPhone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <a
                    href={`tel:${restaurantPhone}`}
                    className="text-dark-gray text-sm sm:text-base hover:text-primary transition-colors"
                  >
                    {restaurantPhone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-dark-gray text-sm sm:text-base">
                  Mon-Sun: {fmt12(openingTime)} – {fmt12(closingTime)}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-dark/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-gray text-center text-sm sm:text-base">
              © {new Date().getFullYear()} {restaurantName}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
