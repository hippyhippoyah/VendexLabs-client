import vendexLogo from '../assets/logo.png';
import { useAccount } from '../contexts/AccountContext';
import { getEmailClaim } from '../utils/apis';
import './Home.css';

function Home({ onSignOut }) {
  const { selectedAccount } = useAccount();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div>
            <h1>Vendor Risk Dashboard</h1>
            {selectedAccount && (
              <p className="account-info">
                Account: {selectedAccount.name}
              </p>
            )}
          </div>
          <div className="user-info">
            <span>Welcome, {getEmailClaim()}</span>
            <button onClick={onSignOut} className="sign-out-btn">Sign out</button>
          </div>
        </div>
      </header>
      
      <main className="home-main">
        <section className="dashboard-section">
          <div className="welcome-card">
            <img src={vendexLogo} alt="VendexLabs Logo" className="dashboard-logo" />
            <h2>Welcome to VendexLabs</h2>
            <p>Your comprehensive vendor risk management platform</p>
            {selectedAccount && (
              <div className="current-account">
                <strong>Current Account:</strong> <span className="account-display">{selectedAccount.name}</span>
              </div>
            )}
          </div>
          
          {/* TODO: FIX STATIC NUMBERS */}
          <div className="quick-stats">
            <div className="stat-card">
              <h3>Total Vendors</h3>
              <p className="stat-number">24</p>
            </div>
            <div className="stat-card">
              <h3>Active Subscriptions</h3>
              <p className="stat-number">12</p>
            </div>
            <div className="stat-card">
              <h3>Risk Assessments</h3>
              <p className="stat-number">18</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
