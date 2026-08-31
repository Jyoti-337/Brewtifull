'use client';
import { motion } from 'framer-motion';
import { features } from '@/data/products';

export default function FeatureSection() {
  return (
    <section className="py-24 px-4 md:px-8 relative overflow-hidden bg-[#2A1B24]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2A1B24] via-[#392431] to-[#2A1B24] opacity-80" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-[#E0B0FF] text-sm font-semibold tracking-widest uppercase block mb-3 font-['Inter']">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">
            Unmatched Coffee Culture
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Left Features */}
          <div className="space-y-8">
            {features.filter(f => f.position === 'left').map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-[#392431]/70 backdrop-blur-sm p-6 rounded-2xl border border-[#5C354C]/60 hover:border-[#E0B0FF]/60 transition-all shadow-lg hover:shadow-xl hover:shadow-[#E63E8C]/10 group"
              >
                <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-[#FFF0F5] mb-3 group-hover:text-[#E0B0FF] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#FFF0F5]/75 font-['Inter'] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Center: Coffee Cup Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-[#E63E8C]/25 to-[#E0B0FF]/25 rounded-full blur-3xl"
              />
              <img
                src="/coffee/cup-centered.png"
                alt="Premium Coffee Cup"
                className="relative z-10 w-80 h-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>

          {/* Right Features */}
          <div className="space-y-8">
            {features.filter(f => f.position === 'right').map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="bg-[#392431]/70 backdrop-blur-sm p-6 rounded-2xl border border-[#5C354C]/60 hover:border-[#E0B0FF]/60 transition-all shadow-lg hover:shadow-xl hover:shadow-[#E63E8C]/10 group"
              >
                <h3 className="text-2xl font-['Playfair_Display'] font-semibold text-[#FFF0F5] mb-3 group-hover:text-[#E0B0FF] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#FFF0F5]/75 font-['Inter'] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
