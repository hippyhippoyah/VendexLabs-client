import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOneVendor } from '../utils/apis';
import './VendorInfo.css';

const VendorInfo = () => {
  const { vendor_name } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOneVendor(vendor_name)
      .then(data => setVendorData(data))
      .finally(() => setLoading(false));
  }, [vendor_name]);

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
        {/* Company Profile Header */}
        <div className="company-profile-header">
          <h2 className="vendor-section-title">Company Profile</h2>
          <button className="vendor-edit-button">
            ✏️ Edit
          </button>
        </div>

        {/* Main Company Info */}
        <div className="company-info-grid">
          <div className="company-main-info">
            <div className="company-logo-section">
              {logo && <img src={logo} alt={vendor} className="company-logo" />}
            </div>
            <div className="company-details">
              <div className="vendor-info-row">
                <span className="vendor-info-label">Name</span>
                <span className="vendor-info-value">{vendor}</span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Primary domain</span>
                <span className="vendor-info-value">{website_url}</span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Industry</span>
                <span className="vendor-info-value">{bus_type && bus_type.join(", ")}</span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Overall security rating</span>
                <div className="vendor-rating-container">
                  <span className="vendor-rating-circle">{Math.round(security_rating * 10)}</span>
                  <span className="vendor-rating-score">{Math.round(security_rating * 100)}</span>
                </div>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Employees</span>
                <span className="vendor-info-value">-</span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Headquarters</span>
                <span className="vendor-info-value vendor-location">🌍 {headquarters_location}</span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Notes</span>
                <span className="vendor-info-value">-</span>
              </div>
            </div>
          </div>

          <div className="questionnaire-section">
            <div className="questionnaire-header">
              <span>Relationship Questionnaire</span>
              <span className="unconfigured-label">Unconfigured</span>
            </div>
          </div>
        </div>

        {/* Subsidiaries Section */}
        <div className="subsidiaries-section">
          <h3 className="vendor-subsection-title">Subsidiaries</h3>
          <div className="vendor-subsidiaries-table">
            <div className="vendor-table-header">
              <span>Vendor</span>
              <span>Website</span>
              <span>Score</span>
              <span>Labels</span>
            </div>
            <div className="vendor-table-row vendor-main-vendor">
              <div className="vendor-info-cell">
                <div className="vendor-radio">●</div>
                <span className="vendor-name">{vendor}</span>
                <span className="this-vendor-label">This vendor</span>
              </div>
              <span className="vendor-website">{website_url}</span>
              <div className="vendor-score">
                <span className="vendor-score-circle">{Math.round(security_rating * 10)}</span>
                <span className="vendor-score-value">{Math.round(security_rating * 100)}</span>
              </div>
              <div className="vendor-labels">
                <span className="vendor-label vendor-business-data">Business Data</span>
                <span className="vendor-label vendor-ti-tier">TI-Tier</span>
              </div>
            </div>
            {alias && alias.length > 0 && alias.map((aliasName, index) => (
              <div key={index} className="vendor-table-row subsidiary">
                <div className="vendor-info-cell">
                  <div className="vendor-radio">○</div>
                  <span className="vendor-name">{aliasName}</span>
                </div>
                <span className="vendor-website">-</span>
                <div className="vendor-score">
                  <span className="vendor-score-circle">-</span>
                  <span className="vendor-score-value">-</span>
                </div>
                <div className="vendor-labels">
                  <button className="vendor-monitor-btn">+ Monitor Vendor</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vendor-info-container">
      {loading ? (
        <p>Loading vendor info...</p>
      ) : (
        <VendorAnalysisCard data={vendorData} />
      )}
    </div>
  );
};

export default VendorInfo;
