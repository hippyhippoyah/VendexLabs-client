import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface VendorListContextType {
  vendorListId: string | null;
  setVendorListId: Dispatch<SetStateAction<string | null>>;
}

const VendorListContext = createContext<VendorListContextType | undefined>(undefined);

export const useVendorList = () => {
  const context = useContext(VendorListContext);
  console.log("CONTEXT SET", context)
  if (!context) {
    throw new Error('useVendorList must be used within a VendorListProvider');
  }
  return context;
};

interface VendorListProviderProps {
  children: ReactNode;
}

export const VendorListProvider: React.FC<VendorListProviderProps> = ({ children }) => {
  // Load initial value from localStorage
  const [vendorListId, setVendorListId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem('vendorListId');
      return stored ? stored : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    console.log('[VendorListProvider] Mounted');
    return () => {
      console.log('[VendorListProvider] Unmounted');
    };
  }, []);

  // Persist vendorListId to localStorage whenever it changes
  React.useEffect(() => {
    console.log('[VendorListProvider] vendorListId changed:', vendorListId);
    try {
      if (vendorListId) {
        localStorage.setItem('vendorListId', vendorListId);
      } else {
        localStorage.removeItem('vendorListId');
      }
    } catch {}
  }, [vendorListId]);

  const value = {
    vendorListId,
    setVendorListId,
  };

  return (
    <VendorListContext.Provider value={value}>
      {children}
    </VendorListContext.Provider>
  );
};

export default VendorListContext;
