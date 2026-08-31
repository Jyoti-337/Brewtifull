'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { coffeeProducts } from '@/data/products';

export default function ProductShowcase() {
  const [products, setProducts] = useState(coffeeProducts);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          // Display top 3 products or popular products
          setProducts(data.products.slice(0, 6));
        }
      })
      .catch((err) => console.error('Error fetching DB products:', err));
  }, []);

  return (
    <section id="signature-blends" className="py-24 px-4 md:px-8 relative bg-[#2A1B24]">
      {/* Coffee Splash Banner with Pink Gradient overlay */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative h-64 mb-16 rounded-3xl overflow-hidden max-w-7xl mx-auto border border-[#5C354C]/60 shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#392431] via-[#4A2B3D] to-[#392431]" />
        <img
          src="/coffee/splash-banner.jpg"
          alt="Coffee Splash"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1B24] via-transparent to-transparent" />
        
        {/* Banner Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <span className="text-[#E0B0FF] font-semibold text-xs tracking-widest uppercase mb-2">Crafted Fresh Daily</span>
          <h3 className="text-3xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">Elevate Your Coffee Routine</h3>
        </div>

        {/* Floating Coffee Beans */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{
              y: [0, -20, 0],
              x: [0, ((i * 13) % 40) - 20, 0],
              rotate: [0, 360]
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + ((i * 7) % 3),
              delay: i * 0.3
            }}
            className="absolute w-8 h-8 opacity-40 pointer-events-none"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + ((i * 37) % 40)}%`
            }}
          >
            <img src="/coffee/bean.png" alt="Coffee Bean" className="w-full h-full object-contain" />
          </motion.div>
        ))}
      </motion.div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#E0B0FF] text-sm font-semibold tracking-widest uppercase block mb-3 font-['Inter']"
          >
            Handcrafted Classics
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-['Playfair_Display'] font-bold text-[#FFF0F5]"
          >
            Our Signature Blends
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
