// client/src/components/Chat/MessageItem.jsx
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import './MessageItem.css';

const MessageItem = ({ message, currentUser, isFirstInGroup, otherParticipant }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Get current user ID - handle different formats
  const currentUserId = currentUser?._id || currentUser?.id;
  
  // FIXED: Extract string ID from message sender (handle both string and object formats)
  let messageSenderId;
  if (typeof message?.senderId === 'string') {
    messageSenderId = message.senderId;
  } else if (message?.senderId?._id) {
    messageSenderId = message.senderId._id;
  } else if (message?.senderId?.id) {
    messageSenderId = message.senderId.id;
  } else {
    messageSenderId = message?.senderId?.toString();
  }
  
  // Simple string comparison after converting to strings
  const isOwnMessage = messageSenderId && currentUserId && 
                      messageSenderId.toString() === currentUserId.toString();
  
  const isSystemMessage = message.senderType === 'system';
  const isAIMessage = message.senderType === 'ai';

  const getSenderName = () => {
    if (isSystemMessage) return 'System';
    if (isAIMessage) return 'AI Assistant';
    if (isOwnMessage) return `You (${currentUser.role})`;
    return `${otherParticipant.name} (${otherParticipant.role || 'other'})`;
  };

  const getMessageTime = () => {
    return formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  };

  const getRiskLevelClass = () => {
    if (!message.aiAnalysis || message.aiAnalysis.fraudScore === 0) return '';
    
    if (message.aiAnalysis.fraudScore >= 80) return 'risk-critical';
    if (message.aiAnalysis.fraudScore >= 60) return 'risk-high';
    if (message.aiAnalysis.fraudScore >= 30) return 'risk-medium';
    return 'risk-low';
  };

  const renderFileContent = () => {
    const { content } = message;
    
    if (content.mimeType?.startsWith('image/')) {
      return (
        <div className="message-image">
          <img 
            src={content.fileUrl} 
            alt={content.fileName}
            onClick={() => window.open(content.fileUrl, '_blank')}
          />
          <div className="file-info">
            <span className="file-name">{content.fileName}</span>
            <span className="file-size">{(content.fileSize / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      );
    }
    
    if (content.mimeType?.startsWith('video/')) {
      return (
        <div className="message-video">
          <video controls>
            <source src={content.fileUrl} type={content.mimeType} />
            Your browser does not support video playback.
          </video>
          <div className="file-info">
            <span className="file-name">{content.fileName}</span>
            <span className="file-size">{(content.fileSize / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>
      );
    }
    
    // Other file types
    return (
      <div className="message-file">
        <div className="file-icon">
          📎
        </div>
        <div className="file-details">
          <a 
            href={content.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="file-name"
          >
            {content.fileName}
          </a>
          <span className="file-size">
            {content.fileSize > 1024 * 1024 ? 
              `${(content.fileSize / 1024 / 1024).toFixed(1)} MB` :
              `${(content.fileSize / 1024).toFixed(1)} KB`
            }
          </span>
        </div>
        <button 
          onClick={() => window.open(content.fileUrl, '_blank')}
          className="download-btn"
        >
          📥
        </button>
      </div>
    );
  };

  const renderAIAnalysis = () => {
    if (!message.aiAnalysis || message.aiAnalysis.fraudScore === 0) return null;

    return (
      <div className={`ai-analysis ${showAnalysis ? 'expanded' : ''}`}>
        <button 
          className="analysis-toggle"
          onClick={() => setShowAnalysis(!showAnalysis)}
        >
          🤖 AI Analysis ({message.aiAnalysis.fraudScore}/100)
          <span className={`toggle-icon ${showAnalysis ? 'rotated' : ''}`}>▼</span>
        </button>
        
        {showAnalysis && (
          <div className="analysis-details">
            <div className="analysis-score">
              <strong>Risk Score:</strong> {message.aiAnalysis.fraudScore}/100
            </div>
            
            {message.aiAnalysis.riskFlags.length > 0 && (
              <div className="risk-flags">
                <strong>Risk Flags:</strong>
                <ul>
                  {message.aiAnalysis.riskFlags.map((flag, index) => (
                    <li key={index}>{flag.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {message.aiAnalysis.suspiciousKeywords.length > 0 && (
              <div className="suspicious-keywords">
                <strong>Flagged Keywords:</strong>
                <span className="keywords">
                  {message.aiAnalysis.suspiciousKeywords.join(', ')}
                </span>
              </div>
            )}
            
            {message.aiAnalysis.inappropriate && (
              <div className="inappropriate-flag">
                ⚠️ This message contains inappropriate content
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`message-item ${isOwnMessage ? 'own' : 'other'} ${isSystemMessage ? 'system' : ''} ${isAIMessage ? 'ai' : ''} ${getRiskLevelClass()}`}>
      {isFirstInGroup && !isSystemMessage && !isAIMessage && (
        <div className="message-sender">
          <span className="sender-name">{getSenderName()}</span>
          <span className="message-time">{getMessageTime()}</span>
        </div>
      )}
      
      <div className="message-content">
        {message.messageType === 'text' && (
          <div className="message-text">
            {message.content.text}
          </div>
        )}
        
        {(message.messageType === 'file' || message.messageType === 'image' || message.messageType === 'video') && (
          renderFileContent()
        )}
        
        {message.messageType === 'system' && (
          <div className="system-message">
            <span className="system-icon">ℹ️</span>
            {message.content.text}
          </div>
        )}
      </div>
      
      {renderAIAnalysis()}
      
      {!isFirstInGroup && (
        <div className="message-timestamp">
          {getMessageTime()}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
