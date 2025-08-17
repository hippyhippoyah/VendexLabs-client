import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVendorSecurityInstances } from '../../utils/apis';

const VendorSecurityInstances = () => {
  const { vendor_name } = useParams();
  const [securityInstances, setSecurityInstances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndexes, setExpandedIndexes] = useState([]);

  useEffect(() => {
    setLoading(true);
    getVendorSecurityInstances(vendor_name)
      .then(data => {
        setSecurityInstances(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching security instances:', error);
        setLoading(false);
      });
  }, [vendor_name]);

  const handleToggle = idx => {
    setExpandedIndexes(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

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
            Recent Security Instances in News
          </h2>
        </div>

        {loading ? (
          <p>Loading security instances...</p>
        ) : Array.isArray(securityInstances) && securityInstances.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {securityInstances.map((item, idx) => (
              <li key={idx} style={{ 
                marginBottom: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <button
                  style={{
                    width: '100%',
                    background: '#f8f9fa',
                    border: 'none',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500',
                    color: '#333',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onClick={() => handleToggle(idx)}
                >
                  <span style={{ fontSize: '12px' }}>
                    {expandedIndexes.includes(idx) ? '▼' : '▶'}
                  </span>
                  <span>{item.title}</span>
                </button>
                {expandedIndexes.includes(idx) && (
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: 'white',
                    borderTop: '1px solid #e5e5e5'
                  }}>
                    <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
                      <div>
                        <strong style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title:</strong>
                        <div style={{ marginTop: '4px', color: '#333' }}>{item.title}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vendor:</strong>
                        <div style={{ marginTop: '4px', color: '#333' }}>{item.vendor}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product:</strong>
                        <div style={{ marginTop: '4px', color: '#333' }}>{item.product}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Published:</strong>
                        <div style={{ marginTop: '4px', color: '#333' }}>{item.published}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exploits:</strong>
                        <div style={{ marginTop: '4px', color: '#333' }}>{item.exploits}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary:</strong>
                        <div style={{ marginTop: '4px', color: '#333', lineHeight: '1.5' }}>{item.summary}</div>
                      </div>
                      {item.url && (
                        <div>
                          <strong style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>URL:</strong>
                          <div style={{ marginTop: '4px' }}>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#007bff', textDecoration: 'none' }}
                              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                              {item.url}
                            </a>
                          </div>
                        </div>
                      )}
                      {item.img && (
                        <div style={{ marginTop: '8px' }}>
                          <img 
                            src={item.img} 
                            alt={item.title} 
                            style={{ 
                              maxWidth: '100%', 
                              height: 'auto',
                              borderRadius: '4px',
                              border: '1px solid #e5e5e5'
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            fontSize: '14px'
          }}>
            No security instances found for this vendor.
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSecurityInstances;
