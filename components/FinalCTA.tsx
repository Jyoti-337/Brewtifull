'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function FinalCTA() {
  const router = useRouter();
  
  return (
    <section className="py-32 px-4 relative overflow-hidden bg-[#2A1B24]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2A1B24] via-[#392431] to-[#2A1B24]" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E63E8C]/20 rounded-full blur-3xl"
      />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-6"
        >
          Find the Perfect Coffee for You
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-[#FFF0F5]/75 mb-12 font-['Inter']"
        >
          Experience the art of coffee craftsmanship delivered right to your table or doorstep
        </motion.p>
        <motion.button
          onClick={() => router.push('/menu')}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-14 py-4.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full text-xl font-semibold font-['Inter'] shadow-2xl shadow-[#E63E8C]/30 hover:shadow-[#E63E8C]/50 transition-all"
        >
          Explore Full Menu →
        </motion.button>
        {/* Decorative Sparkle */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="mt-12 text-[#E0B0FF] text-4xl"
        >
          ✦
        </motion.div>
      </div>
    </section>
  );
}
