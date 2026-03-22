import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { PlusCircle, Clock, CheckCircle, PackageOpen, AlertTriangle, LayoutDashboard, FileText, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

// Mock components to be replaced
import NewComplaint from './NewComplaint';
import ComplaintDetail from "../../components/common/ComplaintDetail";
import NotificationList from "../../components/common/NotificationList";
import ComplaintHistory from './ComplaintHistory';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-darkBorder hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6">
        <h2 className="text-xl font-bold font-jakarta mb-8 text-slate-800 dark:text-white">Student Panel</h2>
        <nav className="flex flex-col gap-2">
           <Link to="/student" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/student' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard className="w-5 h-5" /> Dashboard
           </Link>
           <Link to="/student/new" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/student/new' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <PlusCircle className="w-5 h-5" /> Submit Issue
           </Link>
           <Link to="/student/history" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/student/history' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <FileText className="w-5 h-5" /> My Complaints
           </Link>
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-slate-200 dark:border-darkBorder">
         <button onClick={logout} className="p-3 w-full rounded-lg flex items-center gap-3 font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
         </button>
      </div>
    </aside>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useSocket('complaint_update', () => setRefresh(prev => prev + 1));

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
         const res = await api.get('/complaints');
         if(res.data.success) {
            const data = res.data.data;
            let p = 0, ip = 0, r = 0;
            data.forEach(c => {
               if(c.status === 'Pending' || c.status === 'Assigned') p++;
               else if(c.status === 'In Progress' || c.status === 'Accepted') ip++;
               else if(c.status === 'Resolved') r++;
            });
            setStats({ pending: p, inProgress: ip, resolved: r });
            setRecent(data.slice(0, 5));
         }
      } catch (err) {
        console.error('Fetch Complaints Error:', err?.response?.data?.message || err.message);
      } finally {
         setLoading(false);
      }
    };
    fetchComplaints();
  }, [refresh]);

  if(loading) return <div className="p-8 text-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div></div></div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in relative">
      <div className="card p-6 md:p-8 mb-6 border border-slate-100 dark:border-darkBorder bg-white dark:bg-slate-900 shadow-sm rounded-xl">
         <h1 className="text-2xl md:text-3xl font-jakarta font-bold mb-2 text-slate-800 dark:text-white">Welcome, {user?.name || 'Student'}</h1>
         <p className="text-slate-500 dark:text-slate-400">Track and manage your campus maintenance requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <motion.div initial={{y:10,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0}} className="card p-6 border-l-[6px] border-l-yellow-400 dark:border-l-yellow-500 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-darkBorder rounded-xl rounded-l-md">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Pending Requests</p>
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white">{stats.pending}</h3>
         </motion.div>
         <motion.div initial={{y:10,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}} className="card p-6 border-l-[6px] border-l-orange-500 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-darkBorder rounded-xl rounded-l-md">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">In Progress</p>
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white">{stats.inProgress}</h3>
         </motion.div>
         <motion.div initial={{y:10,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.2}} className="card p-6 border-l-[6px] border-l-green-500 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-darkBorder rounded-xl rounded-l-md">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Resolved</p>
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white">{stats.resolved}</h3>
         </motion.div>
      </div>

      <div className="card bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-darkBorder p-6 mb-10 rounded-xl">
         <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Quick Actions</h2>
         <div className="flex gap-4">
            <Link to="/student/new" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
               <PlusCircle className="w-5 h-5"/> New Issue
            </Link>
            <Link to="/student/history" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
               View All History
            </Link>
         </div>
      </div>

      <h2 id="history" className="text-xl font-bold mb-4 pt-4 text-slate-800 dark:text-white">Recent Complaints</h2>
      <div className="card overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-darkBorder rounded-xl mb-12">
         {recent.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
               <AlertTriangle className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-700"/>
               <p>No complaints found. Create one to get started.</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-darkBorder">
                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Title</th>
                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Category</th>
                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Status</th>
                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Date</th>
                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recent.map((c) => (
                        <tr key={c._id} className="border-b border-slate-100 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                           <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{c.title}</td>
                           <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                 {c.categories && c.categories.map(cat => (
                                    <span key={cat} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">{cat}</span>
                                 ))}
                              </div>
                           </td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                 c.status==='Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                 c.status==='Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                 {c.status}
                              </span>
                           </td>
                           <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                           <td className="p-4">
                              <Link to={`/student/complaint/${c._id}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
                                 View
                              </Link>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};

// Student Main Component
const StudentMain = () => {
  return (
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-950 flex relative">
      <Sidebar />
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        <Routes>
          <Route path="" element={<DashboardHome />} />
          <Route path="new" element={<NewComplaint />} />
          <Route path="history" element={<ComplaintHistory />} />
          <Route path="complaint/:id" element={<ComplaintDetail />} />
          <Route path="notifications" element={<NotificationList />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentMain;
