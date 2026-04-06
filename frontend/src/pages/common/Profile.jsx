import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Calendar, Shield, MapPin, Briefcase, Award, CheckCircle, ArrowLeft, Layers } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const renderRoleSpecificDetails = () => {
        switch (user.role) {
            case 'student':
                return (
                    <>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College ID</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{user.collegeId || 'N/A'}</p>
                            </div>
                        </div>
                    </>
                );
            case 'authority':
                return (
                    <>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Block</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{user.block || 'All Blocks'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Floors</p>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                    {user.floors?.length > 0 ? user.floors.map(f => (
                                        <span key={f} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{f}</span>
                                    )) : <p className="font-bold text-slate-700 dark:text-slate-200">All Floors</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 col-span-full">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsibilities</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {user.responsibilities?.map(r => (
                                        <span key={r} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{r}</span>
                                    )) || 'General Overseer'}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'maintainer':
                return (
                    <>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Type</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{user.jobType}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Score</p>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{user.performanceScore?.toFixed(1)} / 5.0</p>
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] pt-20 pb-12 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {/* Cover / Header */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                        <div className="absolute -bottom-16 left-10">
                            <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-slate-800 p-2 shadow-xl">
                                <div className="w-full h-full rounded-[1.5rem] bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-4 border-white dark:border-slate-800">
                                    <User className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-10 px-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-jakarta font-extrabold text-slate-800 dark:text-white mb-2">{user.name}</h1>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                                        {user.role}
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-sm flex items-center gap-1.5 font-medium">
                                        <Calendar className="w-4 h-4" /> Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
                                    </span>
                                </div>
                            </div>
                            <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold transition-all shadow-lg hover:shadow-slate-500/20 active:scale-95">
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* General Info */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{user.email || 'No email provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">{user.phone || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Role Specific Info */}
                            {renderRoleSpecificDetails()}
                        </div>
                        
                        <div className="mt-12 p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100/50 dark:border-blue-900/30">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" /> Account Security
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                Your account is secured with multi-factor authentication (where applicable). Always ensure your contact details are up to date to receive important campus alerts.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30">
                                    Change Password
                                </button>
                                <button className="text-sm font-bold text-slate-600 hover:text-red-500 transition-colors px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                                    Security Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
