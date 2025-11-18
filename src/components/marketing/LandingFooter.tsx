import '../../pages/marketing/LandingPage.css';

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-contact">
          <span>Contact:</span>
          <a href="mailto:info@vendexlabs.com">info@vendexlabs.com</a>
        </div>
        <div className="footer-links">
          <a href="#">About</a>
          <span className="footer-divider">|</span>
          <a href="#">Terms of Service</a>
        </div>
        <div className="footer-copyright">
          &copy; 2025 VendexLabs
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
