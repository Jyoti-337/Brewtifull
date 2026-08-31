'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) setOrder(data.order);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl w-full bg-[#392431]/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-[#5C354C] shadow-2xl text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-tr from-[#E63E8C] to-[#C93375] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#E63E8C]/30">
        <span className="text-3xl text-white">✓</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-2">
        Order Confirmed!
      </h1>
      <p className="text-[#FFF0F5]/70 font-['Inter'] text-sm mb-6">
        Thank you for choosing Brew-tiful Coffee. Your artisanal brew is being prepared with perfection.
      </p>

      {loading ? (
        <div className="py-6 font-['Inter'] text-sm text-[#FFF0F5]/50">Loading order summary...</div>
      ) : order ? (
        <div className="space-y-4 mb-8">
          {(order.payment_method === 'COD' || searchParams.get('payment_method') === 'COD') && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-2xl p-4 text-left font-['Inter'] text-xs text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-300 text-sm">
                <span>💵</span> Cash Payment on Delivery
              </p>
              <p>
                Your order has been placed. Please keep <strong className="text-white">₹{Number(order.total).toFixed(2)}</strong> ready for cash payment on delivery or pickup.
              </p>
            </div>
          )}

          <div className="bg-[#2A1B24]/70 rounded-2xl p-5 border border-[#5C354C] text-left space-y-3 font-['Inter'] text-xs">
            <div className="flex justify-between border-b border-[#5C354C] pb-2">
              <span className="text-[#FFF0F5]/60">Order Number</span>
              <span className="font-bold text-[#FFF0F5]">{order.order_number}</span>
            </div>
            <div className="flex justify-between border-b border-[#5C354C] pb-2">
              <span className="text-[#FFF0F5]/60">Payment Method</span>
              <span className="font-bold text-[#E0B0FF]">
                {order.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment (Stripe)'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#5C354C] pb-2">
              <span className="text-[#FFF0F5]/60">Payment Status</span>
              <span className={`font-bold uppercase ${order.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#5C354C] pb-2">
              <span className="text-[#FFF0F5]/60">Order Type</span>
              <span className="font-bold text-[#FFF0F5] uppercase">{order.order_type?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#FFF0F5]/60">Grand Total</span>
              <span className="font-bold text-[#E63E8C] text-sm">₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#2A1B24]/70 rounded-2xl p-4 border border-[#5C354C] mb-8 font-['Inter'] text-xs text-[#FFF0F5]/70">
          Order complete. Your confirmation receipt has been sent to your account.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => router.push('/orders')}
          className="px-6 py-3.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-xs shadow-lg shadow-[#E63E8C]/20 hover:opacity-95 transition-all"
        >
          View My Orders →
        </button>
        <button
          onClick={() => router.push('/menu')}
          className="px-6 py-3.5 bg-[#2A1B24] border border-[#5C354C] hover:border-[#E0B0FF] text-[#FFF0F5] rounded-full font-semibold font-['Inter'] text-xs transition-colors"
        >
          Back to Menu
        </button>
      </div>
    </motion.div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 flex items-center justify-center px-4 text-[#FFF0F5]">
      <Suspense fallback={<div className="text-[#FFF0F5] text-sm">Loading order details...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}

