import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSecurityLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  // Security Check: If not an admin, kick them out to customer dashboard
  if (profile?.role !== 'admin') {
    redirect('/dashboard/customer');
  }

  return <>{children}</>;
}
