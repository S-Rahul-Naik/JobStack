import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Wait for auth check before rendering/redirecting
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}
