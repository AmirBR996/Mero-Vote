import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const LoadingScreen = () => (
  <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-[var(--nepal-red)] border-t-transparent rounded-full mx-auto" style={{ animation: 'spin 1s linear infinite' }} />
      <p className="text-[var(--text-muted)] text-sm">Loading...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};
