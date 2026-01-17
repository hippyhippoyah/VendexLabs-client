import { VendorListUsersResponse, UsersByAccountIdResponse, AllAccountsResponse, AccountSubscriptionsResponse, VendorOverview, VendorAnalysis, VendorAssessment, VendorAssessmentsResponse, RSSFeed, DashboardMetrics } from './responseTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL

const getIdToken = () => {
    const sessionStorageKeys = Object.keys(sessionStorage);
    // Look for OIDC keys with auth.vendexlabs.com or cognito-idp (for backward compatibility)
    const oidcKey = sessionStorageKeys.find(key => 
        key.startsWith("oidc.user:https://auth.vendexlabs.com") || 
        key.startsWith("oidc.user:https://cognito-idp.")
    );
    if (oidcKey) {
        const oidcContext = JSON.parse(sessionStorage.getItem(oidcKey) || "{}");
        if (oidcContext?.id_token) {
            return oidcContext.id_token;
        }
    }
    
    // Fallback: try to get token from localStorage (direct Cognito auth format)
    const storedTokens = localStorage.getItem('cognito_tokens');
    if (storedTokens) {
        try {
            const tokens = JSON.parse(storedTokens);
            return tokens.idToken;
        } catch (e) {
            console.error('Error parsing stored tokens:', e);
        }
    }
    
    return null;
};

export const getEmailClaim = () => {
    const idToken = getIdToken();
    if (!idToken) {
        return null;
    }
    const payload = idToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    console.log("Decoded Payload:", decodedPayload);
    return decodedPayload.email;
}

export const getAllVendors = async (): Promise<VendorOverview[]> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendors/all`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

export const getOneVendor = async (vendor: string): Promise<VendorAnalysis[]> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor/${vendor}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

export const getVendorSecurityInstances = async (vendor: string): Promise<any> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor/${vendor}/security-instances`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

// Subscription Manager (Accounts)
export const getAccountSubscriptions = async (
  accountId: string,
  vendorList: string = "master-list"
): Promise<AccountSubscriptionsResponse> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/subscribers?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

export const createAccountSubscription = async (accountId: string, vendorList: string, emails: string[]): Promise<AccountSubscriptionsResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/subscribers?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "subscriber-email": emails })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

export const deleteAccountSubscription = async (accountId: string, vendorList: string, emails: string[]): Promise<AccountSubscriptionsResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/subscribers?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "subscriber-email": emails })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

// User Manager
// TODO: fix the routing... 
export const getAllAccounts = async (): Promise<AllAccountsResponse> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

export const getUsersByAccountId = async (
  accountId: string
): Promise<UsersByAccountIdResponse> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/users?account-id=${encodeURIComponent(accountId)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

export const addUserToAccount = async (accountId: string, users: string[]): Promise<UsersByAccountIdResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/users?account-id=${encodeURIComponent(accountId)}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ users })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

export const deleteUserFromAccount = async (accountId: string, users: string[]): Promise<UsersByAccountIdResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/users?account-id=${encodeURIComponent(accountId)}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ users })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

// Vendor List Manager
export const getAllVendorLists = async (
  accountId: string
): Promise<VendorListUsersResponse> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/vendor-lists?account-id=${encodeURIComponent(accountId)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

export const createVendorList = async (accountId: string, vendorList: string): Promise<VendorListUsersResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor-lists?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

export const deleteVendorList = async (accountId: string, vendorList: string): Promise<VendorListUsersResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor-lists?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

export const updateVendorList = async (accountId: string, vendorList: string, vendors: string[]): Promise<VendorListUsersResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor-lists?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ vendors })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

export const saveVendorsToList = async (accountId: string, vendorList: string, vendors: string[]): Promise<VendorListUsersResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor-lists?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}&operation=save-vendors`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ vendors })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

// Vendor Assessment Types

// Vendor Assessments API
export const addVendorAssessment = async (
  accountId: string,
  vendorListId: string,
  data: Omit<VendorAssessment, 'id'>
): Promise<{ id: string }> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/vendor-assessments?account-id=${encodeURIComponent(accountId)}&vendor-list-id=${encodeURIComponent(vendorListId)}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export const getVendorAssessments = async (
  accountId: string,
  vendorListId: string
): Promise<VendorAssessmentsResponse> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/vendor-assessments?account-id=${encodeURIComponent(accountId)}&vendor-list-id=${encodeURIComponent(vendorListId)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export const updateVendorAssessment = async (
  accountId: string,
  vendorListId: string,
  assessmentId: string,
  data: Partial<Omit<VendorAssessment, 'id'>>
): Promise<string> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/vendor-assessments?account-id=${encodeURIComponent(accountId)}&vendor-list-id=${encodeURIComponent(vendorListId)}&assessment-id=${encodeURIComponent(assessmentId)}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.text();
};

export const deleteVendorAssessment = async (
  accountId: string,
  vendorListId: string,
  assessmentId: string
): Promise<string> => {
  const accessToken = getIdToken();
  const response = await fetch(`${API_BASE_URL}/vendor-assessments?account-id=${encodeURIComponent(accountId)}&vendor-list-id=${encodeURIComponent(vendorListId)}&assessment-id=${encodeURIComponent(assessmentId)}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.text();
};

// Dashboard API Functions
export const getRecentIncidents = async (
  accountId: string,
  vendorListId: string | null,
  limit: number = 5
): Promise<RSSFeed[]> => {
  const accessToken = getIdToken();
  const params = new URLSearchParams({
    'account-id': accountId,
    'limit': limit.toString()
  });
  
  if (vendorListId) {
    params.append('vendor-list-id', vendorListId);
  }
  
  const response = await fetch(`${API_BASE_URL}/metrics/recent-incidents?${params.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  
  return await response.json();
};


// Get vendors from a vendor list (defaults to master-list)
export const getVendorsFromList = async (
  accountId: string,
  vendorListName: string = 'master-list'
): Promise<VendorOverview[]> => {
  const accessToken = getIdToken();
  const params = new URLSearchParams({
    'account-id': accountId,
    'vendor-list': vendorListName
  });
  
  const response = await fetch(`${API_BASE_URL}/metrics/vendors-from-list?${params.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  
  return await response.json();
};

export const getDashboardMetrics = async (
  accountId: string,
  vendorListId: string | null
): Promise<DashboardMetrics> => {
  const accessToken = getIdToken();
  const params = new URLSearchParams({
    'account-id': accountId
  });
  
  if (vendorListId) {
    params.append('vendor-list-id', vendorListId);
  }
  
  const response = await fetch(`${API_BASE_URL}/metrics/dashboard?${params.toString()}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  
  return await response.json();
};

export const getAISummary = async (
  _accountId: string,
  _vendorListId: string | null
): Promise<string> => {
  return "FEATURE IN PROGRESS";
};

