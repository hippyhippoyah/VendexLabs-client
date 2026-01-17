import { useEffect, useState } from 'react';
import { getAllVendors } from '../../utils/apis.ts';
import './SupportedVendors.css';


import { VendorOverview } from '../../utils/responseTypes.ts';

const SupportedVendors = () => {
  const [vendors, setVendors] = useState<VendorOverview[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const filteredVendors: VendorOverview[] = vendors?.filter(vendor =>
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
        <p className="page-subtitle">
          View and add 150+ vendors with prebuilt integrations and templates
        </p>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <div className="vendors-grid">
        {filteredVendors.map((vendor, idx) => (
          <div
            key={idx}
            className="vendor-card"
            onClick={() => window.location.href = `/vendors/${encodeURIComponent(vendor.vendor)}`}
            tabIndex={0}
            role="button"
            aria-label={`More information about ${vendor.vendor}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = `/vendors/${encodeURIComponent(vendor.vendor)}`;
              }
            }}
          >
            <div className="vendor-logo-container">
              <img 
                src={vendor.logo} 
                alt={`${vendor.vendor} logo`}
                className="vendor-logo"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="logo-fallback" style={{ display: 'none' }}>
                {vendor.vendor?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div className="vendor-name">{vendor.vendor}</div>
          </div>
        ))}
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
