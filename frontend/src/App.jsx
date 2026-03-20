import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import StudentDashboard from './pages/student/StudentDashboard';
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import MaintainerDashboard from './pages/maintainer/MaintainerDashboard';

// Component imports
import Navbar from './components/common/Navbar';
import Toaster from './components/common/Toaster';

// Route Guards
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-xl">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ApprovedRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'maintainer' && user?.approvalStatus !== 'approved') {
    return <div className="min-h-screen flex items-center justify-center text-center p-6"><div className="card p-8 max-w-md"><h2 className="text-2xl font-bold mb-4 text-orange-500">Pending Approval</h2><p>Your account is currently under review by the administration. You will be notified once approved.</p></div></div>;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen font-inter flex flex-col relative w-full overflow-x-hidden">
        <Toaster />
        <Navbar />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Student Routes */}
            <Route path="/student/*" element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            } />
            
            {/* Authority Routes */}
            <Route path="/authority/*" element={
              <PrivateRoute allowedRoles={['authority']}>
                <AuthorityDashboard />
              </PrivateRoute>
            } />
            
            {/* Maintainer Routes */}
            <Route path="/maintainer/*" element={
              <PrivateRoute allowedRoles={['maintainer']}>
                <ApprovedRoute>
                  <MaintainerDashboard />
                </ApprovedRoute>
              </PrivateRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
