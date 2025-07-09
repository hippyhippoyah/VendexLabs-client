import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getAllVendors, getOneVendor } from '../utils/apis';
import { Link } from 'react-router-dom';

const SupportedVendors = () => {
  const [vendors, setVendors] = useState(null);

  useEffect(() => {
    getAllVendors()
      .then(setVendors)
      .catch(console.error);
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Supported Vendors</h1>
      <p>This page will provide insights and analysis on vendor performance.</p>
      <div style={{ padding: '16px' }}>
        {vendors ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Logo</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Vendor Name</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Website</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <img src={vendor.logo} alt={vendor.vendor} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <Link to={`/vendor/${encodeURIComponent(vendor.vendor)}`}>
                      {vendor.vendor}
                    </Link>
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <a href={vendor.website_url} target="_blank" rel="noopener noreferrer">
                      {vendor.website_url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading vendor data...</p>
        )}
      </div>
    </div>
  );
};

export default SupportedVendors;
