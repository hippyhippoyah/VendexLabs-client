import { useEffect } from 'react';

/**
 * OAuth callback component that handles the redirect from Cognito
 * and posts the authorization code back to the parent window via postMessage
 */
function OAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (!window.opener) {
      console.error('OAuth callback not in popup window');
      window.location.href = '/';
      return;
    }

    const origin = window.location.origin;
    
    if (error) {
      window.opener.postMessage({
        type: 'OAUTH_ERROR',
        error,
        errorDescription: errorDescription || `OAuth error: ${error}`,
      }, origin);
    } else if (code && state) {
      window.opener.postMessage({
        type: 'OAUTH_SUCCESS',
        code,
        state,
      }, origin);
    } else {
      window.opener.postMessage({
        type: 'OAUTH_ERROR',
        error: 'missing_parameters',
        errorDescription: 'Missing code or state parameter',
      }, origin);
    }
    
    window.close();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div>Completing sign in...</div>
    </div>
  );
}

export default OAuthCallback;
