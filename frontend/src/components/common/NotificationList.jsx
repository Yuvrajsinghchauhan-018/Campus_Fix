import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Bell, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      if(res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(`/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    } catch (err) {
      console.error(err);
    }
  };

  if(loading) return <div className="p-8 text-center animate-pulse">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="text-blue-600"/> Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAllAsRead} className="text-sm font-medium text-blue-600 hover:underline">Mark all as read</button>
        )}
      </div>

      <div className="card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No recent notifications.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-darkBorder">
            {notifications.map(n => (
              <div key={n._id} className={`p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition relative ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type==='success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {n.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <Info className="w-5 h-5"/>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), {addSuffix: true})}</p>
                  
                  {n.complaintId && (
                    <Link to={`/student/complaint/${n.complaintId}`} className="text-xs text-blue-600 font-medium hover:underline mt-2 inline-block" onClick={() => markAsRead(n._id)}>
                      View Details
                    </Link>
                  )}
                </div>
                {!n.isRead && (
                  <button onClick={() => markAsRead(n._id)} className="text-xs text-slate-400 hover:text-slate-700 w-max h-max">
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
