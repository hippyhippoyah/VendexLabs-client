import React, { useEffect, useState } from 'react';
import { VendorAssessment, VendorAssessmentsResponse, VendorList } from '../utils/responseTypes';
import { getVendorAssessments, getAllVendorLists, addVendorAssessment, updateVendorAssessment, deleteVendorAssessment } from '../utils/apis';
import { useAccount } from '../contexts/AccountContext';
import './VendorAssessments.css';

const initialForm: Omit<VendorAssessment, 'id'> = {
  sponsor_business_org: '',
  sponsor_contact: '',
  compliance_approval_status: '',
  compliance_comment: '',
  compliance_contact: '',
  compliance_assessment_date: '',
};

const VendorAssessments: React.FC = () => {
  const { selectedAccount } = useAccount();
  const accountId = selectedAccount?.id;

  const [vendorLists, setVendorLists] = useState<VendorList[]>([]);
  const [selectedVendorListId, setSelectedVendorListId] = useState<string>('');
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<VendorAssessment, 'id'>>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Load vendor lists
  useEffect(() => {
    if (!accountId || accountId === 'individual') {
      setError('Vendor assessments are only available for organization accounts.');
      setLoading(false);
      return;
    }
    const fetchVendorLists = async () => {
      try {
        setLoading(true);
        const response = await getAllVendorLists(accountId);
        if (response.vendor_lists && response.vendor_lists.length > 0) {
          setVendorLists(response.vendor_lists);
          setSelectedVendorListId(response.vendor_lists[0].id);
        } else {
          setError('No vendor lists found. Please create a vendor list first.');
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching vendor lists:', err);
        setError('Failed to load vendor lists');
        setLoading(false);
      }
    };
    fetchVendorLists();
  }, [accountId]);

  // Load assessments when vendor list is selected
  useEffect(() => {
    if (!accountId || !selectedVendorListId) return;
    setLoading(true);
    getVendorAssessments(accountId, selectedVendorListId)
      .then((res: VendorAssessmentsResponse) => {
        setAssessments(res.assessments);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load assessments');
        setLoading(false);
      });
  }, [accountId, selectedVendorListId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !selectedVendorListId) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await updateVendorAssessment(accountId, selectedVendorListId, editingId, form);
      } else {
        await addVendorAssessment(accountId, selectedVendorListId, form);
      }
      // Refresh list
      const res = await getVendorAssessments(accountId, selectedVendorListId);
      setAssessments(res.assessments);
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
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
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!accountId || !selectedVendorListId) return;
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    setSubmitting(true);
    try {
      await deleteVendorAssessment(accountId, selectedVendorListId, id);
      const res = await getVendorAssessments(accountId, selectedVendorListId);
      setAssessments(res.assessments);
    } catch (err: any) {
      setError(err.message || 'Failed to delete assessment');
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="vendor-assessments-container">
      <div className="vendor-assessments-header">
        <h1>Vendor Assessments</h1>
        {selectedAccount && (
          <p className="account-info">Account: {selectedAccount.name}</p>
        )}
      </div>

      {!accountId || accountId === 'individual' ? (
        <div className="error-state">
          <p>Vendor assessments are only available for organization accounts. Please select an organization account.</p>
        </div>
      ) : loading && vendorLists.length === 0 ? (
        <div className="loading-state">
          <p>Loading vendor lists...</p>
        </div>
      ) : vendorLists.length === 0 ? (
        <div className="error-state">
          <p>No vendor lists found. Please create a vendor list first.</p>
        </div>
      ) : (
        <>
          <div className="vendor-list-selector">
            <label htmlFor="vendor-list-select">Select Vendor List:</label>
            <select
              id="vendor-list-select"
              value={selectedVendorListId}
              onChange={(e) => setSelectedVendorListId(e.target.value)}
              className="vendor-list-select"
            >
              {vendorLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div className="assessments-actions">
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  handleCancel();
                }
              }}
              className="btn btn-primary"
            >
              {showForm ? 'Cancel' : '+ Add Assessment'}
            </button>
          </div>

          {showForm && (
            <div className="assessment-form-card">
              <h2>{editingId ? 'Edit Assessment' : 'Add New Assessment'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="sponsor_business_org">Sponsor Business Org *</label>
                    <input
                      id="sponsor_business_org"
                      name="sponsor_business_org"
                      value={form.sponsor_business_org}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sponsor_contact">Sponsor Contact *</label>
                    <input
                      id="sponsor_contact"
                      name="sponsor_contact"
                      value={form.sponsor_contact}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="compliance_approval_status">Compliance Approval Status *</label>
                    <select
                      id="compliance_approval_status"
                      name="compliance_approval_status"
                      value={form.compliance_approval_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select status...</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="compliance_contact">Compliance Contact *</label>
                    <input
                      id="compliance_contact"
                      name="compliance_contact"
                      value={form.compliance_contact}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="compliance_assessment_date">Assessment Date *</label>
                    <input
                      id="compliance_assessment_date"
                      name="compliance_assessment_date"
                      type="date"
                      value={form.compliance_assessment_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label htmlFor="compliance_comment">Compliance Comment</label>
                    <textarea
                      id="compliance_comment"
                      name="compliance_comment"
                      value={form.compliance_comment}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Assessment' : 'Add Assessment')}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancel} className="btn btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <p>Loading assessments...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>Error: {error}</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="empty-state">
              <p>No assessments found for this vendor list.</p>
              <p>Click "Add Assessment" to create your first assessment.</p>
            </div>
          ) : (
            <div className="assessments-list">
              <h2>Assessments ({assessments.length})</h2>
              <div className="assessments-grid">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="assessment-card">
                    <div className="assessment-card-header">
                      <h3>{assessment.sponsor_business_org}</h3>
                      <span className={`status-badge status-${assessment.compliance_approval_status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {assessment.compliance_approval_status}
                      </span>
                    </div>
                    <div className="assessment-card-body">
                      <div className="assessment-field">
                        <span className="field-label">Sponsor Contact:</span>
                        <span className="field-value">{assessment.sponsor_contact}</span>
                      </div>
                      <div className="assessment-field">
                        <span className="field-label">Compliance Contact:</span>
                        <span className="field-value">{assessment.compliance_contact}</span>
                      </div>
                      <div className="assessment-field">
                        <span className="field-label">Assessment Date:</span>
                        <span className="field-value">{formatDate(assessment.compliance_assessment_date)}</span>
                      </div>
                      {assessment.compliance_comment && (
                        <div className="assessment-field">
                          <span className="field-label">Comment:</span>
                          <span className="field-value">{assessment.compliance_comment}</span>
                        </div>
                      )}
                    </div>
                    <div className="assessment-card-actions">
                      <button
                        onClick={() => handleEdit(assessment)}
                        className="btn btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(assessment.id)}
                        className="btn btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorAssessments;

