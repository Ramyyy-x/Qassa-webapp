'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendBookingConfirmationEmail } from '@/utils/email';

export async function createBooking(serviceId: string, date: string, time: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول.' };

  try {
    // 1. Limit active bookings per user (max 5)
    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id)
      .in('status', ['pending', 'confirmed']);

    if (countError) throw countError;
    if (count !== null && count >= 5) {
      return { 
        success: false, 
        error: 'لديك بالفعل 5 حجوزات نشطة (معلقة أو مؤكدة) كحد أقصى. يرجى إتمامها أو إلغاء أحدها أولاً لحماية النظام من إغراق الحجوزات.' 
      };
    }

    // 2. Prevent double-booking for the exact same slot
    const { data: existingApt, error: checkError } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .neq('status', 'cancelled')
      .limit(1);

    if (checkError) throw checkError;
    if (existingApt && existingApt.length > 0) {
      return { 
        success: false, 
        error: 'عذراً، هذا الموعد تم حجزه للتو من قبل عميل آخر. يرجى العودة للخطوة السابقة واختيار وقت آخر.' 
      };
    }

    // 3. Insert the booking
    const { error: insertError } = await supabase.from('appointments').insert([{
      customer_id: user.id,
      service_id: serviceId,
      appointment_date: date,
      appointment_time: time,
      status: 'pending'
    }]);

    if (insertError) throw insertError;

    // Fetch details and send confirmation email
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data: service } = await supabase
        .from('services')
        .select('name')
        .eq('id', serviceId)
        .single();

      if (user.email) {
        await sendBookingConfirmationEmail(
          user.email,
          profile?.full_name || 'عميل',
          service?.name || 'خدمة',
          date,
          time
        );
      }
    } catch (emailErr) {
      console.error('Error sending confirmation email:', emailErr);
    }

  } catch (err: any) {
    console.error('Booking error:', err);
    return { success: false, error: 'حدث خطأ غير متوقع أثناء الحجز. يرجى المحاولة مرة أخرى.' };
  }

  revalidatePath('/dashboard/customer');
  return { success: true };
}

export async function getAvailableSlots(date: string, serviceDuration: number) {
  const supabase = await createClient();
  
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); 
  
  const { data: workingDay } = await supabase
    .from('working_hours')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single();

  if (!workingDay || workingDay.is_closed || !workingDay.open_time || !workingDay.close_time) {
    return []; // Closed on this day
  }

  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('appointment_time, services(duration_minutes)')
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  const slots: string[] = [];
  const currentTimeStr = workingDay.open_time.substring(0, 5);
  const closeTimeStr = workingDay.close_time.substring(0, 5);

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  let currentMinutes = timeToMinutes(currentTimeStr);
  const closeMinutes = timeToMinutes(closeTimeStr);

  while (currentMinutes + serviceDuration <= closeMinutes) {
    const slotStartStr = minutesToTime(currentMinutes);
    const slotEndMinutes = currentMinutes + serviceDuration;
    
    let isOverlap = false;
    if (existingAppointments) {
      for (const apt of existingAppointments) {
        if (!apt.appointment_time) continue;
        
        const aptStartStr = apt.appointment_time.substring(0, 5);
        // Typescript workaround for nested Supabase select
        const aptServices = apt.services as any;
        const aptDuration = aptServices?.duration_minutes || 30; 
        
        const aptStartMins = timeToMinutes(aptStartStr);
        const aptEndMins = aptStartMins + aptDuration;

        if (
          (currentMinutes >= aptStartMins && currentMinutes < aptEndMins) ||
          (slotEndMinutes > aptStartMins && slotEndMinutes <= aptEndMins) ||
          (currentMinutes <= aptStartMins && slotEndMinutes >= aptEndMins)
        ) {
          isOverlap = true;
          break;
        }
      }
    }

    if (!isOverlap) {
      slots.push(slotStartStr);
    }

    // Step size for slots generation (every 30 mins)
    currentMinutes += 30;
  }

  return slots;
}
