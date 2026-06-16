'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendBookingStatusUpdateEmail } from '@/utils/email';

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error("Forbidden: Admins only");

  await supabase.from('appointments').update({ status }).eq('id', id);

  try {
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        appointment_date,
        appointment_time,
        profiles (
          full_name,
          email
        ),
        services (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (appointment) {
      const customer = appointment.profiles as any;
      const service = appointment.services as any;
      const customerEmail = customer?.email;
      const customerName = customer?.full_name || 'عميل';
      const serviceName = service?.name || 'خدمة';

      if (customerEmail) {
        await sendBookingStatusUpdateEmail(
          customerEmail,
          customerName,
          serviceName,
          appointment.appointment_date,
          appointment.appointment_time,
          status
        );
      }
    }
  } catch (err) {
    console.error('Error sending status update email:', err);
  }

  revalidatePath('/dashboard/admin/appointments');
}
