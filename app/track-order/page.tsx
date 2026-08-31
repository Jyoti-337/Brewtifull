'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('lastOrder');
    if (data) {
      setOrder(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (!order) return;

    // Simulation timings based on order type
    let timings = [];
    if (order.orderType === 'dine_in') {
      timings = [0, 8000, 25000];
    } else if (order.orderType === 'take_away') {
      timings = [0, 8000, 40000];
    } else { // delivery
      timings = [0, 8000, 50000, 90000];
    }

    const timeouts = timings.map((time, index) => 
      setTimeout(() => setCurrentStep(index), time)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [order]);

  if (!order) return <div className="min-h-screen bg-[#1A0F0A] pt-24 text-center text-[#F5E6D3]">Loading...</div>;

  const steps = {
    dine_in: [
      { key: 'confirmed', label: 'Order Confirmed', desc: 'Received at counter' },
      { key: 'preparing', label: 'Being Prepared', desc: 'Our baristas are crafting your order' },
      { key: 'ready', label: 'Ready at Your Table', desc: 'Enjoy your coffee!' }
    ],
    take_away: [
      { key: 'confirmed', label: 'Order Confirmed', desc: 'Received at counter' },
      { key: 'preparing', label: 'Being Prepared', desc: 'Our baristas are crafting your order' },
      { key: 'ready', label: 'Ready for Pickup', desc: 'Please head to the counter' }
    ],
    delivery: [
      { key: 'confirmed', label: 'Order Confirmed', desc: 'Received at cafe' },
      { key: 'preparing', label: 'Being Prepared', desc: 'Our baristas are crafting your order' },
      { key: 'transit', label: 'Out for Delivery', desc: 'Runner is on the way' },
      { key: 'delivered', label: 'Delivered', desc: 'Enjoy your coffee!' }
    ]
  };

  const timelineSteps = steps[order.orderType as keyof typeof steps] || steps.take_away;

  return (
    <div className="min-h-screen bg-[#1A0F0A] pt-24 pb-20 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-['Playfair_Display'] font-bold text-[#F5E6D3] mb-8 text-center">Track Order</h1>

        {/* Timeline */}
        <div className="bg-[#3D2820]/80 border border-[#5A4034] rounded-2xl p-8 mb-8 backdrop-blur shadow-2xl relative">
          <div className="absolute left-[44px] top-12 bottom-12 w-0.5 bg-[#1A0F0A]" /> {/* Background Line */}
          
          <div className="space-y-12 relative z-10">
            {timelineSteps.map((step, idx) => {
              const isCompleted = currentStep > idx;
              const isActive = currentStep === idx;
              
              return (
                <div key={step.key} className="flex gap-6 relative">
                  {/* Circle Indicator */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-4 relative z-10 ${
                    isCompleted ? 'bg-[#4F9C8F] border-[#4F9C8F] text-white' : 
                    isActive ? 'bg-[#4F9C8F] border-[#1A0F0A] text-[#1A0F0A]' : 
                    'bg-[#2D1810] border-[#1A0F0A]'
                  }`}>
                    {isCompleted && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    {isActive && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-[#4F9C8F] rounded-full z-0"
                      />
                    )}
                  </div>
                  
                  {/* Colored Line Overlay per step */}
                  {idx < timelineSteps.length - 1 && (
                     <div className={`absolute left-3.5 top-8 w-1 -ml-[1px] transition-all duration-1000 origin-top ${
                        isCompleted ? 'bg-[#4F9C8F] h-[calc(100%+16px)] scale-y-100' : 'bg-transparent h-0 scale-y-0'
                     }`} />
                  )}

                  {/* Text Content */}
                  <div className={`flex-1 transition-colors ${isActive || isCompleted ? 'text-[#F5E6D3]' : 'text-[#C9B8A0]'}`}>
                    <h4 className="font-bold text-lg leading-none mb-1 mt-1">{step.label}</h4>
                    <p className="text-sm opacity-80">{step.desc}</p>
                    {(isActive || isCompleted) && (
                      <span className="text-xs absolute right-0 top-1 text-[#4F9C8F] font-mono">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#2D1810] border border-[#5A4034] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#5A4034]">
            <div>
              <p className="text-[#C9B8A0] text-sm mb-1">Order Number</p>
              <h3 className="font-bold text-[#F5E6D3] text-xl">{order.orderNumber}</h3>
            </div>
            <div className="text-right">
              <span className="bg-[#4F9C8F]/20 text-[#4F9C8F] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider block mb-2 border border-[#4F9C8F]">
                {order.orderType?.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {order.items.map((item: any) => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between text-[#C9B8A0] text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#5A4034]">
            <span className="text-[#C9B8A0]">Total Amount</span>
            <span className="text-2xl font-bold text-[#F5E6D3]">₹{order.grandTotal.toFixed(2)}</span>
          </div>

          <button onClick={() => alert("WhatsApp Support Opening...")} className="w-full mt-6 py-3 border border-[#4F9C8F] text-[#4F9C8F] rounded-xl font-bold hover:bg-[#4F9C8F] hover:text-[#1A0F0A] transition-colors flex items-center justify-center gap-2">
            <span>💬</span> Need Help?
          </button>
        </div>

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1A0F0A]" />}>
      <TrackOrderContent />
    </Suspense>
  );
}
