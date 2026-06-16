import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminFixPage(props: any) {
  // Using Promise.resolve to unwrap searchParams correctly in Next.js 15
  const searchParams = await Promise.resolve(props.searchParams);
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-10 text-white">يرجى تسجيل الدخول أولاً</div>;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const makeAdmin = async () => {
    "use server";
    const supabaseServer = await createClient();
    const { error } = await supabaseServer.from('profiles').update({ role: 'admin' }).eq('id', user.id);
    
    if (error) {
       redirect(`/dashboard/admin-fix?error=${encodeURIComponent(error.message)}`);
    } else {
       revalidatePath('/', 'layout');
       redirect('/dashboard/admin-fix?success=true');
    }
  };

  return (
    <div className="p-12 max-w-2xl mx-auto bg-zinc-900 border border-white/10 rounded-[2rem] mt-12 text-center text-white shadow-2xl">
      {searchParams?.error && <div className="bg-red-500/20 border border-red-500/50 p-6 rounded-2xl mb-6 text-red-400 font-bold break-words">{searchParams.error}</div>}
      {searchParams?.success && <div className="bg-emerald-500/20 border border-emerald-500/50 p-6 rounded-2xl mb-6 text-emerald-400 font-bold">تم ترقية حسابك إلى مدير بنجاح! يمكنك الآن الذهاب إلى لوحة تحكم المدير بكل الخصائص.</div>}
      
      <h2 className="text-3xl font-black mb-4">أداة إصلاح الصلاحيات</h2>
      <p className="text-zinc-400 mb-8 text-lg">
        إذا واجهت أي رسالة خطأ باللون الأحمر هنا، فهذا يعني أن قاعدة البيانات ترفض التعديل.
      </p>
      
      <div className="bg-black/40 border border-white/5 p-6 rounded-2xl mb-8 text-left text-sm font-mono text-amber-400 overflow-hidden">
        <p className="mb-2"><span className="text-zinc-500">ID:</span> {user.id}</p>
        <p><span className="text-zinc-500">Role:</span> {profile?.role || 'null'}</p>
      </div>

      <form action={makeAdmin} className="flex flex-col gap-4">
        <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-2xl font-black text-xl transition-all shadow-lg hover:-translate-y-1">
          1. ترقية الحساب إلى مدير
        </button>
        {searchParams?.success && (
          <a href="/dashboard/admin" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all border border-white/10">
            2. الذهاب إلى لوحة تحكم المدير
          </a>
        )}
      </form>
    </div>
  );
}
