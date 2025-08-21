import { useEffect, useState } from 'react';
import '../App.css';
import VendorCard from "../components/VendorCard.jsx";
import { createIndividualSubscription, deleteIndividualSubscriptions, getAllVendors, getIndividualSubscriptions } from "../utils/apis.js";
import './Subscriptions.css';


function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [vendors, setVendors] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    getIndividualSubscriptions().then((response) => {
      setSubscriptions(response.vendors);
    })
    getAllVendors().then((response) => {
      setVendors(response || []);
    })
  }, []);

  const filteredVendors = vendors.filter(vendorObj =>
    vendorObj.vendor.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleAddSubscription = () => {
    const vendorToAdd = inputValue.trim();
    if (!vendorToAdd) return;
    createIndividualSubscription([vendorToAdd]).then((response) => {
      setSubscriptions(prev => [...prev, { name: vendorToAdd, date: new Date().toLocaleDateString() }]);
    }
    ).catch((error) => {
      console.error("Error creating subscription: ", error);
    }
    );
    setInputValue("");
    setShowDropdown(false);
  };

  const handleDeleteSubscription = (vendorName) => {
  deleteIndividualSubscriptions([vendorName]) // <- use your existing function
    .then(() => {
      setSubscriptions((prev) => prev.filter((s) => s.name !== vendorName));
    })
    .catch((error) => {
      console.error('Error deleting subscription:', error);
    });
};

  
  const handleSelectVendor = (vendorName) => {
    setInputValue(vendorName);
    setShowDropdown(false);
  };

  return (
    <>
      <div className="subscriptions-page-container">
        <div className="subscriptions-left">
          <h2>VendexLabs Subscription Manager</h2>
          <div className="add-subscription-bar add-subscription-bar-row">
              <input
                type="text"
                placeholder="Search or enter vendor"
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setShowDropdown(false)}
                className="add-subscription-input"
                autoComplete="off"
              />
              {showDropdown && filteredVendors.length > 0 && (
                <div>
                  <ul className="vendor-dropdown">
                    {filteredVendors.map((vendorObj, idx) => (
                      <li
                        key={idx}
                        className="vendor-dropdown-item"
                        onMouseDown={() => handleSelectVendor(vendorObj.vendor)}
                      >
                        <img src={vendorObj.logo} alt={vendorObj.vendor} style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} />
                        {vendorObj.vendor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            <button
              onClick={handleAddSubscription}
              className="add-subscription-btn"
              disabled={!inputValue.trim()}
            >
              Add
            </button>
          </div>
        </div>
        <div className="subscriptions-right">
          <div className="subscriptions-list">
            {subscriptions.map((subscription, idx) => (
              <VendorCard
                vendor={subscription.name}
                dateAdded={subscription.date}
                key={subscription.id || idx}
                onDelete={() => handleDeleteSubscription(subscription.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Subscriptions
