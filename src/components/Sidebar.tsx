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

  // Check if we're on any vendor-related route
  const isVendorRoute = location.pathname.startsWith('/vendors');
  
  // Check if we're on a vendor info page (exclude /vendors/supported and /vendors/alerts)
  const isVendorPage = isVendorRoute && 
    !location.pathname.startsWith('/vendors/supported') && 
    !location.pathname.startsWith('/vendors/alerts') &&
    location.pathname !== '/vendors' &&
    location.pathname.split('/vendors/')[1]?.split('/')[0] !== undefined;
  const vendorName = isVendorPage ? location.pathname.split('/vendors/')[1]?.split('/')[0] : null;
  
  // State for expandable Vendors section (auto-expand when on vendor routes)
  const [vendorsExpanded, setVendorsExpanded] = useState<boolean>(isVendorRoute);

  // Auto-expand Vendors section when on vendor routes
  useEffect(() => {
    setVendorsExpanded(isVendorRoute);
  }, [isVendorRoute]);

  // Icon components
  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="11" y="3" width="6" height="4" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="11" y="9" width="6" height="8" rx="1" fill="currentColor" opacity="0.9"/>
    </svg>
  );

  const VendorsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10C11.3807 10 12.5 8.88071 12.5 7.5C12.5 6.11929 11.3807 5 10 5C8.61929 5 7.5 6.11929 7.5 7.5C7.5 8.88071 8.61929 10 10 10Z" fill="currentColor"/>
      <path d="M10 11.25C7.92893 11.25 6.25 12.9289 6.25 15H13.75C13.75 12.9289 12.0711 11.25 10 11.25Z" fill="currentColor"/>
    </svg>
  );

  const AssessmentsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4.5C5 4.22386 5.22386 4 5.5 4H14.5C14.7761 4 15 4.22386 15 4.5V15.5C15 15.7761 14.7761 16 14.5 16H5.5C5.22386 16 5 15.7761 5 15.5V4.5ZM6 5V15H14V5H6Z" fill="currentColor"/>
      <path d="M7 7H13V8H7V7Z" fill="currentColor"/>
      <path d="M7 9.5H13V10.5H7V9.5Z" fill="currentColor"/>
      <path d="M7 12H11V13H7V12Z" fill="currentColor"/>
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" fill="currentColor"/>
      <path d="M17.6569 8.34315L16.2426 6.92893C16.0521 6.73841 15.7957 6.62891 15.5286 6.62891C15.2615 6.62891 15.0051 6.73841 14.8146 6.92893L13.4004 8.34315C13.2099 8.53367 12.9535 8.64317 12.6864 8.64317C12.4193 8.64317 12.1629 8.53367 11.9724 8.34315L10.5582 6.92893C10.3677 6.73841 10.1113 6.62891 9.84415 6.62891C9.57704 6.62891 9.32063 6.73841 9.13011 6.92893L7.7159 8.34315C7.52538 8.53367 7.26897 8.64317 7.00186 8.64317C6.73475 8.64317 6.47834 8.53367 6.28782 8.34315L4.87361 6.92893C4.68309 6.73841 4.42668 6.62891 4.15957 6.62891C3.89246 6.62891 3.63605 6.73841 3.44553 6.92893L2.03132 8.34315C1.8408 8.53367 1.7303 8.79008 1.7303 9.05719C1.7303 9.3243 1.8408 9.58071 2.03132 9.77123L3.44553 11.1854C3.63605 11.376 3.89246 11.4855 4.15957 11.4855C4.42668 11.4855 4.68309 11.376 4.87361 11.1854L6.28782 9.77123C6.47834 9.58071 6.73475 9.47121 7.00186 9.47121C7.26897 9.47121 7.52538 9.58071 7.7159 9.77123L9.13011 11.1854C9.32063 11.376 9.57704 11.4855 9.84415 11.4855C10.1113 11.4855 10.3677 11.376 10.5582 11.1854L11.9724 9.77123C12.1629 9.58071 12.4193 9.47121 12.6864 9.47121C12.9535 9.47121 13.2099 9.58071 13.4004 9.77123L14.8146 11.1854C15.0051 11.376 15.2615 11.4855 15.5286 11.4855C15.7957 11.4855 16.0521 11.376 16.2426 11.1854L17.6569 9.77123C17.8474 9.58071 17.9569 9.3243 17.9569 9.05719C17.9569 8.79008 17.8474 8.53367 17.6569 8.34315Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
    </svg>
  );

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease'
      }}
    >
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Vendor sub-items
  const vendorSubItems = [
    { path: '/vendors', label: 'Your Vendors' },
    { path: '/vendors/supported', label: 'Supported Vendors' },
    { path: '/vendors/alerts', label: 'Vendor Alerts' },
  ];

  const navItems = [
    { path: '/', label: 'Dashboard', icon: DashboardIcon },
    // { path: '/assessments', label: 'Assessments', icon: AssessmentsIcon },
    { path: '/management', label: 'Management', icon: SettingsIcon },
  ];

  const vendorNavItems = [
    { path: `/vendors/${vendorName}/general-compliance`, label: 'General Compliance', icon: '✅' },
    { path: `/vendors/${vendorName}/privacy-controls`, label: 'Privacy Controls', icon: '🔒' },
    { path: `/vendors/${vendorName}/business-maturity`, label: 'Business Maturity', icon: '📈' },
    { path: `/vendors/${vendorName}/security-instances`, label: 'Recent Security Instances in News', icon: '📰' },
    { path: `/vendors/${vendorName}/assessment-tracking`, label: 'Vendor Assessment Tracking', icon: '📊' },
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
        <div className="sidebar-logo-container">
          <img src={vendexLogo} alt="VendexLabs" className="sidebar-logo" />
        </div>
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
              <Link to="/vendors" className="back-link">
                ← Back to Your Vendors
              </Link>
              <h3 className="vendor-nav-title">
                {vendorName ? vendorName.charAt(0).toUpperCase() + vendorName.slice(1) : 'Vendor'}
              </h3>
            </div>
            {/* Vendor Navigation */}
            <ul className="nav-list vendor-nav-list">
              <li className="nav-item">
                <Link 
                  to={`/vendors/${vendorName}`}
                  className={`nav-link ${location.pathname === `/vendors/${vendorName}` ? 'active' : ''}`}
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
            {navItems
              .filter(item => item.path === '/')
              .map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.path} className="nav-item">
                    <Link 
                      to={item.path} 
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      <span className="nav-icon"><IconComponent /></span>
                      <span className="nav-label">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            {/* Vendors expandable section - rendered second */}
            <li className="nav-item">
              <div className="nav-item-expandable">
                <Link 
                  to="/vendors" 
                  className={`nav-link ${isVendorRoute ? 'active' : ''}`}
                >
                  <span className="nav-icon"><VendorsIcon /></span>
                  <span className="nav-label">Vendors</span>
                </Link>
                <button
                  className="nav-chevron"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setVendorsExpanded(!vendorsExpanded);
                  }}
                  aria-label={vendorsExpanded ? 'Collapse Vendors' : 'Expand Vendors'}
                >
                  <ChevronIcon expanded={vendorsExpanded} />
                </button>
              </div>
              {vendorsExpanded && (
                <ul className="nav-sub-list">
                  {vendorSubItems.map((subItem) => {
                    // Check if this sub-item is active
                    // For '/vendors', it should only be active if pathname is exactly '/vendors'
                    // For other paths, check exact match
                    const isActive = subItem.path === '/vendors' 
                      ? location.pathname === '/vendors'
                      : location.pathname === subItem.path;
                    return (
                      <li key={subItem.path} className="nav-sub-item">
                        <Link 
                          to={subItem.path} 
                          className={`nav-link nav-sub-link ${isActive ? 'active' : ''}`}
                        >
                          <span className="nav-label">{subItem.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
            {navItems
              .filter(item => item.path !== '/')
              .map((item) => {
                if (selectedAccount?.id === 'individual' && (item.path === '/org-manager' || item.path === '/vendor-lists')) {
                  return null;
                }
                const IconComponent = item.icon;
                return (
                  <li key={item.path} className="nav-item">
                    <Link 
                      to={item.path} 
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      <span className="nav-icon"><IconComponent /></span>
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
