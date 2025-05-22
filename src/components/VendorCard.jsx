import React, { useState } from 'react';
import './VendorCard.css';
import { deleteSubscriptions } from "../utils/apis";

const VendorCard = ({ vendor, dateAdded }) => {
  const [hidden, setHidden] = useState(false);

  const handleDelete = () => {
    deleteSubscriptions([vendor]);
    setHidden(true);
  };

  return (
    <div className={`vendor-card${hidden ? ' vendor-card--hidden' : ''}`} key={vendor}>
      <span><strong>Vendor:</strong> {vendor}</span>
      <span><strong>Date Added:</strong> {dateAdded}</span>
      <button
        className="vendor-delete-btn"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default VendorCard;