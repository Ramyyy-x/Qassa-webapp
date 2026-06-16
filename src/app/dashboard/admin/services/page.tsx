import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Trash2, Scissors } from 'lucide-react';
import { deleteService } from './actions';

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: false });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">إدارة الخدمات</h2>
          <p className="text-zinc-400 text-lg">أضف وعدّل خدمات الصالون والأسعار.</p>
        </div>
        <Link href="/dashboard/admin/services/new" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-1">
          <Plus size={20} strokeWidth={3} />
          <span>خدمة جديدة</span>
        </Link>
      </header>

      {services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="group bg-zinc-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl hover:border-white/10 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                     <div className="p-3 bg-white/5 rounded-2xl text-amber-400 border border-white/5 shadow-inner">
                        <Scissors size={24} />
                     </div>
                     <div className="text-3xl font-black text-white drop-shadow-md">{service.price} DZD</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{service.name}</h3>
                  <p className="text-zinc-400 mb-8 text-sm line-clamp-2 leading-relaxed">{service.description}</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                     <span className="text-xs font-bold px-3 py-1.5 bg-white/5 rounded-lg text-amber-400 border border-amber-500/10 shadow-sm">{service.duration_minutes} دقيقة</span>
                     <div className="flex gap-2">
                       <form action={async () => { "use server"; await deleteService(service.id); }}>
                         <button className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                           <Trash2 size={18} />
                         </button>
                       </form>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 border border-dashed border-white/10 rounded-[2.5rem] backdrop-blur-sm text-center shadow-2xl">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 text-zinc-500 shadow-inner">
            <Scissors size={40} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">لا توجد خدمات</h3>
          <p className="text-zinc-400 text-lg max-w-sm mb-8 leading-relaxed">لم تقم بإضافة أي خدمات بعد، ابدأ بإنشاء قائمة خدمات الصالون الآن.</p>
        </div>
      )}
    </div>
  )
}
