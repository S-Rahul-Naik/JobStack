// client/src/components/Chat/ConversationsList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import './ConversationsList.css';

const ConversationsList = ({ onSelectConversation, selectedConversationId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/communication/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (user.role === 'recruiter') {
      return conversation.applicantId;
    } else {
      return conversation.recruiterId;
    }
  };

  const getConversationPreview = (conversation) => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }

    const message = conversation.lastMessage;
    if (message.messageType === 'text') {
      return message.content.text?.substring(0, 50) + (message.content.text?.length > 50 ? '...' : '');
    } else if (message.messageType === 'file') {
      return `📎 ${message.content.fileName}`;
    } else if (message.messageType === 'image') {
      return `🖼️ Image: ${message.content.fileName}`;
    } else if (message.messageType === 'video') {
      return `🎥 Video: ${message.content.fileName}`;
    } else if (message.messageType === 'system') {
      return `ℹ️ ${message.content.text}`;
    }
    
    return 'New message';
  };

  const getRiskIndicator = (conversation) => {
    if (!conversation.aiRiskScore || conversation.aiRiskScore === 0) return null;
    
    if (conversation.aiRiskScore >= 80) {
      return <span className="risk-indicator critical" title="Critical Risk">🔴</span>;
    } else if (conversation.aiRiskScore >= 60) {
      return <span className="risk-indicator high" title="High Risk">🟠</span>;
    } else if (conversation.aiRiskScore >= 30) {
      return <span className="risk-indicator medium" title="Medium Risk">🟡</span>;
    }
    
    return <span className="risk-indicator low" title="Low Risk">🟡</span>;
  };

  const getStatusIndicator = (conversation) => {
    switch (conversation.status) {
      case 'reported':
        return <span className="status-indicator reported" title="Reported">⚠️</span>;
      case 'closed':
        return <span className="status-indicator closed" title="Closed">🔒</span>;
      case 'under_review':
        return <span className="status-indicator review" title="Under Review">🔍</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="conversations-list loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversations-list error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchConversations} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversations-list empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No Conversations Yet</h3>
          <p>
            {user.role === 'recruiter' ? 
              'Conversations will appear here when you shortlist applicants.' :
              'Conversations will appear here when recruiters shortlist your applications.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-list">
      <div className="conversations-header">
        <h2>💬 Messages</h2>
        <div className="conversations-count">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="conversations-container">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          const isSelected = selectedConversationId === conversation._id;
          
          return (
            <div
              key={conversation._id}
              className={`conversation-item ${isSelected ? 'selected' : ''} ${conversation.status}`}
              onClick={() => onSelectConversation(conversation._id)}
            >
              <div className="conversation-avatar">
                {otherParticipant.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="conversation-content">
                <div className="conversation-header">
                  <div className="participant-name">
                    {otherParticipant.name}
                    {otherParticipant.role === 'recruiter' && otherParticipant.companyName && (
                      <span className="company-name"> • {otherParticipant.companyName}</span>
                    )}
                  </div>
                  
                  <div className="conversation-indicators">
                    {getRiskIndicator(conversation)}
                    {getStatusIndicator(conversation)}
                  </div>
                </div>
                
                <div className="conversation-preview">
                  {getConversationPreview(conversation)}
                </div>
                
                <div className="conversation-footer">
                  <div className="conversation-time">
                    {conversation.lastActivity ? 
                      formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true }) :
                      'No recent activity'
                    }
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsList;
