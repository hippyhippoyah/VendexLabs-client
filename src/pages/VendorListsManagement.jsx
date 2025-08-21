import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext';
import {
  getAllVendorLists,
  createVendorList,
  deleteVendorList,
  addVendorsToList,
  removeVendorsFromList,
  getAllVendors,
  getAccountSubscriptions,
  createAccountSubscription,
  deleteAccountSubscription
} from '../utils/apis';
import './VendorListsManagement.css';

const VendorListsManagement = () => {
  const { selectedAccount } = useAccount();
  const [vendorLists, setVendorLists] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedListName, setSelectedListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  // Edit Subscribers Modal State
  const [showEditSubscribersModal, setShowEditSubscribersModal] = useState(false);
  const [editSubscriberInput, setEditSubscriberInput] = useState('');

  useEffect(() => {
    if (selectedAccount?.id) {
      fetchVendorLists();
      fetchAllVendors();
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (selectedListName && selectedAccount?.id) {
      const list = vendorLists.find(l => l.name === selectedListName);
      setSelectedList(list || null);
      fetchSubscribers(selectedListName);
    } else {
      setSelectedList(null);
      setSubscribers([]);
    }
  }, [selectedListName, vendorLists, selectedAccount]);

  const fetchVendorLists = async () => {
    try {
      setLoading(true);
      const lists = await getAllVendorLists(selectedAccount.id);
      setVendorLists(lists?.vendor_lists || []);
      // Select first list by default
      if (lists?.vendor_lists?.length > 0) {
        setSelectedListName(lists.vendor_lists[0].name);
      }
    } catch (err) {
      console.error('Error fetching vendor lists:', err);
      setError('Failed to load vendor lists');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVendors = async () => {
    try {
      const vendors = await getAllVendors();
      setAllVendors(vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchSubscribers = async (listName) => {
    if (!selectedAccount?.id || !listName) return;
    setSubLoading(true);
    try {
      const res = await getAccountSubscriptions(selectedAccount.id, listName);
      // API now returns array of objects: { email, verified }
      setSubscribers(res?.subscribers || []);
    } catch{
      setError('Failed to load subscribers');
    } finally {
      setSubLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      await createVendorList(selectedAccount.id, newListName);
      setNewListName('');
      setShowCreateModal(false);
      fetchVendorLists();
    } catch {
      setError('Failed to create vendor list');
    }
  };

  const handleDeleteList = async (listName) => {
    if (!window.confirm(`Are you sure you want to delete "${listName}"?`)) return;
    try {
      await deleteVendorList(selectedAccount.id, listName);
      fetchVendorLists();
    } catch {
      setError('Failed to delete vendor list');
    }
  };

  // Edit Vendors Modal State
  const [showEditVendorsModal, setShowEditVendorsModal] = useState(false);
  const [editVendorSearch, setEditVendorSearch] = useState('');
  const [editSelectedVendors, setEditSelectedVendors] = useState([]);
  const [customVendorInput, setCustomVendorInput] = useState('');
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

  // Helper to get logo for a vendor name
  const getVendorLogo = (vendorName) => {
    const vendorObj = allVendors.find(v => v.vendor === vendorName);
    return vendorObj?.logo || null;
  };

  const handleSaveVendors = async () => {
    if (!selectedList) return;
    try {
      // Remove all vendors first, then add selected
      const toRemove = selectedList.vendors.filter(v => !editSelectedVendors.includes(v));
      const toAdd = editSelectedVendors.filter(v => !selectedList.vendors.includes(v));
      if (toRemove.length > 0) {
        await removeVendorsFromList(selectedAccount.id, selectedList.name, toRemove);
      }
      if (toAdd.length > 0) {
        await addVendorsToList(selectedAccount.id, selectedList.name, toAdd);
      }
      setShowEditVendorsModal(false);
      fetchVendorLists();
    } catch {
      setError('Failed to update vendors');
    }
  };

  // Add subscriber (modal)
  const handleAddSubscriber = async (email) => {
    if (!email.trim() || !selectedList) return;
    if (subscribers.some(sub => sub.email === email)) {
      setEditSubscriberInput('');
      return;
    }
    setSubLoading(true);
    try {
      await createAccountSubscription(selectedAccount.id, selectedList.name, [email]);
      setEditSubscriberInput('');
      fetchSubscribers(selectedList.name);
    } catch {
      setError('Failed to add subscriber');
    } finally {
      setSubLoading(false);
    }
  };

  // Remove subscriber (modal)
  const handleRemoveSubscriber = async (email) => {
    if (!selectedList) return;
    setSubLoading(true);
    try {
      await deleteAccountSubscription(selectedAccount.id, selectedList.name, [email]);
      fetchSubscribers(selectedList.name);
    } catch {
      setError('Failed to remove subscriber');
    } finally {
      setSubLoading(false);
    }
  };

  if (!selectedAccount) {
    return (
      <div className="vendor-lists-container">
        <div className="no-account-state">
          <h3>No Account Selected</h3>
          <p>Please select an account to manage vendor lists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supported-vendors">
      <header className="page-header">
        <h1>Vendor Lists Management</h1>
        <p className="page-description">
          Manage and configure vendor lists for {selectedAccount.name}
        </p>
        <div className="header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={selectedListName}
              onChange={e => setSelectedListName(e.target.value)}
              className="search-input"
              style={{ minWidth: 200 }}
            >
              {vendorLists.map((list, idx) => (
                <option key={idx} value={list.name}>{list.name}</option>
              ))}
            </select>
            <button className="request-vendors-btn" style={{ marginLeft: 8 }} onClick={() => setShowCreateModal(true)}>
              Create New List
            </button>
            {selectedList && (
              <button
                className="delete-btn"
                style={{ marginLeft: 8, padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => handleDeleteList(selectedList.name)}
                title="Delete List"
              >
                <span role="img" aria-label="Delete" style={{ fontSize: '1.2rem' }}>🗑️</span>
              </button>
            )}
          </div>
        </div>
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
          <p>Loading vendor lists...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Vendors Table */}
          <div style={{ flex: 2 }}>
            <div className="vendors-table-container">
              <div className="vendors-table">
                <div className="table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="table-cell header-cell">Vendor</div>
                  <button className="view-details-btn" onClick={() => setShowEditVendorsModal(true)} disabled={!selectedList} style={{ marginLeft: 8 }}>
                    Edit Vendors
                  </button>
                </div>
                {selectedList?.vendors?.length > 0 ? (
                  selectedList.vendors.map((vendor, idx) => (
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
                        {getVendorLogo(vendor) && (
                          <img src={getVendorLogo(vendor)} alt={vendor + ' logo'} style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 10, borderRadius: 4, background: '#fff' }} />
                        )}
                        {vendor}
                        <span className="vendor-info-arrow" style={{ display: 'none', marginLeft: 12, color: '#2563eb', fontWeight: 500, alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>→</span> More Information
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No vendors in this list</h3>
                    <p>Add vendors using the Edit button above.</p>
                  </div>
                )}
              </div>
            </div>

          {/* Edit Vendors Modal */}
          {showEditVendorsModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="modal" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxWidth: 420, width: '100%', padding: 0 }}>
                <div className="modal-header" style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Edit Vendors in List</h3>
                  <button className="close-modal" style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }} onClick={() => setShowEditVendorsModal(false)}>×</button>
                </div>
                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={editVendorSearch}
                    onChange={e => setEditVendorSearch(e.target.value)}
                    className="search-input"
                    style={{ marginBottom: 12, width: '90%' }}
                  />
                  <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fafbff', marginBottom: 16 }}>
                    {filteredAllVendors.length > 0 ? (
                      filteredAllVendors.map((vendor, idx) => (
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
                  <button className="cancel-btn" onClick={() => setShowEditVendorsModal(false)} style={{ minWidth: 90 }}>Cancel</button>
                  <button className="create-btn" onClick={handleSaveVendors} disabled={editSelectedVendors.length === 0} style={{ minWidth: 90 }}>Save</button>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Subscribers Table */}
          <div style={{ flex: 1 }}>
            <div className="vendors-table-container">
              <div className="vendors-table" style={{minWidth: '500px'}}>
                <div className="table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="table-cell header-cell">Subscriber Email</div>
                  <button className="view-details-btn" onClick={() => setShowEditSubscribersModal(true)} disabled={!selectedList} style={{ marginLeft: 8 }}>
                    Edit Subscribers
                  </button>
                </div>
                {subLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading subscribers...</p>
                  </div>
                ) : (
                  subscribers.length > 0 ? (
                    subscribers.map((sub, idx) => (
                      <div key={idx} className="table-row">
                        <div className="table-cell vendor-cell">{sub.email}</div>
                        <div className="table-cell vendor-cell">
                          {sub.verified ? (
                            <span style={{ color: '#059669', fontWeight: 600 }}>Verified</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>Unverified</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <h3>No subscribers</h3>
                      <p>Add subscribers using the Edit button above.</p>
                    </div>
                  )
                )}
              </div>
            </div>
            {/* Edit Subscribers Modal */}
            {showEditSubscribersModal && (
              <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="modal" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxWidth: 420, width: '100%', padding: 0 }}>
                  <div className="modal-header" style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Edit Subscribers</h3>
                    <button className="close-modal" style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#374151' }} onClick={() => setShowEditSubscribersModal(false)}>×</button>
                  </div>
                  <div className="modal-body" style={{ padding: '1.5rem' }}>
                    <input
                      type="email"
                      placeholder="Add subscriber email..."
                      value={editSubscriberInput}
                      onChange={e => setEditSubscriberInput(e.target.value)}
                      className="search-input"
                      style={{ marginBottom: 12, width: '90%' }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && editSubscriberInput.trim()) {
                          handleAddSubscriber(editSubscriberInput.trim());
                        }
                      }}
                    />
                    <button
                      className="view-details-btn"
                      style={{ marginBottom: 16, width: '90%' }}
                      onClick={() => handleAddSubscriber(editSubscriberInput.trim())}
                      disabled={!editSubscriberInput.trim()}
                    >
                      Add Subscriber
                    </button>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Current Subscribers:</div>
                    {subLoading ? (
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading subscribers...</p>
                      </div>
                    ) : (
                      subscribers.length > 0 ? (
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                          {subscribers.map((sub, idx) => (
                            <li key={idx} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>
                                {sub.email}
                                {sub.verified ? (
                                  <span style={{ color: '#059669', fontWeight: 600, marginLeft: 8 }}>Verified</span>
                                ) : (
                                  <span style={{ color: '#dc2626', fontWeight: 600, marginLeft: 8 }}>Unverified</span>
                                )}
                              </span>
                              <button
                                style={{ marginLeft: 8, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}
                                onClick={() => handleRemoveSubscriber(sub.email)}
                                title="Remove"
                              >×</button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ color: '#6b7280' }}>No subscribers.</div>
                      )
                    )}
                  </div>
                  <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button className="cancel-btn" onClick={() => setShowEditSubscribersModal(false)} style={{ minWidth: 90 }}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Vendor List</h3>
              <button 
                className="close-modal"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="listName">List Name:</label>
              <input
                id="listName"
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="list-name-input"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateList}
                disabled={!newListName.trim()}
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorListsManagement;
