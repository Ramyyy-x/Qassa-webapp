import { updatePassword } from '@/app/actions';
import { KeyRound } from 'lucide-react';
import SubmitButton from '@/components/SubmitButton';

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="flex min-h-screen flex-col justify-center items-center px-6 py-12 bg-black text-white relative selection:bg-amber-500/30 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(251,191,36,0.4)] mb-4">
            <KeyRound size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">كلمة مرور جديدة</h2>
          <p className="mt-3 text-center text-zinc-400 text-lg">الرجاء إدخال كلمة المرور الجديدة لحسابك</p>
        </div>

        <form className="bg-zinc-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6" action={updatePassword}>
          {resolvedParams?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold text-center">
              {resolvedParams.error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-zinc-300 mb-3 ml-1">
              كلمة المرور الجديدة
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-left"
              dir="ltr"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2 flex w-full">
            <SubmitButton>
              تحديث كلمة المرور
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
