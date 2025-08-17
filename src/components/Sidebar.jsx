import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import vendexLogo from '../assets/logo.png';
import { getAllAccounts } from '../utils/apis';
import { useAccount } from '../contexts/AccountContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const params = useParams();
  const { selectedAccount, setSelectedAccount } = useAccount();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if we're on a vendor info page
  const isVendorPage = location.pathname.includes('/vendor/');
  const vendorName = isVendorPage ? location.pathname.split('/vendor/')[1]?.split('/')[0] : null;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/supported-vendors', label: 'Supported Vendors', icon: '🏢' },
    // { path: '/subscriptions', label: 'Subscription Manager', icon: '📝' },
    { path: '/org-manager', label: 'Account Manager', icon: '👥' },
    { path: '/vendor-lists', label: 'Vendor Lists Management', icon: '📋' },
  ];

  const vendorNavItems = [
    { path: `/vendor/${vendorName}/general-compliance`, label: 'General Compliance', icon: '✅' },
    { path: `/vendor/${vendorName}/privacy-controls`, label: 'Privacy Controls', icon: '🔒' },
    { path: `/vendor/${vendorName}/business-maturity`, label: 'Business Maturity', icon: '📈' },
    { path: `/vendor/${vendorName}/security-instances`, label: 'Recent Security Instances in News', icon: '📰' },
    { path: `/vendor/${vendorName}/assessment-tracking`, label: 'Vendor Assessment Tracking', icon: '📊' },
  ];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await getAllAccounts();
        // Response structure: {"accounts": [{"id": 11, "name": "testingChad", "active": true}]}
        const accountsData = response.accounts || [];
        setAccounts(accountsData);
        
        // If only one account, select it automatically
        if (accountsData.length === 1) {
          const account = accountsData[0];
          setSelectedAccount(account);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [setSelectedAccount]);

  const handleAccountChange = (event) => {
    const accountId = parseInt(event.target.value);
    const account = accounts.find(acc => acc.id === accountId);
    setSelectedAccount(account);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={vendexLogo} alt="VendexLabs" className="sidebar-logo" />
        <h2 className="sidebar-title">VendexLabs</h2>
      </div>
      
      {/* Account Selection */}
      <div className="account-selection">
        <label htmlFor="account-select" className="account-label">
          Current Account:
        </label>
        {loading ? (
          <div className="account-loading">Loading accounts...</div>
        ) : error ? (
          <div className="account-error">{error}</div>
        ) : accounts.length > 0 ? (
          <select 
            id="account-select"
            className="account-select"
            value={selectedAccount?.id || ''}
            onChange={handleAccountChange}
          >
            {accounts.map((account) => (
              <option 
                key={account.id} 
                value={account.id}
              >
                {account.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="account-none">No accounts found</div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {isVendorPage ? (
          <>
            {/* Vendor Header */}
            <div className="vendor-nav-header">
              <Link to="/supported-vendors" className="back-link">
                ← Back to Vendors
              </Link>
              <h3 className="vendor-nav-title">
                {vendorName ? vendorName.charAt(0).toUpperCase() + vendorName.slice(1) : 'Vendor'}
              </h3>
            </div>
            
            {/* Vendor Navigation */}
            <ul className="nav-list vendor-nav-list">
              <li className="nav-item">
                <Link 
                  to={`/vendor/${vendorName}`}
                  className={`nav-link ${location.pathname === `/vendor/${vendorName}` ? 'active' : ''}`}
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-label">Vendor Risk</span>
                </Link>
              </li>
              {vendorNavItems.map((item) => (
                <li key={item.path} className="nav-item vendor-nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
