import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { 
  getAllVendorLists, 
  createVendorList, 
  deleteVendorList, 
  addVendorsToList,
  removeVendorsFromList,
  getAllVendors 
} from '../utils/apis';
import './VendorListsManagement.css';

const VendorListsManagement = () => {
  const { selectedAccount } = useAccount();
  const [vendorLists, setVendorLists] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customVendorInput, setCustomVendorInput] = useState('');

  useEffect(() => {
    if (selectedAccount?.id) {
      fetchVendorLists();
      fetchAllVendors();
    }
  }, [selectedAccount]);

  const fetchVendorLists = async () => {
    try {
      setLoading(true);
      const lists = await getAllVendorLists(selectedAccount.id);
      setVendorLists(lists?.vendor_lists || []);
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

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    try {
      await createVendorList(selectedAccount.id, newListName);
      setNewListName('');
      setShowCreateModal(false);
      fetchVendorLists();
    } catch (err) {
      console.error('Error creating vendor list:', err);
      setError('Failed to create vendor list');
    }
  };

  const handleDeleteList = async (listName) => {
    if (!window.confirm(`Are you sure you want to delete "${listName}"?`)) return;
    
    try {
      await deleteVendorList(selectedAccount.id, listName);
      fetchVendorLists();
    } catch (err) {
      console.error('Error deleting vendor list:', err);
      setError('Failed to delete vendor list');
    }
  };

  const handleEditList = (list) => {
    setSelectedList(list);
    setSelectedVendors(list.vendors || []);
    setCustomVendorInput('');
    setShowEditModal(true);
  };

  const handleUpdateList = async () => {
    if (!selectedList) return;
    
    try {
      // Get current vendors in the list
      const currentVendors = selectedList.vendors || [];
      
      // Find vendors to add and remove
      const vendorsToAdd = selectedVendors.filter(v => !currentVendors.includes(v));
      const vendorsToRemove = currentVendors.filter(v => !selectedVendors.includes(v));
      
      // Add new vendors
      if (vendorsToAdd.length > 0) {
        await addVendorsToList(selectedAccount.id, selectedList.name, vendorsToAdd);
      }
      
      // Remove vendors
      if (vendorsToRemove.length > 0) {
        await removeVendorsFromList(selectedAccount.id, selectedList.name, vendorsToRemove);
      }
      
      setShowEditModal(false);
      setSelectedList(null);
      setSelectedVendors([]);
      fetchVendorLists();
    } catch (err) {
      console.error('Error updating vendor list:', err);
      setError('Failed to update vendor list');
    }
  };

  const toggleVendorSelection = (vendorName) => {
    setSelectedVendors(prev => 
      prev.includes(vendorName)
        ? prev.filter(v => v !== vendorName)
        : [...prev, vendorName]
    );
  };

  const addCustomVendor = () => {
    const vendorName = customVendorInput.trim();
    if (!vendorName) return;
    
    // Check if vendor already exists in selected vendors
    if (selectedVendors.includes(vendorName)) {
      setCustomVendorInput('');
      return;
    }
    
    // Check if vendor already exists in supported vendors
    const supportedVendorNames = allVendors.map(v => v.vendor);
    if (supportedVendorNames.includes(vendorName)) {
      setCustomVendorInput('');
      return;
    }
    
    // Add to selected vendors
    setSelectedVendors(prev => [...prev, vendorName]);
    setCustomVendorInput('');
  };

  const handleCustomVendorKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCustomVendor();
    }
  };

  const filteredVendors = allVendors.filter(vendor =>
    vendor.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get custom vendors that are in the selected list but not in the supported vendors
  const getCustomVendors = () => {
    if (!selectedList?.vendors) return [];
    
    const supportedVendorNames = allVendors.map(v => v.vendor);
    return selectedList.vendors.filter(vendorName => 
      !supportedVendorNames.includes(vendorName) &&
      vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const customVendors = getCustomVendors();

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
    <div className="vendor-lists-container">
      <header className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Vendor Lists Management</h1>
            <p className="page-description">
              Manage and configure vendor lists for {selectedAccount.name}
            </p>
          </div>
          <button 
            className="create-list-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create New List
          </button>
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
        <div className="vendor-lists-grid">
          {vendorLists.map((list, index) => (
            <div key={index} className="vendor-list-card">
              <div className="list-header">
                <h3 className="list-name">{list.name || `List ${index + 1}`}</h3>
                <div className="list-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditList(list)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteList(list.name || `List ${index + 1}`)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="list-info">
                <p className="vendor-count">
                  {list.vendors?.length || 0} vendors
                </p>
                {list.vendors && list.vendors.length > 0 && (
                  <div className="vendor-preview">
                    <p className="preview-title">Vendors:</p>
                    <div className="vendor-tags">
                      {list.vendors.slice(0, 3).map((vendor, vIndex) => (
                        <span key={vIndex} className="vendor-tag">
                          {vendor}
                        </span>
                      ))}
                      {list.vendors.length > 3 && (
                        <span className="vendor-tag more">
                          +{list.vendors.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {vendorLists.length === 0 && (
            <div className="empty-state">
              <h3>No Vendor Lists</h3>
              <p>Create your first vendor list to get started.</p>
              <button 
                className="create-first-btn"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First List
              </button>
            </div>
          )}
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

      {/* Edit List Modal */}
      {showEditModal && selectedList && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>Edit Vendor List: {selectedList.name}</h3>
              <button 
                className="close-modal"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="vendor-selection">
                <div className="search-section">
                  <label htmlFor="vendorSearch">Search Vendors:</label>
                  <input
                    id="vendorSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for vendors..."
                    className="vendor-search-input"
                  />
                </div>
                <div className="selected-count">
                  Selected: {selectedVendors.length} vendors
                </div>
                
                {/* Supported Vendors */}
                <div className="vendor-section">
                  <h4 className="section-title">Supported Vendors</h4>
                  <div className="vendors-grid">
                    {filteredVendors.map((vendor, index) => (
                      <div 
                        key={index} 
                        className={`vendor-item ${selectedVendors.includes(vendor.vendor) ? 'selected' : ''}`}
                        onClick={() => toggleVendorSelection(vendor.vendor)}
                      >
                        <img 
                          src={vendor.logo} 
                          alt={vendor.vendor}
                          className="vendor-logo-small"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="vendor-logo-fallback" style={{ display: 'none' }}>
                          {vendor.vendor?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="vendor-name">{vendor.vendor}</span>
                        <div className="selection-indicator">
                          {selectedVendors.includes(vendor.vendor) && '✓'}
                        </div>
                      </div>
                    ))}
                    {filteredVendors.length === 0 && (
                      <div className="no-vendors-message">
                        No supported vendors match your search.
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Vendors */}
                <div className="vendor-section">
                  <h4 className="section-title">Custom Vendors</h4>
                  
                  {/* Add Custom Vendor Input */}
                  <div className="add-custom-vendor">
                    <div className="custom-vendor-input-group">
                      <input
                        type="text"
                        value={customVendorInput}
                        onChange={(e) => setCustomVendorInput(e.target.value)}
                        onKeyPress={handleCustomVendorKeyPress}
                        placeholder="Enter custom vendor name..."
                        className="custom-vendor-input"
                      />
                      <button
                        onClick={addCustomVendor}
                        disabled={!customVendorInput.trim()}
                        className="add-custom-btn"
                      >
                        Add Vendor
                      </button>
                    </div>
                  </div>
                  
                  {customVendors.length > 0 && (
                    <div className="vendors-grid">
                      {customVendors.map((vendorName, index) => (
                        <div 
                          key={`custom-${index}`} 
                          className={`vendor-item custom-vendor ${selectedVendors.includes(vendorName) ? 'selected' : ''}`}
                          onClick={() => toggleVendorSelection(vendorName)}
                        >
                          <div className="vendor-logo-fallback custom-logo">
                            {vendorName?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="vendor-name">{vendorName}</span>
                          <div className="selection-indicator">
                            {selectedVendors.includes(vendorName) && '✓'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {customVendors.length === 0 && !customVendorInput && (
                    <div className="no-custom-vendors">
                      <p>No custom vendors in this list. Add vendors using the input above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleUpdateList}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorListsManagement;
