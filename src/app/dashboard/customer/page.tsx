import { createClient } from '@/utils/supabase/server';
import { Calendar, Clock, CheckCircle2, Clock3, XCircle, CalendarDays, Star } from 'lucide-react';
import ReviewModal from './ReviewModal';

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      services ( name, duration_minutes, price ),
      reviews ( rating, comment )
    `)
    .eq('customer_id', user?.id)
    .order('appointment_date', { ascending: false });

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'confirmed': return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', text: 'مؤكد' };
      case 'pending': return { icon: Clock3, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', text: 'قيد الانتظار' };
      case 'cancelled': return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', text: 'ملغي' };
      default: return { icon: CheckCircle2, color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20', text: 'مكتمل' };
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">مواعيدي القادمة</h2>
          <p className="text-zinc-400 text-lg">تتبع حجوزاتك وإدارتها بكل سهولة.</p>
        </div>
      </header>
      
      {appointments && appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((apt) => {
            const statusConfig = getStatusConfig(apt.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={apt.id} className="group relative bg-zinc-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-white/5 shadow-2xl hover:border-white/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className={`absolute top-[-20%] right-[-10%] w-32 h-32 blur-[60px] rounded-full opacity-50 transition-all duration-500 group-hover:scale-150 ${statusConfig.bg}`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6 sm:mb-8 gap-4">
                    <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] sm:text-xs font-black border backdrop-blur-md ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color} shrink-0`}>
                      <StatusIcon size={14} strokeWidth={3} />
                      <span>{statusConfig.text}</span>
                    </div>
                    <div className="text-xl sm:text-3xl font-black text-white drop-shadow-md whitespace-nowrap">
                      {apt.services?.price} DZD
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6 group-hover:text-amber-400 transition-colors drop-shadow-sm line-clamp-1">
                    {apt.services?.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-zinc-400 bg-black/30 p-3.5 rounded-2xl border border-white/5">
                      <div className="p-2 rounded-xl bg-white/5 text-amber-400 shadow-inner"><Calendar size={18} /></div>
                      <span className="font-bold text-white/90 text-sm tracking-wide">{new Date(apt.appointment_date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-zinc-400 bg-black/30 p-3.5 rounded-2xl border border-white/5">
                      <div className="p-2 rounded-xl bg-white/5 text-amber-400 shadow-inner"><Clock size={18} /></div>
                      <span className="font-bold text-white/90 text-sm tracking-wide">{apt.appointment_time}</span>
                      <span className="text-xs px-2.5 py-1.5 font-bold bg-white/5 rounded-lg text-amber-400 mr-auto border border-amber-500/10">
                        {apt.services?.duration_minutes} دقيقة
                      </span>
                    </div>
                  </div>

                  {/* Rating / Review UI */}
                  {apt.status === 'completed' && (() => {
                    const review = Array.isArray(apt.reviews) ? apt.reviews[0] : apt.reviews;
                    return review ? (
                      <div className="mt-6 flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                        <span className="text-zinc-500 text-xs font-bold">تقييمك للخدمة:</span>
                        <div className="flex gap-1 direction-ltr">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < (review.rating || 0) ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]" : "text-zinc-700"}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <ReviewModal
                        appointmentId={apt.id}
                        serviceName={apt.services?.name || 'خدمة'}
                        date={new Date(apt.appointment_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        time={apt.appointment_time}
                      />
                    );
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-white/10 rounded-[2.5rem] backdrop-blur-sm text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-zinc-500 shadow-inner relative z-10">
            <CalendarDays size={40} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3 relative z-10">لا توجد حجوزات</h3>
          <p className="text-zinc-400 text-lg max-w-sm mb-8 relative z-10 leading-relaxed">لم تقم بحجز أي مواعيد حتى الآن. استمتع بأفضل الخدمات واحجز موعدك الأول!</p>
        </div>
      )}
    </div>
  );
}
