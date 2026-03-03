import React, { useState } from "react";
import {
  Clock,
  Truck,
  Sparkles,
  Users,
  Leaf,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Lightbulb,
  Phone,
  Mail,
} from "lucide-react";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What are your operating hours?",
      answer:
        "We're open Monday to Thursday from 11:00 AM to 10:00 PM, Friday to Saturday from 11:00 AM to 11:00 PM, and Sunday from 10:00 AM to 9:00 PM. Our online ordering is available 24/7!",
      icon: Clock,
    },
    {
      question: "Do you offer delivery services?",
      answer:
        "Yes! We offer fast delivery within a 10km radius. Orders typically arrive within 30-45 minutes. You can track your order in real-time through our website or mobile app. Delivery is free for orders above Rs. 500.",
      icon: Truck,
    },
    {
      question: "Can I customize my order?",
      answer:
        "Absolutely! We understand everyone has different preferences. You can customize your order by adding special instructions during checkout. Let us know about dietary restrictions, spice levels, or ingredient modifications, and our chefs will accommodate your requests.",
      icon: Sparkles,
    },
    {
      question: "Do you offer group ordering and bulk discounts?",
      answer:
        "Yes! We offer special pricing for bulk orders and group events. Whether you're ordering for an office party, family gathering, or large group, contact us to discuss your requirements and we'll provide a customized quote with attractive discounts.",
      icon: Users,
    },
    {
      question: "Are your ingredients fresh and locally sourced?",
      answer:
        "We take pride in using only the freshest ingredients. We partner with local farmers and suppliers to source seasonal produce, ensuring quality and supporting our community. All our meats are premium quality, and seafood is delivered fresh daily.",
      icon: Leaf,
    },
    {
      question: "What if I have a complaint or feedback?",
      answer:
        "Your satisfaction is our priority! If you have any concerns, please contact us immediately at our customer service hotline or through the 'Contact Us' page. We take all feedback seriously and strive to resolve any issues promptly. We also offer a satisfaction guarantee on all orders.",
      icon: MessageCircle,
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-16 lg:py-24 bg-gradient-to-br from-cream-light via-white to-cream"
    >
      <div className="container mx-auto px-6 sm:px-6 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-5 py-2 rounded-full mb-6">
            <HelpCircle className="w-6 h-6 text-primary" />
            <span className="text-primary font-semibold text-sm">
              Got Questions?
            </span>
          </div>
          <h2 className="font-sans font-bold text-4xl lg:text-5xl text-dark mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-dark-gray text-lg lg:text-xl max-w-2xl mx-auto">
            Find answers to common questions about our services, ordering, and
            more
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? "border-primary shadow-2xl"
                    : "border-transparent hover:border-primary/30 hover:shadow-xl"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-3 py-3 lg:p-6 lg:py-5 text-left flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        openIndex === index
                          ? "bg-primary text-white scale-110"
                          : "bg-primary/10 group-hover:bg-primary/20 text-primary"
                      }`}
                    >
                      <faq.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg transition-colors ${
                          openIndex === index
                            ? "text-primary"
                            : "text-dark group-hover:text-primary"
                        }`}
                      >
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      openIndex === index
                        ? "bg-primary text-white rotate-180"
                        : "bg-cream text-primary group-hover:bg-primary/10"
                    }`}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                    <div className="lg:pl-16 lg:pr-4">
                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
                        <p className="text-dark-gray text-base lg:text-md leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Box */}
        <div className="mt-16 bg-gradient-to-r from-primary via-primary to-primary-dark rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-4 text-white">
              <Lightbulb className="w-16 h-16 animate-pulse" />
            </div>
            <h3 className="font-sans font-bold text-3xl lg:text-4xl text-white mb-4">
              Still Have Questions?
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Our friendly support team is here to help! Reach out anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" /> Call Us Now
              </button>
              <button className="bg-primary text-white border-2 border-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-primary transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" /> Email Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
