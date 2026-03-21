import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, AlertTriangle, CheckCircle, Download, Bell, QrCode } from 'lucide-react';
import { format } from 'date-fns';

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#ef5350'];

  if(!summary) return <div className="p-8 text-center animate-pulse">Loading Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-jakarta font-bold mb-6">Authority Dashboard</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6 flex flex-col justify-between">
           <p className="text-sm text-slate-500 font-medium font-jakarta">Total Complaints</p>
           <h3 className="text-4xl font-bold mt-2">{summary.total}</h3>
        </div>
        <div className="card p-6 flex flex-col justify-between">
           <p className="text-sm text-slate-500 font-medium font-jakarta">Pending</p>
           <h3 className="text-4xl font-bold mt-2 text-yellow-600">{summary.pendingCount}</h3>
        </div>
        <div className="card p-6 flex flex-col justify-between">
           <p className="text-sm text-slate-500 font-medium font-jakarta">Resolution Rate</p>
           <h3 className="text-4xl font-bold mt-2 text-green-600">{summary.resolvedPercentage.toFixed(1)}%</h3>
        </div>
        <div className="card p-6 flex flex-col justify-between">
           <p className="text-sm text-slate-500 font-medium font-jakarta">Avg Fix Time</p>
           <h3 className="text-4xl font-bold mt-2 text-blue-600">{summary.avgResolutionTime}h</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="card p-6 h-96">
          <h3 className="font-bold mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catData}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}}/>
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6 h-96">
          <h3 className="font-bold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="count" label>
                {catData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '8px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/authority/queue" className="card p-6 text-center hover:bg-blue-50 dark:hover:bg-slate-800 transition">
          <AlertTriangle className="w-8 h-8 text-blue-600 mx-auto mb-2"/>
          <span className="font-medium">Complaints Queue</span>
        </Link>
        <Link to="/authority/approvals" className="card p-6 text-center hover:bg-blue-50 dark:hover:bg-slate-800 transition">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2"/>
          <span className="font-medium">Maintainer Approvals</span>
        </Link>
        <Link to="/authority/reports" className="card p-6 text-center hover:bg-blue-50 dark:hover:bg-slate-800 transition">
          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2"/>
          <span className="font-medium">PDF Reports</span>
        </Link>
        <Link to="/authority/qr" className="card p-6 text-center hover:bg-blue-50 dark:hover:bg-slate-800 transition">
          <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-2"/>
          <span className="font-medium">Generate QR</span>
        </Link>
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
                {pending.length === 0 ? <p>No pending approvals.</p> : pending.map(m => (
                    <div key={m._id} className="card p-6">
                        <h3 className="text-xl font-bold">{m.name}</h3>
                        <p className="text-slate-500 mb-1">{m.email} • {m.phone}</p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold uppercase">{m.jobType}</span>
                        <div className="flex gap-2 mt-6">
                            <button onClick={()=>handleApprove(m._id, 'approve')} className="flex-1 bg-green-600 text-white rounded py-2 font-medium hover:bg-green-700">Approve</button>
                            <button onClick={()=>handleApprove(m._id, 'reject')} className="flex-1 bg-red-100 text-red-700 rounded py-2 font-medium hover:bg-red-200">Reject</button>
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
                <div className="card p-6">
                    <h3 className="font-bold mb-4">Room Details</h3>
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Room Number</label>
                            <input type="text" required className="input-field" value={roomData.roomNumber} onChange={e=>setRoomData({...roomData, roomNumber: e.target.value})} placeholder="e.g. 101" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Block</label>
                            <input type="text" required className="input-field" value={roomData.block} onChange={e=>setRoomData({...roomData, block: e.target.value})} placeholder="e.g. A" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Floor</label>
                            <input type="text" required className="input-field" value={roomData.floor} onChange={e=>setRoomData({...roomData, floor: e.target.value})} placeholder="e.g. 1" />
                        </div>
                        <button type="submit" disabled={generating} className="btn-primary w-full py-2">
                            {generating ? 'Generating...' : 'Generate QR Code'}
                        </button>
                    </form>
                </div>
                <div className="card p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                    {qrCode ? (
                        <>
                            <img src={qrCode} alt="Room QR" className="w-48 h-48 mb-4 border-4 border-white shadow-lg rounded" />
                            <h4 className="font-bold text-lg mb-1">Room {roomData.roomNumber}</h4>
                            <p className="text-slate-500 text-sm mb-4">Block {roomData.block}, Floor {roomData.floor}</p>
                            <a href={qrCode} download={`QR_Room_${roomData.roomNumber}.png`} className="btn-primary py-2 px-6 flex items-center gap-2">
                                <Download className="w-4 h-4"/> Download & Print
                            </a>
                        </>
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center">
                            <QrCode className="w-16 h-16 mb-2 opacity-30" />
                            <p>Fill form to generate a scannable QR code.<br/>Students can scan it to quickly report issues.</p>
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
    <div className="min-h-screen pt-16 bg-slate-50 dark:bg-darkBg w-full">
      <Routes>
        <Route path="" element={<DashboardHome />} />
        <Route path="queue" element={<ComplaintsQueue />} />
        <Route path="approvals" element={<MaintainerApprovals />} />
        <Route path="reports" element={<div className="max-w-4xl mx-auto p-8"><h1 className="text-2xl font-bold mb-4">Reports</h1><a href="/api/analytics/report" target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2"><Download className="w-4 h-4"/> Download PDF</a></div>} />
        <Route path="qr" element={<QRGenerator />} />
      </Routes>
    </div>
  );
};

export default AuthorityMain;
