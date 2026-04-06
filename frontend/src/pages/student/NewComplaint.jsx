import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Sparkles, UploadCloud, X, Loader2, CheckCircle, AlertTriangle, FileText, MapPin, Layers, DoorOpen, Type, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCATION_TYPES = ['Classroom', 'Lab', 'Corridor', 'Washroom', 'Staff Room', 'Common Area'];

const DYNAMIC_ISSUES = {
  Classroom: ['Projector', 'Fan', 'AC', 'Lights', 'Benches/Desks', 'Board'],
  Lab: ['Computers', 'Keyboards', 'Mouse', 'Printers', 'Projector', 'AC', 'Fans', 'Electrical Points', 'Desks'],
  Corridor: ['Lights', 'CCTV', 'Cleanliness', 'Electrical'],
  Washroom: ['Water Supply', 'Flush', 'Cleanliness', 'Broken Fixtures'],
  'Staff Room': ['AC', 'Furniture', 'Electrical', 'Internet'],
  'Common Area': ['Lights', 'Cleanliness', 'Furniture']
};

const NewComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', locationType: 'Classroom',
    roomNumber: '', block: 'MSI', floor: '1', issues: [],
    computerNumber: '', mouseNumber: '', keyboardNumber: '', printerNumber: ''
  });
  
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'locationType') {
      setFormData({ ...formData, locationType: value, issues: [] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleIssue = (issue) => {
    setFormData(f => {
      const arr = f.issues || [];
      return {
        ...f,
        issues: arr.includes(issue) ? arr.filter(i => i !== issue) : [...arr, issue]
      };
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      return setError('Description must be at least 20 characters.');
    }
    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'issues') {
           formData.issues.forEach(iss => data.append('issues', iss));
        } else {
           data.append(key, formData[key]);
        }
      });
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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in mb-12">
      {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow-sm flex items-center gap-3"><AlertTriangle className="w-5 h-5"/> {error}</div>}

      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden relative">
        
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="p-8 md:p-10">
           <div className="mb-10 text-center">
             <h1 className="text-3xl font-jakarta font-extrabold text-slate-800 dark:text-white mb-2">Report an Issue</h1>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Provide details below. Our AI will automatically categorize and prioritize your request!</p>
           </div>
           
           <form onSubmit={handleSubmit} className="space-y-8">
             
             {/* Title */}
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Issue Title</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Type className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., Broken AC" />
               </div>
             </div>

             {/* Description */}
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Description</label>
               <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                     <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="Describe the issue in detail (min 20 characters)..." />
               </div>
             </div>

             {/* Notice of AI Auto Categorization */}
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-start gap-3 border border-indigo-100 dark:border-indigo-800/30">
               <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
               <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Category and Priority are handled securely by our AI system based on your description above.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Block / Building</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                     </div>
                     <select name="block" value={formData.block} onChange={handleChange} className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800 appearance-none cursor-pointer">
                       <option value="MSI">MSI</option>
                       <option value="MSIT">MSIT</option>
                       <option value="MBA">MBA</option>
                     </select>
                     <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                  </div>
                </div>

                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Floor</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Layers className="h-5 w-5 text-slate-400" />
                      </div>
                      <select name="floor" value={formData.floor} onChange={handleChange} className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800 appearance-none cursor-pointer">
                        {[1, 2, 3, 4, 5, 6, 7].map(f => <option key={f} value={f}>Floor {f}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                   </div>
                 </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Location Type</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Map className="h-5 w-5 text-slate-400" />
                     </div>
                     <select name="locationType" value={formData.locationType} onChange={handleChange} className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800 appearance-none cursor-pointer">
                       {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                     {formData.locationType === 'Lab' ? 'Lab Number' : 'Room Number'}
                   </label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <DoorOpen className="h-5 w-5 text-slate-400 transition-all" />
                      </div>
                      <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block pl-12 p-3.5 dark:bg-slate-800/50 dark:placeholder-slate-500 dark:text-white dark:focus:ring-blue-500 shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder={formData.locationType === 'Lab' ? 'e.g., Computer Lab 2' : 'e.g., 101'} />
                   </div>
                </div>

                {formData.locationType && DYNAMIC_ISSUES[formData.locationType] && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                    What's wrong in the {formData.locationType}? (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DYNAMIC_ISSUES[formData.locationType].map(issue => {
                      const isSelected = formData.issues.includes(issue);
                      return (
                         <button
                           key={issue}
                           type="button"
                           onClick={() => toggleIssue(issue)}
                           className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                             isSelected
                               ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300'
                               : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                           }`}
                         >
                           + {issue}
                         </button>
                      );
                    })}
                  </div>
                </div>
                )}

                 {/* Conditional Item Number Fields */}
                 {formData.locationType === 'Lab' && (
                   <>
                     {formData.issues.includes('Computers') && (
                       <div>
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Computer Number</label>
                         <input type="text" name="computerNumber" value={formData.computerNumber} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 dark:bg-slate-800/50 dark:text-white shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., PC-01" />
                       </div>
                     )}
                     {formData.issues.includes('Keyboards') && (
                       <div>
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Keyboard Number</label>
                         <input type="text" name="keyboardNumber" value={formData.keyboardNumber} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 dark:bg-slate-800/50 dark:text-white shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., KB-01" />
                       </div>
                     )}
                     {formData.issues.includes('Mouse') && (
                       <div>
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Mouse Number</label>
                         <input type="text" name="mouseNumber" value={formData.mouseNumber} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 dark:bg-slate-800/50 dark:text-white shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., M-01" />
                       </div>
                     )}
                     {formData.issues.includes('Printers') && (
                       <div>
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Printer Number</label>
                         <input type="text" name="printerNumber" value={formData.printerNumber} onChange={handleChange} required className="w-full bg-slate-50 border-transparent text-slate-800 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3.5 dark:bg-slate-800/50 dark:text-white shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-800" placeholder="e.g., PRN-01" />
                       </div>
                     )}
                   </>
                 )}
             </div>

             <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50">
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Supporting Photos (Max 3)</label>
               <div className="grid grid-cols-2 gap-4">
                 <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-center items-center h-[140px]">
                   <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 transition-colors">
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   </div>
                   <h4 className="text-slate-700 dark:text-slate-200 text-sm font-bold">Launch Camera</h4>
                 </div>
                 <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-center items-center h-[140px]">
                   <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mb-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 transition-colors">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                   </div>
                   <h4 className="text-slate-700 dark:text-slate-200 text-sm font-bold">Upload Gallery</h4>
                 </div>
               </div>
               
               <AnimatePresence>
                 {previews.length > 0 && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 flex gap-4 overflow-x-auto pb-2">
                     {previews.map((src, idx) => (
                       <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-md group">
                         <img src={src} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                         <div className="absolute inset-0 bg-black/opacity-0 group-hover:bg-black/20 transition-colors"></div>
                         <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors shadow-sm">
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             <div className="pt-4">
               <button type="submit" disabled={submitting} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
                 {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                 {submitting ? 'Submitting Details...' : 'Submit Complaint'}
               </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;
