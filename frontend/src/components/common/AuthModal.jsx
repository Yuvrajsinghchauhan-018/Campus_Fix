import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fieldClassName =
  'input-field py-3 text-sm bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800';
const compactFieldClassName =
  'input-field py-3.5 text-sm bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800';

const AuthModal = ({ isOpen, onClose, role }) => {
  const [tab, setTab] = useState('login');
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    collegeId: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    jobType: 'Electrician',
    adminSecretKey: '',
    block: 'MSI',
    floors: [],
    responsibilities: [],
  });

  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setMsg('');
      setShowSuccess(false);
      setTab('login');
      setFormData((prev) => ({ ...prev, password: '', adminSecretKey: '' }));
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const canRegister = true;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFloorToggle = (fl) => {
    setFormData((prev) => ({
      ...prev,
      floors: prev.floors.includes(fl)
        ? prev.floors.filter((r) => r !== fl)
        : [...prev.floors, fl],
    }));
    setError('');
  };

  const handleResponsibilityToggle = (resp) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.includes(resp)
        ? prev.responsibilities.filter((r) => r !== resp)
        : [...prev.responsibilities, resp],
    }));
    setError('');
  };

  const validateForm = () => {
    if (tab === 'register') {
      if (!formData.name || !formData.phone) return 'Name and Phone are required.';
      if (formData.phone.length !== 10) return 'Phone number must be 10 digits.';

      if (role === 'authority') {
        if (!formData.email) return 'Email Address is required.';
        if (!formData.adminSecretKey) return 'Admin Secret Key is required.';
        if (formData.responsibilities.length === 0) return 'Select at least one responsibility.';
        if (formData.floors.length === 0) return 'Select at least one floor.';
      } else if (role === 'student') {
        if (!formData.email.toLowerCase().endsWith('@gmail.com')) return 'Please use a valid @gmail.com address.';
        if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
        if (formData.password.length < 6) return 'Password must be at least 6 characters.';
      }
    } else {
      if (role === 'authority') {
        if (!formData.email || !formData.adminSecretKey) return 'Email and Admin Secret Key required.';
      } else if (role === 'student') {
        if (!formData.email && !formData.collegeId) return 'Email or College ID required.';
        if (!formData.password) return 'Password required.';
      } else if (role === 'maintainer') {
        if (!formData.phone) return 'Phone number required.';
        if (formData.phone.length !== 10) return 'Phone number must be 10 digits.';
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErr = validateForm();
    if (validationErr) return setError(validationErr);

    setLoading(true);
    setError('');
    setMsg('');

    try {
      if (tab === 'login') {
        const payload = { role };

        if (role === 'authority') {
          payload.email = formData.email;
          payload.adminSecretKey = formData.adminSecretKey;
        } else if (role === 'student') {
          payload.password = formData.password;
          payload[formData.email.includes('@') ? 'email' : 'collegeId'] = formData.email || formData.collegeId;
        } else {
          payload.phone = formData.phone;
        }

        const res = await login(payload);

        if (res.token) {
          onClose();
          navigate(`/${role}`, { replace: true });
        }
      } else {
        const res = await register({ ...formData, role: role.toLowerCase() });
        if (res.token || res.success) {
          if (role === 'maintainer') {
            setMsg(res.message);
            setShowSuccess(true);
          } else if (role === 'authority') {
            onClose();
            navigate(`/${role}`, { replace: true });
          } else {
            setMsg('Registration successful! Please login to continue.');
            setTab('login');
            setFormData({ ...formData, password: '', confirmPassword: '' });
          }
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm shadow-2xl overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-white dark:bg-slate-900/95 p-6 md:p-8 relative flex flex-col my-auto shadow-2xl border border-slate-100 dark:border-white/10 rounded-[2rem] max-h-[90vh] overflow-y-auto custom-scrollbar"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            {showSuccess && (
              <button
                onClick={() => setShowSuccess(false)}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            <h2 className="text-3xl font-jakarta font-bold text-center mb-2 tracking-tight text-slate-800 dark:text-white">
              {role === 'authority' ? 'Authority Access' : role === 'student' ? 'Student Portal' : 'Maintainer Portal'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8 font-medium">
              {!showSuccess
                ? role === 'authority'
                  ? 'Secure access for authorized personnel.'
                  : 'Login or create your account to continue.'
                : 'Account Status'}
            </p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium leading-relaxed">
                <div>{error}</div>
                {role === 'maintainer' && error.includes('Ask authority') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('register');
                      setError('');
                    }}
                    className="mt-4 bg-white text-slate-900 border border-slate-200 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all w-full"
                  >
                    Request Access
                  </button>
                )}
              </motion.div>
            )}

            {msg && !showSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-medium leading-relaxed">
                {msg}
              </motion.div>
            )}

            {!showSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {canRegister && (
                  <div className="flex mb-8 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200 dark:border-white/5">
                    <button
                      type="button"
                      className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        tab === 'login'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                      onClick={() => {
                        setTab('login');
                        setError('');
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        tab === 'register'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                      onClick={() => {
                        setTab('register');
                        setError('');
                      }}
                    >
                      Register
                    </button>
                  </div>
                )}

                {tab === 'register' ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className={fieldClassName} placeholder="Enter full name" />
                    </div>

                    {role === 'student' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">College ID</label>
                        <input type="text" name="collegeId" required value={formData.collegeId} onChange={handleChange} className={fieldClassName} placeholder="ID Number" />
                      </div>
                    )}

                    <div className={`space-y-1.5 ${role === 'authority' ? 'md:col-span-1' : ''}`}>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Phone Number</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={fieldClassName} placeholder="10-digit number" maxLength={10} />
                    </div>

                    {role === 'maintainer' && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Job Type</label>
                        <select name="jobType" required value={formData.jobType} onChange={handleChange} className={fieldClassName}>
                          {['Electrician', 'Plumber', 'IT Technician', 'AC Mechanic', 'Carpenter', 'Painter', 'Civil Worker', 'Sweeper'].map((job) => (
                            <option key={job} value={job}>
                              {job}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {role === 'student' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Gender</label>
                        <select name="gender" required value={formData.gender} onChange={handleChange} className={fieldClassName}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    )}

                    {role !== 'maintainer' && (
                      <div className={`space-y-1.5 ${role === 'authority' ? 'md:col-span-1' : 'md:col-span-2 mt-1'}`}>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className={fieldClassName} placeholder="example@gmail.com" />
                      </div>
                    )}

                    {role === 'authority' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Admin Secret Key</label>
                          <input type="password" name="adminSecretKey" required value={formData.adminSecretKey} onChange={handleChange} className={fieldClassName} placeholder="Enter Registration Key" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Block / Building</label>
                          <select name="block" required value={formData.block} onChange={handleChange} className={fieldClassName}>
                            <option value="MSI">MSI</option>
                            <option value="MSIT">MSIT</option>
                            <option value="MBA">MBA</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2 mt-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Floors Incharge</label>
                          <div className="flex flex-wrap gap-2">
                            {['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6'].map((fl) => (
                              <button
                                type="button"
                                key={fl}
                                onClick={() => handleFloorToggle(fl)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                  formData.floors.includes(fl)
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-slate-800/50 dark:text-slate-400 dark:border-white/5 dark:hover:border-white/10'
                                }`}
                              >
                                {fl}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2 mt-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Responsibilities</label>
                          <div className="flex flex-wrap gap-2">
                            {['Electrical', 'Plumbing', 'Lab Management', 'IT Systems', 'Infrastructure'].map((resp) => (
                              <button
                                type="button"
                                key={resp}
                                onClick={() => handleResponsibilityToggle(resp)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                  formData.responsibilities.includes(resp)
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-slate-800/50 dark:text-slate-400 dark:border-white/5 dark:hover:border-white/10'
                                }`}
                              >
                                {resp}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {role === 'student' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Password</label>
                          <input type="password" name="password" required value={formData.password} onChange={handleChange} className={fieldClassName} placeholder="Password" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Confirm Password</label>
                          <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className={fieldClassName} placeholder="Confirm password" />
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                    {role !== 'maintainer' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                          {role === 'student' ? 'Email or College ID' : 'Email Address'}
                        </label>
                        <input
                          type="text"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className={compactFieldClassName}
                          placeholder={role === 'student' ? 'ID or Gmail' : 'example@gmail.com'}
                        />
                      </div>
                    )}

                    {role === 'maintainer' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Phone Number</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={compactFieldClassName} placeholder="Registered number" maxLength={10} />
                      </div>
                    )}

                    {role === 'authority' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Admin Secret Key</label>
                        </div>
                        <input
                          type="password"
                          name="adminSecretKey"
                          required
                          value={formData.adminSecretKey}
                          onChange={handleChange}
                          className={compactFieldClassName}
                          placeholder="Enter Registration Key"
                        />
                      </div>
                    )}

                    {role === 'student' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Password</label>
                        </div>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className={compactFieldClassName} placeholder="Password" />
                      </div>
                    )}
                  </motion.div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-bold rounded-2xl mt-4 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-medium leading-relaxed">{msg}</div>
                <button onClick={onClose} className="btn-primary w-full py-4 text-base font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Got it
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
