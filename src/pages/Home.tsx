import { useEffect, useState } from 'react';
import { useAccount } from '../contexts/AccountContext.tsx';
import { useVendorList } from '../contexts/VendorListContext.tsx';
import { getEmailClaim, getRecentIncidents, getVendorsFromList, getDashboardMetrics, getAISummary } from '../utils/apis.ts';
import { RSSFeed, VendorOverview, DashboardMetrics } from '../utils/responseTypes';
import './Home.css';

function Home({ onSignOut }: { onSignOut: () => void }) {
  const { selectedAccount } = useAccount();
  const { vendorListId } = useVendorList();
  
  const [recentIncidents, setRecentIncidents] = useState<RSSFeed[]>([]);
  const [yourVendors, setYourVendors] = useState<VendorOverview[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedAccount) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const accountId = selectedAccount.id;
        
        // Fetch all dashboard data in parallel
        const [incidents, vendors, dashboardMetrics, summary] = await Promise.all([
          getRecentIncidents(accountId, vendorListId, 5),
          getVendorsFromList(accountId, 'master-list'),
          getDashboardMetrics(accountId, vendorListId),
          getAISummary(accountId, vendorListId)
        ]);
        
        setRecentIncidents(incidents);
        setYourVendors(vendors);
        setMetrics(dashboardMetrics);
        setAiSummary(summary);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedAccount, vendorListId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const toggleIncidentExpansion = (incidentId: string) => {
    setExpandedIncidentId(expandedIncidentId === incidentId ? null : incidentId);
  };

  if (loading) {
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
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

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
        <div className="dashboard-grid">
          {/* Metric Cards Row */}
          <div className="metrics-row">
            <div className="metric-card">
              <h3>Active Assessments</h3>
              <p className="metric-number">{metrics?.activeAssessments || 0}</p>
            </div>
            <div className="metric-card">
              <h3>Total Vendors</h3>
              <p className="metric-number">{metrics?.totalVendors || 0}</p>
            </div>
            <div className="metric-card">
              <h3>Followed Vendors</h3>
              <p className="metric-number">{metrics?.followedVendors || 0}</p>
            </div>
          </div>

          <div className="dashboard-middle-row">
            <div className="recent-incidents-card">
              <h2>Recent Incidents for Followed Vendors</h2>
              {recentIncidents.length === 0 ? (
                <div className="empty-state">
                  <p>No recent incidents from followed vendors</p>
                </div>
              ) : (
                <ul className="incidents-list">
                  {recentIncidents.map((incident) => {
                    const isExpanded = expandedIncidentId === incident.id;
                    return (
                      <li 
                        key={incident.id} 
                        className={`incident-item ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => toggleIncidentExpansion(incident.id)}
                      >
                        <div className="incident-summary">
                          <div className="incident-header">
                            <span className="incident-vendor">{incident.vendor_name}</span>
                            <span className="incident-date">{formatDate(incident.published)}</span>
                          </div>
                          <h4 className="incident-title">{incident.title}</h4>
                          {incident.incident_type && (
                            <span className="incident-type">{incident.incident_type}</span>
                          )}
                          <div className="incident-expand-indicator">
                            {isExpanded ? '▼' : '▶'}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="incident-details">
                            {incident.summary && (
                              <div className="detail-section">
                                <h5>Summary</h5>
                                <p>{incident.summary}</p>
                              </div>
                            )}
                            
                            <div className="detail-grid">
                              {incident.product && (
                                <div className="detail-item">
                                  <span className="detail-label">Product:</span>
                                  <span className="detail-value">{incident.product}</span>
                                </div>
                              )}
                              
                              {incident.published && (
                                <div className="detail-item">
                                  <span className="detail-label">Published:</span>
                                  <span className="detail-value">{formatFullDate(incident.published)}</span>
                                </div>
                              )}
                              
                              {incident.incident_type && (
                                <div className="detail-item">
                                  <span className="detail-label">Type:</span>
                                  <span className="detail-value">{incident.incident_type}</span>
                                </div>
                              )}
                              
                              {incident.status && (
                                <div className="detail-item">
                                  <span className="detail-label">Status:</span>
                                  <span className={`detail-value status-${incident.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {incident.status}
                                  </span>
                                </div>
                              )}
                              
                              {incident.affected_service && (
                                <div className="detail-item">
                                  <span className="detail-label">Affected Service:</span>
                                  <span className="detail-value">{incident.affected_service}</span>
                                </div>
                              )}
                              
                              {incident.potentially_impacted_data && (
                                <div className="detail-item">
                                  <span className="detail-label">Potentially Impacted Data:</span>
                                  <span className="detail-value">{incident.potentially_impacted_data}</span>
                                </div>
                              )}
                              
                              {incident.exploits && (
                                <div className="detail-item">
                                  <span className="detail-label">Exploits/CVE:</span>
                                  <span className="detail-value">{incident.exploits}</span>
                                </div>
                              )}
                              
                              {incident.source && (
                                <div className="detail-item">
                                  <span className="detail-label">Source:</span>
                                  <span className="detail-value">{incident.source}</span>
                                </div>
                              )}
                            </div>
                            
                            {incident.url && (
                              <div className="detail-section">
                                <a 
                                  href={incident.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="incident-link"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Full Report →
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="your-vendors-card">
              <h2>Your Vendors</h2>
              {yourVendors.length === 0 ? (
                <div className="empty-state">
                  <p>You have no vendors to display</p>
                  <p>Add vendors to your account to see them here</p>
                  <button onClick={() => window.location.href = '/vendors'} className="add-vendor-btn">Add Vendor</button>
                  <button onClick={() => window.location.href = '/vendors/supported'} className="add-vendor-btn">View Supported Vendors</button>
                </div>
              ) : (
                <>
                  <div className="vendor-subsidiaries-table">
                    <div className="vendor-table-header">
                      <span>Vendor</span>
                      <span>Website</span>
                      <span>Score</span>
                    </div>
                    {yourVendors.map((vendor) => (
                      <div 
                        key={vendor.id} 
                        className="vendor-table-row"
                        onClick={() => window.location.href = `/vendors/${encodeURIComponent(vendor.vendor)}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="vendor-info-cell">
                          {vendor.logo ? (
                            <img 
                              src={vendor.logo} 
                              alt={`${vendor.vendor} logo`}
                              className="vendor-logo-small"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                const fallback = img.nextSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="vendor-logo-fallback" style={{ display: vendor.logo ? 'none' : 'flex' }}>
                            {vendor.vendor?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="vendor-radio">●</div>
                          <span className="vendor-name">{vendor.vendor}</span>
                        </div>
                        <span className="vendor-website">{vendor.website_url || '-'}</span>
                        <div className="vendor-score">
                          <span className="vendor-score-circle">-</span>
                          <span className="vendor-score-value">-</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="manage-vendors-button-container">
                    <button 
                      onClick={() => window.location.href = '/vendors'} 
                      className="manage-vendors-btn"
                    >
                      Manage
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Summary Row */}
          <div className="ai-summary-card">
            <h2>AI Daily Summary</h2>
            {aiSummary ? (
              <p className="ai-summary-text">{aiSummary}</p>
            ) : (
              <div className="empty-state">
                <p>No summary available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
