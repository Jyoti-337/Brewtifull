'use client';

import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReviewsModal from './ReviewsModal';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    rating: number;
    image?: string;
    image_url?: string;
    features?: string[];
  };
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [isAdded, setIsAdded] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const imageUrl = product.image_url || product.image || '';

  const handleAdd = () => {
    addItem({
      id: product.id || product.name,
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = async () => {
    if (!session) {
      router.push('/login?callbackUrl=/wishlist&message=Please%20log%20in%20to%20save%20items%20to%20your%20wishlist');
      return;
    }
    setWishLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id || product.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsWished(data.wished);
      }
    } catch (err) {
      console.error('Wishlist error', err);
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ scale: 1.03, y: -5 }}
        className="bg-[#392431]/90 backdrop-blur-sm rounded-2xl p-6 border border-[#5C354C] hover:border-[#E0B0FF] transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#E63E8C]/20 flex flex-col justify-between"
      >
        <div>
          {/* Star Rating & Wishlist Heart */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsReviewsOpen(true)}
              className="flex items-center gap-1.5 bg-[#2A1B24]/80 hover:border-[#E0B0FF] px-3 py-1 rounded-full border border-[#5C354C]/50 transition-colors group cursor-pointer"
              title="Click to view & write reviews"
            >
              <span className="text-[#FFD700] text-sm">★</span>
              <span className="text-[#FFF0F5] font-semibold text-xs group-hover:text-[#E0B0FF]">{product.rating || 5.0}</span>
              <span className="text-[10px] text-[#FFF0F5]/50 font-['Inter'] underline ml-1">Reviews</span>
            </button>

            <div className="flex items-center gap-2">
              {product.features && product.features[0] && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E0B0FF]/15 text-[#E0B0FF] border border-[#E0B0FF]/30">
                  {product.features[0]}
                </span>
              )}

              {/* Heart Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                disabled={wishLoading}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all text-xs ${
                  isWished
                    ? 'bg-[#E63E8C] text-white border-[#E63E8C] shadow-md shadow-[#E63E8C]/40 scale-110'
                    : 'bg-[#2A1B24]/80 text-[#FFF0F5]/60 border-[#5C354C] hover:text-[#E63E8C] hover:border-[#E63E8C]/50'
                }`}
                title={isWished ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                {isWished ? '❤️' : '🤍'}
              </button>
            </div>
          </div>

          {/* Coffee Image */}
          <div className="w-full h-52 bg-[#2A1B24] rounded-xl mb-5 overflow-hidden border border-[#5C354C]/40">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Title & Description */}
          <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-2">
            {product.name}
          </h3>
          <p className="text-sm text-[#FFF0F5]/70 mb-5 line-clamp-2 font-['Inter'] leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add Button */}
        <div className="flex items-center justify-between pt-4 border-t border-[#5C354C]/50">
          <div>
            <span className="text-xs text-[#FFF0F5]/60 block font-['Inter']">Price</span>
            <span className="text-2xl font-bold text-[#FFF0F5] font-['Inter']">
              ₹{product.price}
            </span>
          </div>
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAdded 
                ? 'bg-[#E63E8C] shadow-lg shadow-[#E63E8C]/50' 
                : 'bg-gradient-to-br from-[#E63E8C] to-[#C93375] hover:shadow-lg hover:shadow-[#E63E8C]/40'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdded ? (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-white text-xl"
              >
                ✓
              </motion.span>
            ) : (
              <span className="text-white text-2xl font-bold">+</span>
            )}
          </motion.button>
        </div>
      </motion.div>

      <ReviewsModal
        productId={product.id}
        productName={product.name}
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
      />
    </>
  );
}
