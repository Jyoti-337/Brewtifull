'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#21141C] border-t border-[#5C354C]/60 text-[#FFF0F5] font-['Inter'] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">
              Brew-tiful
            </span>
            <span className="text-[#E63E8C] text-2xl font-['Playfair_Display'] font-bold">
              Coffee
            </span>
          </Link>
          <p className="text-xs text-[#FFF0F5]/70 leading-relaxed">
            Handcrafted artisanal roasts, single-origin beans, and unforgettable coffee lounge experiences in every cup.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold font-['Playfair_Display'] text-[#E0B0FF] mb-3 uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2 text-xs text-[#FFF0F5]/80">
            <li>
              <Link href="/" className="hover:text-[#E0B0FF] transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-[#E0B0FF] transition-colors">Menu Showcase</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[#E0B0FF] transition-colors">Our Story & About</Link>
            </li>
            <li>
              <Link href="/reviews" className="hover:text-[#E0B0FF] transition-colors">Customer Reviews</Link>
            </li>
          </ul>
        </div>

        {/* Lounge & Ordering */}
        <div>
          <h4 className="text-sm font-bold font-['Playfair_Display'] text-[#E0B0FF] mb-3 uppercase tracking-wider">Experience</h4>
          <ul className="space-y-2 text-xs text-[#FFF0F5]/80">
            <li>
              <Link href="/checkout" className="hover:text-[#E0B0FF] transition-colors">Dine-In & Pickup</Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-[#E0B0FF] transition-colors">Order History</Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-[#E0B0FF] transition-colors">Track Live Order</Link>
            </li>
          </ul>
        </div>

        {/* Contact & Hours */}
        <div className="text-xs space-y-2 text-[#FFF0F5]/70">
          <h4 className="text-sm font-bold font-['Playfair_Display'] text-[#E0B0FF] mb-3 uppercase tracking-wider">Lounge Hours</h4>
          <p>Mon - Fri: 7:00 AM – 9:00 PM</p>
          <p>Sat - Sun: 8:00 AM – 10:00 PM</p>
          <p className="pt-2 text-[#FFF0F5]/50">📍 104 Roasters Lane, Wildberry Quarter</p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#5C354C]/40 flex flex-col sm:flex-row justify-between items-center text-xs text-[#FFF0F5]/50">
        <p>© {new Date().getFullYear()} Brew-tiful Coffee. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Crafted with ❤️ and single-origin coffee beans.</p>
      </div>
    </footer>
  );
}
