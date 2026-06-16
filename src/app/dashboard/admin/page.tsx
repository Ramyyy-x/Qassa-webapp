import { createClient } from '@/utils/supabase/server';
import { Scissors, CalendarDays, Star, Users, CheckCircle2, Clock3, XCircle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Fetch counts
  const { count: servicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true });
     
  const { count: appointmentsCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles ( full_name ),
      appointments (
        services ( name )
      )
    `)
    .order('created_at', { ascending: false });

  // Fetch recent appointments
  const { data: recentAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      appointment_time,
      status,
      profiles ( full_name ),
      services ( name, price )
    `)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })
    .limit(5);

  // Calculate average rating
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (reviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'إجمالي الحجوزات', value: appointmentsCount || 0, icon: CalendarDays, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'الخدمات المتاحة', value: servicesCount || 0, icon: Scissors, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'متوسط التقييم', value: `${averageRating} / 5`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'إجمالي التقييمات', value: totalReviews, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">مؤكد</span>;
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/10">قيد الانتظار</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/10">ملغي</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/10">مكتمل</span>;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">نظرة عامة</h2>
        <p className="text-zinc-400 text-lg">مرحباً بك في لوحة تحكم قَصَّة، إليك ملخص الأداء.</p>
      </header>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group relative bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-zinc-400 font-bold text-sm mb-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} shadow-inner`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        
        {/* Recent Appointments Column */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          <h3 className="text-2xl font-bold text-white mb-6 relative z-10">أحدث الحجوزات</h3>
          
          <div className="relative z-10 flex-1 space-y-4">
            {recentAppointments && recentAppointments.length > 0 ? (
              recentAppointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-black/35 transition-colors">
                  <div>
                    <h4 className="font-bold text-white text-sm">{(apt.profiles as any)?.full_name || 'عميل'}</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {(apt.services as any)?.name} - {apt.appointment_date} في {apt.appointment_time}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    <span className="font-black text-amber-400 text-sm">{(apt.services as any)?.price} DZD</span>
                    {getStatusBadge(apt.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-black/10">
                <CalendarDays size={40} className="text-zinc-600 mb-3" />
                <p className="text-zinc-500 font-bold text-sm">لا توجد حجوزات مسجلة بعد</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Column */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
          <h3 className="text-2xl font-bold text-white mb-6 relative z-10">تقييمات وآراء العملاء</h3>
          
          <div className="relative z-10 flex-1 space-y-4 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {reviews && reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/35 transition-colors">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{(rev.profiles as any)?.full_name || 'عميل'}</h4>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block">
                        خدمة: {((rev.appointments as any)?.services as any)?.name}
                      </span>
                    </div>
                    <div className="flex gap-0.5 direction-ltr">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < rev.rating ? "text-amber-400 fill-amber-400" : "text-zinc-700"}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment ? (
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium bg-white/5 p-3 rounded-xl border border-white/5">
                      {rev.comment}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-600 italic font-medium">تم التقييم بدون تعليق.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-black/10">
                <Star size={40} className="text-zinc-600 mb-3" />
                <p className="text-zinc-500 font-bold text-sm">لا توجد تقييمات مكتوبة بعد</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
