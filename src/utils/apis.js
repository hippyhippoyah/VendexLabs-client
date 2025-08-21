const API_BASE_URL = import.meta.env.VITE_API_URL

const getIdToken = () => {
    const sessionStoragKeys = Object.keys(sessionStorage);
    const oidcKey = sessionStoragKeys.find(key => key.startsWith("oidc.user:https://cognito-idp."));
    const oidcContext = JSON.parse(sessionStorage.getItem(oidcKey) || "{}");
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

export const dummyApi = async () => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/dummy`, {
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

export const getIndividualSubscriptions = async () => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
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

export const deleteIndividualSubscriptions = async (vendors) => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
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
export const createIndividualSubscription = async (vendors) => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
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

export const getVendorsAnalysis = async (vendors) => {
    const accessToken = getIdToken();
    const vendorQuery = vendors && vendors.length > 0
        ? `?vendors=${encodeURIComponent(vendors.join(','))}`
        : '';
    const response = await fetch(`${API_BASE_URL}/vendors${vendorQuery}`, {
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

export const getAllVendors = async () => {
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

export const getOneVendor = async (vendor) => {
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

export const getVendorSecurityInstances = async (vendor) => {
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
export const getAccountSubscriptions = async (accountId, vendorList = "master-list") => {
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

export const createAccountSubscription = async (accountId, vendorList, emails) => {
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

export const deleteAccountSubscription = async (accountId, vendorList, emails) => {
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
export const getAllAccounts = async () => {
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

export const getUsersByAccountId = async (accountId) => {
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

export const addUserToAccount = async (accountId, users) => {
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

export const deleteUserFromAccount = async (accountId, users) => {
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

// Vendor Info (Additional)
export const createVendorInfo = async (vendors, updateAllFields = false) => {
    const accessToken = getIdToken();
    const response = await fetch(`${API_BASE_URL}/vendors`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ vendors, updateAllFields })
    });
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return await response.json();
}

// Vendor List Manager
export const getAllVendorLists = async (accountId) => {
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

export const createVendorList = async (accountId, vendorList) => {
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

export const deleteVendorList = async (accountId, vendorList) => {
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

export const updateVendorList = async (accountId, vendorList, vendors, action = "add") => {
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

export const addVendorsToList = async (accountId, vendorList, vendors) => {
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

export const removeVendorsFromList = async (accountId, vendorList, vendors) => {
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

