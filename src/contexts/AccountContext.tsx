import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface AccountContextType {
  selectedAccount: any;
  setSelectedAccount: Dispatch<SetStateAction<any>>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const value = {
    selectedAccount,
    setSelectedAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

export default AccountContext;
