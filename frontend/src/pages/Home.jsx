import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Shield, User, Wrench, ArrowRight, Zap, Camera, Clock, CheckCircle, Bell, QrCode, TrendingUp, Search, Star } from 'lucide-react';
import AuthModal from '../components/common/AuthModal';
import api from '../api/axios';
import logo from '../assets/images/msi logo.png';

const Counter = ({ to, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const end = parseFloat(to);
      const startTime = Date.now();
      const durMs = duration * 1000;
      
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durMs, 1);
        
        // Handle both integer and simple float counts
        const currentCount = to.includes('.') 
          ? (progress * end).toFixed(1)
          : Math.floor(progress * end);
          
        setCount(currentCount + suffix);
        
        if (progress === 1) {
          clearInterval(timer);
        }
      }, 30); // ~33fps is enough for this
      
      return () => clearInterval(timer);
    }
  }, [to, isInView, suffix, duration]);

  return <span ref={ref}>{count || 0}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Home = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('student');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Fetch announcements
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        if (res.data.success) {
          setAnnouncements(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err?.response?.data?.message || err.message);
      }
    };
    fetchAnnouncements();

    // Listen for custom event from Navbar
    const handleAuthEvent = (e) => openModal(e.detail || 'student');
    window.addEventListener('openAuthModal', handleAuthEvent);

    return () => window.removeEventListener('openAuthModal', handleAuthEvent);
  }, []);

  const openModal = (role) => {
    setActiveRole(role);
    setModalOpen(true);
  };

  return (
    <>
      <div className={`w-full min-h-screen transition-all duration-300 ${modalOpen ? 'blur-sm' : ''}`}>
      
      {/* 6a. Live scrolling ticker (Top bar) */}
      <div className="w-full bg-blue-600 text-white py-2 overflow-hidden whitespace-nowrap pt-18">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{ ease: 'linear', duration: 20, repeat: Infinity }}
          className="inline-block"
        >
          {announcements.length > 0 
            ? announcements.map(a => `🔔 ${a.title}: ${a.message} `).join(" |   | ") 
            : "No recent announcements."}
        </motion.div>
      </div>

      <div className="pt-2"></div>

      {/* 1. Hero Section */}
      <section className="relative w-full h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-darkBg">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <motion.div 
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-20 left-[20%] w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
          />
          <motion.div 
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="absolute bottom-20 right-[20%] w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
          />
        </div>
        
        <div className="z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-jakarta font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6"
          >
            Smart Campus, Seamless Maintenance.
          </motion.h1>
          <motion.p 
            variants={fadeUp} initial="hidden" animate="visible"
            className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 mb-10"
          >
            Experience next-generation facility management. Powered by AI priority detection and real-time SLA tracking.
          </motion.p>
          
          <motion.div 
            variants={fadeUp} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button onClick={() => openModal('student')} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-500/30">
              <User className="w-5 h-5 fill-current" />
              Student Portal
            </button>
            <button onClick={() => openModal('authority')} className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-darkCard text-slate-800 dark:text-white border-2 border-slate-800 dark:border-white rounded-xl font-bold hover:-translate-y-1 transition-all">
              <Shield className="w-5 h-5" />
              Authority Portal
            </button>
            <button onClick={() => openModal('maintainer')} className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-darkCard text-slate-800 dark:text-white border-2 border-slate-800 dark:border-white rounded-xl font-bold hover:-translate-y-1 transition-all">
              <Wrench className="w-5 h-5" />
              Maintainer Portal
            </button>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10"
        >
          <ArrowRight className="w-8 h-8 rotate-90 text-slate-400" />
        </motion.div>
      </section>

      {/* 2. How It Works */}
      <section className="py-20 px-4 bg-white dark:bg-darkCard">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-jakarta font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -50 }} viewport={{ once: true }} className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl relative z-10 border border-slate-100 dark:border-darkBorder">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold shadow-sm">1</div>
              <h3 className="text-xl font-bold mb-3">Report Issue</h3>
              <p className="text-slate-600 dark:text-slate-400">Students snap a photo and describe the fault. AI auto-detects priority and category within seconds.</p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 50 }} viewport={{ once: true }} className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl relative z-10 border border-slate-100 dark:border-darkBorder">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold shadow-sm">2</div>
              <h3 className="text-xl font-bold mb-3">Smart Assign</h3>
              <p className="text-slate-600 dark:text-slate-400">Authorities instantly approve and assign the task to the right maintainer based on availability and skills.</p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 50 }} viewport={{ once: true }} className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl relative z-10 border border-slate-100 dark:border-darkBorder">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-2xl font-bold shadow-sm">3</div>
              <h3 className="text-xl font-bold mb-3">Fix & Close</h3>
              <p className="text-slate-600 dark:text-slate-400">Maintainers resolve the issue before the SLA deadline and upload completion proof. Everyone gets notified.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-darkBg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-jakarta font-bold text-center mb-16">Platform Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap />, title: "AI Priority Detection", desc: "GPT-3.5 analyzes complaints to instantly suggest correct priority and timeframe." },
              { icon: <Camera />, title: "Photo Evidence", desc: "Upload issues with pictures directly from your phone for precise fault assessment." },
              { icon: <Clock />, title: "SLA Deadline Timer", desc: "Live countdowns and automated escalations ensure nothing is ever left unfixed." },
              { icon: <CheckCircle />, title: "Smart Assignment", desc: "Instantly find available maintainers filtered by job type and performance scores." },
              { icon: <Bell />, title: "Real-time Tracking", desc: "Live status updates via Socket.io with push notifications directly in the app." },
              { icon: <Search />, title: "Email Alerts", desc: "Automated Nodemailer updates to your inbox for important lifecycle events." },
              { icon: <QrCode />, title: "QR Room Codes", desc: "Generate and scan QR codes for specific rooms to instantly open pre-filled forms." },
              { icon: <TrendingUp />, title: "Performance Scores", desc: "Students rate resolution quality, building maintainer reputation and statistics." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 flex flex-col group hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Real Campus Photos (Carousel/Row) */}
      <section className="py-20 bg-white dark:bg-darkCard overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-jakarta font-bold text-center mb-12">Built for Real Campus Life</h2>
        <div className="flex gap-4 px-4 overflow-x-auto pb-8 snap-x" style={{ scrollbarWidth: 'none' }}>
          {[
            { img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80", caption: "College Exterior" },
            { img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80", caption: "Classroom Maintenance" },
            { img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80", caption: "Electrical Panel Fix" },
            { img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&q=80", caption: "Computer Lab Checking" },
          ].map((item, idx) => (
            <div key={idx} className="min-w-[300px] md:min-w-[400px] h-[250px] relative rounded-2xl overflow-hidden snap-center flex-shrink-0 group">
              <img src={item.img} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">{item.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Stats and Testimonials */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-darkBg overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-jakarta font-bold text-blue-600 mb-2"><Counter to="1420" suffix="+" duration="3" /></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Issues Resolved</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-jakarta font-bold text-blue-600 mb-2"><Counter to="48" suffix="h" duration="3" /></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Avg Fix Time</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-jakarta font-bold text-blue-600 mb-2"><Counter to="45" duration="3" /></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Active Maintainers</p>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-jakarta font-bold text-blue-600 mb-2"><Counter to="98" suffix="%" duration="3" /></div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Satisfaction</p>
            </div>
          </div>

          <h2 className="text-3xl font-jakarta font-bold text-center mb-10">What Students Say</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x" style={{ scrollbarWidth: 'none' }}>
            {[
              { name: "Alex Johnson", quote: "Reported a broken AC and it was fixed within 2 hours. The app is incredibly easy to use and the live tracking is awesome." },
              { name: "Samantha Lee", quote: "No more running to the admin office. I just uploaded a photo of the leaking pipe and a plumber arrived." },
              { name: "Michael T.", quote: "The AI priority detection is crazy smart. It knew immediately that our electrical fault was urgent." }
            ].map((t, i) => (
              <div key={i} className="card p-8 min-w-[300px] md:min-w-[400px] snap-center flex-shrink-0">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="fill-current w-5 h-5" />)}
                </div>
                <p className="text-lg italic text-slate-700 dark:text-slate-300 mb-4">"{t.quote}"</p>
                <p className="font-bold">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Announcements Board (Cards) */}
      <section className="py-20 px-4 bg-white dark:bg-darkCard">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-jakarta font-bold mb-8 flex items-center gap-2">
            <Bell className="w-8 h-8 text-blue-600" />
            Latest Announcements
          </h2>
          <div className="space-y-4">
            {announcements.slice(0, 3).map((a, i) => (
              <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="card p-6 border-l-4 border-l-blue-600">
                <h3 className="font-bold text-xl mb-2">{a.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{a.message}</p>
                <p className="text-sm text-slate-400 mt-4">{new Date(a.createdAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
            {announcements.length === 0 && <p className="text-slate-500">No recent announcements.</p>}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="MSI Logo" className="w-10 h-10 object-contain" />
              <span className="font-jakarta font-bold text-xl text-white">CampusFix</span>
            </div>
            <p className="text-sm">Smart Campus, Seamless Maintenance.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => openModal('student')} className="hover:text-white transition-colors">Student Login</button></li>
              <li><button onClick={() => openModal('maintainer')} className="hover:text-white transition-colors">Maintainer Login</button></li>
              <li><button onClick={() => openModal('authority')} className="hover:text-white transition-colors">Authority Login</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <p className="text-sm mb-2">Technical Support: support@campusfix.edu</p>
            <p className="text-sm">Administration: admin@campusfix.edu</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} CampusFix System. All rights reserved.</p>
          <p className="mt-2 md:mt-0">College Placeholder University</p>
        </div>
      </footer>
      
      </div>
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} role={activeRole} />
    </>
  );
};

export default Home;
