import { createClient } from '@/utils/supabase/server';
import HeroSequence from "@/components/Hero";
import Link from 'next/link';
import { Scissors, Calendar, ArrowLeft, Star, MessageSquare } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch services for the landing page
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: false });
  
  // Fetch top-rated reviews (rating >= 4) with profile names and service names
  const { data: topReviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      profiles ( full_name ),
      appointments (
        services ( name )
      )
    `)
    .gte('rating', 4)
    .order('created_at', { ascending: false })
    .limit(6);

  // Check if user is logged in and their role
  const { data: { user } } = await supabase.auth.getUser();
  let role = 'customer';
  
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    role = profile?.role || 'customer';
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-white selection:bg-amber-500/30">
      
      {/* Navigation Bar — fully transparent, floats over the animation */}
      <nav className="fixed top-0 w-full z-50 bg-transparent transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Scissors size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">قَصَّة</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-zinc-200">
            <a href="#hero" className="hover:text-amber-400 transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">الرئيسية</a>
            <a href="#services" className="hover:text-amber-400 transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">خدماتنا</a>
            <Link href="/dashboard/customer/book" className="hover:text-amber-400 transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">احجز موعداً</Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <NotificationBell />
                <Link href={role === 'admin' ? "/dashboard/admin" : "/dashboard/customer"} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border border-white/10 flex items-center gap-2 backdrop-blur-sm">
                  {role === 'admin' ? (
                    <><span className="hidden sm:inline">لوحة تحكم</span> الإدارة</>
                  ) : (
                    <>حسابي <span className="hidden sm:inline">(مواعيدي)</span></>
                  )}
                </Link>
              </>
            ) : (
              <Link href="/login" className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center gap-2">
                دخول
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section — full bleed, starts from top of page */}
      <div id="hero">
        <HeroSequence />
      </div>
      
      {/* Services Section */}
      <section id="services" className="py-32 w-full bg-zinc-950 flex flex-col items-center justify-center px-6 relative border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-black mb-4">خدمات الصالون</h2>
             <p className="text-zinc-400 text-lg max-w-2xl mx-auto">نقدم مجموعة واسعة من خدمات العناية بالرجل بلمسة احترافية وأدوات معقمة.</p>
          </div>

          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-black/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-all group">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                    <Scissors size={28} strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">{service.name}</h3>
                  <p className="text-zinc-400 mb-6 line-clamp-2 h-12">{service.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-2xl font-black text-amber-400">{service.price} DZD</span>
                    <span className="text-sm font-bold text-zinc-500 bg-white/5 px-3 py-1 rounded-lg">{service.duration_minutes} دقيقة</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500 font-bold p-12 border border-dashed border-white/10 rounded-[2rem]">
              لم يتم إضافة خدمات بعد.
            </div>
          )}
          
          <div className="mt-16 text-center">
             <Link href="/dashboard/customer/book" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-1">
               <Calendar size={24} />
               <span>احجز موعدك الآن</span>
             </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {topReviews && topReviews.length > 0 && (
        <section id="reviews" className="py-32 w-full bg-black flex flex-col items-center justify-center px-6 relative border-t border-white/5 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-6xl w-full relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">آراء عملائنا</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">ثقة عملائنا هي سر تميزنا. إليك ما يقوله من زار صالون قَصَّة:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topReviews.map((rev) => (
                <div key={rev.id} className="bg-zinc-950/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex gap-1 mb-4 direction-ltr justify-end">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < rev.rating ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "text-zinc-700"}
                        />
                      ))}
                    </div>
                    
                    <p className="text-zinc-300 font-medium leading-relaxed mb-6 text-sm text-right">
                      {rev.comment ? `"${rev.comment}"` : "تجربة ممتازة وخدمة رائعة جداً، الحلاقين محترفين للغاية والمعاملة راقية."}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-400 font-black border border-white/10 shadow-inner">
                      {((rev.profiles as any)?.full_name || 'ع')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{(rev.profiles as any)?.full_name || 'عميل مجهول'}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">حصل على خدمة: {((rev.appointments as any)?.services as any)?.name || 'حلاقة شعر'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 bg-zinc-950 text-center">
        <p className="text-zinc-500 font-bold text-sm">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} تطبيق قَصَّة</p>
      </footer>
    </main>
  );
}
