// client/src/components/Chat/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import AIWarningBanner from './AIWarningBanner';
import './ChatInterface.css';

const ChatInterface = ({ conversationId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiWarning, setAiWarning] = useState(null);
  const messagesEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/communication/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
        
        // Check for AI warnings
        if (data.conversation.aiRiskScore > 50) {
          setAiWarning({
            type: 'high_risk',
            message: 'This conversation has been flagged by our AI system for potentially suspicious activity.',
            score: data.conversation.aiRiskScore
          });
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/communication/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/communication/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          content: messageData.content
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        
        // Check for AI warnings
        if (data.aiWarning) {
          setAiWarning({
            type: 'message_warning',
            message: data.aiWarning,
            temporary: true
          });
          
          // Auto-hide temporary warnings after 10 seconds
          setTimeout(() => {
            setAiWarning(prev => prev?.temporary ? null : prev);
          }, 10000);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/communication/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const reportConversation = async (reason, evidence) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/communication/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          reason,
          evidence
        })
      });

      if (response.ok) {
        alert('Conversation reported successfully. Our team will review it shortly.');
        setConversation(prev => ({ ...prev, status: 'reported' }));
      }
    } catch (error) {
      console.error('Error reporting conversation:', error);
      alert('Failed to report conversation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="chat-interface loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="chat-interface error">
        <div className="error-message">
          <h3>Conversation not found</h3>
          <p>The conversation you're looking for doesn't exist or you don't have access to it.</p>
          <button onClick={onClose} className="btn btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      {aiWarning && (
        <AIWarningBanner 
          warning={aiWarning} 
          onDismiss={() => setAiWarning(null)}
        />
      )}
      
      <ChatHeader 
        conversation={conversation}
        currentUser={user}
        onClose={onClose}
        onReport={reportConversation}
      />
      
      <MessageList 
        messages={messages}
        currentUser={user}
        conversation={conversation}
      />
      
      <div ref={messagesEndRef} />
      
      <MessageInput 
        onSendMessage={sendMessage}
        onUploadFile={uploadFile}
        disabled={conversation.status === 'closed' || conversation.status === 'reported'}
      />
      
      {(conversation.status === 'closed' || conversation.status === 'reported') && (
        <div className="chat-disabled-notice">
          <p>
            {conversation.status === 'closed' ? 
              'This conversation has been closed.' : 
              'This conversation has been reported and is under review.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
