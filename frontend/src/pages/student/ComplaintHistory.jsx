import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { format } from 'date-fns';
import { AlertTriangle, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
         const res = await api.get('/complaints');
         if(res.data.success) {
            setComplaints(res.data.data);
         }
      } catch (err) {
        console.error('Fetch Complaints Error:', err?.response?.data?.message || err.message);
      } finally {
         setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) {
     return (
        <div className="flex h-[70vh] items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
     );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
         <div>
            <h1 className="text-2xl md:text-3xl font-jakarta font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
               <FileText className="w-8 h-8 text-blue-500" />
               My Complaints History
            </h1>
            <p className="text-slate-500 dark:text-slate-400">View and track all the issues you have reported.</p>
         </div>
         <Link to="/student" className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
         </Link>
      </div>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 border border-slate-100 dark:border-darkBorder rounded-2xl">
         {complaints.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-slate-400 dark:text-slate-500"/>
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No complaints yet</h3>
               <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">You haven't lodged any complaints. When you do, they will appear here along with their status.</p>
               <Link to="/student/new" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue-600/20">
                  Report a New Issue
               </Link>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                     <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-darkBorder">
                        <th className="p-5 font-bold text-sm text-slate-600 dark:text-slate-300">Issue Title</th>
                        <th className="p-5 font-bold text-sm text-slate-600 dark:text-slate-300">Category</th>
                        <th className="p-5 font-bold text-sm text-slate-600 dark:text-slate-300">Location</th>
                        <th className="p-5 font-bold text-sm text-slate-600 dark:text-slate-300">Status</th>
                        <th className="p-5 font-bold text-sm text-slate-600 dark:text-slate-300">Date Logged</th>
                        <th className="p-5 font-bold text-sm text-slate-600 dark:text-slate-300">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {complaints.map((c, i) => (
                        <motion.tr 
                           initial={{ opacity: 0, y: 10 }} 
                           animate={{ opacity: 1, y: 0 }} 
                           transition={{ delay: i * 0.05 }}
                           key={c._id} 
                           className="border-b border-slate-100 dark:border-darkBorder hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition group"
                        >
                           <td className="p-5 font-medium text-slate-800 dark:text-slate-200">
                              <span className="line-clamp-1">{c.title}</span>
                           </td>
                           <td className="p-5">
                              <div className="flex flex-wrap gap-1">
                                 {c.categories && c.categories.map(cat => (
                                    <span key={cat} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                       {cat}
                                    </span>
                                 ))}
                              </div>
                           </td>
                           <td className="p-5 text-sm text-slate-600 dark:text-slate-400">
                              {c.block} - {c.roomNumber}
                           </td>
                           <td className="p-5">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${ /* Beautiful status pills */
                                 c.status==='Resolved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' :
                                 c.status==='Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50' : 
                                 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50'
                              }`}>
                                 {c.status}
                              </span>
                           </td>
                           <td className="p-5 text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                              {format(new Date(c.createdAt), 'MMM d, yyyy')}
                           </td>
                           <td className="p-5">
                              <Link to={`/student/complaint/${c._id}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-4 py-2 rounded-lg transition-colors">
                                 View Details
                              </Link>
                           </td>
                        </motion.tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};

export default ComplaintHistory;
