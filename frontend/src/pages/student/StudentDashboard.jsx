import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import api from '../../api/axios';
import { PlusCircle, Clock, CheckCircle, PackageOpen, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Mock components to be replaced
import NewComplaint from './NewComplaint';
import ComplaintDetail from "../../components/common/ComplaintDetail";
import NotificationList from "../../components/common/NotificationList";

const DashboardHome = () => {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if(loading) return <div className="p-8 text-center"><div className="animate-pulse flex flex-col items-center"><div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div><div className="h-4 w-32 bg-slate-200 rounded"></div></div></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl md:text-3xl font-jakarta font-bold">Student Dashboard</h1>
         <Link to="/student/new" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-5 h-5"/> New Complaint
         </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="card p-6 flex items-center gap-4 border-l-4 border-l-yellow-500">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Clock className="w-8 h-8"/></div>
            <div><p className="text-sm text-slate-500 font-medium">Pending/Assigned</p><h3 className="text-3xl font-bold">{stats.pending}</h3></div>
         </motion.div>
         <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}} className="card p-6 flex items-center gap-4 border-l-4 border-l-orange-500">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><PackageOpen className="w-8 h-8"/></div>
            <div><p className="text-sm text-slate-500 font-medium">In Progress</p><h3 className="text-3xl font-bold">{stats.inProgress}</h3></div>
         </motion.div>
         <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.2}} className="card p-6 flex items-center gap-4 border-l-4 border-l-green-500">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle className="w-8 h-8"/></div>
            <div><p className="text-sm text-slate-500 font-medium">Resolved</p><h3 className="text-3xl font-bold">{stats.resolved}</h3></div>
         </motion.div>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Complaints</h2>
      <div className="card overflow-hidden">
         {recent.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
               <AlertTriangle className="w-12 h-12 mb-2 text-slate-300"/>
               <p>No complaints found. Create one to get started.</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-darkBorder">
                        <th className="p-4 font-medium text-sm text-slate-600 dark:text-slate-400">Title</th>
                        <th className="p-4 font-medium text-sm text-slate-600 dark:text-slate-400">Category</th>
                        <th className="p-4 font-medium text-sm text-slate-600 dark:text-slate-400">Status</th>
                        <th className="p-4 font-medium text-sm text-slate-600 dark:text-slate-400">Date</th>
                        <th className="p-4 font-medium text-sm text-slate-600 dark:text-slate-400">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recent.map((c) => (
                        <tr key={c._id} className="border-b border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                           <td className="p-4 font-medium">{c.title}</td>
                           <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">{c.category}</span></td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                 c.status==='Resolved' ? 'bg-green-100 text-green-700' :
                                 c.status==='Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                 {c.status}
                              </span>
                           </td>
                           <td className="p-4 text-sm text-slate-500">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                           <td className="p-4"><Link to={`/student/complaint/${c._id}`} className="text-blue-600 hover:underline text-sm font-medium">View</Link></td>
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
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-darkBg">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="new" element={<NewComplaint />} />
        <Route path="complaint/:id" element={<ComplaintDetail />} />
        <Route path="notifications" element={<NotificationList />} />
      </Routes>
    </div>
  );
};

export default StudentMain;
