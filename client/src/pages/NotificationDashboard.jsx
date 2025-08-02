import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function NotificationDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [chatNotifications, setChatNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, application, job_match, message

  useEffect(() => {
    fetchNotifications();
    fetchChatNotifications();
    
    // Reset notification bell counts when this page is viewed
    if (window.resetNotificationCounts) {
      window.resetNotificationCounts();
    }
  }, [filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('read', filter === 'read');
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        console.log('📋 General notifications:', data.notifications?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    }
  };

  const fetchChatNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/communication/unread-count', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const chatMessages = data.recentMessages || [];
        
        // Convert chat messages to notification format
        const formattedChatNotifications = chatMessages.map((msg, index) => ({
          _id: `chat-${msg.conversationId}-${index}`,
          title: `💬 Message from ${msg.senderName}`,
          message: msg.messageType === 'text' 
            ? (typeof msg.content === 'object' ? msg.content.text : msg.content)
            : `Sent a ${msg.messageType}`,
          type: 'message',
          read: false, // Chat messages in this list are unread
          createdAt: msg.createdAt,
          actionUrl: `/chat?conversation=${msg.conversationId}`,
          isChat: true
        }));
        
        setChatNotifications(formattedChatNotifications);
        console.log('💬 Chat notifications:', formattedChatNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching chat notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read (only for non-chat notifications)
    if (!notification.read && !notification.isChat) {
      markAsRead(notification._id);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application': return '📋';
      case 'job_match': return '🎯';
      case 'message': return '💬';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application': return 'bg-blue-50 border-blue-200';
      case 'job_match': return 'bg-green-50 border-green-200';
      case 'message': return 'bg-purple-50 border-purple-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredNotifications = [...notifications, ...chatNotifications].filter(notif => {
    const readFilter = filter === 'all' || 
                      (filter === 'read' && notif.read) || 
                      (filter === 'unread' && !notif.read);
    const typeFilterMatch = typeFilter === 'all' || notif.type === typeFilter;
    return readFilter && typeFilterMatch;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

  const allNotifications = [...notifications, ...chatNotifications];
  const totalCount = allNotifications.length;
  const unreadCount = allNotifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7C13 10.76 16.05 13.81 19.81 14H4.19C7.95 13.81 11 10.76 11 7V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2ZM21 19V20H3V19L5 17V11C5 7.9 7.03 5.17 10 4.29C10.1 4.19 10.2 4.1 10.2 4C10.2 3.24 10.76 2.68 11.52 2.68S12.83 3.24 12.83 4C12.83 4.1 12.93 4.19 13.03 4.29C15.97 5.17 18 7.9 18 11V17L21 19ZM14 21C14 22.1 13.1 23 12 23S10 22.1 10 21" />
              </svg>
              Notifications
            </h1>
            <p className="text-blue-100 mt-2">Stay updated with your job applications and activities</p>
          </div>

          {/* Filters and Actions */}
          <div className="p-6 border-b">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                {/* Read Status Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="application">Applications</option>
                  <option value="job_match">Job Matches</option>
                  <option value="message">Messages</option>
                  <option value="system">System</option>
                </select>
              </div>

              <button
                onClick={markAllAsRead}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark All Read
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-6 text-sm text-gray-600">
              <span>Total: {totalCount}</span>
              <span>Unread: {unreadCount}</span>
              <span>Filtered: {filteredNotifications.length}</span>
              <span className="text-blue-600">General: {notifications.length}</span>
              <span className="text-purple-600">Chat: {chatNotifications.length}</span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        <h3 className={`font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-800'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                          {notification.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Mark as read"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete notification"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination could go here if needed */}
      </div>
    </div>
  );
}
