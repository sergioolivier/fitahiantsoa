import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

/**
 * Protege une route : redirige vers /connexion si non connecte,
 * ou vers la page d'accueil si le role ne correspond pas.
 *
 * Usage : <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">{t('common.loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
