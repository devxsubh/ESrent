'use client';

import { Header } from '../home/components/Header';
import { FAQItem } from './components/FAQItem';

export default function FAQPage() {
  const faqs = [
    {
      question: "What types of luxury cars are available for rent?",
      answer: "We offer an extensive range of high-end vehicles, including exotic sports cars, luxury sedans, and premium SUVs. Our fleet features brands like Ferrari, Lamborghini, Rolls-Royce, Bentley, Mercedes-Benz, and more, ensuring you find the perfect car for your Dubai experience."
    },
    {
      question: "How do I book a luxury car rental?",
      answer: "Booking is simple and convenient. You can use our online reservation system on our website, call our dedicated customer service line at +971 4 XXX XXXX, or visit our office in Dubai. We'll guide you through the process and help you select the ideal vehicle for your needs."
    },
    {
      question: "What are the rental requirements?",
      answer: "To rent a luxury car, you must be at least 25 years old, possess a valid driver's license, and provide a credit card for the security deposit. International visitors need a passport and their home country's driver's license or an international driving permit. We may have additional requirements for certain high-end models."
    },
    {
      question: "Do you offer chauffeur services?",
      answer: "Yes, we provide professional chauffeur services for those who prefer not to drive. Our experienced drivers are knowledgeable about Dubai and can ensure a comfortable and stylish journey. This service is available for all our vehicles and can be booked hourly, daily, or for special events."
    },
    {
      question: "What insurance coverage is included with the rental?",
      answer: "All our rentals come with comprehensive insurance coverage. This typically includes collision damage waiver (CDW) and theft protection. We also offer additional coverage options for extra peace of mind. Our team can explain the details and help you choose the best coverage for your rental."
    },
    {
      question: "Can I take the rented car outside of Dubai?",
      answer: "Yes, most of our vehicles can be driven throughout the UAE. However, specific restrictions may apply to certain high-end models. If you plan to travel outside of Dubai, please inform us in advance so we can provide you with the necessary documentation and ensure your vehicle is properly equipped for inter-emirate travel."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto w-full">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="heading-4 font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our luxury car rental services in Dubai
          </p>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center border border-primary/20">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our luxury car rental experts are ready to assist you with any additional queries or special requests.
          </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/contact" 
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
                Contact Us
              </a>
              <a 
                href="tel:+9714XXXXXXX" 
                className="inline-flex items-center justify-center border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
