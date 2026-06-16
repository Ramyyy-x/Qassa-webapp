'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addService(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error("Forbidden: Admins only");

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const duration = parseInt(formData.get('duration') as string);
  const price = parseFloat(formData.get('price') as string);

  const { error } = await supabase.from('services').insert([{
    name, description, duration_minutes: duration, price
  }]);

  if (error) {
    console.error("Supabase Insert Error:", error);
    throw new Error("Failed to insert service: " + error.message);
  }

  revalidatePath('/dashboard/admin/services');
  redirect('/dashboard/admin/services');
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error("Forbidden: Admins only");

  await supabase.from('services').delete().eq('id', id);
  revalidatePath('/dashboard/admin/services');
}
