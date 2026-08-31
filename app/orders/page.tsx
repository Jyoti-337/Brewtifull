'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Cancel Modal State
  const [cancellingOrder, setCancellingOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
      setOrders(data.orders || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/orders&message=Please%20log%20in%20to%20view%20your%20orders');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const handleCancelSubmit = async () => {
    if (!cancellingOrder) return;
    setCancelLoading(true);
    setCancelError('');

    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cancellingOrder.id,
          reason: cancelReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');

      setOrders(orders.map(o => o.id === cancellingOrder.id ? { ...o, status: 'CANCELLED', cancellation_reason: cancelReason || 'Cancelled by customer' } : o));
      setCancellingOrder(null);
      setCancelReason('');
    } catch (err: any) {
      setCancelError(err.message || 'Error cancelling order');
    } finally {
      setCancelLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CONFIRMED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    PREPARING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    OUT_FOR_DELIVERY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    DELIVERED: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#2A1B24] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E63E8C]/30 border-t-[#E63E8C] rounded-full animate-spin" />
          <p className="text-[#FFF0F5]/70 font-['Inter'] text-sm">Loading Order History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-[#FFF0F5]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">My Orders</h1>
            <p className="text-xs text-[#FFF0F5]/70 font-['Inter']">Track your freshly brewed coffee orders</p>
          </div>
          <button
            onClick={() => router.push('/menu')}
            className="px-4 py-2 bg-[#392431] hover:bg-[#4A2B3D] border border-[#5C354C] rounded-full text-xs font-semibold font-['Inter'] transition-colors"
          >
            Order New Coffee +
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-['Inter']">
            ⚠️ {errorMsg}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[#392431]/40 rounded-3xl border border-[#5C354C]/50">
            <span className="text-5xl mb-3 block">☕</span>
            <h3 className="text-xl font-['Playfair_Display'] text-[#FFF0F5] mb-2">No orders placed yet</h3>
            <p className="text-xs text-[#FFF0F5]/60 font-['Inter'] mb-6">Explore our menu and place your first order!</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-xs shadow-lg shadow-[#E63E8C]/20"
            >
              Browse Menu →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#392431] border border-[#5C354C] rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#5C354C]/50 pb-4 mb-4 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-[#E0B0FF] block">#{order.order_number}</span>
                      <p className="text-[11px] text-[#FFF0F5]/50 font-['Inter']">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border font-['Inter'] ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="text-lg font-bold font-['Playfair_Display'] text-[#E63E8C]">
                        ₹{Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Status Visual Progress Bar */}
                  {order.status === 'CANCELLED' ? (
                    <div className="my-4 p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-center text-xs text-red-300 font-['Inter'] font-semibold">
                      🚫 Order Cancelled {order.cancellation_reason ? `(${order.cancellation_reason})` : ''}
                    </div>
                  ) : (
                    <div className="my-5 bg-[#2A1B24]/70 p-4 rounded-2xl border border-[#5C354C]/60">
                      <p className="text-[11px] font-bold text-[#E0B0FF] uppercase tracking-wider mb-3 font-['Inter']">Order Progress</p>
                      {(() => {
                        const steps = [
                          { label: 'Placed', icon: '📝' },
                          { label: 'Confirmed', icon: '✓' },
                          { label: 'Preparing', icon: '☕' },
                          { label: 'Out for Delivery', icon: '🛵' },
                          { label: 'Delivered', icon: '🎉' },
                        ];
                        const getStepIndex = (status: string) => {
                          switch (status) {
                            case 'PENDING': return 0;
                            case 'CONFIRMED':
                            case 'PAID': return 1;
                            case 'PREPARING': return 2;
                            case 'OUT_FOR_DELIVERY': return 3;
                            case 'DELIVERED':
                            case 'COMPLETED': return 4;
                            default: return 0;
                          }
                        };
                        const activeIndex = getStepIndex(order.status);
                        return (
                          <div className="relative flex justify-between items-center">
                            <div className="absolute top-4 left-4 right-4 h-1 bg-[#5C354C] -z-0 rounded" />
                            <div
                              className="absolute top-4 left-4 h-1 bg-gradient-to-r from-[#E63E8C] to-[#E0B0FF] transition-all duration-500 -z-0 rounded"
                              style={{
                                width: `${(activeIndex / (steps.length - 1)) * 100}%`,
                              }}
                            />

                            {steps.map((st, idx) => {
                              const isCompleted = idx <= activeIndex;
                              const isCurrent = idx === activeIndex;
                              return (
                                <div key={st.label} className="relative z-10 flex flex-col items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                      isCurrent
                                        ? 'bg-[#E63E8C] text-white ring-4 ring-[#E63E8C]/30 scale-110'
                                        : isCompleted
                                        ? 'bg-[#5C354C] text-[#E0B0FF] border border-[#E0B0FF]/40'
                                        : 'bg-[#2A1B24] text-white/30 border border-[#5C354C]'
                                    }`}
                                  >
                                    {st.icon}
                                  </div>
                                  <span
                                    className={`text-[10px] mt-2 font-['Inter'] font-semibold text-center ${
                                      isCurrent
                                        ? 'text-[#E63E8C]'
                                        : isCompleted
                                        ? 'text-[#FFF0F5]'
                                        : 'text-[#FFF0F5]/40'
                                    }`}
                                  >
                                    {st.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="py-4 space-y-3 border-b border-[#5C354C]/50">
                    {order.order_items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-['Inter']">
                        <div className="flex items-center gap-3">
                          {item.product?.image_url && (
                            <img src={item.product.image_url} alt={item.product.name} className="w-10 h-10 object-cover rounded-xl border border-[#5C354C]" />
                          )}
                          <div>
                            <p className="font-semibold text-[#FFF0F5]">{item.product?.name || 'Coffee Item'}</p>
                            <p className="text-[#FFF0F5]/50 text-[10px]">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-[#FFF0F5]/80 font-semibold">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-between sm:items-center text-xs font-['Inter'] text-[#FFF0F5]/70 gap-2">
                    <div className="flex gap-4 items-center flex-wrap">
                      <span>Type: <strong className="text-[#FFF0F5] uppercase">{order.order_type?.replace('_', ' ')}</strong></span>
                      <span>•</span>
                      <span>Payment: <strong className="text-[#E0B0FF]">{order.payment_method === 'COD' ? '💵 Cash on Delivery' : '💳 Online (Stripe)'}</strong></span>
                      {order.discount_amount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">Saved ₹{order.discount_amount.toFixed(2)} ({order.coupon_code})</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {canCancel && (
                        <button
                          onClick={() => {
                            setCancellingOrder(order);
                            setCancelError('');
                            setCancelReason('');
                          }}
                          className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-full font-bold text-[11px] transition-all"
                        >
                          Cancel Order
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/menu`)}
                        className="text-[#E63E8C] font-semibold hover:underline"
                      >
                        Order Again →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#392431] border border-[#5C354C] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl font-['Inter']"
            >
              <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">⚠️</span>
                <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#FFF0F5] mb-2">Cancel Order?</h3>
                <p className="text-xs text-[#FFF0F5]/70">
                  Are you sure you want to cancel order <strong className="text-[#E0B0FF] font-mono">#{cancellingOrder.order_number}</strong>? This action cannot be undone.
                </p>
              </div>

              {cancelError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs font-['Inter']">
                  ⚠️ {cancelError}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5">Reason for cancellation (optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ordered by mistake, change of plans..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] placeholder-[#FFF0F5]/40 text-xs rounded-xl p-3 focus:outline-none focus:border-[#E63E8C]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="flex-1 py-2.5 bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] rounded-xl font-bold text-xs hover:bg-[#2A1B24]/80 transition-all"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubmit}
                  disabled={cancelLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/30 hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
