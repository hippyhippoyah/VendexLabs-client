import React, { useEffect, useState } from 'react';
import { getAllVendors } from '../utils/apis';
import { Link } from 'react-router-dom';
import './SupportedVendors.css';

const SupportedVendors = () => {
  const [vendors, setVendors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const vendorData = await getAllVendors();
        setVendors(vendorData);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load vendor data');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const filteredVendors = vendors?.filter(vendor =>
    vendor.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.website_url?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="supported-vendors-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading supported vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="supported-vendors-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="supported-vendors-container">
      <header className="page-header">
        <h1>Supported Vendors</h1>
        <p className="page-description">
          Comprehensive security insights and analysis for {filteredVendors.length} vendor platforms
        </p>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="request-vendors-btn">
            Request New Vendors
          </button>
        </div>
      </header>

      <div className="vendors-table-container">
        <div className="vendors-table">
          <div className="table-header">
            <div className="table-cell header-cell">Vendor</div>
            <div className="table-cell header-cell">Website</div>
            <div className="table-cell header-cell">Actions</div>
          </div>

          {filteredVendors.map((vendor, idx) => (
            <div key={idx} className="table-row">
              <div className="table-cell vendor-logo-name-cell">
                <div className="vendor-logo-container">
                  <img 
                    src={vendor.logo} 
                    alt={`${vendor.vendor} logo`}
                    className="vendor-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="logo-fallback" style={{ display: 'none' }}>
                    {vendor.vendor?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
                <div
                  className="vendor-cell vendor-info-hover"
                  style={{ cursor: 'pointer', position: 'relative', marginLeft: 16 }}
                  onClick={() => window.location.href = `/vendor/${encodeURIComponent(vendor.vendor)}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`More information about ${vendor.vendor}`}
                >
                  {vendor.vendor}
                  <span className="vendor-info-arrow" style={{ display: 'none', marginLeft: 12, color: '#2563eb', fontWeight: 500, alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>→</span> More Information
                  </span>
                </div>
              </div>

              <div className="table-cell website-cell">
                {vendor.website_url && (
                  <a 
                    href={vendor.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    {vendor.website_url}
                  </a>
                )}
              </div>

              <div className="table-cell actions-cell">
                <Link 
                  to={`/vendor/${encodeURIComponent(vendor.vendor)}`}
                  className="view-details-btn"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredVendors.length === 0 && vendors && (
        <div className="empty-state">
          <h3>No vendors found</h3>
          <p>No vendors match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SupportedVendors;
