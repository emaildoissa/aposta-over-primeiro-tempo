import { Navigate, Outlet } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useData();

  if (!isAuthenticated) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, renderiza a página solicitada (Dashboard, etc.)
  return <Outlet />;
};

export default ProtectedRoute;