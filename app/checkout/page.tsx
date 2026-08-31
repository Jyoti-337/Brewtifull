'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';

type OrderType = 'dine_in' | 'take_away' | 'delivery' | null;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { data: session, status } = useSession();

  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'COD'>('stripe');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    tableNumber: '',
    guests: '1',
    specialRequests: '',
    pickupTime: 'ASAP',
    name: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    pincode: '',
    instructions: ''
  });

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout&message=Please%20log%20in%20to%20place%20your%20order');
    } else if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
      }));
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setValidatingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput, subtotal: totalPrice }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoError(data.error || 'Invalid promo code');
        setAppliedPromo(null);
        setDiscountAmount(0);
      } else {
        setAppliedPromo(data.coupon);
        setDiscountAmount(data.discountAmount);
        setPromoSuccess(`Promo code "${data.coupon.code}" applied! You saved ₹${data.discountAmount.toFixed(2)}`);
      }
    } catch (err) {
      setPromoError('Failed to validate promo code');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCodeInput('');
    setPromoError('');
    setPromoSuccess('');
  };

  const deliveryFee = orderType === 'delivery' ? 49 : 0;
  const taxes = Math.max(0, (totalPrice - discountAmount) * 0.05);
  const grandTotal = Math.max(0, totalPrice - discountAmount + deliveryFee + taxes);

  const validateStep2 = () => {
    if (!formData.name || !formData.phone) {
      setErrorMsg('Name and Phone are required.');
      return false;
    }
    if (orderType === 'dine_in' && !formData.tableNumber) {
      setErrorMsg('Table number is required.');
      return false;
    }
    if (orderType === 'delivery') {
      if (!formData.address1 || !formData.city || !formData.pincode) {
        setErrorMsg('Delivery address, city, and pincode are required.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = (newStep: number) => {
    if (newStep === 3 && !validateStep2()) return;
    paginate(newStep);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        order_type: orderType,
        payment_method: paymentMethod,
        customer_name: formData.name,
        customer_phone: formData.phone,
        items,
        delivery_fee: deliveryFee,
        tax: taxes,
        coupon_code: appliedPromo ? appliedPromo.code : null,
        discount_amount: discountAmount,
        table_number: orderType === 'dine_in' ? parseInt(formData.tableNumber) : null,
        guests: orderType === 'dine_in' ? parseInt(formData.guests) : null,
        pickup_time: orderType === 'take_away' ? formData.pickupTime : null,
        address_line1: orderType === 'delivery' ? formData.address1 : null,
        address_line2: orderType === 'delivery' ? formData.address2 : null,
        city: orderType === 'delivery' ? formData.city : null,
        pincode: orderType === 'delivery' ? formData.pincode : null,
        delivery_instructions: orderType === 'delivery' ? formData.instructions : null,
        special_requests: formData.specialRequests
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process order');
      }

      if (data.payment_method === 'COD' || data.isCod || paymentMethod === 'COD') {
        clearCart();
        router.push(`/order-success?order_id=${data.orderId}&payment_method=COD`);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during checkout');
      setIsLoading(false);
    }
  };

  const [[page, direction], setPage] = useState([1, 0]);

  const paginate = (newStep: number) => {
    setPage([newStep, newStep > step ? 1 : -1]);
    setStep(newStep);
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 flex items-center justify-center px-4">
        <div className="bg-[#392431] border border-[#5C354C] p-8 rounded-3xl text-center max-w-md w-full">
          <span className="text-5xl block mb-4">☕</span>
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-2">Your Cart is Empty</h2>
          <p className="text-[#FFF0F5]/70 font-['Inter'] mb-6 text-sm">Add some of our artisanal coffees to checkout.</p>
          <button
            onClick={() => router.push('/menu')}
            className="px-6 py-3 bg-[#E63E8C] text-white rounded-full font-semibold hover:bg-[#C93375] transition-colors font-['Inter']"
          >
            Explore Menu
          </button>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 600 : -600, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 600 : -600, opacity: 0 })
  };

  const inputClass = "bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl px-4 py-3 w-full transition-colors font-['Inter'] text-sm";

  return (
    <div className="min-h-screen bg-[#2A1B24] pt-28 pb-20 text-[#FFF0F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-2">Checkout</h1>
          <p className="text-[#FFF0F5]/70 text-sm font-['Inter']">Complete your order with secure payment</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {[
            { stepNum: 1, label: 'Order Type' },
            { stepNum: 2, label: 'Details' },
            { stepNum: 3, label: 'Payment' }
          ].map((s, i) => (
            <div key={s.stepNum} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-['Inter'] text-sm transition-all shadow-md ${
                step >= s.stepNum ? 'bg-[#E63E8C] text-white shadow-[#E63E8C]/30' : 'bg-[#392431] text-[#FFF0F5]/50 border border-[#5C354C]'
              }`}>
                {s.stepNum}
              </div>
              <span className={`ml-2 text-xs font-semibold hidden sm:inline ${step >= s.stepNum ? 'text-[#E0B0FF]' : 'text-[#FFF0F5]/50'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`w-12 sm:w-16 h-0.5 mx-3 transition-colors ${
                  step > s.stepNum ? 'bg-[#E63E8C]' : 'bg-[#5C354C]'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#392431]/90 backdrop-blur-md rounded-3xl border border-[#5C354C] shadow-2xl overflow-hidden relative min-h-[480px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            
            {/* STEP 1: Order Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="p-6 sm:p-10 max-w-2xl mx-auto"
              >
                <h2 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-6 text-center">
                  Select Order Type
                </h2>
                
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {[
                    { id: 'dine_in', icon: '🍽️', title: 'Dine In', desc: 'Reserved table at our coffee lounge' },
                    { id: 'take_away', icon: '🥡', title: 'Take Away', desc: 'Freshly prepared for quick pickup' },
                    { id: 'delivery', icon: '🛵', title: 'Home Delivery', desc: 'Delivered hot to your door' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setOrderType(type.id as OrderType)}
                      className={`flex items-center p-5 rounded-2xl border transition-all text-left group ${
                        orderType === type.id 
                          ? 'border-[#E63E8C] bg-[#E63E8C]/15 shadow-lg shadow-[#E63E8C]/10' 
                          : 'border-[#5C354C] hover:border-[#E0B0FF]/50 bg-[#2A1B24]/60'
                      }`}
                    >
                      <span className="text-3xl mr-5">{type.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#FFF0F5] font-['Playfair_Display'] group-hover:text-[#E0B0FF] transition-colors">{type.title}</h3>
                        <p className="text-xs text-[#FFF0F5]/70 font-['Inter']">{type.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        orderType === type.id ? 'border-[#E63E8C]' : 'border-[#5C354C]'
                      }`}>
                        {orderType === type.id && <div className="w-2.5 h-2.5 bg-[#E63E8C] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    disabled={!orderType}
                    onClick={() => paginate(2)}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-[#E63E8C]/20"
                  >
                    Continue to Details →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="p-6 sm:p-10 max-w-2xl mx-auto"
              >
                <h2 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-6 text-center">
                  Customer & Delivery Details
                </h2>

                {errorMsg && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-['Inter']">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div className="space-y-5 mb-8">
                  {/* Common fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClass} placeholder="Jane Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Table Number *</label>
                          <select name="tableNumber" value={formData.tableNumber} onChange={handleInputChange} className={inputClass}>
                            <option value="">Select Table</option>
                            {[...Array(20)].map((_, i) => <option key={i+1} value={i+1}>Table #{i+1}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Guests *</label>
                          <select name="guests" value={formData.guests} onChange={handleInputChange} className={inputClass}>
                            {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Guests</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Special Requests</label>
                        <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} placeholder="Extra hot milk, less sugar, etc." className={inputClass} rows={2} />
                      </div>
                    </>
                  )}

                  {orderType === 'take_away' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Expected Pickup Time *</label>
                        <select name="pickupTime" value={formData.pickupTime} onChange={handleInputChange} className={inputClass}>
                          <option>ASAP (10-15 mins)</option>
                          <option>20-30 mins</option>
                          <option>45 mins</option>
                          <option>1 hour</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Special Requests</label>
                        <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} placeholder="Extra cup sleeve, etc." className={inputClass} rows={2} />
                      </div>
                    </>
                  )}

                  {orderType === 'delivery' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Address Line 1 *</label>
                        <input type="text" name="address1" value={formData.address1} onChange={handleInputChange} className={inputClass} placeholder="Street address or Apt #" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Address Line 2 (Optional)</label>
                        <input type="text" name="address2" value={formData.address2} onChange={handleInputChange} className={inputClass} placeholder="Landmark or building" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">City *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} placeholder="City name" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Zip / Pincode *</label>
                          <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className={inputClass} maxLength={10} placeholder="ZIP code" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-1.5 font-['Inter']">Delivery Instructions</label>
                        <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} placeholder="Ring doorbell, leave at front door, etc." className={inputClass} rows={2} />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => paginate(1)} className="px-6 py-2.5 text-xs text-[#FFF0F5]/70 hover:text-[#FFF0F5] font-['Inter']">
                    ← Back
                  </button>
                  <button onClick={() => handleNextStep(3)} className="px-8 py-3.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-sm shadow-lg shadow-[#E63E8C]/20 hover:opacity-90 transition-all">
                    Review & Pay →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Review & Pay */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="p-6 sm:p-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Summary */}
                  <div>
                    <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#FFF0F5] mb-4 border-b border-[#5C354C] pb-3 flex items-center justify-between">
                      Order Summary
                      <span className="bg-[#E0B0FF]/20 text-[#E0B0FF] px-3 py-1 rounded-full text-xs font-['Inter'] uppercase tracking-wider">
                        {orderType?.replace('_', ' ')}
                      </span>
                    </h3>

                    <div className="space-y-2 mb-4 text-xs font-['Inter'] text-[#FFF0F5]/70 bg-[#2A1B24]/60 p-3.5 rounded-xl border border-[#5C354C]/60">
                      <p><strong className="text-[#FFF0F5]">Customer:</strong> {formData.name} ({formData.phone})</p>
                      {orderType === 'dine_in' && <p><strong className="text-[#FFF0F5]">Location:</strong> Table #{formData.tableNumber} • {formData.guests} Guests</p>}
                      {orderType === 'take_away' && <p><strong className="text-[#FFF0F5]">Pickup:</strong> {formData.pickupTime}</p>}
                      {orderType === 'delivery' && <p><strong className="text-[#FFF0F5]">Delivery:</strong> {formData.address1}, {formData.city} {formData.pincode}</p>}
                    </div>

                    <div className="space-y-3 mb-6 bg-[#2A1B24]/60 rounded-xl p-4 border border-[#5C354C]/60 max-h-48 overflow-y-auto">
                      {items.map(item => (
                        <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-xs font-['Inter']">
                          <div>
                            <span className="font-bold text-[#FFF0F5]">{item.quantity}x</span> {item.name}
                            {item.size && <span className="text-[#FFF0F5]/50"> ({item.size})</span>}
                          </div>
                          <span className="text-[#FFF0F5] font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-xs text-[#FFF0F5]/70 font-['Inter'] pt-2 border-t border-[#5C354C]">
                      <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
                      
                      {/* Promo Code Input Block */}
                      <div className="my-3 bg-[#2A1B24]/80 p-3 rounded-xl border border-[#5C354C]">
                        <label className="block text-[11px] font-semibold text-[#FFF0F5] mb-1.5">Have a promo code?</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. WELCOME10"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                            disabled={!!appliedPromo}
                            className="flex-1 bg-[#392431] border border-[#5C354C] text-[#FFF0F5] placeholder-[#FFF0F5]/40 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#E0B0FF] uppercase"
                          />
                          {appliedPromo ? (
                            <button
                              type="button"
                              onClick={handleRemovePromo}
                              className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-all"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyPromo}
                              disabled={validatingPromo || !promoCodeInput.trim()}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-lg text-xs font-bold hover:opacity-95 disabled:opacity-50 transition-all shadow-md"
                            >
                              {validatingPromo ? '...' : 'Apply'}
                            </button>
                          )}
                        </div>
                        {promoError && <p className="text-red-400 text-[10px] mt-1.5">⚠️ {promoError}</p>}
                        {promoSuccess && <p className="text-emerald-400 text-[10px] mt-1.5">✓ {promoSuccess}</p>}
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Discount ({appliedPromo?.code})</span>
                          <span>-₹{discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Taxes & Fees (5%)</span><span>₹{taxes.toFixed(2)}</span></div>
                      <div className="flex justify-between text-[#FFF0F5] text-lg font-bold pt-3 font-['Inter'] mt-2 border-t border-[#5C354C]">
                        <span>Total Due</span>
                        <span className="text-[#E63E8C]">₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Payment Method Selection */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#FFF0F5] mb-4 border-b border-[#5C354C] pb-3">
                        Select Payment Method
                      </h3>
                      
                      {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm font-['Inter']">
                          ⚠️ {errorMsg}
                        </div>
                      )}

                      <div className="space-y-4 mb-6">
                        {/* Option 1: Stripe */}
                        <div 
                          onClick={() => setPaymentMethod('stripe')}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                            paymentMethod === 'stripe'
                              ? 'bg-[#392431] border-[#E63E8C] shadow-lg shadow-[#E63E8C]/20'
                              : 'bg-[#2A1B24]/60 border-[#5C354C] hover:border-[#5C354C]/80'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="payment_method" 
                            checked={paymentMethod === 'stripe'} 
                            onChange={() => setPaymentMethod('stripe')} 
                            className="mt-1 accent-[#E63E8C]" 
                          />
                          <div className="flex-1 font-['Inter']">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-[#FFF0F5] text-sm">💳 Pay Online (Stripe)</span>
                              <span className="text-[10px] bg-[#E0B0FF]/20 text-[#E0B0FF] px-2 py-0.5 rounded-full border border-[#E0B0FF]/30 uppercase font-semibold">Instant</span>
                            </div>
                            <p className="text-xs text-[#FFF0F5]/70">
                              Secure checkout via Credit Card, Debit Card, or UPI/Wallet via Stripe.
                            </p>
                          </div>
                        </div>

                        {/* Option 2: Cash on Delivery */}
                        <div 
                          onClick={() => setPaymentMethod('COD')}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                            paymentMethod === 'COD'
                              ? 'bg-[#392431] border-[#E63E8C] shadow-lg shadow-[#E63E8C]/20'
                              : 'bg-[#2A1B24]/60 border-[#5C354C] hover:border-[#5C354C]/80'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="payment_method" 
                            checked={paymentMethod === 'COD'} 
                            onChange={() => setPaymentMethod('COD')} 
                            className="mt-1 accent-[#E63E8C]" 
                          />
                          <div className="flex-1 font-['Inter']">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-[#FFF0F5] text-sm">💵 Cash on Delivery (COD)</span>
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase font-semibold">Pay at door</span>
                            </div>
                            <p className="text-xs text-[#FFF0F5]/70">
                              Pay in cash upon arrival or order pickup. Please keep exact change ready.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#5C354C]">
                      <button onClick={() => paginate(2)} className="text-xs text-[#FFF0F5]/70 hover:text-[#FFF0F5] font-['Inter']">
                        ← Edit Details
                      </button>
                      <button 
                        onClick={handleCheckout} 
                        disabled={isLoading} 
                        className="px-8 py-3.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-sm hover:opacity-95 shadow-lg shadow-[#E63E8C]/30 transition-all flex items-center justify-center min-w-[200px] disabled:opacity-50"
                      >
                        {isLoading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                        ) : paymentMethod === 'COD' ? (
                          'Place Cash Order →'
                        ) : (
                          'Pay with Stripe →'
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
