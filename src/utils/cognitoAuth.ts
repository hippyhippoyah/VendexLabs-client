import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';

// Get Cognito configuration from environment variables
const getUserPool = () => {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  
  if (!userPoolId || !clientId) {
    throw new Error('Missing Cognito configuration. Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID');
  }

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

export const signOut = () => {
  const userPool = getUserPool();
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
  // Clear any stored tokens
  sessionStorage.clear();
  localStorage.removeItem('cognito_tokens');
};

export const getCurrentUser = (): CognitoUser | null => {
  const userPool = getUserPool();
  const user = userPool.getCurrentUser();
  
  // If CognitoUserPool doesn't find a user, check if we have tokens stored
  // This handles OAuth flow where tokens are stored manually
  if (!user) {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const lastAuthUser = localStorage.getItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`);
    if (lastAuthUser) {
      // Create a CognitoUser instance manually
      return new CognitoUser({
        Username: lastAuthUser,
        Pool: userPool,
      });
    }
  }
  
  return user;
};

export const getSession = (): Promise<AuthTokens> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) {
      // Fallback: check if we have tokens stored directly
      const storedTokens = localStorage.getItem('cognito_tokens');
      if (storedTokens) {
        try {
          const tokens = JSON.parse(storedTokens);
          // Verify tokens are still valid (basic check)
          if (tokens.idToken && tokens.accessToken) {
            resolve(tokens);
            return;
          }
        } catch (e) {
          // Invalid stored tokens, continue to reject
        }
      }
      reject(new Error('No user session found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err || !session || !session.isValid()) {
        // Fallback: check if we have tokens stored directly
        const storedTokens = localStorage.getItem('cognito_tokens');
        if (storedTokens) {
          try {
            const tokens = JSON.parse(storedTokens);
            if (tokens.idToken && tokens.accessToken) {
              resolve(tokens);
              return;
            }
          } catch (e) {
            // Invalid stored tokens
          }
        }
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

// Store tokens in a format compatible with existing code
export const storeTokens = (tokens: AuthTokens) => {
  // Store in localStorage for persistence
  localStorage.setItem('cognito_tokens', JSON.stringify(tokens));
  
  // Also store in sessionStorage in OIDC format for compatibility with existing code
  const authority = import.meta.env.VITE_COGNITO_AUTHORITY;
  if (authority) {
    const oidcKey = `oidc.user:${authority}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`;
    const oidcData = {
      id_token: tokens.idToken,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour default
    };
    sessionStorage.setItem(oidcKey, JSON.stringify(oidcData));
  }
};


// Sign in with Google using OAuth2 popup flow with Cognito
export const signInWithGoogle = (): Promise<AuthTokens> => {
  return new Promise((resolve, reject) => {
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const redirectUri = window.location.origin;

    if (!cognitoDomain || !clientId) {
      reject(new Error('Missing Cognito configuration'));
      return;
    }

    // Generate a unique state for security
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oauth_state', state);

    // Build OAuth URL with Google as identity provider
    const authUrl = new URL(`${cognitoDomain}/oauth2/authorize`);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('identity_provider', 'Google');
    authUrl.searchParams.set('state', state);

    // Open popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl.toString(),
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    // Listen for OAuth callback
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          sessionStorage.removeItem('oauth_state');
          reject(new Error('Sign in cancelled or failed'));
          return;
        }

        // Check if popup has navigated to redirect URI
        try {
          const popupUrl = new URL(popup.location.href);
          if (popupUrl.origin === new URL(redirectUri).origin) {
            const code = popupUrl.searchParams.get('code');
            const returnedState = popupUrl.searchParams.get('state');
            const error = popupUrl.searchParams.get('error');
            
            if (error) {
              popup.close();
              clearInterval(checkPopup);
              sessionStorage.removeItem('oauth_state');
              const errorDescription = popupUrl.searchParams.get('error_description');
              reject(new Error(errorDescription || `OAuth error: ${error}`));
              return;
            }
            
            if (code && returnedState === state) {
              popup.close();
              clearInterval(checkPopup);
              sessionStorage.removeItem('oauth_state');
              exchangeCodeForTokens(code, redirectUri, cognitoDomain, clientId)
                .then(resolve)
                .catch(reject);
            }
          }
        } catch (e) {
          // Cross-origin error, popup hasn't navigated to redirect URI yet
        }
      } catch (e) {
        // Ignore errors
      }
    }, 100);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        clearInterval(checkPopup);
        sessionStorage.removeItem('oauth_state');
        reject(new Error('Sign in timeout'));
      }
    }, 300000);
  });
};

// Exchange authorization code for tokens
const exchangeCodeForTokens = async (
  code: string,
  redirectUri: string,
  cognitoDomain: string,
  clientId: string
): Promise<AuthTokens> => {
  const tokenUrl = `${cognitoDomain}/oauth2/token`;
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

  // Store tokens
  storeTokens(tokens);

  // Also store in CognitoUserPool format for getCurrentUser() to work
  try {
    const idTokenPayload = JSON.parse(atob(tokens.idToken.split('.')[1]));
    const username = idTokenPayload['cognito:username'] || idTokenPayload.sub || idTokenPayload.email;
    
    if (username) {
      // Store user info in localStorage for CognitoUserPool
      localStorage.setItem(`CognitoIdentityServiceProvider.${clientId}.LastAuthUser`, username);
      localStorage.setItem(`CognitoIdentityServiceProvider.${clientId}.${username}.idToken`, tokens.idToken);
      localStorage.setItem(`CognitoIdentityServiceProvider.${clientId}.${username}.accessToken`, tokens.accessToken);
      localStorage.setItem(`CognitoIdentityServiceProvider.${clientId}.${username}.refreshToken`, tokens.refreshToken);
      localStorage.setItem(`CognitoIdentityServiceProvider.${clientId}.${username}.clockDrift`, '0');
    }
  } catch (e) {
    console.warn('Could not store user info for CognitoUserPool:', e);
  }

  return tokens;
};

