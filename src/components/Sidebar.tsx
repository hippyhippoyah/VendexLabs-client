import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import vendexLogo from '../assets/logo.png';
import { getAllAccounts } from '../utils/apis';
import { useAccount } from '../contexts/AccountContext.tsx';
import './Sidebar.css';

interface Account {
  id: string | number;
  name: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { selectedAccount, setSelectedAccount } = useAccount();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        const accountsData: Account[] = response.accounts || [];
        setAccounts(accountsData);
        // Try to restore account from localStorage
        const storedAccount = localStorage.getItem('selectedAccount');
        if (storedAccount) {
          const parsedAccount: Account = JSON.parse(storedAccount);
          // If org, make sure it exists in accountsData
          if (parsedAccount.id === 'individual') {
            setSelectedAccount(parsedAccount);
          } else {
            const found = accountsData.find(acc => String(acc.id) === String(parsedAccount.id));
            if (found) {
              setSelectedAccount(found);
            } else if (accountsData.length > 0) {
              setSelectedAccount(accountsData[0]);
            } else {
              setSelectedAccount({ id: 'individual', name: 'Individual' });
            }
          }
        } else {
          // If no account is selected, default to first account (not 'individual')
          if (accountsData.length > 0) {
            setSelectedAccount(accountsData[0]);
          } else {
            setSelectedAccount({ id: 'individual', name: 'Individual' });
          }
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleAccountChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    let newAccount: Account;
    if (value === 'individual') {
      newAccount = { id: 'individual', name: 'Individual' };
    } else {
      const account = accounts.find(acc => String(acc.id) === value);
      newAccount = account ? account : { id: 'individual', name: 'Individual' };
    }
    setSelectedAccount(newAccount);
    localStorage.setItem('selectedAccount', JSON.stringify(newAccount));
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
        ) : (
          <select 
            id="account-select"
            className="account-select"
            value={String(selectedAccount?.id) || ''}
            onChange={handleAccountChange}
          >
            <option value="individual">Individual</option>
            {accounts.map((account) => (
              <option 
                key={account.id} 
                value={String(account.id)}
              >
                {account.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <nav className="sidebar-nav">
        {isVendorPage ? (
          <>
            {/* Vendor Header */}
            <div className="vendor-nav-header">
              <Link to="/vendor-lists" className="back-link">
                ← Back to Vendor Lists
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
            {/* Individual Subscriptions NavItem (only show when Individual is selected) */}
            {selectedAccount?.id === 'individual' && (
              <li className="nav-item">
                <Link 
                  to="/individual-subscriptions" 
                  className={`nav-link ${location.pathname === '/individual-subscriptions' ? 'active' : ''}`}
                >
                  <span className="nav-icon">📝</span>
                  <span className="nav-label">Individual Subscriptions</span>
                </Link>
              </li>
            )}
            {/* Other nav items, hide Account Manager and Vendor Lists Management when Individual is selected */}
            {navItems.map((item) => {
              if (selectedAccount?.id === 'individual' && (item.path === '/org-manager' || item.path === '/vendor-lists')) {
                return null;
              }
              return (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
