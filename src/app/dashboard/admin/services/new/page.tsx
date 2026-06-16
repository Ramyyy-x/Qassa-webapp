import { addService } from '../actions';
import Link from 'next/link';
import SubmitButton from '@/components/SubmitButton';

export default function NewServicePage() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight mb-2">إضافة خدمة جديدة</h2>
        <p className="text-zinc-400 text-lg">قم بتحديد اسم وتفاصيل الخدمة ليتمكن العملاء من حجزها.</p>
      </header>

      <form action={addService} className="bg-zinc-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-3 ml-1">اسم الخدمة</label>
          <input name="name" required className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all" placeholder="مثال: حلاقة شعر كلاسيكية" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-zinc-300 mb-3 ml-1">الوصف</label>
          <textarea name="description" rows={3} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none" placeholder="اكتب وصفاً جذاباً للخدمة..." />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-3 ml-1">المدة (بالدقائق)</label>
            <input name="duration" type="number" required className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-left" dir="ltr" placeholder="30" />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-3 ml-1">السعر (DZD)</label>
            <input name="price" type="number" step="any" required className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-left" dir="ltr" placeholder="1000" />
          </div>
        </div>

        <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
          <SubmitButton>
            حفظ الخدمة
          </SubmitButton>
          <Link href="/dashboard/admin/services" className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center border border-white/10">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
