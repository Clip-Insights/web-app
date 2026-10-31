import { Route, createBrowserRouter, createRoutesFromElements, Navigate,} from "react-router-dom";
import AuthGuard from "../components/Auth/AuthGuard";
import { RouteErrorScreen } from "../components/Feedback/AppErrorBoundary";
import Main_Layout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import ResetPasswordEmail from "../pages/ResetPassword/ResetPasswordEmail";
import ResetPasswordNew from "../pages/ResetPassword/ResetPasswordNew";
import Files from "../pages/Files/Files";
import Folders from "../pages/Folders/Folders";
import GetStarted from "../pages/Static/GetStarted";
import Settings from "../pages/Settings/Settings";
import Pricing from "../pages/Pricing/Pricing";
import PageNotFound from "../pages/Static/PageNotFound";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import SignupSuccess from "../pages/Signup/SignupSuccess";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<RouteErrorScreen />}>
      <Route path="/" element={<Main_Layout />}>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPasswordEmail />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/products" element={<Navigate to="/get-started" replace />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordNew />} />

        {/* Protected routes */}
        <Route path="" element={<AuthGuard> <Dashboard /> </AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        <Route path="folders" element={<AuthGuard> <Folders /> </AuthGuard>} />
        <Route path="/files/:folder_id?" element={<AuthGuard> <Files /> </AuthGuard>} />

      </Route>

      <Route path="*" element={<PageNotFound />} />
        <Route path="signup-success" element={<SignupSuccess />} />
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
    </Route>
  )
);

export default router;
