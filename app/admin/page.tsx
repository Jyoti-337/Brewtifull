'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'coupons'>('orders');

  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Coupon State
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '0',
    max_uses: '1000',
    expires_at: '',
  });
  const [couponFormError, setCouponFormError] = useState('');
  const [couponFormSubmitting, setCouponFormSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (res.ok) setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'ADMIN' && role !== 'admin') {
        router.push('/');
      } else {
        fetchOrders();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) {
      fetchAnalytics();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'CANCELLED') {
        const reason = prompt('Enter reason for admin cancellation (optional):') || 'Cancelled by admin';
        const res = await fetch('/api/orders/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id, reason }),
        });
        if (res.ok) {
          setOrders(orders.map(o => o.id === id ? { ...o, status: 'CANCELLED', cancellation_reason: reason } : o));
          return;
        }
      }

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const toggleCouponActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      if (res.ok) {
        setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentActive } : c));
      }
    } catch (err) {
      console.error('Error toggling coupon', err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFormError('');
    setCouponFormSubmitting(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCoupon.code,
          discount_type: newCoupon.discount_type,
          discount_value: parseFloat(newCoupon.discount_value),
          min_order_value: parseFloat(newCoupon.min_order_value || '0'),
          max_uses: parseInt(newCoupon.max_uses || '1000'),
          expires_at: newCoupon.expires_at || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

      setCoupons([data.coupon, ...coupons]);
      setShowCreateCouponModal(false);
      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_value: '0',
        max_uses: '1000',
        expires_at: '',
      });
    } catch (err: any) {
      setCouponFormError(err.message || 'Error creating coupon');
    } finally {
      setCouponFormSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#2A1B24] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E63E8C]/30 border-t-[#E63E8C] rounded-full animate-spin" />
          <p className="text-[#FFF0F5]/70 font-['Inter'] text-sm">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'All') return true;
    if (filter === 'Paid') return o.status === 'PAID';
    if (filter === 'Pending') return o.status === 'PENDING';
    if (filter === 'COD') return o.payment_method === 'COD';
    return o.order_type === filter.toLowerCase().replace(' ', '_');
  });

  const stats = {
    total: orders.length,
    revenue: orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED' || o.status === 'DELIVERED').reduce((acc, curr) => acc + Number(curr.total || 0), 0),
    pending: orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CONFIRMED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    PREPARING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    OUT_FOR_DELIVERY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    DELIVERED: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-[#FFF0F5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-[#E0B0FF] text-xs font-semibold tracking-wider uppercase font-['Inter']">Management Portal</span>
            <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="bg-[#392431] p-1 rounded-full border border-[#5C354C] flex gap-1 font-['Inter'] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-5 py-2 rounded-full transition-all ${
                  activeTab === 'orders' ? 'bg-[#E63E8C] text-white shadow-md' : 'text-[#FFF0F5]/70 hover:text-white'
                }`}
              >
                📦 Orders
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-5 py-2 rounded-full transition-all ${
                  activeTab === 'analytics' ? 'bg-[#E63E8C] text-white shadow-md' : 'text-[#FFF0F5]/70 hover:text-white'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setActiveTab('coupons')}
                className={`px-5 py-2 rounded-full transition-all ${
                  activeTab === 'coupons' ? 'bg-[#E63E8C] text-white shadow-md' : 'text-[#FFF0F5]/70 hover:text-white'
                }`}
              >
                🏷️ Coupons
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-['Inter']">
            ⚠️ {error}
          </div>
        )}

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <>
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#392431] p-6 rounded-3xl border border-[#5C354C] shadow-xl">
                <span className="text-xs text-[#FFF0F5]/60 font-['Inter'] block mb-1">Total Orders</span>
                <span className="text-3xl font-bold font-['Playfair_Display'] text-[#FFF0F5]">{stats.total}</span>
              </div>
              <div className="bg-[#392431] p-6 rounded-3xl border border-[#5C354C] shadow-xl">
                <span className="text-xs text-[#FFF0F5]/60 font-['Inter'] block mb-1">Total Revenue</span>
                <span className="text-3xl font-bold font-['Playfair_Display'] text-[#E63E8C]">₹{stats.revenue.toFixed(2)}</span>
              </div>
              <div className="bg-[#392431] p-6 rounded-3xl border border-[#5C354C] shadow-xl">
                <span className="text-xs text-[#FFF0F5]/60 font-['Inter'] block mb-1">Active / Pending</span>
                <span className="text-3xl font-bold font-['Playfair_Display'] text-[#E0B0FF]">{stats.pending}</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6 font-['Inter'] text-xs">
              {['All', 'Paid', 'Pending', 'COD', 'Dine In', 'Take Away', 'Delivery'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    filter === f
                      ? 'bg-[#E0B0FF]/20 border-[#E0B0FF] text-[#E0B0FF] font-semibold'
                      : 'bg-[#392431]/60 border-[#5C354C] text-[#FFF0F5]/70 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-[#392431] border border-[#5C354C] rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-['Inter'] text-xs">
                  <thead>
                    <tr className="bg-[#2A1B24] border-b border-[#5C354C] text-[#FFF0F5]/60 uppercase tracking-wider font-semibold">
                      <th className="p-4">Order #</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#5C354C]/50">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#FFF0F5]/50">
                          No orders match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#2A1B24]/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#E0B0FF]">{order.order_number}</td>
                          <td className="p-4">
                            <p className="font-semibold text-[#FFF0F5]">{order.customer_name}</p>
                            <p className="text-[10px] text-[#FFF0F5]/60">{order.customer_phone}</p>
                          </td>
                          <td className="p-4">
                            <span className="bg-[#2A1B24] px-2.5 py-1 rounded-full border border-[#5C354C] text-[10px] uppercase font-semibold">
                              {order.order_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <ul className="space-y-1">
                              {order.order_items?.map((item: any) => (
                                <li key={item.id} className="truncate text-[#FFF0F5]/80">
                                  {item.quantity}x {item.product?.name || 'Item'}
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="p-4 font-bold text-[#E63E8C]">₹{Number(order.total).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              order.payment_method === 'COD' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#E0B0FF]"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PAID">PAID</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 font-['Inter']">
            {analyticsLoading || !analytics ? (
              <div className="py-20 text-center text-[#FFF0F5]/70">
                <div className="w-8 h-8 border-4 border-[#E63E8C]/30 border-t-[#E63E8C] rounded-full animate-spin mx-auto mb-3" />
                Loading Analytics Data...
              </div>
            ) : (
              <>
                {/* 1. Revenue Trend Chart */}
                <div className="bg-[#392431] p-6 rounded-3xl border border-[#5C354C] shadow-xl">
                  <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-1">30-Day Revenue Trend</h3>
                  <p className="text-xs text-[#FFF0F5]/60 mb-6">Daily sales over the past month</p>
                  
                  <div className="h-64 w-full flex items-end justify-between gap-1 pt-8 px-2 bg-[#2A1B24]/60 rounded-2xl border border-[#5C354C]/50 relative">
                    {analytics.dailyRevenue.map((d: any, idx: number) => {
                      const maxRev = Math.max(...analytics.dailyRevenue.map((item: any) => item.revenue), 100);
                      const heightPct = Math.max(8, Math.round((d.revenue / maxRev) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                          <div className="absolute -top-8 bg-[#392431] text-[#E0B0FF] text-[9px] font-bold px-2 py-0.5 rounded border border-[#5C354C] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                            ₹{d.revenue.toFixed(0)} ({d.orders} orders)
                          </div>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-gradient-to-t from-[#E63E8C] to-[#E0B0FF] rounded-t-sm group-hover:brightness-125 transition-all"
                          />
                          <span className="text-[8px] text-[#FFF0F5]/40 truncate w-full text-center">{d.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 2. Top 5 Best-Selling Products */}
                  <div className="bg-[#392431] p-6 rounded-3xl border border-[#5C354C] shadow-xl">
                    <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-1">Top 5 Best Sellers</h3>
                    <p className="text-xs text-[#FFF0F5]/60 mb-6">Highest ordered items by quantity</p>

                    <div className="space-y-4">
                      {analytics.topProducts.length === 0 ? (
                        <p className="text-xs text-[#FFF0F5]/50 py-4">No order items recorded yet.</p>
                      ) : (
                        analytics.topProducts.map((p: any, idx: number) => {
                          const maxQty = Math.max(...analytics.topProducts.map((tp: any) => tp.quantity), 1);
                          const widthPct = Math.round((p.quantity / maxQty) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[#FFF0F5]">{idx + 1}. {p.name}</span>
                                <span className="text-[#E0B0FF]">{p.quantity} sold (₹{p.revenue.toFixed(2)})</span>
                              </div>
                              <div className="w-full bg-[#2A1B24] h-3 rounded-full overflow-hidden border border-[#5C354C]">
                                <div
                                  style={{ width: `${widthPct}%` }}
                                  className="bg-gradient-to-r from-[#E63E8C] to-[#E0B0FF] h-full rounded-full transition-all duration-500"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* 3. Orders by Status Breakdown */}
                  <div className="bg-[#392431] p-6 rounded-3xl border border-[#5C354C] shadow-xl">
                    <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-1">Order Status Breakdown</h3>
                    <p className="text-xs text-[#FFF0F5]/60 mb-6">Volume of orders per status step</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {analytics.ordersByStatus.map((st: any) => (
                        <div key={st.status} className="bg-[#2A1B24]/80 p-4 rounded-2xl border border-[#5C354C] text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusColors[st.status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {st.status.replace('_', ' ')}
                          </span>
                          <p className="text-2xl font-bold font-['Playfair_Display'] text-[#FFF0F5] mt-2">{st.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 font-['Inter']">
            <div className="flex justify-between items-center bg-[#392431] p-6 rounded-3xl border border-[#5C354C]">
              <div>
                <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">Promo Codes & Coupons</h3>
                <p className="text-xs text-[#FFF0F5]/60">Create discounts, set min order thresholds, and monitor redemption limits</p>
              </div>
              <button
                onClick={() => setShowCreateCouponModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full text-xs font-bold shadow-lg shadow-[#E63E8C]/30 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>+</span> Create New Coupon
              </button>
            </div>

            {/* Coupons List */}
            <div className="bg-[#392431] border border-[#5C354C] rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#2A1B24] border-b border-[#5C354C] text-[#FFF0F5]/60 uppercase tracking-wider font-semibold">
                      <th className="p-4">Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Min Order</th>
                      <th className="p-4">Usage Count</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Expires</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#5C354C]/50">
                    {couponsLoading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#FFF0F5]/50">
                          Loading promo codes...
                        </td>
                      </tr>
                    ) : coupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#FFF0F5]/50">
                          No coupons found. Create your first promo code above!
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-[#2A1B24]/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#E0B0FF] text-sm">{coupon.code}</td>
                          <td className="p-4 font-semibold text-[#E63E8C]">
                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value.toFixed(2)} OFF`}
                          </td>
                          <td className="p-4 text-[#FFF0F5]/80">₹{coupon.min_order_value.toFixed(2)}</td>
                          <td className="p-4">
                            <span className="bg-[#2A1B24] px-2.5 py-1 rounded-full border border-[#5C354C] font-semibold text-[#FFF0F5]">
                              {coupon.times_used} / {coupon.max_uses}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                              coupon.is_active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {coupon.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td className="p-4 text-[#FFF0F5]/60">
                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleCouponActive(coupon.id, coupon.is_active)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                coupon.is_active
                                  ? 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              }`}
                            >
                              {coupon.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Coupon Modal */}
            <AnimatePresence>
              {showCreateCouponModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[#392431] border border-[#5C354C] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-6 border-b border-[#5C354C] pb-4">
                      <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#FFF0F5]">Create New Promo Code</h3>
                      <button
                        onClick={() => setShowCreateCouponModal(false)}
                        className="text-[#FFF0F5]/60 hover:text-white text-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {couponFormError && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs font-['Inter']">
                        ⚠️ {couponFormError}
                      </div>
                    )}

                    <form onSubmit={handleCreateCoupon} className="space-y-4 font-['Inter'] text-xs">
                      <div>
                        <label className="block text-[#FFF0F5]/80 font-semibold mb-1">Coupon Code</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SUMMER25"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                          className="w-full bg-[#2A1B24] border border-[#5C354C] rounded-xl px-3.5 py-2 text-[#FFF0F5] uppercase font-mono focus:outline-none focus:border-[#E63E8C]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#FFF0F5]/80 font-semibold mb-1">Type</label>
                          <select
                            value={newCoupon.discount_type}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                            className="w-full bg-[#2A1B24] border border-[#5C354C] rounded-xl px-3 py-2 text-[#FFF0F5] focus:outline-none focus:border-[#E63E8C]"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed_amount">Fixed Amount (₹)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#FFF0F5]/80 font-semibold mb-1">Discount Value</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="e.g. 15 or 50"
                            value={newCoupon.discount_value}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                            className="w-full bg-[#2A1B24] border border-[#5C354C] rounded-xl px-3.5 py-2 text-[#FFF0F5] focus:outline-none focus:border-[#E63E8C]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#FFF0F5]/80 font-semibold mb-1">Min Order Value (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={newCoupon.min_order_value}
                            onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: e.target.value })}
                            className="w-full bg-[#2A1B24] border border-[#5C354C] rounded-xl px-3.5 py-2 text-[#FFF0F5] focus:outline-none focus:border-[#E63E8C]"
                          />
                        </div>

                        <div>
                          <label className="block text-[#FFF0F5]/80 font-semibold mb-1">Max Uses</label>
                          <input
                            type="number"
                            placeholder="1000"
                            value={newCoupon.max_uses}
                            onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })}
                            className="w-full bg-[#2A1B24] border border-[#5C354C] rounded-xl px-3.5 py-2 text-[#FFF0F5] focus:outline-none focus:border-[#E63E8C]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#FFF0F5]/80 font-semibold mb-1">Expiration Date (Optional)</label>
                        <input
                          type="date"
                          value={newCoupon.expires_at}
                          onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                          className="w-full bg-[#2A1B24] border border-[#5C354C] rounded-xl px-3.5 py-2 text-[#FFF0F5] focus:outline-none focus:border-[#E63E8C]"
                        />
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-[#5C354C]">
                        <button
                          type="button"
                          onClick={() => setShowCreateCouponModal(false)}
                          className="flex-1 py-2.5 bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] rounded-xl font-bold hover:bg-[#2A1B24]/80 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={couponFormSubmitting}
                          className="flex-1 py-2.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-xl font-bold shadow-md shadow-[#E63E8C]/20 hover:opacity-95 disabled:opacity-50 transition-all"
                        >
                          {couponFormSubmitting ? 'Creating...' : 'Create Coupon'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
