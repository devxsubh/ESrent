import Link from 'next/link';
import { motion } from "framer-motion";

export function NotSureSection() {
  const whatsappLink = "https://wa.me/971553553626"; // +971 55 355 3626

  return (
    <motion.div
      className="mt-10 bg-indigo-100 rounded-lg p-6 text-center border border-gray-200"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-lg font-medium text-gray-900 mb-2">Not sure what to choose?</h2>
      <p className="text-sm text-gray-600 mb-4">
        Our team is here to help you pick the perfect car for your needs.
      </p>
      <Link 
        href={whatsappLink}
        className="inline-block bg-indigo-400 text-white px-5 py-2.5 rounded-full  text-sm font-medium hover:bg-indigo-900 transition-colors"
      >
        Talk to us
      </Link>
    </motion.div>
  );
}
