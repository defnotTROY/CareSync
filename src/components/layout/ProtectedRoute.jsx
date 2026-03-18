import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Not logged in -> send to login screen
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If strict roles are required and user role doesn't match -> redirect to their designated default dashboard
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized -> render the route component
  return children;
}
