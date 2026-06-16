'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateWorkingHours(dayOfWeek: number, isClosed: boolean, openTime: string, closeTime: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error("Forbidden: Admins only");

  await supabase.from('working_hours').update({
    is_closed: isClosed,
    open_time: openTime,
    close_time: closeTime
  }).eq('day_of_week', dayOfWeek);
  
  revalidatePath('/dashboard/admin/settings');
  revalidatePath('/dashboard/customer/book'); // Ensure booking form sees new times
}
