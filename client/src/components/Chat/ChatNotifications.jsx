// client/src/components/Chat/ChatNotifications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ChatNotifications.css';

const ChatNotifications = ({ onNavigateToChat }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUnreadCount();
    // Set up polling for new messages (in a real app, use WebSocket)
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/communication/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
        setRecentMessages(data.recentMessages || []);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMessageClick = (conversationId) => {
    setShowNotifications(false);
    onNavigateToChat(conversationId);
  };

  const formatMessagePreview = (message) => {
    if (message.messageType === 'text') {
      return message.content.text?.substring(0, 50) + (message.content.text?.length > 50 ? '...' : '');
    } else if (message.messageType === 'file') {
      return `📎 ${message.content.fileName}`;
    } else if (message.messageType === 'image') {
      return `🖼️ Image`;
    } else if (message.messageType === 'video') {
      return `🎥 Video`;
    }
    return 'New message';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (unreadCount === 0) {
    return null; // Don't show notification bell if no unread messages
  }

  return (
    <div className="chat-notifications">
      <button 
        className="notification-bell"
        onClick={handleNotificationClick}
        title={`${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          <div 
            className="notification-overlay" 
            onClick={() => setShowNotifications(false)}
          />
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>💬 New Messages</h3>
              <span className="unread-count">{unreadCount} unread</span>
            </div>

            <div className="notifications-list">
              {recentMessages.length > 0 ? (
                recentMessages.map((message, index) => (
                  <div
                    key={index}
                    className="notification-item"
                    onClick={() => handleMessageClick(message.conversationId)}
                  >
                    <div className="notification-avatar">
                      {message.senderName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-header">
                        <span className="sender-name">{message.senderName}</span>
                        <span className="message-time">{getTimeAgo(message.createdAt)}</span>
                      </div>
                      
                      <div className="message-preview">
                        {formatMessagePreview(message)}
                      </div>
                      
                      {message.aiAnalysis?.fraudScore > 30 && (
                        <div className="ai-warning-indicator">
                          ⚠️ AI flagged this message
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-notifications">
                  <p>No recent messages</p>
                </div>
              )}
            </div>

            <div className="notifications-footer">
              <button 
                onClick={() => {
                  setShowNotifications(false);
                  onNavigateToChat();
                }}
                className="view-all-btn"
              >
                View All Messages
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatNotifications;
