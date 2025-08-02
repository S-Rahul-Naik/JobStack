import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    newJobMatches: true,
    messageNotifications: true,
    deadlineReminders: true,
    marketingEmails: false,
    weeklyDigest: true,
    instantNotifications: true
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preferences: newPreferences })
      });

      if (response.ok) {
        toast.success('Notification preferences updated!');
        setPreferences(newPreferences);
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    updatePreferences(newPreferences);
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">🔔 Notification Settings</h1>
            <p className="text-blue-100 mt-2">Manage how you receive updates about your job applications and matches</p>
          </div>

          <div className="p-6">
            {/* Quick Actions */}
            <div className="mb-8 flex flex-wrap gap-4">
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

            {/* Notification Categories */}
            <div className="space-y-8">
              {/* Job-Related Notifications */}
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  💼 Job-Related Notifications
                </h3>
                <div className="space-y-4">
                  <ToggleItem
                    title="Application Status Updates"
                    description="Get notified when recruiters update your application status (shortlisted, rejected, etc.)"
                    enabled={preferences.applicationUpdates}
                    onChange={() => handleToggle('applicationUpdates')}
                    disabled={saving}
                  />
                  <ToggleItem
                    title="New Job Matches"
                    description="Receive notifications about new jobs that match your skills and preferences"
                    enabled={preferences.newJobMatches}
                    onChange={() => handleToggle('newJobMatches')}
                    disabled={saving}
                  />
                  <ToggleItem
                    title="Application Deadline Reminders"
                    description="Get reminded about upcoming application deadlines"
                    enabled={preferences.deadlineReminders}
                    onChange={() => handleToggle('deadlineReminders')}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Communication Notifications */}
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  💬 Communication
                </h3>
                <div className="space-y-4">
                  <ToggleItem
                    title="Message Notifications"
                    description="Get notified when you receive new messages from recruiters or applicants"
                    enabled={preferences.messageNotifications}
                    onChange={() => handleToggle('messageNotifications')}
                    disabled={saving}
                  />
                  <ToggleItem
                    title="Instant Notifications"
                    description="Receive real-time notifications for important updates"
                    enabled={preferences.instantNotifications}
                    onChange={() => handleToggle('instantNotifications')}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Email Preferences */}
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📧 Email Preferences
                </h3>
                <div className="space-y-4">
                  <ToggleItem
                    title="Email Notifications"
                    description="Receive email notifications for important updates"
                    enabled={preferences.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                    disabled={saving}
                  />
                  <ToggleItem
                    title="Weekly Digest"
                    description="Get a weekly summary of your job activity and new opportunities"
                    enabled={preferences.weeklyDigest}
                    onChange={() => handleToggle('weeklyDigest')}
                    disabled={saving}
                  />
                  <ToggleItem
                    title="Marketing Emails"
                    description="Receive occasional tips, features updates, and career advice"
                    enabled={preferences.marketingEmails}
                    onChange={() => handleToggle('marketingEmails')}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Save Status */}
            {saving && (
              <div className="mt-6 flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Saving preferences...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ title, description, enabled, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
