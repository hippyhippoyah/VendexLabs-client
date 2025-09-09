import React, { useEffect, useState } from 'react';
import { VendorAssessment, VendorAssessmentsResponse } from '../../utils/responseTypes';
import { getVendorAssessments, addVendorAssessment, updateVendorAssessment, deleteVendorAssessment } from '../../utils/apis';
import { useAccount } from '../../contexts/AccountContext';
import { useVendorList } from '../../contexts/VendorListContext';

// Example prop for vendorListId, adjust as needed
interface VendorAssessmentTrackingProps {
  vendorListId: string;
}

const initialForm: Omit<VendorAssessment, 'id'> = {
  sponsor_business_org: '',
  sponsor_contact: '',
  compliance_approval_status: '',
  compliance_comment: '',
  compliance_contact: '',
  compliance_assessment_date: '',
};

const VendorAssessmentTracking: React.FC = () => {
  const { selectedAccount } = useAccount();
  const { vendorListId } = useVendorList();
  const accountId = selectedAccount?.id;

  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<VendorAssessment, 'id'>>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    console.log(accountId, vendorListId)
    if (!accountId || !vendorListId) return;
    setLoading(true);
    getVendorAssessments(accountId, vendorListId)
      .then((res: VendorAssessmentsResponse) => {
        setAssessments(res.assessments);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load assessments');
        setLoading(false);
      });
  }, [accountId, vendorListId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !vendorListId) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateVendorAssessment(accountId, vendorListId, editingId, form);
      } else {
        await addVendorAssessment(accountId, vendorListId, form);
      }
      // Refresh list
      const res = await getVendorAssessments(accountId, vendorListId);
      setAssessments(res.assessments);
      setForm(initialForm);
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
    }
    setSubmitting(false);
  };

  const handleEdit = (assessment: VendorAssessment) => {
    setForm({
      sponsor_business_org: assessment.sponsor_business_org,
      sponsor_contact: assessment.sponsor_contact,
      compliance_approval_status: assessment.compliance_approval_status,
      compliance_comment: assessment.compliance_comment,
      compliance_contact: assessment.compliance_contact,
      compliance_assessment_date: assessment.compliance_assessment_date,
    });
    setEditingId(assessment.id);
  };

  const handleDelete = async (id: string) => {
    if (!accountId || !vendorListId) return;
    setSubmitting(true);
    try {
      await deleteVendorAssessment(accountId, vendorListId, id);
      const res = await getVendorAssessments(accountId, vendorListId);
      setAssessments(res.assessments);
    } catch (err: any) {
      setError(err.message || 'Failed to delete assessment');
    }
    setSubmitting(false);
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
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#333' }}>{editingId ? 'Edit Assessment' : 'Add Assessment'}</h3>
              <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                <input name="sponsor_business_org" value={form.sponsor_business_org} onChange={handleChange} placeholder="Sponsor Business Org" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} required />
                <input name="sponsor_contact" value={form.sponsor_contact} onChange={handleChange} placeholder="Sponsor Contact" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} required />
                <input name="compliance_approval_status" value={form.compliance_approval_status} onChange={handleChange} placeholder="Compliance Approval Status" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} required />
                <textarea name="compliance_comment" value={form.compliance_comment} onChange={handleChange} placeholder="Compliance Comment" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minHeight: '60px' }} />
                <input name="compliance_contact" value={form.compliance_contact} onChange={handleChange} placeholder="Compliance Contact" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} required />
                <input name="compliance_assessment_date" value={form.compliance_assessment_date} onChange={handleChange} placeholder="Assessment Date" type="date" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} required />
              </div>
              <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: '4px', background: '#007bff', color: 'white', fontWeight: 500, border: 'none', fontSize: '14px', cursor: 'pointer' }}>
                {submitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Assessment' : 'Add Assessment')}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setForm(initialForm); setEditingId(null); }} style={{ marginLeft: '16px', padding: '10px 20px', borderRadius: '4px', background: '#6c757d', color: 'white', fontWeight: 500, border: 'none', fontSize: '14px', cursor: 'pointer' }}>
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
                        <span style={{ fontWeight: 600, color: '#333', fontSize: '15px' }}>{assessment.sponsor_business_org}</span>
                        <span style={{ fontSize: '13px', color: '#666' }}>{assessment.compliance_approval_status}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Contact:</strong> {assessment.sponsor_contact}</div>
                      <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Compliance Contact:</strong> {assessment.compliance_contact}</div>
                      <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Date:</strong> {assessment.compliance_assessment_date}</div>
                      {assessment.compliance_comment && (
                        <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}><strong>Comment:</strong> {assessment.compliance_comment}</div>
                      )}
                      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(assessment)} style={{ padding: '6px 12px', borderRadius: '4px', background: '#ffc107', color: '#333', fontWeight: 500, border: 'none', fontSize: '13px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(assessment.id)} style={{ padding: '6px 12px', borderRadius: '4px', background: '#dc3545', color: 'white', fontWeight: 500, border: 'none', fontSize: '13px', cursor: 'pointer' }}>Delete</button>
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
