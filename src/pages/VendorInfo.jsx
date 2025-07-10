import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VendorAnalysisCard from '../components/VendorAnalysisCard';
import { getOneVendor, getVendorSecurityInstances } from '../utils/apis';
import Navbar from '../components/Navbar.jsx';

const VendorInfo = () => {
  const { vendor_name } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [securityInstances, setSecurityInstances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndexes, setExpandedIndexes] = useState([]);

  useEffect(() => {
    setLoading(true);
    getOneVendor(vendor_name)
      .then(data => setVendorData(data))
      .finally(() => setLoading(false));
    getVendorSecurityInstances(vendor_name)
      .then(data => setSecurityInstances(data));
  }, [vendor_name]);

  const handleToggle = idx => {
    setExpandedIndexes(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  return (
    <div>
      <Navbar />
      {loading ? (
        <p>Loading vendor info...</p>
      ) : (
        <VendorAnalysisCard data={vendorData} />
      )}
      {Array.isArray(securityInstances) && securityInstances.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>Recent Security Instances in News</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {securityInstances.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '1em',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onClick={() => handleToggle(idx)}
                >
                  <span style={{ fontSize: '1em' }}>
                    {expandedIndexes.includes(idx) ? '▼' : '▶'}
                  </span>
                  {item.title}
                </button>
                {expandedIndexes.includes(idx) && (
                  <div style={{ marginTop: 4, padding: 12, border: '1px solid #ddd', borderRadius: 4 }}>
                    <div><strong>Title:</strong> {item.title}</div>
                    <div><strong>Vendor:</strong> {item.vendor}</div>
                    <div><strong>Product:</strong> {item.product}</div>
                    <div><strong>Published:</strong> {item.published}</div>
                    <div><strong>Exploits:</strong> {item.exploits}</div>
                    <div><strong>Summary:</strong> {item.summary}</div>
                    {item.url && (
                      <div>
                        <strong>URL:</strong> <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                      </div>
                    )}
                    {item.img && (
                      <div style={{ marginTop: 8 }}>
                        <img src={item.img} alt={item.title} style={{ maxWidth: '100%', height: 'auto' }} />
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VendorInfo;
