import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, role }) => {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState('form'); // 'form', 'otp', or 'message'
  const { login, register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    collegeId: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    jobType: 'Electrician'
  });
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const otpInputs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  if (!isOpen) return null;

  const canRegister = role !== 'authority';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    const digits = pastedData.split('');
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    
    const nextIndex = Math.min(digits.length, 5);
    otpInputs.current[nextIndex].focus();
  };

  const validateForm = () => {
    if (tab === 'register') {
      if (!formData.name || !formData.phone) return "Name and Phone are required.";
      if (formData.phone.length !== 10) return "Phone number must be 10 digits.";
      
      if (role === 'student') {
        if (!formData.email.toLowerCase().endsWith('@gmail.com')) return "Please use a valid @gmail.com address.";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
        if (formData.password.length < 6) return "Password must be at least 6 characters.";
      }
    } else {
      if (role === 'authority') {
        if (!formData.email || !formData.password) return "Email and Password required.";
      } else if (role === 'student') {
        if (!formData.email && !formData.collegeId) return "Email or College ID required.";
        if (!formData.password) return "Password required.";
      } else if (role === 'maintainer') {
        if (!formData.phone) return "Phone number required.";
        if (formData.phone.length !== 10) return "Phone number must be 10 digits.";
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
          payload.password = formData.password;
        } else if (role === 'student') {
          payload.password = formData.password;
          payload[formData.email.includes('@') ? 'email' : 'collegeId'] = formData.email || formData.collegeId;
        } else {
          payload.phone = formData.phone;
        }
        
        const res = await login(payload);
        
        if (res.step === 'otp') {
          setStep('otp');
          setTimer(30);
        } else if (res.token) {
          onClose();
          navigate(`/${role}`);
        }
      } else {
        const res = await register({ ...formData, role });
        if (res.step === 'otp') {
          setStep('otp');
          setTimer(30);
          setMsg(res.message);
        } else if (res.token) {
          onClose();
          navigate(`/${role}`);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) return setError("Enter 6-digit OTP");

    setLoading(true);
    setError('');
    
    try {
      const res = await verifyOTP({ 
        phone: formData.phone,
        otp: otpCode,
        isRegistration: tab === 'register',
        userData: tab === 'register' ? { ...formData, role } : undefined
      });

      if (res.token) {
        onClose();
        navigate(`/${role}`);
      } else {
        setMsg(res.message);
        setStep('message');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await resendOTP(formData.phone);
      setTimer(30);
      setMsg("OTP Resent successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('form');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setMsg('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm shadow-2xl overflow-y-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="card w-full max-w-md p-8 relative flex flex-col my-8 shadow-2xl border border-white/10 dark:bg-slate-900/95"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            {(step === 'otp' || step === 'message') && (
              <button onClick={() => setStep('form')} className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            <h2 className="text-3xl font-jakarta font-bold text-center mb-2 tracking-tight">
              {role === 'authority' ? 'Authority Access' : role === 'student' ? 'Student Portal' : 'Maintainer Portal'}
            </h2>
            <p className="text-slate-400 text-center text-sm mb-8 font-medium">
              {step === 'form' 
                ? (role === 'authority' ? 'Access restricted to authorized college staff only.' : 'Login or create your account to continue.')
                : step === 'otp' 
                  ? `We sent a 6-digit code to +91 XXXX${(formData.phone || '').slice(-4)}`
                  : 'Account Status'}
            </p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium leading-relaxed">
                {error}
              </motion.div>
            )}
            {msg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-medium leading-relaxed">
                {msg}
              </motion.div>
            )}

            {step === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {canRegister && (
                  <div className="flex mb-8 bg-slate-800/50 rounded-2xl p-1.5 border border-white/5">
                    <button type="button" 
                      className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${tab === 'login' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}
                      onClick={() => { setTab('login'); setError(''); }}
                    >Sign In</button>
                    <button type="button" 
                      className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${tab === 'register' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200'}`}
                      onClick={() => { setTab('register'); setError(''); }}
                    >Register</button>
                  </div>
                )}

                <div className="space-y-5">
                  {tab === 'register' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field py-3.5" placeholder="Enter full name" />
                      </div>
                      {role === 'student' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">College ID</label>
                          <input type="text" name="collegeId" required value={formData.collegeId} onChange={handleChange} className="input-field py-3.5" placeholder="ID Number" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-field py-3.5" placeholder="10-digit number" maxLength={10} />
                      </div>
                      {role === 'maintainer' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Job Type</label>
                          <select name="jobType" required value={formData.jobType} onChange={handleChange} className="input-field py-3.5">
                            {['Electrician','Plumber','IT Technician','AC Mechanic','Carpenter','Painter','Civil Worker','Sweeper'].map(job => (
                              <option key={job} value={job}>{job}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {role === 'student' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Gender</label>
                          <select name="gender" required value={formData.gender} onChange={handleChange} className="input-field py-3.5">
                            <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {role !== 'maintainer' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                        {role === 'student' && tab === 'login' ? 'Email or College ID' : 'Email Address'}
                      </label>
                      <input type="text" name="email" required value={formData.email} onChange={handleChange} className="input-field py-3.5" placeholder={role === 'student' && tab === 'login' ? "ID or Gmail" : "example@gmail.com"} />
                    </div>
                  )}

                  {role === 'maintainer' && tab === 'login' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-field py-3.5" placeholder="Registered number" maxLength={10} />
                    </div>
                  )}

                  {role !== 'maintainer' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                      <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field py-3.5" placeholder="••••••••" />
                    </div>
                  )}

                  {tab === 'register' && role === 'student' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</label>
                      <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="input-field py-3.5" placeholder="••••••••" />
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base font-bold rounded-2xl mt-4 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (tab === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>
            ) : step === 'otp' ? (
              <div className="flex flex-col items-center">
                <div className="flex gap-3 mb-10 w-full justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpInputs.current[i] = el}
                      type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      autoComplete="one-time-code"
                      className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-blue-500 focus:ring-0 transition-all outline-none text-white shadow-inner"
                    />
                  ))}
                </div>
                <button onClick={handleVerify} disabled={loading} className="btn-primary w-full py-4 text-base font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all mb-6 flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                </button>
                <div className="text-center space-y-3">
                  <p className="text-sm text-slate-400 font-medium">Didn't receive the code?</p>
                  <button onClick={handleResend} disabled={timer > 0 || loading} className={`text-sm font-bold transition-colors ${timer > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-blue-500 hover:text-blue-400'}`}>
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend Code Now'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-medium leading-relaxed">{msg}</div>
                <button onClick={onClose} className="btn-primary w-full py-4 text-base font-bold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">Got it</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
