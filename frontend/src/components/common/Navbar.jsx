import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogOut, Bell, User as UserIcon, Menu } from 'lucide-react';

import logo from '../../assets/images/msi logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md border-b border-gray-200 dark:border-darkBorder transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="MSI Logo" className="w-10 h-10 object-contain" />
            <span className="font-jakarta font-bold text-xl tracking-tight text-slate-900 dark:text-white">CampusFix</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={`/${user.role}`} className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
                <div className="relative">
                  <Bell className="w-5 h-5 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex items-center gap-2 pl-4 border-l border-slate-300 dark:border-darkBorder">
                  <Link to="/profile" title="View Profile" className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
                    <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium ml-2 flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    Exit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <button onClick={() => { if(window.location.pathname !== '/') navigate('/'); window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'student' })); }} className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Login
                 </button>
                 <button onClick={() => { if(window.location.pathname !== '/') navigate('/'); window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'student' })); }} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Get Started
                 </button>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center gap-4">
             <ThemeToggle />
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                <Menu className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
