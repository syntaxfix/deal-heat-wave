
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const RootAdminRoute = () => {
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profile?.role !== 'root_admin') {
    return <Navigate to="/root/login" replace />;
  }

  return <Outlet />;
};

export default RootAdminRoute;
