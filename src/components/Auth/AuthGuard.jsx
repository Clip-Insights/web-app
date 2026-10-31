import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SessionLoading from '../Loading/SessionLoading';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();
  const location = useLocation();
  if (isLoading) return <SessionLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search, reason: sessionExpired ? 'expired' : undefined }} />;
  return children;
}
AuthGuard.propTypes = { children: PropTypes.node.isRequired };
