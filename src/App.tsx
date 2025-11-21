import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.tsx";
import SignIn from "./components/SignIn.tsx";
import SignUp from "./components/SignUp.tsx";
import LandingPage from "./pages/marketing/LandingPage.tsx";
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
import './App.css';
import { getSession, signOut as cognitoSignOut, getCurrentUser } from "./utils/cognitoAuth";

function ProtectedRoutes() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          // Try to get a valid session
          await getSession();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOutRedirect = () => {
    cognitoSignOut();
    setIsAuthenticated(false);
    navigate('/');
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

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
            </Routes>
          </main>
        </div>
      </VendorListProvider>
    </AccountProvider>
  );
}

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status for public routes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          await getSession();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignInClick = () => {
    navigate('/sign-in');
  };

  const handleSignUpClick = () => {
    navigate('/sign-up');
  };

  const handleSignInSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If authenticated, show protected routes
  if (isAuthenticated) {
    return <ProtectedRoutes />;
  }

  // If not authenticated, show public routes
  return (
    <Routes>
      <Route path="/" element={<LandingPage onSignIn={handleSignInClick} onSignUp={handleSignUpClick} />} />
      <Route path="/sign-in" element={<SignIn onSignInSuccess={handleSignInSuccess} onBackToLanding={() => navigate('/')} />} />
      <Route path="/sign-up" element={<SignUp onSignUpSuccess={() => navigate('/sign-in')} onBackToSignIn={() => navigate('/sign-in')} />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default App;