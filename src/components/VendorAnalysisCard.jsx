import React from "react";
import "./VendorAnalysisCard.css";

const icon = {
  compliance: "✅",
  controls: "🛡️",
  document: "📄",
  domain: "🌐",
  email: "✉️",
  location: "📍",
  risk: "⚠️",
  privacy: "🔒",
  tos: "📜",
  alias: "🔗",
  calendar: "📅",
  certification: "🏅",
  rating: "⭐",
};

const VendorAnalysisCard = ({ data }) => {
  if (!data) return null;

  const {
    vendor,
    logo,
    alias,
    bus_type,
    data_collected,
    legal_compliance,
    published_subprocessors,
    privacy_policy_url,
    tos_url,
    date,
    security_rating,
    risk_score,
    risk_categories,
    compliance_certifications,
    headquarters_location,
    contact_email,
    breach_history,
    last_reviewed,
    website_url,
  } = data;

  return (
    <div className="vendor-analysis-card">
      <div className="vendor-header">
        {logo && <img src={logo} alt={vendor} className="vendor-logo" />}
        <div>
          <h2 className="vendor-title">{vendor}</h2>
          {alias && alias.length > 0 && (
            <div className="vendor-alias">
              {icon.alias} <b>Also known as:</b> {alias.join(", ")}
            </div>
          )}
        </div>
      </div>

      <div className="vendor-section vendor-section-flex">
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.compliance} Compliance</div>
          <div className="vendor-compliance-score">
            <span className="vendor-score">{security_rating * 10}%</span>
            <span className="vendor-score-label">Security Rating</span>
          </div>
          <div className="vendor-risk-score">
            {icon.risk} Risk Score: <b>{risk_score}/10</b>
          </div>
          <div className="vendor-badges">
            {risk_categories && risk_categories.map((cat) => (
              <span className="vendor-badge" key={cat}>{cat}</span>
            ))}
          </div>
        </div>

        <div className="vendor-card">
          <div className="vendor-card-title">{icon.controls} Certifications</div>
          <ul className="vendor-list">
            {compliance_certifications && compliance_certifications.map((cert) => (
              <li key={cert}>{icon.certification} {cert}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="vendor-section vendor-section-flex">
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.document} Business Type</div>
          <div>{bus_type && bus_type.join(", ")}</div>
        </div>
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.privacy} Data Collected</div>
          <ul className="vendor-list">
            {Array.isArray(data_collected)
              ? data_collected.map((d) => <li key={d}>{d}</li>)
              : <li>{data_collected}</li>}
          </ul>
        </div>
      </div>

      <div className="vendor-section">
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.controls} Legal Compliance</div>
          <div className="vendor-legal">{legal_compliance}</div>
        </div>
      </div>

      <div className="vendor-section vendor-section-flex">
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.privacy} Privacy Policy</div>
          <a href={privacy_policy_url} target="_blank" rel="noopener noreferrer">{privacy_policy_url}</a>
        </div>
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.tos} Terms of Service</div>
          <a href={tos_url} target="_blank" rel="noopener noreferrer">{tos_url}</a>
        </div>
      </div>

      <div className="vendor-section vendor-section-flex">
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.domain} Website</div>
          <a href={website_url} target="_blank" rel="noopener noreferrer">{website_url}</a>
        </div>
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.email} Contact</div>
          <a href={`mailto:${contact_email}`}>{contact_email}</a>
        </div>
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.location} Headquarters</div>
          <div>{headquarters_location}</div>
        </div>
      </div>

      <div className="vendor-section vendor-section-flex">
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.calendar} Last Reviewed</div>
          <div>{last_reviewed}</div>
        </div>
        <div className="vendor-card">
          <div className="vendor-card-title">{icon.calendar} Last Updated</div>
          <div>{date}</div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalysisCard;