import vendexLogo from '../../assets/logo.png';
import '../../pages/marketing/LandingPage.css';

function LandingNav({ onSignIn }: { onSignIn: () => void }) {
  return (
    <nav className="landing-topnav">
      <div className="nav-left">
        <img src={vendexLogo} className="nav-logo" alt="VendexLabs Logo" />
        <span className="nav-title">VendexLabs</span>
      </div>
      <div className="nav-right">
        <button className="sign-in-btn" onClick={onSignIn}>Sign in</button>
      </div>
    </nav>
  );
}

export default LandingNav;
