import { Route, createBrowserRouter, createRoutesFromElements, Navigate,} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Main_Layout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import NoNavbarLayout from "../layouts/NoNavbarLayout";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import ResetPasswordEmail from "../pages/ResetPassword/ResetPasswordEmail";
import ResetPasswordNew from "../pages/ResetPassword/ResetPasswordNew";
import Files from "../pages/Files/Files";
import Folders from "../pages/Folders/Folders";
import ComingSoon from "../pages/Static/ComingSoon";
import PageNotFound from "../pages/Static/PageNotFound";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import SignupSuccess from "../pages/Signup/SignupSuccess";

function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading indicator while checking authentication
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Main_Layout />}>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPasswordEmail />} />
        <Route path="/products" element={<ComingSoon />} />
        <Route path="/pricing" element={<ComingSoon />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordNew />} />

        // Protected Routes
        <Route path="" element={<AuthGuard> <Dashboard /> </AuthGuard>} />
        <Route path="folders" element={<AuthGuard> <Folders /> </AuthGuard>} />
        <Route path="/files/:folder_id?" element={<AuthGuard> <Files /> </AuthGuard>} />

        <Route path="*" element={<PageNotFound />} />
      </Route>

      <Route path="/" element={<NoNavbarLayout />}></Route>
        <Route path="signup-success" element={<SignupSuccess />} />
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
    </Route>
  )
);

export default router;
