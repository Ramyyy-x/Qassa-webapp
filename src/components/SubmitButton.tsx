'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`flex-1 bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 ${pending ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <span>جاري الحفظ...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
