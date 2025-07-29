// client/src/components/Chat/ChatHeader.jsx
import React, { useState } from 'react';
import ReportModal from './ReportModal';
import './ChatHeader.css';

const ChatHeader = ({ conversation, currentUser, onClose, onReport }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const getOtherParticipant = () => {
    if (currentUser.role === 'recruiter') {
      return conversation.applicantId;
    } else {
      return conversation.recruiterId;
    }
  };

  const otherParticipant = getOtherParticipant();

  const getStatusBadge = () => {
    const status = conversation.status;
    const badgeClass = `status-badge status-${status}`;
    
    const statusText = {
      'active': '🟢 Active',
      'closed': '🔴 Closed',
      'reported': '⚠️ Reported',
      'under_review': '🔍 Under Review'
    };

    return (
      <span className={badgeClass}>
        {statusText[status] || status}
      </span>
    );
  };

  const getRiskIndicator = () => {
    if (!conversation.aiRiskScore || conversation.aiRiskScore === 0) return null;
    
    let riskClass = 'risk-low';
    let riskText = 'Low Risk';
    let riskIcon = '🟡';
    
    if (conversation.aiRiskScore >= 80) {
      riskClass = 'risk-critical';
      riskText = 'Critical Risk';
      riskIcon = '🔴';
    } else if (conversation.aiRiskScore >= 60) {
      riskClass = 'risk-high';
      riskText = 'High Risk';
      riskIcon = '🟠';
    } else if (conversation.aiRiskScore >= 30) {
      riskClass = 'risk-medium';
      riskText = 'Medium Risk';
      riskIcon = '🟡';
    }

    return (
      <div className={`risk-indicator ${riskClass}`} title={`AI Risk Score: ${conversation.aiRiskScore}/100`}>
        <span className="risk-icon">{riskIcon}</span>
        <span className="risk-text">{riskText}</span>
        <span className="risk-score">({conversation.aiRiskScore})</span>
      </div>
    );
  };

  const handleReport = (reason, evidence) => {
    onReport(reason, evidence);
    setShowReportModal(false);
  };

  return (
    <>
      <div className="chat-header">
        <div className="header-left">
          <button onClick={onClose} className="back-btn" title="Back to conversations">
            ← Back
          </button>
          
          <div className="participant-info">
            <div className="participant-avatar">
              {otherParticipant.name.charAt(0).toUpperCase()}
            </div>
            <div className="participant-details">
              <h3 className="participant-name">{otherParticipant.name}</h3>
              <p className="participant-role">
                {otherParticipant.role === 'recruiter' ? '🏢 Recruiter' : '👤 Job Seeker'}
                {otherParticipant.role === 'recruiter' && otherParticipant.companyName && (
                  <span className="company"> at {otherParticipant.companyName}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="conversation-info">
            {getStatusBadge()}
            {getRiskIndicator()}
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button 
              className="action-btn info-btn" 
              title="Conversation details"
              onClick={() => {/* TODO: Show conversation details modal */}}
            >
              ℹ️
            </button>
            
            <button 
              className="action-btn report-btn" 
              title="Report this conversation"
              onClick={() => setShowReportModal(true)}
            >
              🚩
            </button>
            
            <div className="menu-btn">
              ⋮
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <ReportModal
          conversationId={conversation._id}
          otherParticipant={otherParticipant}
          onReport={handleReport}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default ChatHeader;
