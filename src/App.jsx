import { useAuth } from "react-oidc-context";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import vendexLogo from './assets/logo.png'
import Home from "./pages/Home.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import VendorAnalysis from "./pages/VendorAnalysis.jsx";

function App() {
  const auth = useAuth();

  const signOutRedirect = () => {
    auth.removeUser();
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Home onSignOut={signOutRedirect} />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/vendor-analysis" element={<VendorAnalysis />} />
        </Routes>
      </div>
    );
  }

  return (
    <div>
      <img src={vendexLogo} className="logo" alt="Vlogo" />
      <h1>VendexLabs</h1>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  );
}

export default App;