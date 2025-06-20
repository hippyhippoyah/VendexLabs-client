import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getVendorsAnalysis, getSubscriptions } from '../utils/apis';
import VendorAnalysisCard from '../components/VendorAnalysisCard';

const VendorAnalysis = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getSubscriptions()
      .then((response) => {
        const vendorNames = (response?.vendors || []).map(v => v.name);
        return getVendorsAnalysis(vendorNames);
      })
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Vendor Analysis</h1>
      <p>This page will provide insights and analysis on vendor performance.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px' }}>
        {data ? (
          data.map((vendor, index) => (
            <VendorAnalysisCard key={index} vendorData={vendor} />
          ))
        ) : (
          <p>Loading vendor data...</p>
        )}
      </div>
    </div>
  );
};

export default VendorAnalysis;
