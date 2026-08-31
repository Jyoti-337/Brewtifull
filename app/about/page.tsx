'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#2A1B24] text-[#FFF0F5] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <span className="bg-[#E63E8C]/20 border border-[#E63E8C] text-[#E0B0FF] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-['Inter']">
            Our Passion & Heritage
          </span>
          <h1 className="text-4xl sm:text-6xl font-['Playfair_Display'] font-bold text-[#FFF0F5] leading-tight">
            Crafting Unforgettable <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63E8C] to-[#E0B0FF]">
              Coffee Experiences
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-[#FFF0F5]/80 text-base sm:text-lg font-['Inter'] leading-relaxed">
            Welcome to Brew-tiful Coffee. We believe every sip should tell a story—from high-altitude volcanic soils to our signature precision roasts.
          </p>
        </motion.div>

        {/* Brand Story Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#392431]/80 border border-[#5C354C] rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md"
        >
          <div className="space-y-4 font-['Inter']">
            <h2 className="text-3xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">
              Our Story & Mission
            </h2>
            <p className="text-sm text-[#FFF0F5]/80 leading-relaxed">
              Founded with an unyielding commitment to coffee perfection, Brew-tiful Coffee began as a boutique roastery nestled in the heart of the city. Our mission is simple: to connect discerning coffee lovers with ethically sourced, micro-batch roasted beans.
            </p>
            <p className="text-sm text-[#FFF0F5]/80 leading-relaxed">
              Whether you are savoring a quiet morning espresso at our lounge, picking up a cold brew on the go, or enjoying fresh delivery at your doorstep, we craft every beverage with precision, warmth, and care.
            </p>
          </div>
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#5C354C]">
            <img 
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1000&auto=format&fit=crop" 
              alt="Artisanal Coffee Roasting" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1B24] via-transparent to-transparent opacity-60" />
          </div>
        </motion.div>

        {/* What Makes Our Coffee Special */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">
              What Makes Our Coffee Special
            </h2>
            <p className="text-sm text-[#FFF0F5]/70 font-['Inter'] mt-2">
              Every detail is engineered for peak aroma, body, and flavor balance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-['Inter']">
            {[
              {
                icon: '🌱',
                title: 'Single-Origin Sourcing',
                desc: 'Direct trade partnerships with sustainable farms in Ethiopia, Colombia, and Guatemala ensure fair wages and premium harvest selection.'
              },
              {
                icon: '🔥',
                title: 'Micro-Batch Roasting',
                desc: 'We roast in small, precise batches daily to highlight the delicate fruit notes, velvety body, and signature wildberry undertones.'
              },
              {
                icon: '☕',
                title: 'Master Barista Precision',
                desc: 'Every espresso shot is calibrated for water temperature, grind size, and extraction pressure to deliver consistent liquid gold.'
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#392431]/60 border border-[#5C354C] rounded-2xl p-6 hover:border-[#E0B0FF]/50 transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#FFF0F5] mb-2">{item.title}</h3>
                <p className="text-xs text-[#FFF0F5]/75 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our Values & Process */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#392431]/90 border border-[#5C354C] rounded-3xl p-8 sm:p-12 space-y-8"
        >
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">
              Our Craft & Values
            </h2>
            <p className="text-xs text-[#FFF0F5]/70 font-['Inter'] mt-1">
              Guiding principles that define everything we brew.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center font-['Inter']">
            <div className="p-4 bg-[#2A1B24]/70 rounded-2xl border border-[#5C354C]/60">
              <span className="text-3xl block mb-2">♻️</span>
              <h4 className="font-bold text-[#E0B0FF] text-sm mb-1">Eco Packaging</h4>
              <p className="text-[11px] text-[#FFF0F5]/70">100% compostable cups & biodegradable coffee bags.</p>
            </div>
            <div className="p-4 bg-[#2A1B24]/70 rounded-2xl border border-[#5C354C]/60">
              <span className="text-3xl block mb-2">🤝</span>
              <h4 className="font-bold text-[#E0B0FF] text-sm mb-1">Fair Trade</h4>
              <p className="text-[11px] text-[#FFF0F5]/70">Honoring coffee farmers with above market compensation.</p>
            </div>
            <div className="p-4 bg-[#2A1B24]/70 rounded-2xl border border-[#5C354C]/60">
              <span className="text-3xl block mb-2">✨</span>
              <h4 className="font-bold text-[#E0B0FF] text-sm mb-1">Zero Compromise</h4>
              <p className="text-[11px] text-[#FFF0F5]/70">Only 100% specialty grade Specialty Coffee Association (SCA) beans.</p>
            </div>
            <div className="p-4 bg-[#2A1B24]/70 rounded-2xl border border-[#5C354C]/60">
              <span className="text-3xl block mb-2">🚀</span>
              <h4 className="font-bold text-[#E0B0FF] text-sm mb-1">Peak Freshness</h4>
              <p className="text-[11px] text-[#FFF0F5]/70">Beans served within 14 days of roasting for maximum flavor notes.</p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link 
              href="/menu" 
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-sm shadow-lg shadow-[#E63E8C]/30 hover:opacity-95 transition-all"
            >
              Explore Our Signature Brews →
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
