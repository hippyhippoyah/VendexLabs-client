import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext.tsx';
import { useVendorList } from '../contexts/VendorListContext';
import {
  getAllVendorLists,
  createVendorList,
  deleteVendorList,
  getAllVendors,
  getAccountSubscriptions,
  createAccountSubscription,
  deleteAccountSubscription,
  saveVendorsToList
} from '../utils/apis.ts';
import './VendorListsManagement.css';
import { VendorOverview, AccountSubscriptionsResponse, VendorListUsersResponse, VendorList } from '../utils/responseTypes.ts';


const VendorListsManagement = () => {
  const { selectedAccount } = useAccount();
  const { vendorListId, setVendorListId } = useVendorList();
  const [vendorLists, setVendorLists] = useState<VendorList[]>([]);
  const [allVendors, setAllVendors] = useState<VendorOverview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');
  const [selectedList, setSelectedList] = useState<VendorList | null>(null);
  const [subscribers, setSubscribers] = useState<AccountSubscriptionsResponse['subscribers']>([]);
  const [subLoading, setSubLoading] = useState<boolean>(false);
  // Edit Subscribers Modal State
  const [showEditSubscribersModal, setShowEditSubscribersModal] = useState<boolean>(false);
  const [editSubscriberInput, setEditSubscriberInput] = useState<string>('');

  useEffect(() => {
    if (selectedAccount?.id) {
      fetchVendorLists();
      fetchAllVendors();
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (vendorListId && selectedAccount?.id) {
      const list = vendorLists.find(l => l.id === vendorListId);
      setSelectedList(list || null);
      fetchSubscribers(vendorListId);
    } else {
      setSelectedList(null);
      setSubscribers([]);
    }
  }, [vendorListId, vendorLists, selectedAccount]);

  const fetchVendorLists = async () => {
    try {
      setLoading(true);
      const lists: VendorListUsersResponse = await getAllVendorLists(selectedAccount.id);
      setVendorLists(Array.isArray(lists?.vendor_lists) ? lists.vendor_lists : []);
      // Select first list by default
      if (Array.isArray(lists?.vendor_lists) && lists.vendor_lists.length > 0) {
        setVendorListId(lists.vendor_lists[0].id);
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
      const vendors: VendorOverview[] = await getAllVendors();
      setAllVendors(vendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchSubscribers = async (listId: string) => {
    if (!selectedAccount?.id || !listId) return;
    setSubLoading(true);
    try {
      const res: AccountSubscriptionsResponse = await getAccountSubscriptions(selectedAccount.id, listId);
      setSubscribers(res?.subscribers || []);
    } catch {
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

  const handleDeleteList = async (listId: string) => {
    const list = vendorLists.find(l => l.id === listId);
    if (!list) return;
    if (!window.confirm(`Are you sure you want to delete "${list.name}"?`)) return;
    try {
      await deleteVendorList(selectedAccount.id, listId);
      fetchVendorLists();
    } catch {
      setError('Failed to delete vendor list');
    }
  };

  // Edit Vendors Modal State
  const [showEditVendorsModal, setShowEditVendorsModal] = useState<boolean>(false);
  const [editVendorSearch, setEditVendorSearch] = useState<string>('');
  const [editSelectedVendors, setEditSelectedVendors] = useState<string[]>([]);
  const [customVendorInput, setCustomVendorInput] = useState<string>('');
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
  const getVendorLogo = (vendorName: string) => {
    const vendorObj = allVendors.find(v => v.vendor === vendorName);
    return vendorObj?.logo || null;
  };

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

  // Add subscriber (modal)
  const handleAddSubscriber = async (email: string) => {
    if (!email.trim() || !selectedList) return;
    if (subscribers.some(sub => sub.email === email)) {
      setEditSubscriberInput('');
      return;
    }
    setSubLoading(true);
    try {
      await createAccountSubscription(selectedAccount.id, selectedList.id, [email]);
      setEditSubscriberInput('');
      fetchSubscribers(selectedList.id);
    } catch {
      setError('Failed to add subscriber');
    } finally {
      setSubLoading(false);
    }
  };

  // Remove subscriber (modal)
  const handleRemoveSubscriber = async (email: string) => {
    if (!selectedList) return;
    setSubLoading(true);
    try {
      await deleteAccountSubscription(selectedAccount.id, selectedList.id, [email]);
      fetchSubscribers(selectedList.id);
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
                value={vendorListId || ''}
                onChange={e => setVendorListId(e.target.value)}
                className="search-input"
                style={{ minWidth: 200 }}
              >
                {vendorLists.map((list, idx) => (
                  <option key={idx} value={list.id}>{list.name}</option>
                ))}
            </select>
            <button className="request-vendors-btn" style={{ marginLeft: 8 }} onClick={() => setShowCreateModal(true)}>
              Create New List
            </button>
            {selectedList && (
              <button
                className="delete-btn"
                style={{ marginLeft: 8, padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => handleDeleteList(selectedList.id)}
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
                {(selectedList && Array.isArray(selectedList.vendors) && selectedList.vendors.length > 0) ? (
                  selectedList.vendors.map((vendor, idx) => (
                    <div key={idx} className="table-row">
                      <div
                        className="table-cell vendor-cell vendor-info-hover"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', position: 'relative' }}
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
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {getVendorLogo(vendor) && (
                            <img src={getVendorLogo(vendor) ?? undefined} alt={(vendor ?? '') + ' logo'} style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 10, borderRadius: 4, background: '#fff' }} />
                          )}
                          {vendor}
                        </span>
                        <button
                          className="view-details-btn"
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.95rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                          onClick={e => {
                            e.stopPropagation();
                            window.location.href = `/vendor/${encodeURIComponent(vendor)}`;
                          }}
                          aria-label={`View assessments for ${vendor}`}
                        >
                          View Assessments
                        </button>
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
