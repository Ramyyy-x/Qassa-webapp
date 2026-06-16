-- Phase 3: Add email column to profiles table and update its auth trigger
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'customer',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Phase 3: Reviews Table
CREATE TABLE public.reviews (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null unique,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can insert reviews for their own completed appointments" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id 
    AND EXISTS (
      SELECT 1 FROM public.appointments
      WHERE id = appointment_id AND customer_id = auth.uid() AND status = 'completed'
    )
  );

-- Phase 3: Notifications Table
CREATE TABLE public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);


-- Trigger function for new appointments (notifying admin)
CREATE OR REPLACE FUNCTION public.handle_new_appointment()
RETURNS trigger AS $$
DECLARE
  cust_name text;
  srv_name text;
  admin_rec record;
BEGIN
  -- Get customer name
  SELECT full_name INTO cust_name FROM public.profiles WHERE id = NEW.customer_id;
  -- Get service name
  SELECT name INTO srv_name FROM public.services WHERE id = NEW.service_id;

  -- Insert notifications for all admin users
  FOR admin_rec IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      admin_rec.id,
      'حجز جديد',
      'قام العميل ' || COALESCE(cust_name, 'غير معروف') || ' بحجز موعد جديد لخدمة ' || COALESCE(srv_name, 'خدمة') || ' بتاريخ ' || NEW.appointment_date || ' الساعة ' || NEW.appointment_time
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_appointment_created
  AFTER INSERT ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_appointment();


-- Trigger function for appointment status updates (notifying customer)
CREATE OR REPLACE FUNCTION public.handle_update_appointment_status()
RETURNS trigger AS $$
DECLARE
  srv_name text;
  status_text text;
BEGIN
  -- Only trigger if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT name INTO srv_name FROM public.services WHERE id = NEW.service_id;

    IF NEW.status = 'confirmed' THEN
      status_text := 'تم تأكيد موعدك لخدمة ' || COALESCE(srv_name, 'خدمة') || ' بتاريخ ' || NEW.appointment_date || ' الساعة ' || NEW.appointment_time || '.';
    ELSIF NEW.status = 'cancelled' THEN
      status_text := 'تم إلغاء موعدك لخدمة ' || COALESCE(srv_name, 'خدمة') || ' بتاريخ ' || NEW.appointment_date || ' الساعة ' || NEW.appointment_time || '.';
    ELSIF NEW.status = 'completed' THEN
      status_text := 'تم إكمال خدمتك لخدمة ' || COALESCE(srv_name, 'خدمة') || ' بنجاح! نأمل أن تكون قد استمتعت بتجربتك معنا. يمكنك الآن تقييم الخدمة.';
    ELSE
      -- Any other status (e.g. pending) we don't trigger notification or return early
      RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      NEW.customer_id,
      'تحديث حالة الحجز',
      status_text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_appointment_status_updated
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_update_appointment_status();


-- Trigger function for new reviews (notifying admin)
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS trigger AS $$
DECLARE
  cust_name text;
  admin_rec record;
BEGIN
  -- Get customer name
  SELECT full_name INTO cust_name FROM public.profiles WHERE id = NEW.customer_id;

  -- Insert notifications for all admin users
  FOR admin_rec IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      admin_rec.id,
      'تقييم جديد',
      'قام العميل ' || COALESCE(cust_name, 'غير معروف') || ' بتقديم تقييم بمقدار ' || NEW.rating || ' نجوم.'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_review();
