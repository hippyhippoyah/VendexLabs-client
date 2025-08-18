import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOneVendor } from '../../utils/apis';

const VendorBusinessMaturity = () => {
  const { vendor_name } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOneVendor(vendor_name)
      .then(data => {
        setVendorData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching vendor data:', error);
        setLoading(false);
      });
  }, [vendor_name]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Loading business maturity information...</p>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>No business maturity data available for this vendor.</p>
      </div>
    );
  }

  const {
    founded_year,
    employee_count,
    company_type,
    total_funding,
    funding_round,
    revenue_estimate,
    has_enterprise_customers,
    popularity_index,
    customer_count_estimate,
    industry,
    business_type,
    primary_product,
    company_description
  } = vendorData;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === "0.00") return "Not disclosed";
    const num = parseFloat(amount);
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (!num || num === 0) return "Not disclosed";
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Calculate company age
  const companyAge = founded_year ? new Date().getFullYear() - founded_year : null;

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
            Business Maturity
          </h2>
        </div>

        {/* Company Overview */}
        {company_description && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              Company Overview
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                {company_description}
              </p>
            </div>
          </div>
        )}

        {/* Key Business Metrics */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Key Business Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {/* Company Age */}
            <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Company Age
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
                {companyAge ? `${companyAge} years` : 'N/A'}
              </div>
              {founded_year && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Founded in {founded_year}
                </div>
              )}
            </div>

            {/* Employee Count */}
            <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Employees
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
                {formatNumber(employee_count)}
              </div>
            </div>

            {/* Revenue */}
            <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Revenue (Estimated)
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
                {formatCurrency(revenue_estimate)}
              </div>
            </div>

            {/* Popularity Index */}
            <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Popularity Index
              </div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
                {popularity_index || 'N/A'}
              </div>
              {popularity_index && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Out of 100
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Classification */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Company Classification
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Company Type</span>
              <span style={{ 
                padding: '4px 12px', 
                backgroundColor: company_type === 'Public' ? '#d4edda' : '#fff3cd',
                color: company_type === 'Public' ? '#155724' : '#856404',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {company_type || 'Unknown'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Business Model</span>
              <span style={{ fontSize: '14px', color: '#333' }}>
                {business_type || 'Not specified'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Industry</span>
              <span style={{ fontSize: '14px', color: '#333' }}>
                {industry || 'Not specified'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>Enterprise Customers</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px', 
                fontWeight: '500',
                backgroundColor: has_enterprise_customers ? '#d4edda' : '#f8d7da',
                color: has_enterprise_customers ? '#155724' : '#721c24'
              }}>
                {has_enterprise_customers ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Product */}
        {primary_product && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
              Primary Product/Service
            </h3>
            <div style={{ padding: '16px', backgroundColor: '#e7f3ff', borderRadius: '6px', border: '1px solid #b8daff' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#004085', lineHeight: '1.5' }}>
                {primary_product}
              </p>
            </div>
          </div>
        )}

        {/* Funding Information */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Funding Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Total Funding
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                {formatCurrency(total_funding)}
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Latest Funding Round
              </div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                {funding_round || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Base */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>
            Customer Base
          </h3>
          <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
            <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Estimated Customer Count
            </div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
              {formatNumber(customer_count_estimate)}
            </div>
            {has_enterprise_customers && (
              <div style={{ fontSize: '12px', color: '#28a745', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>✓</span>
                <span>Serves enterprise customers</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBusinessMaturity;
