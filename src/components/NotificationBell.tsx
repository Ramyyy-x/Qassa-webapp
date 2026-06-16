'use client';

import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/dashboard/notifications/actions';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('customer');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) setUserRole(profile.role);

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setNotifications(data);
    };

    init();
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;
    
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const channel = supabase
      .channel(`realtime-notifications-bell-${userId}-${uniqueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      // Cleanup: Unsubscribe and remove the channel properly to avoid memory leaks
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      await handleMarkAsRead(n.id);
    }
    setIsOpen(false);
    
    // Navigate to the respective dashboard
    if (userRole === 'admin') {
      router.push('/dashboard/admin/appointments');
    } else {
      router.push('/dashboard/customer');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} د`;
    if (diffHours < 24) return `منذ ${diffHours} س`;
    return `منذ ${diffDays} ي`;
  };

  if (!userId) return null; // Don't show bell if not logged in

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:bg-white/10 transition-all border border-white/5 hover:border-amber-500/20 relative"
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 w-5 h-5 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border border-zinc-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-12 left-0 w-80 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-right font-cairo"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
                <span className="font-black text-sm text-white">الإشعارات</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <Check size={12} strokeWidth={3} />
                    <span>قراءة الكل</span>
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-xl border transition-all text-xs cursor-pointer ${n.is_read ? 'bg-white/5 border-transparent hover:bg-white/10' : 'bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10'}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className={`font-black ${n.is_read ? 'text-zinc-200' : 'text-amber-400'}`}>{n.title}</span>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">{formatTime(n.created_at)}</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed font-medium">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-zinc-600 font-bold text-xs">
                    لا توجد إشعارات حالياً
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
