'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface ReviewsModalProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewsModal({ productId, productName, isOpen, onClose }: ReviewsModalProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchReviews();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setErrorMsg('Please sign in to leave a review.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccessMsg('Review posted successfully!');
      setComment('');
      fetchReviews();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#392431] border border-[#5C354C] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl text-[#FFF0F5] relative max-h-[85vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#FFF0F5]/60 hover:text-white text-xl font-bold font-['Inter']"
          >
            ✕
          </button>

          <span className="text-[#E0B0FF] text-xs font-semibold uppercase tracking-wider font-['Inter']">Ratings & Feedback</span>
          <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#FFF0F5] mb-4">{productName}</h3>

          {/* Leave a Review Form */}
          <div className="bg-[#2A1B24]/70 p-4 rounded-2xl border border-[#5C354C] mb-6">
            <h4 className="text-sm font-semibold font-['Inter'] text-[#FFF0F5] mb-3">Write a Customer Review</h4>

            {errorMsg && <p className="text-red-400 text-xs mb-3 font-['Inter']">⚠️ {errorMsg}</p>}
            {successMsg && <p className="text-emerald-400 text-xs mb-3 font-['Inter']">✓ {successMsg}</p>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#FFF0F5]/70 mb-1 font-['Inter']">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-xl transition-transform ${rating >= star ? 'scale-110 text-amber-400' : 'text-gray-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#FFF0F5]/70 mb-1 font-['Inter']">Your Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your taste experience..."
                  required
                  rows={2}
                  className="w-full bg-[#392431] border border-[#5C354C] text-[#FFF0F5] focus:border-[#E0B0FF] text-xs rounded-xl p-3 outline-none font-['Inter']"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-gradient-to-r from-[#E63E8C] to-[#C93375] text-white rounded-full font-bold font-['Inter'] text-xs shadow-md shadow-[#E63E8C]/20 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Existing Reviews List */}
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFF0F5]/70 mb-3 font-['Inter']">Verified Reviews ({reviews.length})</h4>
          {loading ? (
            <p className="text-xs text-[#FFF0F5]/50 font-['Inter'] py-4">Loading feedback...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-[#FFF0F5]/50 font-['Inter'] py-4">No reviews yet for this item.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-[#2A1B24]/50 p-3 rounded-xl border border-[#5C354C]/50 text-xs font-['Inter']">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#FFF0F5]">{rev.user?.name || 'Customer'}</span>
                    <span className="text-amber-400">{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p className="text-[#FFF0F5]/70 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
