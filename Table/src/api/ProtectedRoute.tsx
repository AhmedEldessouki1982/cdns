import { Navigate } from 'react-router-dom';
import { api } from './client';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.isAuthenticated();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 300000);
    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div>
        Loading...
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
