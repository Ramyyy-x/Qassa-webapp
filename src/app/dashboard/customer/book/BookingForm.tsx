'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking, getAvailableSlots } from './actions';
import { Calendar as CalendarIcon, Clock, Scissors, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BookingForm({ services }: { services: any[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (selectedDate && selectedService) {
      setLoadingSlots(true);
      setSelectedTime('');
      getAvailableSlots(selectedDate, selectedService.duration_minutes)
        .then((slots) => setAvailableTimes(slots))
        .catch(console.error)
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, selectedService]);

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError('');
    const res = await createBooking(selectedService.id, selectedDate, selectedTime);
    if (res.success) {
      router.push('/dashboard/customer');
      router.refresh();
    } else {
      setError(res.error || 'حدث خطأ غير متوقع.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8 sm:mb-12 relative z-10 px-2 sm:px-4">
         <div className={`flex flex-col items-center gap-2 sm:gap-3 ${step >= 1 ? 'text-amber-400' : 'text-zinc-600'}`}>
           <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 font-bold text-base sm:text-lg ${step >= 1 ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-zinc-700 bg-zinc-800'}`}>1</div>
           <span className="text-xs sm:text-sm font-bold">الخدمة</span>
         </div>
         <div className={`flex-1 h-0.5 mx-2 sm:mx-4 mt-[-20px] sm:mt-[-24px] rounded-full ${step >= 2 ? 'bg-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-zinc-800'}`} />
         <div className={`flex flex-col items-center gap-2 sm:gap-3 ${step >= 2 ? 'text-amber-400' : 'text-zinc-600'}`}>
           <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 font-bold text-base sm:text-lg ${step >= 2 ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-zinc-700 bg-zinc-800'}`}>2</div>
           <span className="text-xs sm:text-sm font-bold">الموعد</span>
         </div>
         <div className={`flex-1 h-0.5 mx-2 sm:mx-4 mt-[-20px] sm:mt-[-24px] rounded-full ${step >= 3 ? 'bg-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-zinc-800'}`} />
         <div className={`flex flex-col items-center gap-2 sm:gap-3 ${step >= 3 ? 'text-amber-400' : 'text-zinc-600'}`}>
           <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 font-bold text-base sm:text-lg ${step >= 3 ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-zinc-700 bg-zinc-800'}`}>3</div>
           <span className="text-xs sm:text-sm font-bold">تأكيد</span>
         </div>
      </div>

      {/* Step 1: Services */}
      {step === 1 && (
        <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">اختر الخدمة المطلوبة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(srv => (
              <button 
                key={srv.id} 
                onClick={() => { setSelectedService(srv); setStep(2); }}
                className="flex items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all duration-300 text-right group bg-black/20 hover:bg-white/5 border-white/5 hover:border-amber-500/30 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-3 sm:p-3.5 bg-white/5 rounded-2xl text-amber-400 group-hover:bg-amber-400/10 transition-colors"><Scissors size={20} className="sm:w-6 sm:h-6" /></div>
                  <div>
                    <h4 className="font-bold text-white text-base sm:text-lg">{srv.name}</h4>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">{srv.duration_minutes} دقيقة</p>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">{srv.price} DZD</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-right-8 duration-500">
          <h3 className="text-2xl font-bold text-white text-center">متى ترغب في زيارتنا؟</h3>
          
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-3 ml-1">اختر التاريخ</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-right shadow-inner" 
            />
          </div>

          {selectedDate && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <label className="block text-sm font-bold text-zinc-300 mb-3 ml-1">الأوقات المتاحة</label>
              
              {loadingSlots ? (
                <div className="flex items-center justify-center p-8 bg-black/20 rounded-2xl border border-white/5">
                  <div className="animate-spin text-amber-400"><Clock size={32} /></div>
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 sm:py-4 rounded-2xl font-bold transition-all border text-sm sm:text-base ${selectedTime === time ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-[1.02]' : 'bg-black/30 text-white border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 font-bold">
                  لا توجد أوقات متاحة في هذا اليوم أو أن الصالون مغلق، يرجى اختيار يوم آخر.
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-6 mt-4 border-t border-white/5">
            <button onClick={() => setStep(1)} className="w-full sm:w-1/3 bg-white/5 hover:bg-white/10 text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all border border-white/10">عودة</button>
            <button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className="w-full sm:w-2/3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none disabled:cursor-not-allowed">متابعة لتأكيد الحجز</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && selectedService && (
        <div className="space-y-6 relative z-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={48} strokeWidth={3} />
          </div>
          <h3 className="text-3xl font-black text-white">تأكيد الحجز</h3>
          <p className="text-zinc-400 mb-8 text-lg">يرجى مراجعة تفاصيل الحجز وتأكيده.</p>
          
          <div className="bg-black/30 border border-white/5 rounded-3xl p-8 text-right space-y-5 mb-8 shadow-inner">
            <div className="flex justify-between items-center pb-5 border-b border-white/5">
              <span className="text-zinc-400 font-medium text-lg">الخدمة</span>
              <span className="font-bold text-white text-lg">{selectedService.name}</span>
            </div>
            <div className="flex justify-between items-center pb-5 border-b border-white/5">
              <span className="text-zinc-400 font-medium text-lg">التاريخ</span>
              <span className="font-bold text-white text-lg">{selectedDate}</span>
            </div>
            <div className="flex justify-between items-center pb-5 border-b border-white/5">
              <span className="text-zinc-400 font-medium text-lg">الوقت</span>
              <span className="font-bold text-white text-lg">{selectedTime}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-zinc-400 font-medium text-lg">الإجمالي</span>
              <span className="text-3xl font-black text-amber-400 drop-shadow-md">{selectedService.price} DZD</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-2xl text-right animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={20} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/5">
            <button onClick={() => setStep(2)} disabled={loading} className="w-full sm:w-1/3 bg-white/5 hover:bg-white/10 text-white py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all border border-white/10 disabled:opacity-50">تعديل</button>
            <button onClick={handleSubmit} disabled={loading} className="w-full sm:w-2/3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:text-black/50 text-black py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-1 flex justify-center items-center gap-3">
              {loading ? <span className="animate-pulse flex items-center gap-2"><Clock className="animate-spin" size={18} /> جاري الحجز...</span> : <span>تأكيد الحجز الآن</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
