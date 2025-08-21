import { useAuth } from "react-oidc-context";
import { Routes, Route } from "react-router-dom";
import vendexLogo from './assets/logo.png'
import Sidebar from "./components/Sidebar.jsx";
import { AccountProvider } from "./contexts/AccountContext.jsx";
import { VendorProvider } from "./contexts/VendorContext.jsx";
import Home from "./pages/Home.jsx";
import SupportedVendors from "./pages/SupportedVendors.jsx";
import OrgManager from "./pages/OrgManager.jsx";
import VendorInfo from "./pages/VendorInfo.jsx";
import VendorListsManagement from "./pages/VendorListsManagement.jsx";
import VendorGeneralCompliance from "./pages/VendorInfoPages/VendorGeneralCompliance.jsx";
import VendorPrivacyControls from "./pages/VendorInfoPages/VendorPrivacyControls.jsx";
import VendorBusinessMaturity from "./pages/VendorInfoPages/VendorBusinessMaturity.jsx";
import VendorSecurityInstances from "./pages/VendorInfoPages/VendorSecurityInstances.jsx";
import IndividualSubscriptions from "./pages/IndividualSubscriptions.jsx";
import './App.css';

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
      <AccountProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home onSignOut={signOutRedirect} />} />
              <Route path="/supported-vendors" element={<SupportedVendors />} />
              <Route path="/org-manager" element={<OrgManager />} />
              <Route path="/vendor-lists" element={<VendorListsManagement />} />
              <Route path="/individual-subscriptions" element={<IndividualSubscriptions />} />
              <Route path="/vendor/:vendor_name/*" element={
                <VendorProvider>
                  <Routes>
                    <Route index element={<VendorInfo />} />
                    <Route path="general-compliance" element={<VendorGeneralCompliance />} />
                    <Route path="privacy-controls" element={<VendorPrivacyControls />} />
                    <Route path="business-maturity" element={<VendorBusinessMaturity />} />
                    <Route path="security-instances" element={<VendorSecurityInstances />} />
                    <Route path="assessment-tracking" element={<div style={{padding: '24px'}}>Assessment Tracking - Coming Soon</div>} />
                  </Routes>
                </VendorProvider>
              } />
            </Routes>
          </main>
        </div>
      </AccountProvider>
    );
  }

  return (
    <div className="login-container">
      <img src={vendexLogo} className="logo" alt="Vlogo" />
      <h1>VendexLabs</h1>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  );
}

export default App;