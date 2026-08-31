'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addItem } = useCart();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load wishlist');
      setItems(data.items || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/wishlist&message=Please%20log%20in%20to%20view%20your%20wishlist');
    } else if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, router]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setItems(items.filter(item => item.product.id !== productId && item.product_id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove item from wishlist', err);
    }
  };

  const handleMoveToCart = async (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1,
      size: 'Medium',
    });
    // Remove from wishlist after moving to cart
    await handleRemove(product.id);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#2A1B24] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E63E8C]/30 border-t-[#E63E8C] rounded-full animate-spin" />
          <p className="text-[#FFF0F5]/70 font-['Inter'] text-sm">Loading your Wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-[#FFF0F5]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button 
              onClick={() => router.push('/menu')}
              className="text-[#FFF0F5]/70 hover:text-[#E0B0FF] transition-colors mb-2 flex items-center gap-2 font-['Inter'] text-xs"
            >
              <span>←</span> Back to Menu
            </button>
            <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">My Wishlist</h1>
            <p className="text-xs text-[#FFF0F5]/70 font-['Inter']">Your personal collection of saved coffees & artisanal treats</p>
          </div>
          <span className="bg-[#E63E8C]/20 text-[#E63E8C] border border-[#E63E8C]/30 px-4 py-1.5 rounded-full font-bold font-['Inter'] text-xs uppercase tracking-wider">
            {items.length} {items.length === 1 ? 'Item' : 'Items'} Saved
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-['Inter']">
            ⚠️ {errorMsg}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 bg-[#392431]/40 rounded-3xl border border-[#5C354C]/50 max-w-md mx-auto">
            <span className="text-6xl mb-4 block" role="img" aria-label="heart">❤️</span>
            <h3 className="text-2xl font-['Playfair_Display'] text-[#FFF0F5] mb-2">Your wishlist is empty</h3>
            <p className="text-[#FFF0F5]/60 font-['Inter'] text-xs mb-6">Explore our menu and tap the heart icon on your favorite roasts.</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-3 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-xs shadow-lg shadow-[#E63E8C]/30 hover:opacity-95 transition-all"
            >
              Browse Full Menu →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {items.map(({ id, product }) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#392431] border border-[#5C354C] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full bg-[#2A1B24]">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-md text-red-400 hover:text-white rounded-full flex items-center justify-center font-bold text-sm transition-all border border-white/20"
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-3 left-3 bg-[#2A1B24]/80 backdrop-blur-md text-[#E0B0FF] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#5C354C]">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#FFF0F5]">{product.name}</h3>
                        <span className="text-amber-400 text-xs font-semibold font-['Inter']">★ {product.rating || 5.0}</span>
                      </div>
                      <p className="text-xs text-[#FFF0F5]/70 font-['Inter'] line-clamp-2 mb-4">{product.description}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center border-t border-[#5C354C] pt-4 mb-4">
                        <span className="text-xs text-[#FFF0F5]/60 font-['Inter']">Price</span>
                        <span className="text-xl font-bold text-[#E63E8C] font-['Playfair_Display']">₹{product.price.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="w-full py-3 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-xs shadow-md shadow-[#E63E8C]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>🛒</span> Move to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
