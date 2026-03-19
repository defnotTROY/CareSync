import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    // 1. Still checking auth? Show nothing or a small spinner
    if (loading) return null;

    // 2. Not logged in? Send to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Logged in but wrong role? Send to their respective dashboard
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={role === 'staff' ? '/staff/dashboard' : '/dashboard'} replace />;
    }

    // 4. Everything is good! Render the page
    return children;
}