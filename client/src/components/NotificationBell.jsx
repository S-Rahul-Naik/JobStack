// client/src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, fetchNotifications, markAllAsViewed } = useNotifications();

  // Function to reset chat unread count
  const resetChatUnreadCount = () => {
    // Store timestamp for chat notifications viewed
    const viewedTimestamp = new Date().toISOString();
    localStorage.setItem('chatNotificationsLastViewed', viewedTimestamp);
    setChatUnreadCount(0);
  };

  // Expose functions globally for notifications page to use
  useEffect(() => {
    window.resetNotificationCounts = () => {
      markAllAsViewed(); // Reset general notifications count
      resetChatUnreadCount(); // Reset chat notifications count
    };

    return () => {
      delete window.resetNotificationCounts;
    };
  }, [markAllAsViewed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch chat unread count on component mount
  useEffect(() => {
    const fetchChatUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        console.log('🚀 Initial chat unread count fetch...');
        const response = await fetch('http://localhost:5000/api/communication/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📧 Initial chat data:', data);
          
          // Check if chat notifications were viewed recently
          const lastViewedTimestamp = localStorage.getItem('chatNotificationsLastViewed');
          if (lastViewedTimestamp) {
            const lastViewed = new Date(lastViewedTimestamp);
            const newChatMessages = (data.recentMessages || []).filter(msg => 
              new Date(msg.createdAt) > lastViewed
            );
            console.log('🕒 Chat messages newer than:', lastViewed);
            console.log('🔢 New chat messages since last view:', newChatMessages.length);
            setChatUnreadCount(newChatMessages.length);
          } else {
            setChatUnreadCount(data.unreadCount || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching initial chat unread count:', error);
      }
    };

    fetchChatUnreadCount();
  }, []);

  // Fetch recent messages for chat notifications
  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        console.log('🔄 Fetching chat unread count...');
        const response = await fetch('http://localhost:5000/api/communication/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📧 Chat data received:', data);
          setRecentMessages(data.recentMessages || []);
          
          // Check if chat notifications were viewed recently (only when dropdown opens)
          if (isOpen) {
            const lastViewedTimestamp = localStorage.getItem('chatNotificationsLastViewed');
            if (lastViewedTimestamp) {
              const lastViewed = new Date(lastViewedTimestamp);
              const newChatMessages = (data.recentMessages || []).filter(msg => 
                new Date(msg.createdAt) > lastViewed
              );
              console.log('🔢 New chat messages for dropdown:', newChatMessages.length);
              setChatUnreadCount(newChatMessages.length);
            } else {
              setChatUnreadCount(data.unreadCount || 0);
            }
          }
        } else {
          console.log('❌ Failed to fetch chat data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching recent messages:', error);
      }
    };

    fetchRecentMessages(); // Fetch immediately when component mounts
    
    if (isOpen) {
      fetchRecentMessages(); // Also fetch when dropdown opens to get latest data
    }
  }, [isOpen]);

  // Calculate total unread count (notifications + chat messages)
  const totalUnreadCount = unreadCount + chatUnreadCount;
  
  // Filter notifications and messages based on last viewed timestamps for dropdown display
  const getFilteredNotificationsForDropdown = () => {
    const lastViewedGeneral = localStorage.getItem('notificationsLastViewed');
    const lastViewedChat = localStorage.getItem('chatNotificationsLastViewed');
    
    // Filter general notifications
    let filteredNotifications = notifications;
    if (lastViewedGeneral) {
      const lastViewed = new Date(lastViewedGeneral);
      filteredNotifications = notifications.filter(notif => 
        !notif.read && new Date(notif.createdAt) > lastViewed
      );
    }
    
    // Filter chat messages
    let filteredMessages = recentMessages;
    if (lastViewedChat) {
      const lastViewed = new Date(lastViewedChat);
      filteredMessages = recentMessages.filter(msg => 
        new Date(msg.createdAt) > lastViewed
      );
    }
    
    return { filteredNotifications, filteredMessages };
  };
  
  const { filteredNotifications, filteredMessages } = getFilteredNotificationsForDropdown();
  
  // Debug logging for counts
  console.log('🔢 Count Debug:', {
    unreadCount,
    chatUnreadCount,
    totalUnreadCount,
    filteredNotifications: filteredNotifications.length,
    filteredMessages: filteredMessages.length
  });

  // Format time ago helper
  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return '📄';
      case 'job_match':
        return '🎯';
      case 'message':
        return '💬';
      case 'deadline':
        return '⏰';
      case 'welcome':
        return '👋';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id || notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
        aria-label={`Notifications (${totalUnreadCount} unread)`}
      >
        {/* Bell Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread Badge */}
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications {totalUnreadCount > 0 && `(${totalUnreadCount})`}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/notification-settings');
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600"
                title="Notification Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Chat Messages Section */}
            {filteredMessages.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent Messages</h4>
                </div>
                {filteredMessages.slice(0, 3).map((message, index) => (
                  <div
                    key={`message-${index}`}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/chat?conversation=${message.conversationId}`);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">💬</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.senderName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {message.messageType === 'text' 
                            ? (typeof message.content === 'object' ? message.content.text : message.content)
                            : `Sent a ${message.messageType}`
                          }
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* General Notifications Section */}
            {filteredNotifications.length > 0 && (
              <>
                {filteredMessages.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-b">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">General Notifications</h4>
                  </div>
                )}
                {filteredNotifications.slice(0, 10).map((notification) => {
                  // Debug: Log the notification data structure
                  console.log('🔍 Rendering notification:', {
                    id: notification._id || notification.id,
                    title: notification.title,
                    titleType: typeof notification.title,
                    message: notification.message,
                    messageType: typeof notification.message,
                    fullNotification: notification
                  });
                  
                  return (
                    <div
                      key={notification._id || notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {typeof notification.title === 'string' ? notification.title : JSON.stringify(notification.title)}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {typeof notification.message === 'string' ? notification.message : JSON.stringify(notification.message)}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Empty State */}
            {filteredNotifications.length === 0 && filteredMessages.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">No new notifications</p>
                <p className="text-xs text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {(notifications.length > 10 || recentMessages.length > 3) && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
