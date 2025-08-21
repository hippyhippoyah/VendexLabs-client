import React from 'react';
import { useVendor } from '../../contexts/VendorContext.tsx';

const VendorGeneralCompliance = () => {
  const { vendorData, loading, error } = useVendor();

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Loading compliance information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Error loading compliance data: {error.message}</p>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>No compliance data available for this vendor.</p>
      </div>
    );
  }

  const {
    compliance_certifications = [],
    gdpr_compliant,
    supports_data_subject_requests,
    data_returned_after_termination,
    breach_history = [],
    privacy_policy_url,
    tos_url,
    shared_data_description,
    data_physical_location
  } = vendorData;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '24px', 
        border: '1px solid #e5e5e5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>
            General Compliance
          </h2>
        </div>

        {/* Compliance Certifications */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Compliance Certifications
          </h3>
          {compliance_certifications.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {compliance_certifications.map((cert, index) => (
                <span 
                  key={index}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#e8f5e8',
                    color: '#2d5016',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {cert}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontSize: '14px' }}>No certifications listed</p>
          )}
        </div>

        {/* GDPR Compliance */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Data Protection Compliance
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>GDPR Compliant</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: '500',
                backgroundColor: gdpr_compliant ? '#d4edda' : '#f8d7da',
                color: gdpr_compliant ? '#155724' : '#721c24'
              }}>
                {gdpr_compliant ? 'Yes' : 'No'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>Supports Data Subject Requests</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: '500',
                backgroundColor: supports_data_subject_requests ? '#d4edda' : '#f8d7da',
                color: supports_data_subject_requests ? '#155724' : '#721c24'
              }}>
                {supports_data_subject_requests ? 'Yes' : 'No'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>Data Returned After Termination</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: '500',
                backgroundColor: data_returned_after_termination ? '#d4edda' : '#f8d7da',
                color: data_returned_after_termination ? '#155724' : '#721c24'
              }}>
                {data_returned_after_termination ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Data Location */}
        {data_physical_location && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              Data Storage Location
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                {data_physical_location}
              </p>
            </div>
          </div>
        )}

        {/* Data Sharing */}
        {shared_data_description && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              Data Sharing Practices
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                {shared_data_description}
              </p>
            </div>
          </div>
        )}

        {/* Legal Documents */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Legal Documents
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {privacy_policy_url && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>Privacy Policy</span>
                <a 
                  href={privacy_policy_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#007bff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View Document →
                </a>
              </div>
            )}
            {tos_url && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>Terms of Service</span>
                <a 
                  href={tos_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#007bff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View Document →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Breach History */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Security Breach History
          </h3>
          {breach_history.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {breach_history.map((breach, index) => (
                <div key={index} style={{ padding: '16px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                    {breach.description || breach}
                  </p>
                  {breach.date && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6c6c6c' }}>
                      Date: {breach.date}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                No known security breaches reported
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorGeneralCompliance;
