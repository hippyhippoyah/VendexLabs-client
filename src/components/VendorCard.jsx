import React from 'react';
import './VendorCard.css';

const VendorCard = ({ vendor, dateAdded, onDelete }) => {
  return (
    <div className="vendor-card">
      <span><strong>{vendor}</strong></span>
      <span><strong>Date Added:</strong> {dateAdded}</span>
      <button
        className="vendor-delete-btn"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default VendorCard;
