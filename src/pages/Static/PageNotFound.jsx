import { useAuth } from '../../context/AuthContext';
import RecoveryScreen from '../../components/Feedback/RecoveryScreen';

export default function PageNotFound() {
  const { isAuthenticated } = useAuth();
  return <RecoveryScreen title="This page couldn’t be found." description="The link may be incomplete, or the page may have moved. Let’s get you back to your learning." home={isAuthenticated ? '/' : '/login'} homeLabel={isAuthenticated ? 'Back to dashboard' : 'Back to sign in'} />;
}
