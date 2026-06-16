'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Scissors, CalendarDays, LogOut, User, PlusCircle, Clock, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

export default function Sidebar({ isAdmin, userName, logoutAction }: { isAdmin: boolean, userName: string, logoutAction: () => void }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const adminLinks = [
    { name: 'نظرة عامة', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'الخدمات', href: '/dashboard/admin/services', icon: Scissors },
    { name: 'الحجوزات', href: '/dashboard/admin/appointments', icon: CalendarDays },
    { name: 'أوقات العمل', href: '/dashboard/admin/settings', icon: Clock },
  ];

  const customerLinks = [
    { name: 'حجوزاتي', href: '/dashboard/customer', icon: CalendarDays },
    { name: 'حجز جديد', href: '/dashboard/customer/book', icon: PlusCircle },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  const SidebarContent = ({ isMobile }: { isMobile: boolean }) => (
    <>
      <div className="h-24 hidden md:flex items-center justify-between px-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative">
        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-md">قَصَّة</h1>
        <NotificationBell />
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.name} href={link.href} className="block relative group">
              {isActive && (
                <motion.div 
                  layoutId={isMobile ? "activeTabMobile" : "activeTabDesktop"} 
                  className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200 group-hover:bg-white/5'}`}>
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''} />
                <span className="font-bold">{link.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/5 mt-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-inner shrink-0">
            <User size={20} className="text-amber-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-zinc-200 truncate">{userName}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{isAdmin ? 'مدير النظام' : 'عميل ذهبي'}</p>
          </div>
        </div>
        
        <Link href="/" className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-3 rounded-xl text-zinc-400 font-bold hover:bg-white/5 hover:text-white transition-all shadow-sm border border-transparent hover:border-white/10">
          <ArrowRight size={18} />
          <span>العودة للموقع</span>
        </Link>

        <form action={logoutAction}>
          <button className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-red-400 font-bold hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20 shadow-sm">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileOpen(true)} className="text-zinc-400 hover:text-amber-400 transition-colors">
            <Menu size={28} />
          </button>
          <h1 className="text-xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">قَصَّة</h1>
        </div>
        <NotificationBell />
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 w-72 h-full bg-zinc-950 border-l border-white/5 flex flex-col z-50 md:hidden"
          >
            <div className="h-24 px-6 flex justify-between items-center border-b border-white/5 bg-white/5 shrink-0">
              <h1 className="text-2xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">القائمة</h1>
              <button onClick={() => setIsMobileOpen(false)} className="text-zinc-400 hover:text-amber-400 p-2 rounded-lg hover:bg-white/5 transition-all">
                <X size={24} />
              </button>
            </div>
            <SidebarContent isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-zinc-950/80 backdrop-blur-2xl border-l border-white/5 flex-col h-full shadow-2xl relative z-20 shrink-0">
        <SidebarContent isMobile={false} />
      </aside>
    </>
  );
}
