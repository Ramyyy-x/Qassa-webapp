import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-zinc-100 overflow-hidden relative font-cairo">
      {/* Premium Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Sidebar */}
      <Sidebar isAdmin={isAdmin} userName={profile?.full_name || 'مستخدم'} logoutAction={logout} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8 lg:p-12 scroll-smooth">
        {children}
      </main>
    </div>
  );
}
