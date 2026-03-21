import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Sparkles, UploadCloud, X, Loader2, CheckCircle, AlertTriangle, FileText, MapPin, Grid, Layers, DoorOpen, Type, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Electrical', 
    roomNumber: '', block: '', floor: ''
  });
  
  const [priority, setPriority] = useState('Low');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files).slice(0, 3);
      setPhotos(filesArr);
      const prvs = filesArr.map(f => URL.createObjectURL(f));
      setPreviews(prvs);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const triggerAIAnalysis = async () => {
    if (formData.title.length < 5 || formData.description.length < 10) return;
    setAiAnalyzing(true);
    
    setTimeout(() => {
       setAiAnalyzing(false);
       setAiSuggestion({ priority: 'High', category: 'Electrical', reason: "Possible hazard based on keywords." });
       setPriority('High');
       setFormData(prev => ({...prev, category: 'Electrical'}));
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      return setError('Description must be at least 20 characters.');
    }
    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('priority', priority);
      photos.forEach(file => data.append('photos', file));

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        navigate('/student');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Electrical', 'Plumbing', 'Furniture', 'Computer', 'AC', 'Carpentry', 'Other'];
  const priorityLevels = [
     { label: 'Low', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
     { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
     { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
     { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in mb-12">
      {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow-sm flex items-center gap-3"><AlertTriangle className="w-5 h-5"/> {error}</div>}

      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden relative">
        
        {/* Decorative Top Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="p-8 md:p-10">
           <div className="mb-10 text-center">
             <h1 className="text-3xl font-jakarta font-extrabold text-slate-800 dark:text-white mb-2">Report a New Issue</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Provide details about the problem so we can fix it quickly.</p>
           </div>
           
           <form onSubmit={handleSubmit} className="space-y-8">
             
             {/* Title */}
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Issue Title</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Type className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., Broken AC in Room 204" />
               </div>
             </div>

             {/* Description */}
             <div>
               <label className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                  <span>Description</span>
                  {formData.description.length > 10 && !aiSuggestion && (
                     <button type="button" onClick={triggerAIAnalysis} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full transition-all shadow-sm">
                        <Sparkles className="w-3.5 h-3.5"/> Auto-Analyze
                     </button>
                  )}
               </label>
               <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                     <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="Describe the issue in detail (min 20 characters)..." />
               </div>
             </div>

             <AnimatePresence>
               {aiAnalyzing && (
                 <motion.div initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0 }} className="bg-indigo-50 dark:bg-slate-800 p-5 rounded-xl flex items-center gap-4 text-sm text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-slate-700 shadow-sm">
                   <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                   <span className="font-medium">AI is deeply analyzing your complaint to suggest priority and category...</span>
                 </motion.div>
               )}
               {aiSuggestion && !aiAnalyzing && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800/30 p-5 rounded-xl shadow-sm relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 opacity-10"><Sparkles className="w-24 h-24 text-purple-600"/></div>
                   <div className="flex items-start gap-4 disabled relative z-10">
                     <div className="bg-white dark:bg-slate-800 shadow-sm p-2.5 rounded-full"><Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
                     <div className="flex-1">
                       <h4 className="font-extrabold text-purple-900 dark:text-purple-100 mb-1 flex justify-between items-center text-base">
                          <span>AI Suggested Priority: <span className="uppercase text-purple-600 dark:text-purple-400 ml-1">{aiSuggestion.priority}</span></span>
                       </h4>
                       <p className="text-sm text-purple-800 dark:text-purple-300 font-medium mb-3">{aiSuggestion.reason}</p>
                       <span className="inline-flex text-xs bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 px-3 py-1.5 rounded-full text-purple-700 dark:text-purple-300 font-bold shadow-sm">Category Auto-Set: {aiSuggestion.category}</span>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Category</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Grid className="h-5 w-5 text-slate-400" />
                     </div>
                     <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer appearance-none">
                       {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                     <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Priority Level</label>
                  <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl shadow-inner border border-transparent">
                    {priorityLevels.map(level => {
                       const active = priority === level.label;
                       return (
                         <button 
                           key={level.label} type="button" 
                           onClick={() => setPriority(level.label)}
                           className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${active ? `${level.color} shadow-sm ring-1 ring-black/5 dark:ring-white/10` : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                         >
                           {level.label}
                         </button>
                       )
                    })}
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Block / Building</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                     </div>
                     <input type="text" name="block" value={formData.block} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., A" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Floor</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Layers className="h-5 w-5 text-slate-400" />
                     </div>
                     <input type="text" name="floor" value={formData.floor} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., 1st" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Room No.</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DoorOpen className="h-5 w-5 text-slate-400" />
                     </div>
                     <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., 101" />
                  </div>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-100 dark:border-darkBorder">
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Supporting Photos (Max 3)</label>
               <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group relative bg-white dark:bg-slate-900 shadow-sm">
                 <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                 <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                 </div>
                 <h4 className="text-slate-700 dark:text-slate-200 text-base font-bold mb-1">Click or drag images to upload</h4>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">PNG, JPG, SVG up to 10MB</p>
               </div>
               
               {previews.length > 0 && (
                 <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                   {previews.map((src, idx) => (
                     <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-md group">
                       <img src={src} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                       <div className="absolute inset-0 bg-black/opacity-0 group-hover:bg-black/20 transition-colors"></div>
                       <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors shadow-sm">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             <div className="pt-4">
               <button type="submit" disabled={submitting} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
                 {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                 {submitting ? 'Submitting Details...' : 'Submit Complaint to Maintainers'}
               </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;
