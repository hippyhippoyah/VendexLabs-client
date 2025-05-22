import { useEffect, useState } from 'react'
import vendexLogo from '../assets/logo.png'
import '../App.css'
import { getSubscriptions, createSubscription } from "../utils/apis.js";
import VendorCard from "../components/VendorCard.jsx";
import './Subscriptions.css';
import Navbar from '../components/Navbar.jsx';


function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [newVendor, setNewVendor] = useState("")

  useEffect(() => {
    getSubscriptions().then((response) => {
      console.log("response: ", response);
      setSubscriptions(response.vendors);
    })
  }, []);

  const handleAddSubscription = () => {
    if (!newVendor.trim()) return;
    createSubscription([newVendor]).then((response) => {
      console.log("response: ", response);
      setSubscriptions(prev => [...prev, { name: newVendor, date: new Date().toLocaleDateString() }]);
    }
    ).catch((error) => {
      console.error("Error creating subscription: ", error);
    }
    );
    setNewVendor("");
  };

  return (
    <>
      <Navbar />
      <div className="subscriptions-page-container">
        <div className="subscriptions-left">
          <h1>VendexLabs Subscription Manager</h1>
          <div className="add-subscription-bar">
            <input
              type="text"
              placeholder="Add new subscription"
              value={newVendor}
              onChange={e => setNewVendor(e.target.value)}
              className="add-subscription-input"
              onKeyDown={e => { if (e.key === "Enter") handleAddSubscription(); }}
            />
            <button
              onClick={handleAddSubscription}
              className="add-subscription-btn"
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
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Subscriptions
