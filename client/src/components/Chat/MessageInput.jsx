// client/src/components/Chat/MessageInput.jsx
import React, { useState, useRef } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onUploadFile, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage({
        messageType: 'text',
        content: message.trim()
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported. Please upload images, videos, PDFs, or documents.');
        return;
      }
      
      onUploadFile(file);
    }
    setShowFileOptions(false);
    // Reset file input
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendRecording = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], `voice-message-${Date.now()}.webm`, {
        type: 'audio/webm'
      });
      onUploadFile(file);
      setRecordedBlob(null);
    }
  };

  const cancelRecording = () => {
    setRecordedBlob(null);
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  if (disabled) {
    return (
      <div className="message-input disabled">
        <div className="disabled-message">
          💬 This conversation is currently disabled
        </div>
      </div>
    );
  }

  return (
    <div className="message-input">
      {recordedBlob && (
        <div className="recorded-message">
          <div className="recording-preview">
            🎤 Voice message recorded
            <audio controls src={URL.createObjectURL(recordedBlob)} />
          </div>
          <div className="recording-actions">
            <button onClick={sendRecording} className="btn-send-recording">
              Send 📤
            </button>
            <button onClick={cancelRecording} className="btn-cancel-recording">
              Cancel ❌
            </button>
          </div>
        </div>
      )}
      
      <div className="input-container">
        <div className="attachment-section">
          <button 
            className={`attachment-btn ${showFileOptions ? 'active' : ''}`}
            onClick={() => setShowFileOptions(!showFileOptions)}
            title="Attach files"
          >
            📎
          </button>
          
          {showFileOptions && (
            <div className="file-options">
              <button onClick={() => fileInputRef.current.click()}>
                📁 Upload File
              </button>
              <button onClick={startRecording} disabled={isRecording}>
                🎤 Voice Message
              </button>
              <button onClick={startVideoRecording} disabled={isRecording}>
                📹 Video Clip
              </button>
            </div>
          )}
        </div>
        
        <div className="text-input-section">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Recording..." : "Type your message... (Enter to send, Shift+Enter for new line)"}
            className="message-textarea"
            disabled={isRecording}
            rows={1}
            style={{ 
              height: 'auto',
              minHeight: '40px',
              maxHeight: '120px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-pulse"></div>
              <span>Recording...</span>
              <button onClick={stopRecording} className="stop-recording-btn">
                ⏹️ Stop
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleSendMessage}
          disabled={!message.trim() || isRecording}
          className="send-btn"
          title="Send message"
        >
          📤
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
      />
      
      <div className="input-hints">
        <span className="hint">💡 Tip: Our AI monitors messages for your safety</span>
        <span className="hint">🔒 Never share personal financial information</span>
      </div>
    </div>
  );
};

export default MessageInput;
