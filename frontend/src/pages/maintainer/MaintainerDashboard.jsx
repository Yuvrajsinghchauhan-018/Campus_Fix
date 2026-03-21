import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Wrench, CheckCircle, Clock, AlertTriangle, PlayCircle, Image as ImageIcon, CheckSquare, UploadCloud, X, ArrowLeft, Star } from 'lucide-react';
import { format } from 'date-fns';

const MaintainerHome = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/complaints');
        setTasks(res.data.data);
      } catch (err) {
        console.error('Fetch Tasks Error:', err?.response?.data?.message || err.message);
      }
      finally { setLoading(false); }
    };
    fetchTasks();
  }, []);

  const pending = tasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress');
  const resolved = tasks.filter(t => t.status === 'Resolved');
  
  const badgeLevel = user.totalTasksCompleted > 60 ? 'Master' : 
                     user.totalTasksCompleted > 30 ? 'Expert' : 
                     user.totalTasksCompleted > 10 ? 'Skilled' : 'Rookie';

  if(loading) return <div className="p-8 text-center animate-pulse">Loading Tasks...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in relative">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Maintainer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex items-center justify-between border-l-4 border-blue-500">
           <div><p className="text-slate-500 font-medium">Active Tasks</p><h3 className="text-4xl font-bold">{pending.length}</h3></div>
           <Wrench className="w-12 h-12 text-blue-100" />
        </div>
        <div className="card p-6 flex items-center justify-between border-l-4 border-green-500">
           <div><p className="text-slate-500 font-medium">Completed</p><h3 className="text-4xl font-bold">{user.totalTasksCompleted}</h3></div>
           <CheckCircle className="w-12 h-12 text-green-100" />
        </div>
        <div className="card p-6 flex flex-col items-center justify-center border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30">
           <div className="flex items-center gap-1 text-yellow-500 mb-2">
             <Star className="w-6 h-6 fill-current"/>
             <span className="text-2xl font-bold">{user.performanceScore ? user.performanceScore.toFixed(1) : 'NA'}</span>
           </div>
           <p className="text-sm font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-500">{badgeLevel} Badge</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">My Task Queue</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pending.length === 0 ? (
          <div className="col-span-full p-8 text-center card text-slate-500">No active tasks assigned.</div>
        ) : (
          pending.map(t => (
            <Link to={`/maintainer/task/${t._id}`} key={t._id} className="card p-6 hover:border-blue-500 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs font-bold rounded ${t.priority==='Urgent'?'bg-red-100 text-red-700':'bg-slate-100 text-slate-700'}`}>{t.priority}</span>
                <span className={`px-2 py-1 text-xs font-bold rounded ${t.status==='In Progress'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{t.status}</span>
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">{t.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{t.roomNumber}, Block {t.block}, Floor {t.floor}</p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-darkBorder flex items-center gap-2 text-sm text-red-500 font-medium">
                <Clock className="w-4 h-4"/>
                Due: {format(new Date(t.deadline), 'MMM d, h:mm a')}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

const TaskDetail = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const fetchTask = async () => {
        try {
            const res = await api.get(`/complaints/${id}`);
            setTask(res.data.data);
        } catch (err) {
            console.error('Fetch Task Error:', err?.response?.data?.message || err.message);
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTask(); }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        setSubmitting(true);
        try {
            await api.patch(`/complaints/${id}/status`, { status: newStatus });
            fetchTask();
        } catch (err) {
            console.error('Status Update Error:', err?.response?.data?.message || err.message);
            alert(err?.response?.data?.message || "Failed to update status");
        }
        finally { setSubmitting(false); }
    }

    const handleResolve = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('resolutionNote', note);
            if(photo) formData.append('completionPhoto', photo);
            
            await api.patch(`/complaints/${id}/resolve`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/maintainer');
        } catch (err) {
            console.error('Resolution Error:', err?.response?.data?.message || err.message);
            alert(err?.response?.data?.message || "Failed to resolve task");
        }
        finally { setSubmitting(false); }
    }

    if(loading) return <div className="p-8 text-center animate-pulse">Loading task...</div>;
    if(!task) return <div className="p-8 text-center">Task missing</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in relative">
            <Link to="/maintainer" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-medium">
                <ArrowLeft className="w-4 h-4"/> Back to Tasks
            </Link>

            <div className="card p-6 md:p-8 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
                        <p className="text-slate-500 font-medium">Room {task.roomNumber}, Block {task.block}, Floor {task.floor}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-sm tracking-wider uppercase">{task.status}</span>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-darkBorder mb-6">
                    {task.description}
                </p>

                {task.photos && task.photos.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-bold mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Student Photos</h4>
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {task.photos.map((url, i) => (
                                <img key={i} src={url} alt="Issue" className="w-40 h-40 object-cover rounded shadow-sm border border-slate-200" />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-darkBorder">
                    {task.status === 'Assigned' && (
                        <button onClick={() => handleStatusUpdate('In Progress')} disabled={submitting} className="btn-primary flex items-center justify-center gap-2 flex-1 bg-orange-600 hover:bg-orange-700">
                            <PlayCircle className="w-5 h-5"/> Start Job (In Progress)
                        </button>
                    )}
                    {task.status === 'In Progress' && (
                        <div className="w-full">
                           <h3 className="font-bold text-lg mb-4 text-green-700 dark:text-green-500 flex items-center gap-2">
                             <CheckSquare className="w-5 h-5"/> Complete Job
                           </h3>
                           <form onSubmit={handleResolve} className="space-y-4">
                               <div>
                                   <label className="block text-sm font-medium mb-1">Resolution Note (What did you fix?)</label>
                                   <textarea required value={note} onChange={e=>setNote(e.target.value)} rows="3" className="input-field" placeholder="Replaced faulty wiring..."></textarea>
                               </div>
                               <div>
                                   <label className="block text-sm font-medium mb-1">Completion Photo (Proof)</label>
                                   <div className="relative">
                                       {!preview ? (
                                           <div className="border border-dashed border-slate-300 p-4 text-center rounded bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 text-sm">
                                               <UploadCloud className="w-6 h-6 mx-auto mb-1 text-slate-400"/>
                                               <p>Click to attach photo</p>
                                               <input type="file" required accept="image/*" onChange={(e)=>{
                                                   if(e.target.files[0]) {
                                                       setPhoto(e.target.files[0]);
                                                       setPreview(URL.createObjectURL(e.target.files[0]));
                                                   }
                                               }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                           </div>
                                       ) : (
                                           <div className="relative w-32 h-32 rounded border overflow-hidden">
                                               <img src={preview} alt="Preview" className="w-full h-full object-cover"/>
                                               <button type="button" onClick={()=>{setPhoto(null); setPreview(null)}} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3"/></button>
                                           </div>
                                       )}
                                   </div>
                               </div>
                               <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                                   <CheckCircle className="w-5 h-5"/> Submit & Mark Resolved
                               </button>
                           </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MaintainerMain = () => {
    return (
        <div className="min-h-screen pt-16 bg-slate-50 dark:bg-darkBg w-full">
            <Routes>
                <Route path="" element={<MaintainerHome />} />
                <Route path="task/:id" element={<TaskDetail />} />
            </Routes>
        </div>
    );
};

export default MaintainerMain;
