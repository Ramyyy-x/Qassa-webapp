'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(appointmentId: string, rating: number, comment?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');
  if (rating < 1 || rating > 5) throw new Error('Invalid rating');

  // Verify appointment is completed and belongs to the customer
  const { data: appointment, error: aptError } = await supabase
    .from('appointments')
    .select('id, status, customer_id')
    .eq('id', appointmentId)
    .single();

  if (aptError || !appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.customer_id !== user.id) {
    throw new Error('Unauthorized: You do not own this appointment');
  }

  if (appointment.status !== 'completed') {
    throw new Error('Cannot review an uncompleted appointment');
  }

  const { error: reviewError } = await supabase
    .from('reviews')
    .insert([
      {
        appointment_id: appointmentId,
        customer_id: user.id,
        rating,
        comment: comment || null,
      }
    ]);

  if (reviewError) {
    if (reviewError.code === '23505') {
      throw new Error('You have already submitted a review for this appointment');
    }
    throw reviewError;
  }

  revalidatePath('/dashboard/customer');
}
