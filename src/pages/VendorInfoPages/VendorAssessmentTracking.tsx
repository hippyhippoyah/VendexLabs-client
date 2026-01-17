import React, { useEffect, useState } from 'react';
import { VendorAssessment, VendorAssessmentRequest } from '../../utils/responseTypes';
import { getVendorAssessments, upsertVendorAssessment, updateVendorAssessment } from '../../utils/apis';
import { useAccount } from '../../contexts/AccountContext';
import { useVendorList } from '../../contexts/VendorListContext';

const initialForm: VendorAssessmentRequest = {
  sponsor_business_department: null,
  sponsor_contact: null,
  compliance_approval_status: 'not-started',
  compliance_comment: null,
  compliance_contact: null,
  submission_date: null,
  approval_date: null,
  use_case: null,
};

const VendorAssessmentTracking: React.FC = () => {
  const { selectedAccount } = useAccount();
  const { vendorListId } = useVendorList();
  const accountId = selectedAccount?.id;

  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VendorAssessmentRequest>(initialForm);
  const [editingAssessment, setEditingAssessment] = useState<VendorAssessment | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    console.log(accountId, vendorListId)
    if (!accountId || !vendorListId) return;
    setLoading(true);
    getVendorAssessments(accountId, vendorListId)
      .then((res) => {
        // API returns array when no vendor-id is provided
        const assessmentsArray = Array.isArray(res) ? res : [];
        setAssessments(assessmentsArray);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load assessments');
        setLoading(false);
      });
  }, [accountId, vendorListId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !vendorListId) return;
    setSubmitting(true);
    try {
      // Use vendor_id or vendor_name from editingAssessment if editing
      const vendorId = editingAssessment?.vendor_id || undefined;
      const vendorName = editingAssessment?.vendor_name || undefined;
      
      const requestData: VendorAssessmentRequest = {
        ...form,
        ...(vendorId && { vendor_id: vendorId }),
        ...(vendorName && { vendor_name: vendorName }),
      };
      
      if (editingAssessment) {
        await updateVendorAssessment(accountId, vendorListId, requestData, vendorId);
      } else {
        await upsertVendorAssessment(accountId, vendorListId, requestData, vendorId);
      }
      // Refresh list
      const res = await getVendorAssessments(accountId, vendorListId);
      const assessmentsArray = Array.isArray(res) ? res : [];
      setAssessments(assessmentsArray);
      setForm(initialForm);
      setEditingAssessment(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
    }
    setSubmitting(false);
  };

  const handleEdit = (assessment: VendorAssessment) => {
    setForm({
      sponsor_business_department: assessment.sponsor_business_department,
      sponsor_contact: assessment.sponsor_contact,
      compliance_approval_status: assessment.compliance_approval_status,
      compliance_comment: assessment.compliance_comment,
      compliance_contact: assessment.compliance_contact,
      submission_date: assessment.submission_date,
      approval_date: assessment.approval_date,
      use_case: assessment.use_case,
    });
    setEditingAssessment(assessment);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ background: 'white', borderRadius: '8px', padding: '24px', border: '1px solid #e5e5e5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>Vendor Assessment Tracking</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p>Loading assessments...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: '#c00' }}>Error: {error}</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ marginBottom: '32px', background: '#f8f9fa', borderRadius: '8px', padding: '24px', border: '1px solid #e5e5e5' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>{editingAssessment ? 'Edit Assessment' : 'Add Assessment'}</h3>
              <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                <input name="sponsor_business_department" value={form.sponsor_business_department || ''} onChange={handleChange} placeholder="Sponsor Business Department" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} />
                <input name="sponsor_contact" value={form.sponsor_contact || ''} onChange={handleChange} placeholder="Sponsor Contact" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} />
                <select name="compliance_approval_status" value={form.compliance_approval_status || 'not-started'} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} required>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="approved">Approved</option>
                  <option value="conditional approval">Conditional Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
                <textarea name="compliance_comment" value={form.compliance_comment || ''} onChange={handleChange} placeholder="Compliance Comment" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minHeight: '60px' }} />
                <input name="compliance_contact" value={form.compliance_contact || ''} onChange={handleChange} placeholder="Compliance Contact" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} />
                <input name="submission_date" value={form.submission_date || ''} onChange={handleChange} placeholder="Submission Date" type="date" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} />
                <input name="approval_date" value={form.approval_date || ''} onChange={handleChange} placeholder="Approval Date" type="date" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} />
                <textarea name="use_case" value={form.use_case || ''} onChange={handleChange} placeholder="Use Case" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minHeight: '60px' }} />
              </div>
              <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: '4px', background: '#007bff', color: 'white', fontWeight: 500, border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                {submitting ? (editingAssessment ? 'Updating...' : 'Adding...') : (editingAssessment ? 'Update Assessment' : 'Add Assessment')}
              </button>
              {editingAssessment && (
                <button type="button" onClick={() => { setForm(initialForm); setEditingAssessment(null); }} style={{ marginLeft: '16px', padding: '10px 20px', borderRadius: '4px', background: '#6c757d', color: 'white', fontWeight: 500, border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </form>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>Assessments</h3>
              {assessments.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>No assessments found.</p>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {assessments.map((assessment) => (
                    <div key={assessment.id} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', border: '1px solid #e5e5e5', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#333', fontSize: '15px' }}>
                          {assessment.vendor_name || assessment.vendor_id || 'Unknown Vendor'}
                        </span>
                        <span style={{ fontSize: '13px', color: '#666' }}>{assessment.compliance_approval_status}</span>
                      </div>
                      {assessment.sponsor_business_department && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Department:</strong> {assessment.sponsor_business_department}</div>
                      )}
                      {assessment.sponsor_contact && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Contact:</strong> {assessment.sponsor_contact}</div>
                      )}
                      {assessment.compliance_contact && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Compliance Contact:</strong> {assessment.compliance_contact}</div>
                      )}
                      {assessment.submission_date && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Submission Date:</strong> {assessment.submission_date}</div>
                      )}
                      {assessment.approval_date && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Approval Date:</strong> {assessment.approval_date}</div>
                      )}
                      {assessment.use_case && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Use Case:</strong> {assessment.use_case}</div>
                      )}
                      {assessment.compliance_comment && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Comment:</strong> {assessment.compliance_comment}</div>
                      )}
                      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(assessment)} style={{ padding: '6px 12px', borderRadius: '4px', background: '#ffc107', color: '#333', fontWeight: 500, border: 'none', fontSize: '13px', cursor: 'pointer' }}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorAssessmentTracking;
