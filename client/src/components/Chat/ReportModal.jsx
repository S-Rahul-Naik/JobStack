// client/src/components/Chat/ReportModal.jsx
import React, { useState } from 'react';
import './ReportModal.css';

const ReportModal = ({ conversationId, otherParticipant, onReport, onClose }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Requesting upfront payment or fees',
    'Asking for personal financial information',
    'Suspicious job offer or company details',
    'Inappropriate or unprofessional behavior',
    'Potential romance scam or catfishing',
    'Fake company or recruitment fraud',
    'Identity theft attempt',
    'Harassment or threatening behavior',
    'Other (please specify)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalReason = reason === 'Other (please specify)' ? customReason : reason;
    
    if (!finalReason.trim()) {
      alert('Please select or specify a reason for reporting.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onReport(finalReason, evidence);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="report-modal">
        <div className="modal-header">
          <h2>🚩 Report Conversation</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-content">
          <div className="report-info">
            <p>You are reporting your conversation with <strong>{otherParticipant.name}</strong>.</p>
            <p className="warning-text">
              ⚠️ False reports may result in account restrictions. Only report genuine violations.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>What is the reason for reporting this conversation?</label>
              <div className="reason-options">
                {reportReasons.map((reasonOption, index) => (
                  <label key={index} className="reason-option">
                    <input
                      type="radio"
                      name="reason"
                      value={reasonOption}
                      checked={reason === reasonOption}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <span>{reasonOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {reason === 'Other (please specify)' && (
              <div className="form-group">
                <label>Please specify the reason:</label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please provide details about the issue..."
                  required
                  rows={3}
                />
              </div>
            )}

            <div className="form-group">
              <label>Additional Evidence (Optional)</label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Provide any additional context, specific messages, or evidence that supports your report..."
                rows={4}
              />
              <small className="help-text">
                Include specific details like message content, timestamps, or any other relevant information.
              </small>
            </div>

            <div className="safety-notice">
              <h4>🛡️ Your Safety is Our Priority</h4>
              <ul>
                <li>All reports are reviewed by our safety team within 24 hours</li>
                <li>We may temporarily restrict the reported account during investigation</li>
                <li>You will receive updates on the status of your report</li>
                <li>For urgent safety concerns, contact our support team immediately</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose}
                className="btn-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-report"
                disabled={isSubmitting || !reason}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
