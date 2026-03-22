import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api, { STATIC_BASE_URL } from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, AlertTriangle, CheckCircle, Download, Bell, QrCode, LayoutDashboard, LogOut, UserPlus, X, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-darkBorder hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-6">
        <h2 className="text-xl font-bold font-jakarta mb-8 text-slate-800 dark:text-white">Authority Panel</h2>
        <nav className="flex flex-col gap-2">
           <Link to="/authority" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/authority' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard className="w-5 h-5" /> Dashboard Overview
           </Link>
           <Link to="/authority/queue" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/authority/queue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <AlertTriangle className="w-5 h-5" /> Complaints Queue
           </Link>
           <Link to="/authority/approvals" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/authority/approvals' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Users className="w-5 h-5" /> Maintainer Approvals
           </Link>
           <Link to="/authority/add-maintainer" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/authority/add-maintainer' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <UserPlus className="w-5 h-5" /> Add Maintainer
           </Link>
           <Link to="/authority/reports" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/authority/reports' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <FileText className="w-5 h-5" /> PDF Reports
           </Link>
           <Link to="/authority/qr" className={`p-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${location.pathname === '/authority/qr' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <QrCode className="w-5 h-5" /> Generate QR Node
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

// 1. Dashboard Home (Stats & Charts)
const DashboardHome = () => {
  const [summary, setSummary] = useState(null);
  const [catData, setCatData] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useSocket('complaint_update', () => setRefresh(prev => prev + 1));
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSum = await api.get('/analytics/summary');
        const resCat = await api.get('/analytics/by-category');
        setSummary(resSum.data.data);
        setCatData(resCat.data.data.map(d => ({ name: d._id, count: d.count })));
      } catch (err) {
        console.error('Fetch Analytics Error:', err?.response?.data?.message || err.message);
      }
    };
    fetchData();
  }, [refresh]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  if(!summary) return <div className="p-8 text-center animate-pulse text-slate-500">Loading Operations Data...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-jakarta font-bold text-slate-800 dark:text-white mb-2">Authority Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Holistic overview of campus maintenance health.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 border-l-[6px] border-l-slate-700 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
           <p className="text-sm text-slate-500 font-medium font-jakarta mb-1">Total Complaints</p>
           <h3 className="text-4xl font-bold mt-2 text-slate-800 dark:text-white">{summary.total}</h3>
        </div>
        <div className="card p-6 border-l-[6px] border-l-yellow-500 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
           <p className="text-sm text-slate-500 font-medium font-jakarta mb-1">Pending Action</p>
           <h3 className="text-4xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">{summary.pendingCount}</h3>
        </div>
        <div className="card p-6 border-l-[6px] border-l-green-500 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
           <p className="text-sm text-slate-500 font-medium font-jakarta mb-1">Resolution Rate</p>
           <h3 className="text-4xl font-bold mt-2 text-green-600 dark:text-green-400">{summary.resolvedPercentage.toFixed(1)}%</h3>
        </div>
        <div className="card p-6 border-l-[6px] border-l-blue-500 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
           <p className="text-sm text-slate-500 font-medium font-jakarta mb-1">Avg Fix Time</p>
           <h3 className="text-4xl font-bold mt-2 text-blue-600 dark:text-blue-400">{summary.avgResolutionTime}h</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6 lg:p-8 h-[400px] shadow-sm rounded-xl border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold mb-6 text-slate-800 dark:text-white text-lg">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={catData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6 lg:p-8 h-[400px] shadow-sm rounded-xl border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold mb-6 text-slate-800 dark:text-white text-lg">Category Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="count" label={{ fill: '#94a3b8', fontSize: 12 }}>
                {catData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 2. Complaints Queue
const ComplaintsQueue = () => {
    const [complaints, setComplaints] = useState({ queue: [], assigned: [], completed: [], dismissed: [] });
    const [tab, setTab] = useState('queue');
    const [maintainers, setMaintainers] = useState([]);
    const [selectedComp, setSelectedComp] = useState(null); // for assigning modal
    const [viewingComp, setViewingComp] = useState(null); // for full view modal
    const [assignData, setAssignData] = useState({ assignedMaintainer: '', deadline: '', internalNote: '' });
    const [dismissComp, setDismissComp] = useState(null);
    const [dismissReason, setDismissReason] = useState('Inappropriate Content');
    const [customReason, setCustomReason] = useState('');
    const [dismissing, setDismissing] = useState(false);
    const [refresh, setRefresh] = useState(0);

    useSocket('complaint_update', () => setRefresh(prev => prev + 1));
    useSocket('maintainer_update', () => setRefresh(prev => prev + 1));

    const fetchAll = async () => {
        const cRes = await api.get('/complaints');
        const mRes = await api.get('/maintainers');
        const allComps = cRes.data.data || [];
        setComplaints({
            queue: allComps.filter(c => !c.assignedMaintainer && c.status !== 'Resolved' && c.status !== 'Rejected'),
            assigned: allComps.filter(c => c.assignedMaintainer && c.status !== 'Resolved' && c.status !== 'Rejected'),
            completed: allComps.filter(c => c.status === 'Resolved'),
            dismissed: allComps.filter(c => c.status === 'Rejected')
        });
        setMaintainers(mRes.data.data);
    };

    useEffect(() => { fetchAll(); }, [refresh]);

    const handleAssignForm = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/complaints/${selectedComp._id}/approve-assign`, assignData);
            setSelectedComp(null);
            fetchAll();
        } catch (err) {
            console.error('Assignment Error:', err?.response?.data?.message || err.message);
            alert(err?.response?.data?.message || "Failed to assign maintainer");
        }
    };

    const handleDismissSubmit = async (e) => {
        e.preventDefault();
        setDismissing(true);
        const finalReason = dismissReason === 'Other' ? customReason : dismissReason;
        try {
            await api.patch(`/complaints/${dismissComp._id}/status`, { status: 'Rejected', resolutionNote: finalReason });
            setDismissComp(null);
            fetchAll();
        } catch(err) {
            alert(err?.response?.data?.message || err.message);
        } finally {
            setDismissing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in relative text-sm md:text-base">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 dark:border-darkBorder pb-4 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">Complaints Management</h1>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
                    <button onClick={() => setTab('queue')} className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${tab === 'queue' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}>Task Queue ({complaints.queue.length})</button>
                    <button onClick={() => setTab('assigned')} className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${tab === 'assigned' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600' : 'text-slate-500'}`}>Assigned ({complaints.assigned.length})</button>
                    <button onClick={() => setTab('completed')} className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${tab === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600' : 'text-slate-500'}`}>Completed ({complaints.completed.length})</button>
                    <button onClick={() => setTab('dismissed')} className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${tab === 'dismissed' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-slate-500'}`}>Dismissed ({complaints.dismissed.length})</button>
                </div>
            </div>
            
            <div className="card overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-darkBorder">
                            <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Title & Location</th>
                            <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Category & Priority</th>
                            <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                            {tab === 'queue' ? (
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Assign</th>
                            ) : tab === 'assigned' ? (
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Maintainer</th>
                            ) : (
                                <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Resolution Note</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-darkBorder">
                        {(tab === 'queue' ? complaints.queue : tab === 'assigned' ? complaints.assigned : tab === 'completed' ? complaints.completed : complaints.dismissed).map(c => (
                            <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-4">
                                    <button onClick={() => setViewingComp(c)} className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-700 underline-offset-4 text-left">
                                        {c.title}
                                    </button>
                                    <p className="text-xs text-slate-500 mt-1">{c.roomNumber}, Block {c.block}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {c.categories && c.categories.map(cat => <span key={cat} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase">{cat}</span>)}
                                    </div>
                                    <p className={`text-xs font-bold mt-1 ${c.priority==='Urgent'?'text-red-500':''}`}>{c.priority}</p>
                                </td>
                                <td className="p-4 font-medium">
                                    {c.status}
                                    {tab === 'completed' && c.assignedMaintainer && <p className="text-[11px] text-slate-500 font-normal mt-1 uppercase tracking-widest hidden sm:block">By: {c.assignedMaintainer.name}</p>}
                                </td>
                                <td className="p-4">
                                    {tab === 'queue' ? (
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => setSelectedComp(c)} className="btn-primary py-1 px-3 text-sm">Assign</button>
                                            <button onClick={() => setDismissComp(c)} className="py-1 px-3 text-sm border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 rounded shadow-sm transition">Dismiss</button>
                                        </div>
                                    ) : tab === 'assigned' ? (
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{c.assignedMaintainer?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{c.assignedMaintainer?.jobType}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-600 italic line-clamp-2">{c.resolutionNote || 'No notes provided.'}</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedComp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={()=>setSelectedComp(null)}>
                    <div className="card p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Assign Maintainer</h2>
                        <form onSubmit={handleAssignForm} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Maintainer</label>
                                <select required className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-blue-500 block p-3.5 shadow-sm transition-all" onChange={e => setAssignData({...assignData, assignedMaintainer: e.target.value})}>
                                    <option value="">-- Choose --</option>
                                    {maintainers
                                        .filter(m => {
                                            if(selectedComp.categories?.includes('Electrical') && m.jobType === 'Electrician') return true;
                                            if(selectedComp.categories?.includes('Plumbing') && m.jobType === 'Plumber') return true;
                                            return true;
                                        })
                                        .map(m => (
                                        <option key={m._id} value={m._id}>{m.name} ({m.jobType}) - Score: {m.performanceScore}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">SLA Deadline</label>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {[
                                        { label: 'End of Day', hours: 8 },
                                        { label: '24 Hours', hours: 24 },
                                        { label: '48 Hours', hours: 48 },
                                        { label: '1 Week', hours: 168 }
                                    ].map(opt => {
                                        // Calculate a fixed target date for equality checking without shifting milliseconds on re-renders
                                        const now = new Date();
                                        now.setHours(now.getHours() + opt.hours);
                                        // Floor it to minutes to match datetime-local format precisely
                                        now.setSeconds(0, 0);
                                        const targetDate = now.toISOString().slice(0, 16);
                                        
                                        return (
                                            <div 
                                                key={opt.label}
                                                onClick={() => setAssignData({...assignData, deadline: targetDate})}
                                                className={`cursor-pointer text-center py-2.5 px-3 text-[13px] font-bold rounded-xl border transition-all ${assignData.deadline === targetDate ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'}`}
                                            >
                                                {opt.label}
                                            </div>
                                        );
                                    })}
                                </div>
                                <input type="datetime-local" required className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-blue-500 block p-3.5 shadow-sm transition-all" value={assignData.deadline || ''} onChange={e => setAssignData({...assignData, deadline: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Internal Note (Optional)</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-blue-500 block p-3.5 shadow-sm transition-all" placeholder="e.g. Check wiring first" onChange={e => setAssignData({...assignData, internalNote: e.target.value})} />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="submit" className="flex-1 btn-primary py-3 px-6 shadow-md shadow-blue-500/20">Confirm Assignment</button>
                                <button type="button" onClick={()=>setSelectedComp(null)} className="flex-1 py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 text-sm transition-all shadow-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {dismissComp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={()=>setDismissComp(null)}>
                    <div className="card p-6 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 rounded-2xl" onClick={e=>e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Dismiss Job</h2>
                        <form onSubmit={handleDismissSubmit}>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Reason for Dismissal</label>
                            <div className="space-y-3 mb-4">
                                {['Inappropriate Content', 'Already Solved', 'Out of Scope', 'Not Enough Information', 'Other'].map(r => (
                                    <label key={r} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded transition-colors">
                                        <input type="radio" name="dismissReason" value={r} checked={dismissReason === r} onChange={() => setDismissReason(r)} className="accent-red-500 w-4 h-4" />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{r}</span>
                                    </label>
                                ))}
                            </div>
                            {dismissReason === 'Other' && (
                                <textarea required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm mb-4 focus:ring-2 focus:ring-red-500 transition-all dark:text-white" placeholder="Enter custom reason..." value={customReason} onChange={e => setCustomReason(e.target.value)} rows={3} />
                            )}
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={dismissing} className="flex-1 bg-red-600 text-white rounded-xl py-3 font-bold shadow-md hover:bg-red-700 transition disabled:opacity-70">{dismissing ? 'Dismissing...' : 'Confirm Dismissal'}</button>
                                <button type="button" onClick={()=>setDismissComp(null)} className="flex-1 py-3 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingComp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm shadow-2xl overflow-y-auto" onClick={() => setViewingComp(null)}>
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900/95 p-6 md:p-8 relative flex flex-col my-auto shadow-2xl border border-slate-100 dark:border-white/10 rounded-[2rem] max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold font-jakarta text-slate-800 dark:text-white mb-1">{viewingComp.title}</h2>
                                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">Room {viewingComp.roomNumber}, Block {viewingComp.block}, Floor {viewingComp.floor} • <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold uppercase tracking-widest text-[10px]">{viewingComp.locationType}</span></p>
                            </div>
                            <button onClick={()=>setViewingComp(null)} className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 dark:bg-slate-800 dark:hover:bg-red-900/20 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-6 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50 text-sm leading-relaxed whitespace-pre-line shadow-inner">
                            {viewingComp.description}
                        </div>

                        {viewingComp.photos && viewingComp.photos.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300"><ImageIcon className="w-4 h-4"/> Attached Evidence</h4>
                                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                    {viewingComp.photos.map((url, i) => (
                                        <a href={url?.startsWith('/uploads/') ? `${STATIC_BASE_URL}${url}` : url} target="_blank" rel="noreferrer" key={i} className="shrink-0 overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                                            <img src={url?.startsWith('/uploads/') ? `${STATIC_BASE_URL}${url}` : url} alt="Evidence" className="w-40 h-40 object-cover" onError={(e) => { e.target.src = 'https://placehold.co/400x400/png?text=Image+Not+Found'; }} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Current Status</span>
                                <span className={`font-bold text-sm px-3 py-1 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg ${viewingComp.status==='Pending'?'text-orange-500':viewingComp.status==='Assigned'?'text-blue-500':viewingComp.status==='Resolved'?'text-green-500':'text-slate-700'}`}>{viewingComp.status}</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Priority Engine</span>
                                <span className={`font-bold text-sm px-3 py-1 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg ${viewingComp.priority==='Urgent'?'text-red-500':viewingComp.priority==='High'?'text-orange-500':'text-slate-700 dark:text-slate-300'}`}>{viewingComp.priority}</span>
                            </div>
                            {viewingComp.aiReason && (
                                <div className="col-span-2 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> Deepmind Architecture Rationale</span>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-2 border-blue-300 dark:border-blue-700 pl-3">{viewingComp.aiReason}</p>
                                </div>
                            )}
                        </div>

                        {viewingComp.status === 'Pending' && (
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button onClick={()=>{setSelectedComp(viewingComp); setViewingComp(null);}} className="btn-primary py-3.5 px-8 font-bold shadow-xl shadow-blue-500/20 w-full md:w-auto">Assign Resources Automatically</button>
                            </div>
                        )}
                        {viewingComp.status !== 'Pending' && viewingComp.assignedMaintainer && (
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="card p-4 border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Allocated Technician</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{viewingComp.assignedMaintainer.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Domain</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400">{viewingComp.assignedMaintainer.jobType}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. Maintainer Approvals
const MaintainerApprovals = () => {
    const [pending, setPending] = useState([]);
    const [refresh, setRefresh] = useState(0);
    
    useSocket('maintainer_update', () => setRefresh(prev => prev + 1));

    const fetchPending = async () => {
        const res = await api.get('/maintainers/pending');
        setPending(res.data.data);
    };
    useEffect(() => { fetchPending(); }, [refresh]);

    const handleApprove = async (id, status) => {
        await api.patch(`/maintainers/${id}/${status}`);
        fetchPending();
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in relative">
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 px-6 py-4 rounded-2xl mb-8 border border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">Maintainer Domain</h1>
                    <p className="text-slate-500 text-sm mt-1">Review and approve pending applications seamlessly.</p>
                </div>
            </div>
            
            <h2 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-widest text-[11px]">Pending Approval Requests ({pending.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pending.length === 0 ? <p className="text-slate-500 dark:text-slate-400">No pending approvals detected currently.</p> : pending.map(m => (
                    <div key={m._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border-l-4 border-l-blue-500 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] rounded-lg font-bold uppercase tracking-widest leading-none">{m.jobType || "Unclassified"}</span>
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        </div>
                        <h3 className="text-xl font-bold truncate text-slate-800 dark:text-white">{m.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6 font-mono text-sm tracking-tight">{m.phone}</p>
                        
                        <div className="flex gap-3 mt-auto border-t border-slate-100 dark:border-slate-800 pt-5">
                            <button onClick={()=>handleApprove(m._id, 'approve')} className="flex-1 bg-green-50 hover:bg-green-500 hover:text-white dark:bg-green-900/20 dark:hover:bg-green-500 text-green-700 dark:text-green-400 rounded-xl py-2.5 text-sm font-bold transition-colors border border-green-200 dark:border-green-800/30 hover:shadow-lg hover:shadow-green-500/20">
                                Approve
                            </button>
                            <button onClick={()=>handleApprove(m._id, 'reject')} className="flex-[0.5] bg-slate-50 hover:bg-red-500 hover:text-white dark:bg-slate-800/50 dark:hover:bg-red-500 text-slate-600 dark:text-slate-400 rounded-xl py-2.5 text-sm font-bold transition-colors border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-red-500/20">
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

const AddMaintainerPanel = () => {
    const [newMaint, setNewMaint] = useState({ name: '', phone: '', jobType: 'Electrician' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/maintainers', newMaint);
            setSuccess(true);
            setNewMaint({ name: '', phone: '', jobType: 'Electrician' });
        } catch(err) {
            alert(err?.response?.data?.error || "Error creating maintainer");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in relative">
            {success && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center transform transition-all translate-y-0 scale-100">
                        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100 dark:border-green-800">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold font-jakarta text-slate-800 dark:text-white mb-3">Success!</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">Maintainer has been successfully created and added to the database.</p>
                        <button onClick={() => setSuccess(false)} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-slate-500/20">
                            Continue
                        </button>
                    </div>
                </div>
            )}
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden flex items-center px-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
                    <div className="relative z-10 text-white">
                        <div className="flex items-center gap-3 mb-2">
                           <UserPlus className="w-8 h-8 text-white/90" />
                           <h2 className="text-3xl font-jakarta font-extrabold tracking-tight text-white">Add Maintainer</h2>
                        </div>
                        <p className="text-white/80 font-medium">Bypass pending approvals and directly provision field agents securely.</p>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <form onSubmit={handleCreate} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-6 md:border-r border-slate-100 dark:border-slate-800 md:pr-10">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <input type="text" required className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-4 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800" value={newMaint.name} onChange={e=>setNewMaint({...newMaint, name: e.target.value})} placeholder="e.g. Ramesh Singh"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Secure Phone</label>
                                    <input type="tel" required maxLength={10} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-4 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800" value={newMaint.phone} onChange={e=>setNewMaint({...newMaint, phone: e.target.value})} placeholder="10-digit number used for authentication" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Operative Domain</label>
                                    <div className="grid grid-cols-2 gap-3 relative">
                                        {['Electrician','Plumber','IT Technician','AC Mechanic','Carpenter','Civil Worker'].map(j => (
                                            <div 
                                                key={j} 
                                                onClick={() => setNewMaint({...newMaint, jobType: j})}
                                                className={`cursor-pointer border text-sm font-bold text-center p-3.5 rounded-xl transition-all ${newMaint.jobType === j ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                {j}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button type="submit" disabled={submitting} className="btn-primary py-4 px-10 text-lg font-bold shadow-xl shadow-blue-500/20 disabled:opacity-70 transition-transform hover:-translate-y-1 flex items-center gap-3">
                                <UserPlus className="w-5 h-5"/> {submitting ? 'Authenticating...' : 'Create Maintainer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const QRGenerator = () => {
    const [roomData, setRoomData] = useState({ roomNumber: '', block: '', floor: '' });
    const [qrCode, setQrCode] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const res = await api.post('/analytics/qr', roomData);
            if(res.data.success) {
                setQrCode(res.data.data.qrCodeDataUrl);
            }
        } catch (err) {
            console.error('QR Generation Error:', err?.response?.data?.message || err.message);
        }
        finally { setGenerating(false); }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><QrCode className="text-blue-600"/> Generate Room QR Map</h1>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="card p-6 shadow-sm rounded-xl border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold mb-4 text-lg">Room Query Details</h3>
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Room Number</label>
                            <input type="text" required className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400 dark:text-white dark:focus:ring-blue-500" value={roomData.roomNumber} onChange={e=>setRoomData({...roomData, roomNumber: e.target.value})} placeholder="e.g. 101" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Block</label>
                            <input type="text" required className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400 dark:text-white dark:focus:ring-blue-500" value={roomData.block} onChange={e=>setRoomData({...roomData, block: e.target.value})} placeholder="e.g. A" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Floor</label>
                            <input type="text" required className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-400 dark:text-white dark:focus:ring-blue-500" value={roomData.floor} onChange={e=>setRoomData({...roomData, floor: e.target.value})} placeholder="e.g. 1" />
                        </div>
                        <button type="submit" disabled={generating} className="btn-primary w-full py-3 mt-4 text-base font-bold shadow-md">
                            {generating ? 'Generating Node Code...' : 'Generate Assignment QR'}
                        </button>
                    </form>
                </div>
                <div className="card p-6 shadow-sm rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px] text-center bg-slate-50/50 dark:bg-slate-900/50">
                    {qrCode ? (
                        <>
                            <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-4">
                               <img src={qrCode} alt="Room QR" className="w-48 h-48" />
                            </div>
                            <h4 className="font-bold text-xl mb-1 text-slate-800 dark:text-white">Room Node: {roomData.roomNumber}</h4>
                            <p className="text-slate-500 text-sm mb-6">Block {roomData.block}, Floor {roomData.floor}</p>
                            <a href={qrCode} download={`QR_Room_${roomData.roomNumber}.png`} className="btn-primary py-2.5 px-6 flex items-center gap-2 shadow-sm">
                                <Download className="w-4 h-4"/> Download Printable Code
                            </a>
                        </>
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                            <QrCode className="w-16 h-16 mb-4 opacity-40 text-blue-500" />
                            <p className="text-sm">Input room details on the left to mint a static QR map point.<br/>Placing these helps precise location reporting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Export
const AuthorityMain = () => {
  return (
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-slate-950 flex relative">
      <Sidebar />
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        <Routes>
          <Route path="" element={<DashboardHome />} />
          <Route path="queue" element={<ComplaintsQueue />} />
          <Route path="approvals" element={<MaintainerApprovals />} />
          <Route path="add-maintainer" element={<AddMaintainerPanel />} />
          <Route path="reports" element={<div className="max-w-4xl mx-auto p-8 animate-fade-in"><div className="card p-10 text-center flex flex-col items-center shadow-sm rounded-xl border border-slate-100 dark:border-slate-800"><FileText className="w-16 h-16 text-blue-500 mb-4 opacity-80"/><h1 className="text-3xl font-bold mb-4 font-jakarta">Monthly PDF Reports</h1><p className="text-slate-500 max-w-md mx-auto mb-8">Download a comprehensive PDF summarizing the resolution rates, maintenance costs, and SLA adherence across all campus sectors.</p><a href="/api/analytics/report" target="_blank" rel="noreferrer" className="btn-primary py-3 px-8 text-lg font-bold shadow-md inline-flex items-center gap-3"><Download className="w-5 h-5"/> Generate Full System Report</a></div></div>} />
          <Route path="qr" element={<QRGenerator />} />
        </Routes>
      </div>
    </div>
  );
};

export default AuthorityMain;
