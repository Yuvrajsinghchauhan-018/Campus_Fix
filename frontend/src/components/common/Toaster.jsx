import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';

const Toaster = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      const newNotif = {
        id: Date.now(),
        message: data.message,
        type: data.type || 'info',
        time: new Date()
      };
      setNotifications(prev => [newNotif, ...prev]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-start gap-3 w-80 p-4 rounded-xl shadow-lg border backdrop-blur-md ${
              notif.type === 'success' ? 'bg-green-50/90 border-green-200 dark:bg-green-900/80 dark:border-green-800' :
              notif.type === 'warning' ? 'bg-yellow-50/90 border-yellow-200 dark:bg-yellow-900/80 dark:border-yellow-800' :
              notif.type === 'error' ? 'bg-red-50/90 border-red-200 dark:bg-red-900/80 dark:border-red-800' :
              'bg-white/90 border-slate-200 dark:bg-slate-800/90 dark:border-darkBorder'
            }`}
          >
            <div className={`mt-0.5 rounded-full p-1 ${
               notif.type === 'success' ? 'text-green-600 bg-green-100 dark:bg-green-800 dark:text-green-300' :
               notif.type === 'warning' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-300' :
               notif.type === 'error' ? 'text-red-600 bg-red-100 dark:bg-red-800 dark:text-red-300' :
               'text-blue-600 bg-blue-100 dark:bg-darkCard dark:text-blue-400'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
               <p className={`text-sm font-medium ${
                 notif.type === 'success' ? 'text-green-800 dark:text-green-200' :
                 notif.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                 notif.type === 'error' ? 'text-red-800 dark:text-red-200' :
                 'text-slate-800 dark:text-slate-200'
               }`}>
                 {notif.message}
               </p>
            </div>
            <button 
              onClick={() => dismiss(notif.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
