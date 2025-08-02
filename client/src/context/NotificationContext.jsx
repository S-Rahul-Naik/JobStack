// client/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Set up polling for notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    // Prevent multiple simultaneous requests
    if (isFetching) {
      console.log('🔄 Already fetching notifications, skipping...');
      return;
    }

    try {
      setIsFetching(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found in localStorage');
        return;
      }

      console.log('🔍 Fetching notifications from:', `${API_BASE}/notifications`);
      console.log('🔑 Using token:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ Notifications fetched successfully:', data.notifications?.length || 0);
          console.log('📊 NotificationContext Data:', {
            notifications: data.notifications,
            unreadCount: data.unreadCount
          });
          
          setNotifications(data.notifications || []);
          
          // Check if notifications were viewed recently and adjust unread count
          const lastViewedTimestamp = localStorage.getItem('notificationsLastViewed');
          if (lastViewedTimestamp) {
            const lastViewed = new Date(lastViewedTimestamp);
            const newNotifications = (data.notifications || []).filter(notif => 
              !notif.read && new Date(notif.createdAt) > lastViewed
            );
            console.log('🕒 Filtering notifications newer than:', lastViewed);
            console.log('🔢 New notifications since last view:', newNotifications.length);
            setUnreadCount(newNotifications.length);
          } else {
            setUnreadCount(data.unreadCount || 0);
          }
          
          setIsConnected(true);
        } else {
          console.error('❌ Response is not JSON, content-type:', contentType);
          const textResponse = await response.text();
          console.error('❌ Response body:', textResponse.substring(0, 200));
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      setIsConnected(false);
    } finally {
      setIsFetching(false);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'JobStack Notification', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type || 'general'
      });
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    if (!notifications.find(n => n.id === notificationId)?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAllAsViewed = () => {
    // This function is called when user visits the notifications page
    // Store the timestamp when notifications were last viewed
    const viewedTimestamp = new Date().toISOString();
    localStorage.setItem('notificationsLastViewed', viewedTimestamp);
    
    // Reset the unread count for the bell icon
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    markAllAsViewed,
    clearNotification,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
