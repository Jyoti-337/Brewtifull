'use client';
import { useEffect } from 'react';
import HeroCanvasAnimation from '@/components/HeroCanvasAnimation';
import ProductShowcase from '@/components/ProductShowcase';
import FeatureSection from '@/components/FeatureSection';
import FinalCTA from '@/components/FinalCTA';

export default function Home() {
  useEffect(() => {
    // Ensure smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <main className="bg-[#2A1B24] min-h-screen">
      {/* Hero: Scroll-Triggered Canvas Animation */}
      <HeroCanvasAnimation />
      {/* Product Showcase Section */}
      <ProductShowcase />
      {/* Feature Highlights Section */}
      <FeatureSection />
      {/* Final Call-to-Action */}
      <FinalCTA />
    </main>
  );
}
