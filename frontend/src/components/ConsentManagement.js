import React, { useState, useEffect } from 'react';
import './ConsentManagement.css';
import { apiService } from '../services/apiService';
import { useWeb3 } from '../hooks/useWeb3';

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    purpose: '',
  });

  // Fetch consents with filtering by status
  useEffect(() => {
    const fetchConsents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Error test for layout and styling
        // throw new Error('Failed to load consents - testing error state');
        const status = filterStatus === 'all' ? null : filterStatus;
        const data = await apiService.getConsents(null, status);
        setConsents(data.consents || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsents();
  }, [filterStatus]);

  const handleCreateConsent = async (e) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // 1. Create a message to sign
      const message = `I consent to: ${formData.purpose} for patient: ${formData.patientId}`;

      // 2. Sign the message using signMessage
      const signature = await signMessage(message);

      // 3. Call apiService.createConsent with consent data and signature
      await apiService.createConsent({
        patientId: formData.patientId,
        purpose: formData.purpose,
        walletAddress: account,
        signature: signature
      });

      // 4. Refresh consents list
      const status = filterStatus === 'all' ? null : filterStatus;
      const data = await apiService.getConsents(null, status);
      setConsents(data.consents || []);

      // Reset form and close
      setFormData({ patientId: '', purpose: '' });
      setShowCreateForm(false);

      alert('Consent created successfully!');
    } catch (err) {
      alert('Failed to create consent: ' + err.message);
    }
  };

  const handleUpdateStatus = async (consentId, newStatus) => {
    try {
      // Call apiService.updateConsent to update the status
      await apiService.updateConsent(consentId, { status: newStatus });

      // Refresh consents list
      const status = filterStatus === 'all' ? null : filterStatus;
      const data = await apiService.getConsents(null, status);
      setConsents(data.consents || []);

      alert(`Consent ${newStatus === 'active' ? 'approved' : 'revoked'} successfully!`);
    } catch (err) {
      alert('Failed to update consent: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">Loading consents...</div>
      </div>
    );
  }

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <button
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!account}
        >
          {showCreateForm ? 'Cancel' : 'Create New Consent'}
        </button>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}

      {showCreateForm && account && (
        <div className="create-consent-form">
          <h3>Create New Consent</h3>
          <form onSubmit={handleCreateConsent}>
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                placeholder="e.g., patient-001"
              />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              >
                <option value="">Select purpose...</option>
                <option value="Research Study Participation">Research Study Participation</option>
                <option value="Data Sharing with Research Institution">Data Sharing with Research Institution</option>
                <option value="Third-Party Analytics Access">Third-Party Analytics Access</option>
                <option value="Insurance Provider Access">Insurance Provider Access</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Sign & Create Consent
            </button>
          </form>
        </div>
      )}

      <div className="consent-filters">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={filterStatus === 'active' ? 'active' : ''}
          onClick={() => setFilterStatus('active')}
        >
          Active
        </button>
        <button
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
      </div>

      {/* Consents list */}
      {error && (
        <div className="error">
          <strong>Error: {error}</strong>
        </div>
      )}

      <div className="consents-list">
        {consents.length > 0 ? (
          consents.map((consent) => (
            <div key={consent.id} className="consent-card">
              <div className="consent-card-header">
                <div className="consent-main-info">
                  <h3 className="consent-purpose">{consent.purpose} <span className={`consent-status ${consent.status}`}>{consent.status}
                </span></h3>
                  
                </div>
              </div>

              <div className="consent-details">
                <p className="consent-patient-id consent-detail-item">
                  <span className="detail-label">Patient:</span> <span className="mono detail-value">{consent.patientId}</span>
                  </p>
                <p className="consent-detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date(consent.createdAt).toLocaleString()}
                  </span>
                </p>

                <p className="consent-detail-item">
                  <span className="detail-label">Wallet:</span>
                  <span className="detail-value mono">{consent.walletAddress}</span>
                </p>

                {consent.blockchainTxHash && (
                  <p className="consent-detail-item">
                    <span className="detail-label">Tx Hash:</span>
                    <span className="detail-value mono">{consent.blockchainTxHash}</span>
                  </p>
                )}

                {consent.signature && (
                  <p className="consent-detail-item">
                    <span className="detail-label">Signature:</span>
                    <span className="detail-value mono signature">
                      {consent.signature.substring(0, 20)}...{consent.signature.substring(consent.signature.length - 20)}
                    </span>
                  </p>
                )}
              </div>

              {consent.status === 'pending' && account && (
                <div className="consent-actions">
                  <button
                    className="action-btn approve-btn"
                    onClick={() => handleUpdateStatus(consent.id, 'active')}
                  >
                    Approve
                  </button>
                  <button
                    className="action-btn reject-btn"
                    onClick={() => handleUpdateStatus(consent.id, 'revoked')}
                  >
                    Revoke
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-consents">
            <p>No consents found{filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;


