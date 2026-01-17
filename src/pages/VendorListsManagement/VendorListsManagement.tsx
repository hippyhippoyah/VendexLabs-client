import { useState, useEffect } from 'react';
import { useAccount } from '../../contexts/AccountContext.tsx';
import {
  getAllVendorLists,
  getAllVendors,
  saveVendorsToList,
  getOneVendor
} from '../../utils/apis.ts';
import './VendorListsManagement.css';
import { VendorOverview, VendorListUsersResponse, VendorList, VendorAnalysis } from '../../utils/responseTypes.ts';

interface VendorDetails {
  vendor: string;
  category?: string;
  owner?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
  lastReview?: string;
  alerts?: number;
  logo?: string;
}

const VendorListsManagement = () => {
  const { selectedAccount } = useAccount();
  const [vendorLists, setVendorLists] = useState<VendorList[]>([]);
  const [allVendors, setAllVendors] = useState<VendorOverview[]>([]);
  const [vendorDetails, setVendorDetails] = useState<Map<string, VendorDetails>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<VendorList | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Edit Vendors Modal State
  const [showEditVendorsModal, setShowEditVendorsModal] = useState<boolean>(false);
  const [editVendorSearch, setEditVendorSearch] = useState<string>('');
  const [editSelectedVendors, setEditSelectedVendors] = useState<string[]>([]);
  const [customVendorInput, setCustomVendorInput] = useState<string>('');

  useEffect(() => {
    if (selectedAccount?.id) {
      fetchVendorLists();
      fetchAllVendors();
    }
  }, [selectedAccount]);

  useEffect(() => {
    // Use first list (master-list) if available
    if (vendorLists.length > 0 && selectedAccount?.id && vendorLists[0].name === 'master-list') {
      setSelectedList(vendorLists[0]);
    } else {
      setSelectedList(null);
    }
  }, [vendorLists, selectedAccount]);

  useEffect(() => {
    // Fetch vendor details for vendors in the selected list
    if (selectedList?.vendors && selectedList.vendors.length > 0 && allVendors.length > 0) {
      fetchVendorDetails(selectedList.vendors);
    }
  }, [selectedList, allVendors]);

  const fetchVendorLists = async () => {
    try {
      setLoading(true);
      const lists: VendorListUsersResponse = await getAllVendorLists(selectedAccount.id);
      setVendorLists(Array.isArray(lists?.vendor_lists) ? lists.vendor_lists : []);
    } catch (err) {
      console.error('Error fetching vendor lists:', err);
      setError('Failed to load vendor lists');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVendors = async () => {
    try {
      const vendors: VendorOverview[] = await getAllVendors();
      setAllVendors(vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchVendorDetails = async (vendorNames: string[]) => {
    if (allVendors.length === 0) return;
    
    const detailsMap = new Map<string, VendorDetails>();
    
    // Initialize with basic info from allVendors
    vendorNames.forEach(vendorName => {
      const vendorObj = allVendors.find(v => v.vendor === vendorName);
      detailsMap.set(vendorName, {
        vendor: vendorName,
        logo: vendorObj?.logo,
        category: vendorObj ? getCategoryFromVendor(vendorObj) : undefined,
        owner: undefined,
        riskLevel: undefined,
        lastReview: undefined,
        alerts: 0
      });
    });

    // Try to fetch detailed info for each vendor (limit to avoid too many requests)
    const fetchPromises = vendorNames.slice(0, 10).map(async (vendorName) => {
      try {
        const data: VendorAnalysis[] = await getOneVendor(vendorName);
        if (data && data.length > 0) {
          const vendorData = data[0];
          const existing = detailsMap.get(vendorName) || { vendor: vendorName };
          detailsMap.set(vendorName, {
            ...existing,
            category: vendorData.industry || existing.category,
            riskLevel: getRiskLevelFromScore(vendorData.risk_score),
            lastReview: vendorData.last_reviewed ? formatDate(vendorData.last_reviewed) : undefined,
            alerts: 0 // This would need to come from a different API
          });
        }
      } catch (err) {
        console.error(`Error fetching details for ${vendorName}:`, err);
      }
    });

    await Promise.all(fetchPromises);
    setVendorDetails(detailsMap);
  };

  const getCategoryFromVendor = (vendor: VendorOverview): string => {
    // Map common vendors to categories (this could be improved with actual data)
    const categoryMap: Record<string, string> = {
      'AWS': 'Cloud Infrastructure',
      'Snowflake': 'Data Warehouse',
      'Okta': 'Identity Provider',
      'Microsoft': 'Cloud Infrastructure',
      'Google': 'Cloud Infrastructure',
      'Salesforce': 'CRM',
      'Slack': 'Communication',
      'Zoom': 'Communication'
    };
    return categoryMap[vendor.vendor] || 'Other';
  };

  const getRiskLevelFromScore = (score?: number): 'Low' | 'Medium' | 'High' => {
    if (!score) return 'Medium';
    if (score <= 3) return 'Low';
    if (score <= 6) return 'Medium';
    return 'High';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch {
      return dateString;
    }
  };

  // Add custom vendor to selection
  const handleAddCustomVendor = () => {
    const vendorName = customVendorInput.trim();
    if (!vendorName) return;
    if (!editSelectedVendors.includes(vendorName)) {
      setEditSelectedVendors([...editSelectedVendors, vendorName]);
    }
    setCustomVendorInput('');
  };

  useEffect(() => {
    if (showEditVendorsModal && selectedList) {
      setEditSelectedVendors(selectedList.vendors || []);
      setEditVendorSearch('');
    }
  }, [showEditVendorsModal, selectedList]);

  const filteredAllVendors = allVendors.filter(vendor =>
    vendor.vendor?.toLowerCase().includes(editVendorSearch.toLowerCase())
  );

  const handleSaveVendors = async () => {
    if (!selectedList) return;
    try {
      await saveVendorsToList(selectedAccount.id, selectedList.id, editSelectedVendors);
      setShowEditVendorsModal(false);
      fetchVendorLists();
    } catch {
      setError('Failed to update vendors');
    }
  };

  // Filter vendors by search term
  const filteredVendors = selectedList?.vendors?.filter(vendor =>
    vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!selectedAccount) {
    return (
      <div className="vendors-container">
        <div className="no-account-state">
          <h3>No Account Selected</h3>
          <p>Please select an account to manage vendor lists.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="vendors-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendors-container">
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
    <div className="vendors-container">
      <header className="vendors-header">
        <h1 className="vendors-title">Vendors</h1>
        <p className="vendors-description">
          Manage and review all third-party vendors. Track risk, compliance, assessments, and alerts.
        </p>
        <div className="vendors-header-actions">
          <div className="vendors-buttons">
            <button className="add-vendor-btn" onClick={() => setShowEditVendorsModal(true)}>
              + Add Vendor
            </button>
            <button className="import-vendors-btn">
              Import Vendors
            </button>
          </div>
          <div className="search-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 14L11.1 11.1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search vendors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vendors-search-input"
            />
          </div>
        </div>
      </header>

      <div className="vendors-section">
        <h2 className="vendors-section-title">Your Vendors ({filteredVendors.length})</h2>
        <div className="vendors-table-wrapper">
          <div className="vendors-table">
            <div className="vendors-table-header">
              <div className="vendors-table-cell header">Name</div>
              <div className="vendors-table-cell header">Category</div>
              <div className="vendors-table-cell header">Owner</div>
              <div className="vendors-table-cell header">Risk Level</div>
              <div className="vendors-table-cell header">Last Review</div>
              <div className="vendors-table-cell header">Alerts</div>
            </div>

            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor, idx) => {
                const details = vendorDetails.get(vendor) || { vendor };
                const vendorObj = allVendors.find(v => v.vendor === vendor);
                const logo = details.logo || vendorObj?.logo;

                return (
                  <div key={idx} className="vendors-table-row">
                    <div className="vendors-table-cell vendor-name-cell">
                      <div className="vendor-logo-wrapper">
                        {logo ? (
                          <img 
                            src={logo} 
                            alt={`${vendor} logo`}
                            className="vendor-logo-img"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const fallback = img.nextSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="vendor-logo-fallback" style={{ display: logo ? 'none' : 'flex' }}>
                          {vendor?.charAt(0)?.toUpperCase()}
                        </div>
                      </div>
                      <span
                        className="vendor-name-link"
                          onClick={() => window.location.href = `/vendors/${encodeURIComponent(vendor)}`}
                      >
                        {vendor}
                      </span>
                    </div>
                    <div className="vendors-table-cell">{details.category || '—'}</div>
                    <div className="vendors-table-cell">{details.owner || '—'}</div>
                    <div className="vendors-table-cell">
                      {details.riskLevel ? (
                        <span className={`risk-badge risk-${details.riskLevel.toLowerCase()}`}>
                          {details.riskLevel}
                        </span>
                      ) : (
                        '—'
                      )}
                    </div>
                    <div className="vendors-table-cell">{details.lastReview || '—'}</div>
                    <div className="vendors-table-cell">{details.alerts ?? '—'}</div>
                  </div>
                );
              })
            ) : (
              <div className="vendors-empty-state">
                <h3>No vendors found</h3>
                <p>{searchTerm ? 'No vendors match your search criteria.' : 'Add vendors using the + Add Vendor button above.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="supported-vendors-section">
        <h2 className="supported-vendors-title">Supported Vendors</h2>
        <a href="/vendors/supported" className="supported-vendors-link">
          View supported vendors →
        </a>
      </div>

      {/* Edit Vendors Modal */}
      {showEditVendorsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Vendors in List</h3>
              <button className="close-modal" onClick={() => setShowEditVendorsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search vendors..."
                value={editVendorSearch}
                onChange={e => setEditVendorSearch(e.target.value)}
                className="search-input"
              />
              <div className="modal-vendors-list">
                {filteredAllVendors.length > 0 ? (
                  filteredAllVendors.map((vendor, idx) => (
                    <label key={idx} className="modal-vendor-item">
                      <input
                        type="checkbox"
                        checked={editSelectedVendors.includes(vendor.vendor)}
                        onChange={e => {
                          if (e.target.checked) {
                            setEditSelectedVendors([...editSelectedVendors, vendor.vendor]);
                          } else {
                            setEditSelectedVendors(editSelectedVendors.filter(v => v !== vendor.vendor));
                          }
                        }}
                      />
                      {vendor.logo && (
                        <img src={vendor.logo} alt={vendor.vendor + ' logo'} className="modal-vendor-logo" />
                      )}
                      {vendor.vendor}
                    </label>
                  ))
                ) : (
                  <div className="modal-empty">No vendors found.</div>
                )}
              </div>
              <div className="modal-custom-vendor">
                <input
                  type="text"
                  placeholder="Add custom vendor..."
                  value={customVendorInput}
                  onChange={e => setCustomVendorInput(e.target.value)}
                  className="search-input"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customVendorInput.trim()) {
                      handleAddCustomVendor();
                    }
                  }}
                />
                <button
                  className="add-custom-btn"
                  onClick={handleAddCustomVendor}
                  disabled={!customVendorInput.trim()}
                >
                  Add Custom Vendor
                </button>
              </div>
              <div className="modal-selected">
                <div className="modal-selected-title">Selected Vendors:</div>
                {editSelectedVendors.length > 0 ? (
                  <ul className="modal-selected-list">
                    {editSelectedVendors.map((v, idx) => (
                      <li key={idx} className="modal-selected-item">
                        {v}
                        <button
                          className="remove-vendor-btn"
                          onClick={() => setEditSelectedVendors(editSelectedVendors.filter(x => x !== v))}
                          title="Remove"
                        >×</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="modal-selected-empty">None selected.</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditVendorsModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSaveVendors} disabled={editSelectedVendors.length === 0}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorListsManagement;
