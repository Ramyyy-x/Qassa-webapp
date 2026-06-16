import { createClient } from '@/utils/supabase/server';
import BookingForm from './BookingForm';

export default async function BookPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: false });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl mx-auto">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black text-white tracking-tight mb-4">حجز موعد جديد</h2>
        <p className="text-zinc-400 text-lg">احجز موعدك بخطوات بسيطة وسريعة.</p>
      </header>

      {services && services.length > 0 ? (
        <BookingForm services={services} />
      ) : (
        <div className="text-center p-16 bg-zinc-900/50 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl">
           <h3 className="text-2xl text-white font-black mb-3">لا تتوفر خدمات حالياً</h3>
           <p className="text-zinc-400 text-lg">يرجى المحاولة لاحقاً عندما يقوم المدير بإضافة الخدمات.</p>
        </div>
      )}
    </div>
  )
}
