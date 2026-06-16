'use client';
import { useState } from 'react';
import { Star, MessageSquare, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitReview } from './reviews/actions';

interface ReviewModalProps {
  appointmentId: string;
  serviceName: string;
  date: string;
  time: string;
}

export default function ReviewModal({ appointmentId, serviceName, date, time }: ReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('يرجى تحديد التقييم بالنجوم.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitReview(appointmentId, rating, comment);
      setIsOpen(false);
      // Reset state
      setRating(0);
      setComment('');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال التقييم. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-6 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500 hover:to-amber-600 text-amber-400 hover:text-black font-black text-sm tracking-wide transition-all duration-300 border border-amber-500/20 hover:border-transparent hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
      >
        تقييم الخدمة
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Glassmorphic Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950/90 border border-white/10 rounded-3xl p-8 shadow-2xl z-10 text-right font-cairo overflow-hidden"
            >
              {/* Top gradient highlight */}
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-amber-400 via-amber-500 to-amber-600" />
              
              <div className="flex justify-between items-start mb-6">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition-colors border border-white/5 hover:border-white/10"
                >
                  <X size={18} />
                </button>
                <div>
                  <h3 className="text-2xl font-black text-white">تقييم الخدمة</h3>
                  <p className="text-zinc-500 text-sm mt-1">{serviceName} - {date}</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-2xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Stars Selection */}
                <div className="flex flex-col items-center justify-center py-4 bg-black/30 rounded-2xl border border-white/5">
                  <span className="text-sm font-bold text-zinc-400 mb-3">ما هو تقييمك للخدمة؟</span>
                  <div className="flex gap-2.5 direction-ltr">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-zinc-600 hover:scale-125 transition-transform duration-200"
                        >
                          <Star
                            size={36}
                            fill={isActive ? '#fbbf24' : 'transparent'}
                            stroke={isActive ? '#fbbf24' : 'currentColor'}
                            className={`transition-colors duration-200 ${isActive ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 flex items-center justify-end gap-1.5">
                    <span>تعليقك (اختياري)</span>
                    <MessageSquare size={16} className="text-amber-500" />
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="اكتب تجربتك هنا لكي تساعدنا على تحسين خدماتنا..."
                    className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-zinc-600 font-medium text-sm focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/40 transition-all text-right resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <span>إرسال التقييم</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
