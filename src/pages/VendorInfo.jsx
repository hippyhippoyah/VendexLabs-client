import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VendorAnalysisCard from '../components/VendorAnalysisCard';
import { getOneVendor } from '../utils/apis';
import Navbar from '../components/Navbar.jsx';

const VendorInfo = () => {
  const { vendor_name } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOneVendor(vendor_name)
      .then(data => setVendorData(data))
      .finally(() => setLoading(false));
  }, [vendor_name]);

  return (
    <div>
      <Navbar />
      {loading ? (
        <p>Loading vendor info...</p>
      ) : (
        <VendorAnalysisCard data={vendorData} />
      )}
    </div>
  );
};

export default VendorInfo;
