import vendexLogo from '../../assets/logo.png';
import './LandingPage.css';
import LandingNav from '../../components/marketing/LandingNav';
import LandingFooter from '../../components/marketing/LandingFooter';

function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="landing-root">
      <LandingNav onSignIn={onSignIn} />
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Vendor Risk Management, Simplified</h1>
            <p>
              VendexLabs is your comprehensive platform for managing vendor risk, compliance, and subscriptions.
              Streamline your vendor onboarding, monitor compliance, and gain actionable insights—all in one place.
            </p>
            <ul>
              <li>Centralized vendor risk dashboard</li>
              <li>Automated compliance tracking</li>
              <li>Subscription and assessment management</li>
              <li>Easy onboarding and collaboration</li>
            </ul>
            <button className="get-started-btn" onClick={onSignIn}>Get Started</button>
          </div>
          <div className="hero-image">
            <img src={vendexLogo} alt="VendexLabs" />
          </div>
        </section>
        <section className="features-section">
          <h2>Securing Your Digital Ecosystems</h2>
          <p>
            Stay ahead of potential threats with our real-time risk posture updates. Safeguard your digital assets and maintain a robust security posture.
          </p>
          <div className="features-list">
            <div className="feature-card">
              <h3>Incident Monitoring</h3>
              <p>
                Receive immediate notifications about security incidents of your SaaS providers and take proactive measures to fortify your digital environment against emerging threats.
              </p>
            </div>
            <div className="feature-card">
              <h3>Reputation Monitoring</h3>
              <p>
                Gather intelligence on your SaaS provider's reputations from across the web, helping you make informed decisions about your vendor relationships.
              </p>
            </div>
            <div className="feature-card">
              <h3>Compliance Posture</h3>
              <p>
                Track the compliance posture of partner services.
              </p>
            </div>
            <div className="feature-card">
              <h3>Expert Analysis</h3>
              <p>
                Benefit from advanced security and privacy due diligence designed to meet modern GRC requirements in these fields.
              </p>
            </div>
            <div className="feature-card">
              <h3>Widespread Vendor Support</h3>
              <p>
                Supported Vendor Analysis across a wide range of SaaS providers (150+), ensuring comprehensive risk management for your entire vendor ecosystem.
              </p>
            </div>

          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;