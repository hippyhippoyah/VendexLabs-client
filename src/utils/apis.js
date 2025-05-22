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

export const getSubscriptions = async () => {
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

export const deleteSubscriptions = async (vendors) => {
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
export const createSubscription = async (vendors) => {
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