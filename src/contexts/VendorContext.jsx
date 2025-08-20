import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOneVendor } from '../utils/apis';

const VendorContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};

export const VendorProvider = ({ children }) => {
  const { vendor_name } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vendor_name) return;

    setLoading(true);
    setError(null);
    
    getOneVendor(vendor_name)
      .then(data => {
        setVendorData(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching vendor data:', err);
        setError(err);
        setVendorData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [vendor_name]);

  // Clear data when vendor changes
  useEffect(() => {
    if (vendor_name) {
      setVendorData(null);
      setLoading(true);
    }
  }, [vendor_name]);

  const value = {
    vendorData,
    loading,
    error,
    vendor_name,
    refetch: () => {
      if (vendor_name) {
        setLoading(true);
        getOneVendor(vendor_name)
          .then(setVendorData)
          .catch(setError)
          .finally(() => setLoading(false));
      }
    }
  };

  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  );
};
