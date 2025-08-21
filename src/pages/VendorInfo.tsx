import React from 'react';
import { useVendor } from '../contexts/VendorContext.tsx';
import './VendorInfo.css';

const VendorInfo = () => {
  const { vendorData, loading, error } = useVendor();

  const VendorAnalysisCard = ({ data }) => {
    if (!data) return null;

    const {
      vendor,
      logo,
      alias,
      bus_type,
      security_rating,
      headquarters_location,
      website_url,
      company_description,
      business_type,
      founded_year,
      employee_count,
      industry,
      primary_product,
      customer_count_estimate,
      company_type,
      total_funding,
      funding_round,
      has_enterprise_customers,
      popularity_index,
      revenue_estimate
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

        {/* Company Description */}
        {company_description && (
          <div className="company-description-section">
            <h3 className="vendor-subsection-title">About {vendor}</h3>
            <p className="company-description">{company_description}</p>
          </div>
        )}

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
                <span className="vendor-info-value">{industry || (bus_type && bus_type.join(", ")) || 'Not specified'}</span>
              </div>
              {primary_product && (
                <div className="vendor-info-row">
                  <span className="vendor-info-label">Primary Product</span>
                  <span className="vendor-info-value">{primary_product}</span>
                </div>
              )}
              <div className="vendor-info-row">
                <span className="vendor-info-label">Overall security rating</span>
                <div className="vendor-rating-container">
                  <span className="vendor-rating-circle">{Math.round(security_rating * 10)}</span>
                  <span className="vendor-rating-score">{Math.round(security_rating * 100)}</span>
                </div>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Employees</span>
                <span className="vendor-info-value">
                  {employee_count ? employee_count.toLocaleString() : '-'}
                </span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Founded</span>
                <span className="vendor-info-value">
                  {founded_year || '-'}
                  {founded_year && ` (${new Date().getFullYear() - founded_year} years ago)`}
                </span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Company Type</span>
                <span className="vendor-info-value">{company_type || 'Not specified'}</span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Business Model</span>
                <span className="vendor-info-value">{business_type || 'Not specified'}</span>
              </div>
              <div className="vendor-info-row">
                <span className="vendor-info-label">Headquarters</span>
                <span className="vendor-info-value vendor-location">🌍 {headquarters_location}</span>
              </div>
              {revenue_estimate && parseFloat(revenue_estimate) > 0 && (
                <div className="vendor-info-row">
                  <span className="vendor-info-label">Est. Revenue</span>
                  <span className="vendor-info-value">
                    ${(parseFloat(revenue_estimate) / 1000000000).toFixed(1)}B
                  </span>
                </div>
              )}
              {customer_count_estimate && customer_count_estimate > 0 && (
                <div className="vendor-info-row">
                  <span className="vendor-info-label">Est. Customers</span>
                  <span className="vendor-info-value">
                    {customer_count_estimate >= 1000000 
                      ? `${(customer_count_estimate / 1000000).toFixed(1)}M`
                      : customer_count_estimate >= 1000 
                        ? `${(customer_count_estimate / 1000).toFixed(1)}K`
                        : customer_count_estimate.toLocaleString()
                    }
                  </span>
                </div>
              )}
              {popularity_index && (
                <div className="vendor-info-row">
                  <span className="vendor-info-label">Popularity Score</span>
                  <span className="vendor-info-value">{popularity_index}/100</span>
                </div>
              )}
              {has_enterprise_customers !== undefined && (
                <div className="vendor-info-row">
                  <span className="vendor-info-label">Enterprise Customers</span>
                  <span className="vendor-info-value">
                    {has_enterprise_customers ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              )}
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

        {/* Funding Information */}
        {(total_funding && parseFloat(total_funding) > 0) || funding_round ? (
          <div className="funding-section">
            <h3 className="vendor-subsection-title">Funding Information</h3>
            <div className="funding-info-grid">
              {total_funding && parseFloat(total_funding) > 0 && (
                <div className="funding-info-item">
                  <span className="funding-label">Total Funding</span>
                  <span className="funding-value">
                    ${(parseFloat(total_funding) / 1000000).toFixed(1)}M
                  </span>
                </div>
              )}
              {funding_round && (
                <div className="funding-info-item">
                  <span className="funding-label">Latest Round</span>
                  <span className="funding-value">{funding_round}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

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
      ) : error ? (
        <p>Error loading vendor info: {error.message}</p>
      ) : (
        <VendorAnalysisCard data={vendorData} />
      )}
    </div>
  );
};

export default VendorInfo;
