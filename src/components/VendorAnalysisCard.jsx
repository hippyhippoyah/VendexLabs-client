import React from "react";
import "./VendorAnalysisCard.css";

/**
 * Props:
 * {
 *   vendorData: {
 *     vendor: string,
 *     s_and_c_cert: string[],
 *     bus_type: string[],
 *     data_collected: string,
 *     legal_compliance: string,
 *     published_subprocessors: string[],
 *     privacy_policy_url: string,
 *     tos_url: string,
 *     date: string,
 *     alias: string[]
 *   }
 * }
 */
const VendorAnalysisCard = ({ vendorData }) => {
  if (!vendorData) return null;
  const {
    vendor,
    s_and_c_cert,
    bus_type,
    data_collected,
    legal_compliance,
    published_subprocessors,
    privacy_policy_url,
    tos_url,
    date,
    alias
  } = vendorData;

  return (
    <div className="vendor-analysis-card">
      <h2 className="vendor-analysis-card-title">{vendor}</h2>
      {alias && alias.length > 0 && (
        <div className="vendor-analysis-card-alias">
          <b>Also known as:</b> {alias.join(", ")}
        </div>
      )}
      <div className="vendor-analysis-card-row">
        <b>Business Type:</b> {bus_type.join(", ")}
      </div>
      <div className="vendor-analysis-card-row">
        <b>Security & Compliance:</b> {s_and_c_cert.join(", ")}
      </div>
      <div className="vendor-analysis-card-row">
        <b>Data Collected:</b> {data_collected}
      </div>
      <div className="vendor-analysis-card-row">
        <b>Legal Compliance:</b> {legal_compliance}
      </div>
      <div className="vendor-analysis-card-row">
        <b>Published Subprocessors:</b> {published_subprocessors.join(", ")}
      </div>
      <div className="vendor-analysis-card-row">
        <b>Privacy Policy:</b> <a href={privacy_policy_url} target="_blank" rel="noopener noreferrer">{privacy_policy_url}</a>
      </div>
      <div className="vendor-analysis-card-row">
        <b>Terms of Service:</b> <a href={tos_url} target="_blank" rel="noopener noreferrer">{tos_url}</a>
      </div>
      <div className="vendor-analysis-card-date">
        <b>Last Updated:</b> {date}
      </div>
    </div>
  );
};

export default VendorAnalysisCard;