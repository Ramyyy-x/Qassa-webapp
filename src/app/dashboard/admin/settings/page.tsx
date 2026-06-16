import { createClient } from '@/utils/supabase/server';
import { updateWorkingHours } from './actions';
import { Clock, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: workingHours } = await supabase.from('working_hours').select('*').order('day_of_week', { ascending: true });

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">أوقات العمل</h2>
        <p className="text-zinc-400 text-lg">تحكم في أوقات دوام الصالون وأيام العطل لمنع الحجوزات خارج الأوقات المحددة.</p>
      </header>

      <div className="space-y-4">
        {workingHours && workingHours.map(day => (
          <div key={day.id} className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col xl:flex-row xl:items-center justify-between gap-6 ${day.is_closed ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-900/60 border-white/5 backdrop-blur-xl shadow-xl'}`}>
            <div className="flex items-center gap-4 w-48">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner ${day.is_closed ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-400/10 border-amber-400 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'}`}>
                 <CalendarDays size={24} />
               </div>
               <h3 className="text-2xl font-bold text-white">{days[day.day_of_week]}</h3>
            </div>

            <form className="flex-1 flex flex-col md:flex-row items-center gap-4" action={async (formData) => {
               "use server";
               const isClosed = formData.get('is_closed') === 'true';
               await updateWorkingHours(day.day_of_week, isClosed, formData.get('open_time') as string || day.open_time, formData.get('close_time') as string || day.close_time);
            }}>
               <div className="flex items-center gap-3 flex-1 w-full">
                 <select name="is_closed" defaultValue={day.is_closed.toString()} className="bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold">
                   <option value="false">مفتوح</option>
                   <option value="true">مغلق (عطلة)</option>
                 </select>
                 
                 {!day.is_closed ? (
                   <>
                     <input type="time" name="open_time" defaultValue={day.open_time} className="bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center flex-1 font-bold" />
                     <span className="text-zinc-500 font-bold">إلى</span>
                     <input type="time" name="close_time" defaultValue={day.close_time} className="bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-center flex-1 font-bold" />
                   </>
                 ) : (
                   <div className="flex-1 text-red-400/80 font-bold px-4 py-3.5 bg-red-500/5 rounded-xl border border-red-500/10 text-center">
                     لن يتمكن العملاء من الحجز في هذا اليوم
                   </div>
                 )}
               </div>
               
               <button type="submit" className={`px-8 py-3.5 rounded-xl font-bold transition-all shadow-md w-full md:w-auto flex-shrink-0 ${day.is_closed ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-amber-500 text-black hover:bg-amber-400 hover:-translate-y-0.5 shadow-amber-500/20'}`}>
                 حفظ التغييرات
               </button>
            </form>
          </div>
        ))}
        {(!workingHours || workingHours.length === 0) && (
          <div className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-3xl">
            <h3 className="text-xl text-red-400 font-bold mb-2">جدول أوقات العمل غير موجود</h3>
            <p className="text-zinc-400">يرجى تشغيل أمر الـ SQL الخاص بإنشاء جدول أوقات العمل في قاعدة بيانات Supabase.</p>
          </div>
        )}
      </div>
    </div>
  )
}
