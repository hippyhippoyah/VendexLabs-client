import React from 'react';
import { useVendor } from '../../contexts/VendorContext.tsx';

const VendorPrivacyControls = () => {
  const { vendorData, loading, error } = useVendor();

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Loading privacy controls information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Error loading privacy controls data: {error.message}</p>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>No privacy controls data available for this vendor.</p>
      </div>
    );
  }

  const {
    data_collected = [],
    ml_training_data_description,
    published_subprocessors = [],
    shared_data_description,
    supports_data_subject_requests,
    gdpr_compliant,
    data_returned_after_termination,
    data_physical_location,
    privacy_policy_url
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
            Privacy Controls
          </h2>
        </div>

        {/* Data Collection */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Data Collection Practices
          </h3>
          {data_collected.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {data_collected.map((dataType, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#333' }}>{dataType}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontSize: '14px' }}>No data collection information available</p>
          )}
        </div>

        {/* Privacy Rights */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Privacy Rights & Controls
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: supports_data_subject_requests ? '#d4edda' : '#f8d7da', 
              borderRadius: '6px',
              border: `1px solid ${supports_data_subject_requests ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>{supports_data_subject_requests ? '✅' : '❌'}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: supports_data_subject_requests ? '#155724' : '#721c24' }}>
                  Data Subject Requests
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: supports_data_subject_requests ? '#155724' : '#721c24' }}>
                {supports_data_subject_requests 
                  ? 'Users can request access, modification, or deletion of their personal data' 
                  : 'Data subject request capabilities are not explicitly supported'
                }
              </p>
            </div>

            <div style={{ 
              padding: '16px', 
              backgroundColor: gdpr_compliant ? '#d4edda' : '#f8d7da', 
              borderRadius: '6px',
              border: `1px solid ${gdpr_compliant ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>{gdpr_compliant ? '✅' : '❌'}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: gdpr_compliant ? '#155724' : '#721c24' }}>
                  GDPR Compliance
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: gdpr_compliant ? '#155724' : '#721c24' }}>
                {gdpr_compliant 
                  ? 'Compliant with General Data Protection Regulation requirements' 
                  : 'GDPR compliance status is unclear or not confirmed'
                }
              </p>
            </div>

            <div style={{ 
              padding: '16px', 
              backgroundColor: data_returned_after_termination ? '#d4edda' : '#fff3cd', 
              borderRadius: '6px',
              border: `1px solid ${data_returned_after_termination ? '#c3e6cb' : '#ffeaa7'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>{data_returned_after_termination ? '✅' : '⚠️'}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: data_returned_after_termination ? '#155724' : '#856404' }}>
                  Data Return After Termination
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: data_returned_after_termination ? '#155724' : '#856404' }}>
                {data_returned_after_termination 
                  ? 'Data is returned to users upon service termination' 
                  : 'Data return after termination is not guaranteed'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Data Sharing */}
        {shared_data_description && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              Data Sharing & Third Parties
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                {shared_data_description}
              </p>
            </div>
          </div>
        )}

        {/* Subprocessors */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Published Subprocessors
          </h3>
          {published_subprocessors.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {published_subprocessors.map((subprocessor, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                    {subprocessor.name || subprocessor}
                  </div>
                  {subprocessor.purpose && (
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                      Purpose: {subprocessor.purpose}
                    </div>
                  )}
                  {subprocessor.location && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Location: {subprocessor.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px', backgroundColor: '#e2e3e5', borderRadius: '6px', border: '1px solid #d6d8db' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                No published subprocessors listed
              </p>
            </div>
          )}
        </div>

        {/* ML/AI Training Data */}
        {ml_training_data_description && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              AI/ML Training Data Usage
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#856404', lineHeight: '1.5' }}>
                {ml_training_data_description}
              </p>
            </div>
          </div>
        )}

        {/* Data Storage Location */}
        {data_physical_location && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              Data Storage Location
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🌍</span>
                <span style={{ fontSize: '14px', color: '#333' }}>
                  {data_physical_location}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Link */}
        {privacy_policy_url && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              Privacy Documentation
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#e7f3ff', borderRadius: '6px', border: '1px solid #b8daff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#004085' }}>
                  View complete privacy policy for detailed information
                </span>
                <a 
                  href={privacy_policy_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '4px'
                  }}
                >
                  View Privacy Policy
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPrivacyControls;
