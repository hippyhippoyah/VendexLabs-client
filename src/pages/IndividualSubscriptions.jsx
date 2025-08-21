import React, { useState, useEffect } from 'react';
import { getAllVendors, getIndividualSubscriptions, createIndividualSubscription, deleteIndividualSubscriptions } from '../utils/apis';
import './VendorListsManagement.css';


const IndividualSubscriptions = () => {
  const [allVendors, setAllVendors] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSelectedVendors, setEditSelectedVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [customVendorInput, setCustomVendorInput] = useState('');

  useEffect(() => {
    fetchAllVendors();
    fetchSubscriptions();
  }, []);

  const fetchAllVendors = async () => {
    try {
      const vendors = await getAllVendors();
      setAllVendors(vendors);
    } catch{
      setError('Failed to load vendors');
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await getIndividualSubscriptions();
      setSubscriptions(res?.vendors.map(vendor => vendor.name) || []);
    } catch{
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriptions = async () => {
    if (editSelectedVendors.length === 0) return;
    setLoading(true);
    try {
      await createIndividualSubscription(editSelectedVendors);
      setShowEditModal(false);
      setEditSelectedVendors([]);
      fetchSubscriptions();
    } catch {
      setError('Failed to add subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = async (vendor) => {
    setLoading(true);
    try {
      await deleteIndividualSubscriptions([vendor]);
      fetchSubscriptions();
    } catch {
      setError('Failed to delete subscription');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = allVendors.filter(vendor =>
    vendor.vendor?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const handleAddCustomVendor = () => {
    const vendorName = customVendorInput.trim();
    if (!vendorName) return;
    if (!editSelectedVendors.includes(vendorName)) {
      setEditSelectedVendors([...editSelectedVendors, vendorName]);
    }
    setCustomVendorInput('');
  };

  return (
    <div className="supported-vendors" style={{ padding: '2rem' }}>
      <header className="page-header">
        <h1>Subscription Manager</h1>
        <p className="page-description">Manage your custom Vendor List</p>
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading subscriptions...</p>
        </div>
      ) : (
        <div className="vendors-table-container" style={{ maxWidth: 600 }}>
          <div className="vendors-table">
            <div className="table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="table-cell header-cell" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Tracked Vendors
              </div>
              <button className="request-vendors-btn" onClick={() => setShowEditModal(true)} style={{ marginLeft: 8 }}>
                Add Subscriptions
              </button>
            </div>
            {subscriptions.length > 0 ? (
              subscriptions.map((vendor, idx) => (
                <div key={idx} className="table-row">
                  <div
                    className="table-cell vendor-cell vendor-info-hover"
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                    onClick={() => window.location.href = `/vendor/${encodeURIComponent(vendor)}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`More information about ${vendor}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        window.location.href = `/vendor/${encodeURIComponent(vendor)}`;
                      }
                    }}
                  >
                    {vendor}
                    <span className="vendor-info-arrow" style={{ display: 'none', marginLeft: 12, color: '#2563eb', fontWeight: 500, alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>→</span> More Information
                    </span>
                  </div>
                  <div className="table-cell actions-cell">
                    <button className="delete-btn" onClick={() => handleDeleteSubscription(vendor)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No subscriptions</h3>
                <p>Add vendors using the button above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Subscriptions Modal */}
      {showEditModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxWidth: 420, width: '100%', padding: 0 }}>
            <div className="modal-header" style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Add Vendor Subscriptions</h3>
              <button className="close-modal" style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }} onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search vendors..."
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                className="search-input"
                style={{ marginBottom: 12, width: '90%' }}
              />
              <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fafbff', marginBottom: 16 }}>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, cursor: 'pointer' }}>
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
                        style={{ marginRight: 8 }}
                      />
                      {vendor.logo && (
                        <img src={vendor.logo} alt={vendor.vendor + ' logo'} style={{ width: 24, height: 24, objectFit: 'contain', marginRight: 8, borderRadius: 4, background: '#fff' }} />
                      )}
                      {vendor.vendor}
                    </label>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: 8 }}>No vendors found.</div>
                )}
              </div>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Add custom vendor..."
                  value={customVendorInput}
                  onChange={e => setCustomVendorInput(e.target.value)}
                  className="search-input"
                  style={{ width: '90%' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customVendorInput.trim()) {
                      handleAddCustomVendor();
                    }
                  }}
                />
                <button
                  className="view-details-btn"
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={handleAddCustomVendor}
                  disabled={!customVendorInput.trim()}
                >
                  Add Custom Vendor
                </button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Selected Vendors:</div>
                {editSelectedVendors.length > 0 ? (
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {editSelectedVendors.map((v, idx) => (
                      <li key={idx} style={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                        {v}
                        <button
                          style={{ marginLeft: 8, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}
                          onClick={() => setEditSelectedVendors(editSelectedVendors.filter(x => x !== v))}
                          title="Remove"
                        >×</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: '#6b7280' }}>None selected.</div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="cancel-btn" onClick={() => setShowEditModal(false)} style={{ minWidth: 90 }}>Cancel</button>
              <button className="create-btn" onClick={handleAddSubscriptions} disabled={editSelectedVendors.length === 0} style={{ minWidth: 90 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualSubscriptions;
