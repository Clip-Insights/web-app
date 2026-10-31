import { createRoot } from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext"; // Import the AuthProvider
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Analytics } from "@vercel/analytics/react";

import AppErrorBoundary from './components/Feedback/AppErrorBoundary';

import { ToastContainer } from 'react-toastify';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <AppErrorBoundary><GoogleOAuthProvider clientId={googleClientId}>
    <AuthProvider>
      <App />
      <Analytics />
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar closeOnClick={false} />
    </AuthProvider>
  </GoogleOAuthProvider></AppErrorBoundary>
);
