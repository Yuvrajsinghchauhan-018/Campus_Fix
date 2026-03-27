import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { STATIC_BASE_URL } from "../../api/axios";
import { Clock, MapPin, Tag, AlertOctagon, User, CheckCircle, Image as ImageIcon, MessageSquare, Star, ArrowLeft, X } from 'lucide-react';
import { format } from 'date-fns';

const getImageUrl = (url) => url?.startsWith('/uploads/') ? `${STATIC_BASE_URL}${url}` : url;

const StatusTimeline = ({ history = [], currentStatus, createdAt }) => {
  // Mock timeline logic based on current status
  const flow = currentStatus === 'Rejected' ? ['Pending', 'Rejected'] : ['Pending', 'Assigned', 'In Progress', 'Resolved'];
  const currentIndex = flow.indexOf(currentStatus) !== -1 ? flow.indexOf(currentStatus) : 0;
  
  return (
    <div className="relative border-l-2 border-slate-200 dark:border-darkBorder ml-4 mt-6 space-y-8 pb-4">
      {flow.map((status, idx) => (
        <div key={status} className={`relative pl-8 ${idx > currentIndex ? 'opacity-40' : ''}`}>
          <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-darkCard ${idx <= currentIndex ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
          <h4 className="font-bold text-slate-800 dark:text-white">{status}</h4>
          {idx === 0 && <p className="text-xs text-slate-500 mt-1">{format(new Date(createdAt), 'MMM d, yyyy h:mm a')}</p>}
          {idx === currentIndex && <p className="text-sm text-blue-600 mt-1 font-medium">Currently {status}</p>}
        </div>
      ))}
    </div>
  );
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(null); // URL or null

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if(res.data.success) {
        setComplaint(res.data.data);
        if(res.data.data.rating) setRatingSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const submitRating = async () => {
    if(rating === 0) return;
    try {
      await api.patch(`/complaints/${id}/rate`, { rating, feedback });
      setRatingSubmitted(true);
      fetchComplaint(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  if(loading) return <div className="p-8 text-center animate-pulse">Loading details...</div>;
  if(!complaint) return <div className="p-8 text-center">Complaint not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in relative">
      <Link to={-1} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4"/> Back
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                complaint.status==='Resolved' ? 'bg-green-100 text-green-700' :
                complaint.status==='Rejected' ? 'bg-red-100 text-red-700' :
                complaint.status==='Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>{complaint.status}</span>
              
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                complaint.priority==='Urgent' ? 'bg-red-100 text-red-700 animate-pulse' :
                complaint.priority==='High' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
              }`}>{complaint.priority} Priority</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-jakarta font-bold mb-4">{complaint.title}</h1>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            
            {complaint.aiSuggestedPriority && (
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg flex gap-3">
                <AlertOctagon className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-purple-800 dark:text-purple-300">AI Analysis applied at creation</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{complaint.aiReason}</p>
                </div>
              </div>
            )}
          </div>

          {complaint.photos && complaint.photos.length > 0 && (
            <div className="card p-6 md:p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-blue-600"/> Attached Photos</h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {complaint.photos.map((url, i) => (
                  <img 
                    key={i} src={getImageUrl(url)} alt={`Issue ${i}`} 
                    className="w-48 h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition hover:shadow-md"
                    onClick={() => setLightboxOpen(getImageUrl(url))}
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400/png?text=Image+Not+Found'; }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {complaint.status === 'Resolved' && (
            <div className="card p-6 md:p-8 border-t-4 border-t-green-500">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600"/> Resolution Details</h3>
               <p className="text-slate-600 dark:text-slate-300 mb-4">{complaint.resolutionNote || 'The issue has been resolved by the assigned maintainer.'}</p>
               {complaint.completionPhoto && (
                 <img 
                    src={getImageUrl(complaint.completionPhoto)} alt="Completion Proof" 
                    className="w-48 h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition hover:shadow-md"
                    onClick={() => setLightboxOpen(getImageUrl(complaint.completionPhoto))}
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400/png?text=Image+Not+Found'; }}
                  />
               )}
            </div>
          )}

          {complaint.status === 'Rejected' && (
            <div className="card p-6 md:p-8 border-t-4 border-t-red-500 bg-red-50/30 dark:bg-red-900/10">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400"><AlertOctagon className="w-5 h-5"/> Job Dismissed</h3>
               <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium">This request was dismissed by the authority for the following reason:</p>
               <div className="p-4 bg-white dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 border border-red-100 dark:border-red-900/30 font-medium">
                  {complaint.resolutionNote || 'No specific reason provided.'}
               </div>
            </div>
          )}

          {complaint.status === 'Resolved' && !ratingSubmitted && (
            <div className="card p-6 md:p-8 bg-blue-50/50 dark:bg-blue-900/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500"/> Rate the Service</h3>
              <div className="flex gap-2 mb-4">
                {[1,2,3,4,5].map(num => (
                  <Star 
                    key={num} 
                    className={`w-8 h-8 cursor-pointer transition-colors ${num <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                    onClick={() => setRating(num)}
                  />
                ))}
              </div>
              <textarea 
                className="input-field mb-4 w-full" rows={3} placeholder="Leave optional feedback..." 
                value={feedback} onChange={e => setFeedback(e.target.value)}
              />
              <button disabled={rating === 0} onClick={submitRating} className="btn-primary w-max">Submit Rating</button>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-100 dark:border-darkBorder pb-2">Location & Category</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                   <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Categories & Issues</p>
                   <div className="flex flex-wrap gap-1 mt-1">
                      {complaint.categories && complaint.categories.map(cat => (
                         <span key={cat} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-medium text-xs border border-slate-200 dark:border-slate-700">{cat}</span>
                      ))}
                      {complaint.issues && complaint.issues.map(iss => (
                         <span key={iss} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded font-medium text-xs border border-indigo-200 dark:border-indigo-800">{iss}</span>
                      ))}
                   </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div><p className="text-xs text-slate-500 uppercase tracking-wilder">Room</p><p className="font-medium">{complaint.roomNumber}, Block {complaint.block}, Floor {complaint.floor}</p></div>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-100 dark:border-darkBorder pb-2">Assignment</h3>
            {complaint.assignedMaintainer ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {complaint.assignedMaintainer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{complaint.assignedMaintainer.name}</p>
                  <p className="text-sm text-slate-500">{complaint.assignedMaintainer.jobType}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4"/> Waiting for assignment</p>
            )}
            
            {complaint.deadline && complaint.status !== 'Resolved' && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4" />
                SLA Deadline: {format(new Date(complaint.deadline), 'MMM d, h:mm a')}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-lg mb-2">Timeline Tracker</h3>
            <StatusTimeline currentStatus={complaint.status} createdAt={complaint.createdAt} />
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(null)}>
           <button className="absolute top-4 right-4 text-white hover:text-slate-300"><X className="w-8 h-8"/></button>
           <img src={lightboxOpen} alt="Lightbox View" className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;
