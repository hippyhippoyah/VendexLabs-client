import { useAuth } from "react-oidc-context";
import { Routes, Route } from "react-router-dom";
import vendexLogo from './assets/logo.png';
import Sidebar from "./components/Sidebar.tsx";
import { AccountProvider } from "./contexts/AccountContext.tsx";
import { VendorProvider } from "./contexts/VendorContext.tsx";
import { VendorListProvider } from "./contexts/VendorListContext";
import Home from "./pages/Home.tsx";
import SupportedVendors from "./pages/SupportedVendors.tsx";
import OrgManager from "./pages/OrgManager.tsx";
import VendorInfo from "./pages/VendorInfo.tsx";
import VendorListsManagement from "./pages/VendorListsManagement.tsx";
import VendorAlerts from "./pages/VendorAlerts.tsx";
import VendorGeneralCompliance from "./pages/VendorInfoPages/VendorGeneralCompliance.tsx";
import VendorPrivacyControls from "./pages/VendorInfoPages/VendorPrivacyControls.tsx";
import VendorBusinessMaturity from "./pages/VendorInfoPages/VendorBusinessMaturity.tsx";
import VendorSecurityInstances from "./pages/VendorInfoPages/VendorSecurityInstances.jsx";
import VendorAssessmentTracking from "./pages/VendorInfoPages/VendorAssessmentTracking.tsx";
import IndividualSubscriptions from "./pages/IndividualSubscriptions.tsx";
import './App.css';
import LandingPage from "./pages/marketing/LandingPage.tsx";
import React from 'react';

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
        <VendorListProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home onSignOut={signOutRedirect} />} />
                <Route path="/vendors/supported" element={<SupportedVendors />} />
                <Route path="/vendors/alerts" element={<VendorAlerts />} />
                <Route path="/vendors/:vendor_name/*" element={
                  <VendorProvider>
                    <Routes>
                      <Route index element={<VendorInfo />} />
                      <Route path="general-compliance" element={<VendorGeneralCompliance />} />
                      <Route path="privacy-controls" element={<VendorPrivacyControls />} />
                      <Route path="business-maturity" element={<VendorBusinessMaturity />} />
                      <Route path="security-instances" element={<VendorSecurityInstances />} />
                      <Route path="assessment-tracking" element={<VendorAssessmentTracking />} />
                    </Routes>
                  </VendorProvider>
                } />
                <Route path="/vendors" element={<VendorListsManagement />} />
                <Route path="/management" element={<OrgManager />} />
                <Route path="/individual-subscriptions" element={<IndividualSubscriptions />} />
              </Routes>
            </main>
          </div>
        </VendorListProvider>
      </AccountProvider>
    );
  }

  return (
    <LandingPage onSignIn={() => auth.signinRedirect()} />
  );
}

export default App;