'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/login?error=Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string,
      }
    }
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect('/register?error=Could not create user');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard'); // or redirect to login asking to confirm email
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient();
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    redirect('/forgot-password?error=حدث خطأ أثناء إرسال رابط الاستعادة، تأكد من صحة البريد الإلكتروني');
  }

  redirect('/forgot-password?message=تم إرسال رابط الاستعادة بنجاح، يرجى تفقد صندوق الوارد الخاص بك');
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect('/update-password?error=حدث خطأ أثناء تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية.');
  }

  redirect('/dashboard');
}
