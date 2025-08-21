import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { getOneVendor } from '../utils/apis.ts';

interface VendorContextType {
  vendorData: any;
  loading: boolean;
  error: any;
  vendor_name?: string;
  refetch: () => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};

interface VendorProviderProps {
  children: ReactNode;
}

export const VendorProvider: React.FC<VendorProviderProps> = ({ children }) => {
  const { vendor_name } = useParams<{ vendor_name?: string }>();
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

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
