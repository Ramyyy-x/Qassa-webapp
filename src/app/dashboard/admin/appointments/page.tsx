import { createClient } from '@/utils/supabase/server';
import { updateAppointmentStatus } from './actions';
import { Calendar, Clock, User, CheckCircle2, Clock3, XCircle } from 'lucide-react';

export default async function AdminAppointmentsPage() {
  const supabase = await createClient();
  
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles ( full_name ),
      services ( name, price )
    `)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

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
      <header className="mb-12">
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">جميع الحجوزات</h2>
        <p className="text-zinc-400 text-lg">إدارة وتحديث حالات حجوزات العملاء.</p>
      </header>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-6 text-zinc-400 font-bold text-sm">العميل</th>
                <th className="p-6 text-zinc-400 font-bold text-sm">الخدمة</th>
                <th className="p-6 text-zinc-400 font-bold text-sm">التاريخ والوقت</th>
                <th className="p-6 text-zinc-400 font-bold text-sm">السعر</th>
                <th className="p-6 text-zinc-400 font-bold text-sm">الحالة</th>
                <th className="p-6 text-zinc-400 font-bold text-sm">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {appointments && appointments.map(apt => {
                const statusConfig = getStatusConfig(apt.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <tr key={apt.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/5"><User size={18} /></div>
                        <span className="font-bold text-white">{apt.profiles?.full_name || 'عميل غير معروف'}</span>
                      </div>
                    </td>
                    <td className="p-6 font-bold text-white/90">{apt.services?.name}</td>
                    <td className="p-6">
                       <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium"><Calendar size={14} className="text-amber-400" /> {apt.appointment_date}</div>
                         <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium"><Clock size={14} className="text-amber-400" /> {apt.appointment_time}</div>
                       </div>
                    </td>
                    <td className="p-6 font-black text-amber-400 text-lg">{apt.services?.price} DZD</td>
                    <td className="p-6">
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          <StatusIcon size={14} strokeWidth={3} />
                          <span>{statusConfig.text}</span>
                       </div>
                    </td>
                    <td className="p-6">
                      <form className="flex gap-2 items-center" action={async (formData) => {
                        "use server";
                        await updateAppointmentStatus(apt.id, formData.get('status') as string);
                      }}>
                        <select name="status" defaultValue={apt.status} className="bg-black/50 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium">
                           <option value="pending">قيد الانتظار</option>
                           <option value="confirmed">تأكيد</option>
                           <option value="completed">مكتمل</option>
                           <option value="cancelled">إلغاء</option>
                        </select>
                        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-500/20 hover:-translate-y-0.5">تحديث</button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(!appointments || appointments.length === 0) && (
            <div className="p-16 text-center">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                  <Calendar size={32} />
               </div>
               <p className="text-zinc-500 font-medium text-lg">لا توجد حجوزات حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
