// client/src/components/Chat/MessageList.jsx
import React from 'react';
import MessageItem from './MessageItem';
import './MessageList.css';

const MessageList = ({ messages, currentUser, conversation }) => {
  const getOtherParticipant = () => {
    if (currentUser.role === 'recruiter') {
      return conversation.applicantId;
    } else {
      return conversation.recruiterId;
    }
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="message-list">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="welcome-message">
              <h3>👋 Welcome to your conversation!</h3>
              <p>
                {currentUser.role === 'recruiter' ? 
                  `You can now communicate with ${otherParticipant.name} about their application.` :
                  `${otherParticipant.name} has shortlisted your application. You can now discuss the opportunity!`
                }
              </p>
              <div className="safety-notice">
                <h4>🛡️ Stay Safe</h4>
                <ul>
                  <li>Never share personal financial information</li>
                  <li>Legitimate employers don't ask for upfront fees</li>
                  <li>Report any suspicious behavior immediately</li>
                  <li>Our AI monitors conversations for your safety</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageItem
              key={message._id || index}
              message={message}
              currentUser={currentUser}
              isFirstInGroup={
                index === 0 || 
                messages[index - 1].senderId !== message.senderId ||
                new Date(message.createdAt) - new Date(messages[index - 1].createdAt) > 300000 // 5 minutes
              }
              otherParticipant={otherParticipant}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MessageList;
