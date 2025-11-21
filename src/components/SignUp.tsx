import { useState } from 'react';
import { signUp, confirmSignUp, resendConfirmationCode } from '../utils/cognitoAuth';
import vendexLogo from '../assets/logo.png';
import './SignIn.css';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onBackToSignIn: () => void;
}

function SignUp({ onSignUpSuccess, onBackToSignIn }: SignUpProps) {
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(username, password, email);
      setStep('confirm');
      setSuccessMessage('Account created! Please check your email for the confirmation code.');
    } catch (err: any) {
      let errorMessage = 'Sign up failed. Please try again.';
      
      if (err.code === 'UsernameExistsException') {
        errorMessage = 'This username already exists. Please choose another or sign in.';
      } else if (err.code === 'InvalidPasswordException') {
        errorMessage = 'Password does not meet requirements.';
      } else if (err.code === 'InvalidParameterException') {
        errorMessage = err.message || 'Invalid input. Please check your information.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await confirmSignUp(username, confirmationCode);
      setSuccessMessage('Account confirmed successfully! You can now sign in.');
      setTimeout(() => {
        onSignUpSuccess();
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Confirmation failed. Please try again.';
      
      if (err.code === 'CodeMismatchException') {
        errorMessage = 'Invalid confirmation code. Please check and try again.';
      } else if (err.code === 'ExpiredCodeException') {
        errorMessage = 'Confirmation code has expired. Please request a new one.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await resendConfirmationCode(username);
      setSuccessMessage('Confirmation code resent! Please check your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <img src={vendexLogo} alt="VendexLabs" className="signin-logo" />
            <h1>Confirm Your Account</h1>
            <p>Enter the confirmation code sent to your email</p>
          </div>

          <form onSubmit={handleConfirm} className="signin-form">
            {error && (
              <div className="signin-error" role="alert">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="signin-success" role="alert">
                {successMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="confirmationCode">Confirmation Code</label>
              <input
                id="confirmationCode"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
                placeholder="Enter confirmation code"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="signin-button"
              disabled={isLoading}
            >
              {isLoading ? 'Confirming...' : 'Confirm Account'}
            </button>

            <div className="signin-footer">
              <p>
                Didn't receive a code?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); handleResendCode(); }}>
                  Resend code
                </a>
              </p>
              <p>
                <a href="#" onClick={(e) => { e.preventDefault(); setStep('signup'); }}>
                  Back to sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <img src={vendexLogo} alt="VendexLabs" className="signin-logo" />
          <h1>Create Account</h1>
          <p>Sign up for your VendexLabs account</p>
        </div>

        <form onSubmit={handleSignUp} className="signin-form">
          {error && (
            <div className="signin-error" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="signin-success" role="alert">
              {successMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Create a password (min. 8 characters)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="signin-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="signin-footer">
          <p>
            Already have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onBackToSignIn(); }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

