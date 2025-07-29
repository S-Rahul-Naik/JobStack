// client/src/pages/Chat.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import ConversationsList from '../components/Chat/ConversationsList';
import ChatInterface from '../components/Chat/ChatInterface';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  // Check for conversation ID in URL parameters
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  const handleCloseChat = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Mobile: Show either conversations list or chat interface */}
        {isMobileView ? (
          <>
            {!selectedConversationId ? (
              <div className="mobile-conversations">
                <ConversationsList
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversationId}
                />
              </div>
            ) : (
              <div className="mobile-chat">
                <ChatInterface
                  conversationId={selectedConversationId}
                  onClose={handleCloseChat}
                />
              </div>
            )}
          </>
        ) : (
          /* Desktop: Show both side by side */
          <>
            <div className="conversations-panel">
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversationId}
              />
            </div>
            
            <div className="chat-panel">
              {selectedConversationId ? (
                <ChatInterface
                  conversationId={selectedConversationId}
                  onClose={handleCloseChat}
                />
              ) : (
                <div className="no-conversation-selected">
                  <div className="welcome-content">
                    <div className="welcome-icon">💬</div>
                    <h2>Welcome to JobStack Messages</h2>
                    <p>
                      {user.role === 'recruiter' ? 
                        'Select a conversation to start communicating with applicants.' :
                        'Select a conversation to chat with recruiters about opportunities.'
                      }
                    </p>
                    
                    <div className="features-info">
                      <h3>🛡️ Your Safety Features</h3>
                      <ul>
                        <li>🤖 AI-powered fraud detection monitors all messages</li>
                        <li>🚩 Easy reporting system for suspicious behavior</li>
                        <li>🔒 Secure file sharing with type validation</li>
                        <li>📹 Support for voice and video messages</li>
                        <li>⚠️ Real-time warnings for potential scams</li>
                      </ul>
                    </div>
                    
                    <div className="safety-reminders">
                      <h3>💡 Safety Reminders</h3>
                      <ul>
                        <li>Never share personal financial information</li>
                        <li>Legitimate employers don't ask for upfront fees</li>
                        <li>Verify company details independently</li>
                        <li>Report suspicious behavior immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
