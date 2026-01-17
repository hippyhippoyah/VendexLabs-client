


import React, { useEffect, useState } from 'react';
import { getAllAccounts, getUsersByAccountId, addUserToAccount, deleteUserFromAccount } from '../../utils/apis';
import { AllAccountsResponse, UsersByAccountIdResponse } from '../../utils/responseTypes';
import { useAccount } from '../../contexts/AccountContext';
import '../VendorInfo/VendorInfo.css';

function OrgManager() {
  const [accounts, setAccounts] = useState<AllAccountsResponse['accounts']>([]);
  const { selectedAccount, setSelectedAccount } = useAccount();
  const [users, setUsers] = useState<UsersByAccountIdResponse['users']>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [removeLoading, setRemoveLoading] = useState<string>('');

  // Helper to get account id from context (object or string)
  const getAccountId = () => {
    if (!selectedAccount) return null;
    if (typeof selectedAccount === 'string') return selectedAccount;
    if (typeof selectedAccount === 'object' && selectedAccount.id) return selectedAccount.id;
    return null;
  };

  useEffect(() => {
    setLoading(true);
    getAllAccounts()
      .then(res => {
        setAccounts(res.accounts);
        if (res.accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(res.accounts[0]); // set whole account object
        }
      })
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))) )
      .finally(() => setLoading(false));
  }, [setSelectedAccount, selectedAccount]);

  useEffect(() => {
    const accountId = getAccountId();
    if (!accountId) return;
    setLoading(true);
    getUsersByAccountId(accountId)
      .then(res => setUsers(res.users))
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))) )
      .finally(() => setLoading(false));
  }, [selectedAccount]);

  const handleAddUser = async () => {
    const accountId = getAccountId();
    if (!newUserEmail || !accountId) return;
    setAddLoading(true);
    try {
      await addUserToAccount(accountId, [newUserEmail]);
      setNewUserEmail('');
      const res = await getUsersByAccountId(accountId);
      setUsers(res.users);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    const accountId = getAccountId();
    if (!accountId) return;
    setRemoveLoading(email);
    try {
      await deleteUserFromAccount(accountId, [email]);
      const res = await getUsersByAccountId(accountId);
      setUsers(res.users);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setRemoveLoading('');
    }
  };

  // Check if this is a personal account
  const isPersonalAccount = selectedAccount && (
    selectedAccount.id === 'individual' || 
    (typeof selectedAccount === 'string' && selectedAccount === 'individual')
  );

  if (isPersonalAccount) {
    return (
      <div className="vendor-info-container">
        <div className="vendor-analysis-card">
          <div className="company-profile-header">
            <h2 className="vendor-section-title">Organization User Manager</h2>
          </div>
          <div className="company-info-grid">
            <div className="company-main-info">
              <div className="company-details">
                <div className="vendor-info-row" style={{ 
                  padding: '2rem', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <p style={{ fontSize: '1.1rem', color: '#6B7280', margin: 0 }}>
                    Management is not supported for Personal Accounts. Please upgrade to Enterprise to access this feature.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-info-container">
      <div className="vendor-analysis-card">
        <div className="company-profile-header">
          <h2 className="vendor-section-title">Organization User Manager</h2>
        </div>
        <div className="company-info-grid">
          <div className="company-main-info">
            <div className="company-details">
              <div className="vendor-info-row">
                <span className="vendor-info-label">Add User (email)</span>
                <input
                  className="search-input"
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="user@email.com"
                  disabled={addLoading}
                />
                <button
                  className="view-details-btn"
                  onClick={handleAddUser}
                  disabled={addLoading || !newUserEmail}
                >
                  {addLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
          <div className="questionnaire-section">
            <div className="questionnaire-header">
              <span>Account Users</span>
            </div>
            <div className="vendor-subsidiaries-table">
              <div className="vendor-table-header">
                <span>Name</span>
                <span>Email</span>
                <span>Actions</span>
              </div>
              {loading ? (
                <div className="vendor-table-row"><span>Loading...</span></div>
              ) : error ? (
                <div className="vendor-table-row"><span>Error: {error.message}</span></div>
              ) : users.length === 0 ? (
                <div className="vendor-table-row"><span>No users found.</span></div>
              ) : (
                users.map(user => (
                  <div key={user.id} className="vendor-table-row subsidiary">
                    <div className="vendor-info-cell">
                      <span className="vendor-name">{user.name || '-'}</span>
                    </div>
                    <span className="vendor-website">{user.email}</span>
                    <div className="vendor-labels">
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveUser(user.email)}
                        disabled={removeLoading === user.email}
                      >
                        {removeLoading === user.email ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrgManager;
