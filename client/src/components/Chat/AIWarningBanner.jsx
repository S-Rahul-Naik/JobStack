// client/src/components/Chat/AIWarningBanner.jsx
import React from 'react';
import './AIWarningBanner.css';

const AIWarningBanner = ({ warning, onDismiss }) => {
  const getWarningIcon = () => {
    switch (warning.type) {
      case 'high_risk':
        return '🚨';
      case 'message_warning':
        return '⚠️';
      case 'fraud_detected':
        return '🛡️';
      default:
        return '⚠️';
    }
  };

  const getWarningClass = () => {
    if (warning.score >= 80) return 'warning-critical';
    if (warning.score >= 60) return 'warning-high';
    if (warning.score >= 30) return 'warning-medium';
    return 'warning-low';
  };

  return (
    <div className={`ai-warning-banner ${getWarningClass()}`}>
      <div className="warning-content">
        <div className="warning-icon">
          {getWarningIcon()}
        </div>
        
        <div className="warning-message">
          <div className="warning-text">
            {warning.message}
          </div>
          
          {warning.score && (
            <div className="warning-score">
              AI Risk Assessment: {warning.score}/100
            </div>
          )}
        </div>
        
        <div className="warning-actions">
          {warning.type === 'high_risk' && (
            <div className="safety-tips">
              <strong>🛡️ Safety Tips:</strong>
              <ul>
                <li>Never send money or financial information</li>
                <li>Verify company details independently</li>
                <li>Report suspicious behavior immediately</li>
              </ul>
            </div>
          )}
          
          <button 
            onClick={onDismiss}
            className="dismiss-btn"
            title="Dismiss warning"
          >
            ✕
          </button>
        </div>
      </div>
      
      {warning.type === 'fraud_detected' && (
        <div className="fraud-alert">
          <div className="fraud-details">
            <h4>🚨 Potential Fraud Detected</h4>
            <p>Our AI system has detected patterns commonly associated with job scams. Please exercise extreme caution.</p>
            
            <div className="immediate-actions">
              <strong>Immediate Actions:</strong>
              <ul>
                <li>Do not send any money or personal financial information</li>
                <li>Verify this opportunity through official company channels</li>
                <li>Consider reporting this conversation</li>
                <li>Contact our support team if you have concerns</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWarningBanner;
