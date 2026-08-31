'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!session) {
      router.push('/login?callbackUrl=/checkout&message=Please%20log%20in%20to%20place%20your%20order');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#2A1B24] shadow-2xl border-l border-[#5C354C] z-[70] flex flex-col font-['Inter']"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#5C354C] flex items-center justify-between bg-[#392431]/40">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">Your Order</h2>
                {totalItems > 0 && (
                  <span className="bg-[#E0B0FF]/20 text-[#E0B0FF] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E0B0FF]/30">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-[#FFF0F5]/70 hover:text-[#E0B0FF] transition-colors p-2 text-xl rounded-lg hover:bg-[#392431]"
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <span className="text-6xl" role="img" aria-label="coffee">☕</span>
                  <p className="text-xl font-['Playfair_Display'] text-[#FFF0F5]">Your cart is empty</p>
                  <p className="text-sm text-[#FFF0F5]/60 max-w-xs">Looks like you haven't added any fresh brew or treats yet.</p>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push('/menu');
                    }}
                    className="mt-4 px-6 py-2.5 border-2 border-[#E63E8C] text-[#E63E8C] font-semibold rounded-full hover:bg-[#E63E8C] hover:text-white transition-all shadow-md shadow-[#E63E8C]/10"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.size || 'default'}`} className="flex gap-4 p-4 bg-[#392431]/70 rounded-2xl border border-[#5C354C]/60 hover:border-[#E0B0FF]/40 transition-colors">
                    <div className="w-20 h-20 bg-[#2A1B24] rounded-xl overflow-hidden shrink-0 border border-[#5C354C]/40">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-[#FFF0F5] text-base">{item.name}</h3>
                          {item.size && <p className="text-xs text-[#FFF0F5]/60 mt-0.5">{item.size}</p>}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id, item.size)}
                          className="text-[#FFF0F5]/40 hover:text-red-400 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-end mt-3">
                        <div className="flex items-center gap-3 bg-[#2A1B24] rounded-full px-3 py-1 border border-[#5C354C]">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                            className="text-[#FFF0F5]/70 hover:text-[#E0B0FF] w-5 h-5 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="text-[#FFF0F5] text-sm font-semibold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                            className="text-[#FFF0F5]/70 hover:text-[#E0B0FF] w-5 h-5 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-bold text-[#E63E8C] text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#5C354C] bg-[#392431]/80 sticky bottom-0 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6 text-[#FFF0F5]">
                  <span className="text-lg font-semibold">Subtotal</span>
                  <span className="text-2xl font-bold font-['Inter'] text-[#E63E8C]">₹{totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleCheckoutClick}
                  className="w-full py-4 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#E63E8C]/40 transition-all font-['Inter'] flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <span>→</span>
                </button>
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[#FFF0F5]/60 hover:text-[#FFF0F5] transition-colors text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
