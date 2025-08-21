import { IndividualSubscriptionsResponse, VendorAnalysis, VendorOverview, AccountSubscriptionsResponse, AllAccountsResponse, UsersByAccountIdResponse, VendorListUsersResponse } from './responseTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL

const getIdToken = () => {
    const sessionStorageKeys = Object.keys(sessionStorage);
    const oidcKey = sessionStorageKeys.find(key => key.startsWith("oidc.user:https://cognito-idp."));
    const oidcContext = JSON.parse(sessionStorage.getItem(oidcKey ?? "") || "{}");
    const idToken = oidcContext?.id_token;
    return idToken;
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

export const getIndividualSubscriptions = async (): Promise<IndividualSubscriptionsResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/individual-subscriptions`, {
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

export const deleteIndividualSubscriptions = async (vendors: string[]): Promise<IndividualSubscriptionsResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/individual-subscriptions`, {
        method: "DELETE",
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
export const createIndividualSubscription = async (vendors: string[]): Promise<IndividualSubscriptionsResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/individual-subscriptions`, {
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

export const addVendorsToList = async (accountId: string, vendorList: string, vendors: string[]): Promise<VendorListUsersResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor-lists?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}&operation=add-vendors`, {
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

export const removeVendorsFromList = async (accountId: string, vendorList: string, vendors: string[]): Promise<VendorListUsersResponse> => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendor-lists?account-id=${encodeURIComponent(accountId)}&vendor-list=${encodeURIComponent(vendorList)}&operation=remove-vendors`, {
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

