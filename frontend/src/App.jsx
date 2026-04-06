import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Component imports
import Navbar from './components/common/Navbar';
import Toaster from './components/common/Toaster';

const Home = lazy(() => import('./pages/Home'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const AuthorityDashboard = lazy(() => import('./pages/authority/AuthorityDashboard'));
const MaintainerDashboard = lazy(() => import('./pages/maintainer/MaintainerDashboard'));
const Profile = lazy(() => import('./pages/common/Profile'));

const RouteFallback = () => (
  <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-base text-slate-500 dark:text-slate-400">
    Loading page...
  </div>
);

// Route Guards
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  if (token && loading && !user) {
    return <div className="flex h-screen items-center justify-center text-xl">Restoring session...</div>;
  }
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role) {
    // Redirect authenticated users to their respective dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

const ApprovedRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'maintainer' && user?.approvalStatus?.toLowerCase() !== 'approved') {
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
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              
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
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
