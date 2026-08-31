'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ReviewsPage() {
  const { data: session, status } = useSession();

  const [reviews, setReviews] = useState<any[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingPurchased, setLoadingPurchased] = useState(false);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchPurchasedProducts = async () => {
    if (!session) return;
    setLoadingPurchased(true);
    try {
      const res = await fetch('/api/reviews/purchased-products');
      const data = await res.json();
      if (data.products) {
        setPurchasedProducts(data.products);
        if (data.products.length > 0) {
          setSelectedProductId(data.products[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch purchased products', err);
    } finally {
      setLoadingPurchased(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPurchasedProducts();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setErrorMsg('Please log in to submit a review.');
      return;
    }
    if (!selectedProductId) {
      setErrorMsg('Please select a product you have purchased.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post review');
      }

      setSuccessMsg('Thank you! Your review has been published.');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while posting your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen bg-[#2A1B24] text-[#FFF0F5] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="bg-[#E63E8C]/20 border border-[#E63E8C] text-[#E0B0FF] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-['Inter']">
            Customer Feedback & Ratings
          </span>
          <h1 className="text-4xl sm:text-5xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">
            Brew-tiful Reviews
          </h1>
          <p className="text-sm sm:text-base text-[#FFF0F5]/75 font-['Inter'] max-w-xl mx-auto">
            Discover what our community of coffee lovers thinks about our single-origin roasts and espresso brews.
          </p>

          {/* Overall Rating Box */}
          <div className="inline-flex items-center gap-4 bg-[#392431] border border-[#5C354C] px-6 py-3 rounded-full mt-4 shadow-xl">
            <span className="text-2xl font-bold font-['Playfair_Display'] text-[#E63E8C]">{averageRating}</span>
            <div className="text-amber-400 text-lg tracking-wider">
              {'★'.repeat(Math.round(Number(averageRating)))}
            </div>
            <span className="text-xs text-[#FFF0F5]/70 font-['Inter']">Based on {reviews.length} customer reviews</span>
          </div>
        </div>

        {/* Review Submission Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#392431]/90 border border-[#5C354C] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md"
        >
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-2">
            Leave a Review
          </h2>

          {status === 'loading' ? (
            <div className="py-6 text-sm text-[#FFF0F5]/60 animate-pulse font-['Inter']">Checking session details...</div>
          ) : !session ? (
            <div className="bg-[#2A1B24]/70 border border-[#5C354C]/70 rounded-2xl p-6 text-center space-y-3 font-['Inter']">
              <p className="text-sm text-[#FFF0F5]/80">
                🔒 You must be logged in and have a completed order to write a review.
              </p>
              <Link 
                href="/login?callbackUrl=/reviews" 
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold text-xs shadow-md shadow-[#E63E8C]/20 hover:opacity-95 transition-all"
              >
                Log In to Review →
              </Link>
            </div>
          ) : loadingPurchased ? (
            <div className="py-6 text-sm text-[#FFF0F5]/60 animate-pulse font-['Inter']">Loading your orders...</div>
          ) : purchasedProducts.length === 0 ? (
            <div className="bg-[#2A1B24]/70 border border-[#5C354C]/70 rounded-2xl p-6 text-center space-y-3 font-['Inter']">
              <p className="text-sm text-[#FFF0F5]/80">
                ☕ You haven't completed any orders yet! Place an order for any coffee or treat to leave a verified customer review.
              </p>
              <Link 
                href="/menu" 
                className="inline-block px-6 py-2.5 border border-[#E63E8C] text-[#E0B0FF] hover:bg-[#E63E8C] hover:text-white rounded-full font-bold text-xs transition-all"
              >
                Browse Menu & Order →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 font-['Inter'] mt-4">
              {errorMsg && (
                <div className="p-3.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs">
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs">
                  ✓ {successMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2">
                    Select Purchased Product *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl px-4 py-3 text-xs"
                    required
                  >
                    {purchasedProducts.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2">
                    Star Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex gap-2 items-center pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-transform ${rating >= star ? 'scale-110 text-amber-400' : 'text-gray-600 hover:text-amber-200'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#E0B0FF] ml-2">{rating} / 5</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FFF0F5]/80 mb-2">
                  Your Review & Tasting Notes *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the aroma, flavor depth, and your overall experience..."
                  required
                  rows={3}
                  className="w-full bg-[#2A1B24] border border-[#5C354C] text-[#FFF0F5] focus:outline-none focus:border-[#E0B0FF] rounded-xl p-3.5 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold text-xs shadow-lg shadow-[#E63E8C]/20 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting Review...' : 'Submit Verified Review →'}
              </button>
            </form>
          )}
        </motion.div>

        {/* All Reviews Feed */}
        <div className="space-y-6">
          <h2 className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5]">
            All Verified Customer Reviews
          </h2>

          {loadingReviews ? (
            <div className="py-12 text-center text-sm text-[#FFF0F5]/60 animate-pulse font-['Inter']">
              Loading reviews feed...
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-[#392431]/50 border border-[#5C354C] rounded-2xl p-8 text-center text-sm text-[#FFF0F5]/70 font-['Inter']">
              No reviews published yet. Be the first to share your experience!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-['Inter']">
              {reviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#392431]/80 border border-[#5C354C] rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-[#E0B0FF]/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-[#FFF0F5] text-sm">
                          {rev.user?.name || 'Verified Customer'}
                        </h3>
                        {rev.product?.name && (
                          <span className="text-[11px] text-[#E0B0FF] bg-[#E0B0FF]/10 px-2 py-0.5 rounded-full border border-[#E0B0FF]/20 inline-block mt-1">
                            ☕ {rev.product.name}
                          </span>
                        )}
                      </div>
                      <div className="text-amber-400 text-sm font-bold">
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>

                    <p className="text-xs text-[#FFF0F5]/80 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#5C354C]/50 flex justify-between items-center text-[10px] text-[#FFF0F5]/50">
                    <span>Verified Purchase</span>
                    <span>{new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
