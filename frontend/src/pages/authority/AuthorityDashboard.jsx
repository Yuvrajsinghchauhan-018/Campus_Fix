import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, AlertTriangle, CheckCircle, Download, Bell, QrCode, LayoutDashboard, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

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
  }, []);

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
    const [complaints, setComplaints] = useState([]);
    const [maintainers, setMaintainers] = useState([]);
    const [selectedComp, setSelectedComp] = useState(null); // for assigning modal
    const [assignData, setAssignData] = useState({ assignedTo: '', deadline: '', internalNote: '' });

    const fetchAll = async () => {
        const cRes = await api.get('/complaints');
        const mRes = await api.get('/maintainers');
        setComplaints(cRes.data.data.filter(c => c.status !== 'Resolved'));
        setMaintainers(mRes.data.data);
    };

    useEffect(() => { fetchAll(); }, []);

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
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in relative text-sm md:text-base">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Active Complaints Queue</h1>
            <div className="card overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-darkBorder">
                            <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Title & Location</th>
                            <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Category & Priority</th>
                            <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                            <th className="p-4 font-medium text-slate-600 dark:text-slate-400">Assign</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-darkBorder">
                        {complaints.map(c => (
                            <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-4">
                                    <p className="font-bold">{c.title}</p>
                                    <p className="text-xs text-slate-500">{c.roomNumber}, Block {c.block}</p>
                                </td>
                                <td className="p-4">
                                    <p>{c.category}</p>
                                    <p className={`text-xs font-bold ${c.priority==='Urgent'?'text-red-500':''}`}>{c.priority}</p>
                                </td>
                                <td className="p-4 font-medium">{c.status}</td>
                                <td className="p-4">
                                    {c.status === 'Pending' ? (
                                        <button onClick={() => setSelectedComp(c)} className="btn-primary py-1 px-3 text-sm">Assign</button>
                                    ) : (
                                        <span className="text-sm text-slate-500">Assigned</span>
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
                                <label className="block text-sm font-medium mb-1">Select Maintainer</label>
                                <select required className="input-field" onChange={e => setAssignData({...assignData, assignedTo: e.target.value})}>
                                    <option value="">-- Choose --</option>
                                    {maintainers
                                        .filter(m => {
                                            if(selectedComp.category === 'Electrical') return m.jobType === 'Electrician';
                                            if(selectedComp.category === 'Plumbing') return m.jobType === 'Plumber';
                                            // Add more naive filtering
                                            return true;
                                        })
                                        .map(m => (
                                        <option key={m._id} value={m._id}>{m.name} ({m.jobType}) - Score: {m.performanceScore}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">SLA Deadline</label>
                                <input type="datetime-local" required className="input-field" onChange={e => setAssignData({...assignData, deadline: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Internal Note (Optional)</label>
                                <input type="text" className="input-field" onChange={e => setAssignData({...assignData, internalNote: e.target.value})} />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 btn-primary py-2">Confirm Assignment</button>
                                <button type="button" onClick={()=>setSelectedComp(null)} className="flex-1 py-2 rounded-lg border border-slate-300 font-medium">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. Maintainer Approvals
const MaintainerApprovals = () => {
    const [pending, setPending] = useState([]);
    
    const fetchPending = async () => {
        const res = await api.get('/maintainers/pending');
        setPending(res.data.data);
    };
    useEffect(() => { fetchPending(); }, []);

    const handleApprove = async (id, status) => {
        await api.patch(`/maintainers/${id}/${status}`);
        fetchPending();
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">Maintainer Approvals</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pending.length === 0 ? <p className="text-slate-500">No pending approvals.</p> : pending.map(m => (
                    <div key={m._id} className="card p-6 border-l-4 border-l-blue-500 shadow-sm rounded-xl">
                        <h3 className="text-xl font-bold">{m.name}</h3>
                        <p className="text-slate-500 mb-1">{m.email} • {m.phone}</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold uppercase inline-block mt-2">{m.jobType}</span>
                        <div className="flex gap-2 mt-6 border-t border-slate-100 pt-4">
                            <button onClick={()=>handleApprove(m._id, 'approve')} className="flex-1 bg-green-100 text-green-700 rounded-lg py-2 font-bold hover:bg-green-200 transition-colors">Approve</button>
                            <button onClick={()=>handleApprove(m._id, 'reject')} className="flex-1 bg-red-50 text-red-600 rounded-lg py-2 font-bold hover:bg-red-100 transition-colors">Reject</button>
                        </div>
                    </div>
                ))}
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
          <Route path="reports" element={<div className="max-w-4xl mx-auto p-8 animate-fade-in"><div className="card p-10 text-center flex flex-col items-center shadow-sm rounded-xl border border-slate-100 dark:border-slate-800"><FileText className="w-16 h-16 text-blue-500 mb-4 opacity-80"/><h1 className="text-3xl font-bold mb-4 font-jakarta">Monthly PDF Reports</h1><p className="text-slate-500 max-w-md mx-auto mb-8">Download a comprehensive PDF summarizing the resolution rates, maintenance costs, and SLA adherence across all campus sectors.</p><a href="/api/analytics/report" target="_blank" rel="noreferrer" className="btn-primary py-3 px-8 text-lg font-bold shadow-md inline-flex items-center gap-3"><Download className="w-5 h-5"/> Generate Full System Report</a></div></div>} />
          <Route path="qr" element={<QRGenerator />} />
        </Routes>
      </div>
    </div>
  );
};

export default AuthorityMain;
