import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';

// Configuration helpers
const getConfig = () => {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const authDomain = import.meta.env.VITE_COGNITO_DOMAIN;
  const authority = import.meta.env.VITE_COGNITO_AUTHORITY;
  
  if (!userPoolId || !clientId) {
    throw new Error('Missing Cognito configuration. Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID');
  }

  return { userPoolId, clientId, authDomain, authority };
};

const getUserPool = () => {
  const { userPoolId, clientId } = getConfig();
  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
};

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface SignUpResult {
  user: CognitoUser;
  userSub: string;
}

export const signUp = (
  username: string,
  password: string,
  email: string,
  attributes?: { [key: string]: string }
): Promise<SignUpResult> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool();
    
    const attributeList: CognitoUserAttribute[] = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    // Add any additional attributes
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        attributeList.push(new CognitoUserAttribute({ Name: key, Value: value }));
      });
    }

    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (result) {
        resolve({
          user: result.user,
          userSub: result.userSub || '',
        });
      } else {
        reject(new Error('Sign up failed: No result returned'));
      }
    });
  });
};

export const confirmSignUp = (username: string, confirmationCode: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result || 'User confirmed successfully');
    });
  });
};

export const resendConfirmationCode = (username: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const userPool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result || 'Confirmation code sent');
    });
  });
};

export const signIn = (username: string, password: string): Promise<AuthTokens> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const userPool = getUserPool();
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const tokens: AuthTokens = {
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        };
        resolve(tokens);
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: () => {
        // Handle new password required flow if needed
        reject(new Error('New password required. Please contact support.'));
      },
    });
  });
};

// Helper to clear all Cognito-related storage
const clearCognitoStorage = (clientId: string, authority?: string) => {
  // Clear CognitoIdentityServiceProvider keys
  Object.keys(localStorage)
    .filter(key => key.startsWith(`CognitoIdentityServiceProvider.${clientId}.`))
    .forEach(key => localStorage.removeItem(key));
  
  // Clear OIDC sessionStorage
  if (authority) {
    sessionStorage.removeItem(`oidc.user:${authority}:${clientId}`);
  }
  
  // Clear OAuth state
  sessionStorage.removeItem('oauth_state');
  localStorage.removeItem('cognito_tokens');
};

export const signOut = () => {
  const userPool = getUserPool();
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
  
  const { clientId, authority } = getConfig();
  sessionStorage.clear();
  clearCognitoStorage(clientId, authority);
};

export const getCurrentUser = (): CognitoUser | null => {
  const userPool = getUserPool();
  return userPool.getCurrentUser();
};

export const getSession = (): Promise<AuthTokens> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No user session found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err || !session.isValid()) {
        reject(err || new Error('Invalid session'));
        return;
      }

      const tokens: AuthTokens = {
        accessToken: session.getAccessToken().getJwtToken(),
        idToken: session.getIdToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
      };
      resolve(tokens);
    });
  });
};

// Fast synchronous check for stored tokens
export const hasStoredTokens = (): boolean => {
  return !!localStorage.getItem('cognito_tokens');
};

// Store tokens in a format compatible with existing code
export const storeTokens = (tokens: AuthTokens) => {
  const { clientId, authority } = getConfig();
  
  // Store in localStorage for persistence
  localStorage.setItem('cognito_tokens', JSON.stringify(tokens));
  
  // Also store in sessionStorage in OIDC format for compatibility
  if (authority) {
    const oidcKey = `oidc.user:${authority}:${clientId}`;
    sessionStorage.setItem(oidcKey, JSON.stringify({
      id_token: tokens.idToken,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour default
    }));
  }
};


// Helper to create popup window
const createPopup = (url: string, title: string) => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  return window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );
};

// Helper to generate secure random state
const generateState = () => 
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Sign in with Google using OAuth2 popup flow with postMessage API
export const signInWithGoogle = (): Promise<AuthTokens> => {
  return new Promise((resolve, reject) => {
    const { authDomain, clientId } = getConfig();
    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = generateState();
    
    sessionStorage.setItem('oauth_state', state);

    // Build OAuth URL
    const authUrl = new URL(`${authDomain}/oauth2/authorize`);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('identity_provider', 'Google');
    authUrl.searchParams.set('state', state);

    const popup = createPopup(authUrl.toString(), 'Google Sign In');
    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let popupCheckInterval: ReturnType<typeof setInterval> | null = null;
    let isResolved = false;

    const cleanup = () => {
      window.removeEventListener('message', messageHandler);
      sessionStorage.removeItem('oauth_state');
      if (popup && !popup.closed) popup.close();
      if (timeoutId) clearTimeout(timeoutId);
      if (popupCheckInterval) clearInterval(popupCheckInterval);
    };

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || isResolved) return;

      if (event.data.type === 'OAUTH_SUCCESS') {
        const { code, state: returnedState } = event.data;
        if (returnedState !== state) {
          isResolved = true;
          cleanup();
          reject(new Error('Invalid state parameter. Possible CSRF attack.'));
          return;
        }
        isResolved = true;
        cleanup();
        exchangeCodeForTokens(code, redirectUri, authDomain, clientId)
          .then(resolve)
          .catch(reject);
      } else if (event.data.type === 'OAUTH_ERROR') {
        isResolved = true;
        cleanup();
        reject(new Error(event.data.errorDescription || `OAuth error: ${event.data.error}`));
      }
    };

    window.addEventListener('message', messageHandler);

    // Check if popup closed manually
    popupCheckInterval = setInterval(() => {
      if (popup.closed && !isResolved) {
        isResolved = true;
        cleanup();
        reject(new Error('Sign in cancelled or popup was closed'));
      }
    }, 500);

    // 5 minute timeout
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        reject(new Error('Sign in timeout'));
      }
    }, 300000);
  });
};

// Exchange authorization code for tokens
const exchangeCodeForTokens = async (
  code: string,
  redirectUri: string,
  authDomain: string,
  clientId: string
): Promise<AuthTokens> => {
  const tokenUrl = `${authDomain}/oauth2/token`;
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code: code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  const tokenData = await response.json();

  const tokens: AuthTokens = {
    accessToken: tokenData.access_token,
    idToken: tokenData.id_token,
    refreshToken: tokenData.refresh_token,
  };

  storeTokens(tokens);

  // Store user info in localStorage for Cognito SDK compatibility
  try {
    const idTokenPayload = JSON.parse(atob(tokens.idToken.split('.')[1]));
    const username = idTokenPayload['cognito:username'] || idTokenPayload.sub || idTokenPayload.email;
    
    if (username) {
      const prefix = `CognitoIdentityServiceProvider.${clientId}`;
      localStorage.setItem(`${prefix}.LastAuthUser`, username);
      localStorage.setItem(`${prefix}.${username}.idToken`, tokens.idToken);
      localStorage.setItem(`${prefix}.${username}.accessToken`, tokens.accessToken);
      localStorage.setItem(`${prefix}.${username}.refreshToken`, tokens.refreshToken);
      localStorage.setItem(`${prefix}.${username}.clockDrift`, '0');
    }
  } catch (e) {
    console.warn('Could not store user info:', e);
  }

  return tokens;
};

