'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { fullMenu } from '@/data/fullMenu';
import ProductCard from '@/components/ProductCard';

const categories = ['All', 'Hot Coffee', 'Cold Drinks', 'Pastries', 'Seasonal'];

function MenuContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<any[]>(fullMenu);

  // Sync state from URL search params
  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || 'All';
  const sortOption = searchParams.get('sort') || 'default';

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setItems(data.products);
        }
      })
      .catch((err) => console.error('Error fetching DB products for menu:', err));
  }, []);

  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All' && value !== 'default' && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sorting logic
    if (sortOption === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating_desc') {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => {
        if (a.is_new && !b.is_new) return -1;
        if (!a.is_new && b.is_new) return 1;
        return 0;
      });
    }

    return result;
  }, [items, activeCategory, searchQuery, sortOption]);

  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 text-[#FFF0F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button 
              onClick={() => router.push('/')}
              className="text-[#FFF0F5]/70 hover:text-[#E0B0FF] transition-colors mb-4 flex items-center justify-center gap-2 mx-auto font-['Inter'] text-sm"
            >
              <span>←</span> Back to Home
            </button>
            <h1 className="text-5xl md:text-6xl font-['Playfair_Display'] font-bold mb-4 text-[#FFF0F5]">
              Our Full Menu
            </h1>
            <p className="text-[#FFF0F5]/75 text-lg max-w-2xl mx-auto font-['Inter']">
              Discover our carefully curated selection of artisanal coffees, signature drinks, and fresh pastries.
            </p>
          </motion.div>

          {/* Search Bar & Sort Dropdown Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search coffee or snacks..."
                value={searchQuery}
                onChange={(e) => updateQueryParams('search', e.target.value)}
                className="w-full bg-[#392431]/80 border border-[#5C354C] text-[#FFF0F5] placeholder-[#FFF0F5]/40 rounded-full py-3.5 px-6 pl-12 focus:outline-none focus:border-[#E0B0FF] transition-all font-['Inter'] shadow-lg text-sm"
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#FFF0F5]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort Select Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={sortOption}
                onChange={(e) => updateQueryParams('sort', e.target.value)}
                className="w-full sm:w-auto bg-[#392431] border border-[#5C354C] text-[#FFF0F5] rounded-full py-3.5 px-6 pr-10 focus:outline-none focus:border-[#E0B0FF] transition-all font-['Inter'] text-sm font-semibold cursor-pointer appearance-none shadow-lg"
              >
                <option value="default">Sort by: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated ⭐</option>
                <option value="newest">Newest First ✨</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#FFF0F5]/50">▼</span>
            </div>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-3 mb-10 pb-4 scrollbar-hide justify-start lg:justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateQueryParams('category', category)}
              className={`relative px-6 py-2.5 rounded-full whitespace-nowrap font-['Inter'] text-sm font-semibold transition-all ${
                activeCategory === category 
                  ? 'text-white bg-[#E63E8C] shadow-md shadow-[#E63E8C]/30 scale-105' 
                  : 'text-[#FFF0F5]/70 hover:text-[#E0B0FF] bg-[#392431]/60 border border-[#5C354C]/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || activeCategory !== 'All' || sortOption !== 'default') && (
          <div className="mb-6 flex justify-between items-center bg-[#392431]/50 px-5 py-2.5 rounded-2xl border border-[#5C354C]/50 font-['Inter'] text-xs text-[#FFF0F5]/70">
            <span>
              Showing <strong>{filteredAndSortedItems.length}</strong> items
              {activeCategory !== 'All' && <span> in <strong>{activeCategory}</strong></span>}
              {searchQuery && <span> matching &quot;<strong>{searchQuery}</strong>&quot;</span>}
            </span>
            <button
              onClick={() => router.replace(pathname)}
              className="text-[#E63E8C] font-bold hover:underline"
            >
              Clear All Filters ✕
            </button>
          </div>
        )}

        {/* Product Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Badges */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
                  {(item.is_new || item.isNew) && (
                    <span className="bg-[#E63E8C] text-white text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-lg border border-[#2A1B24]">
                      NEW
                    </span>
                  )}
                  {(item.is_popular || item.isPopular) && (
                    <span className="bg-[#C93375] text-white text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full shadow-lg border border-[#2A1B24]">
                      POPULAR
                    </span>
                  )}
                </div>
                <ProductCard 
                  product={item} 
                  index={index} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedItems.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#392431]/40 rounded-3xl border border-[#5C354C]/50 max-w-lg mx-auto"
          >
            <span className="text-6xl mb-4 block" role="img" aria-label="search">🔍</span>
            <h3 className="text-2xl font-['Playfair_Display'] text-[#FFF0F5] mb-2">No items found</h3>
            <p className="text-[#FFF0F5]/60 font-['Inter'] mb-4">Try adjusting your search query, category filter, or sort order.</p>
            <button
              onClick={() => router.replace(pathname)}
              className="px-6 py-2.5 bg-[#E63E8C] text-white rounded-full font-bold font-['Inter'] text-xs shadow-md"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#2A1B24] pt-28 text-center text-[#FFF0F5] font-['Inter'] text-sm">Loading Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
