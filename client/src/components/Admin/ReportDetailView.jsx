// client/src/components/Admin/ReportDetailView.jsx
import { useState } from 'react';
import './ReportDetailView.css';

const ReportDetailView = ({ report, messages, onResolve, onBack }) => {
  const [action, setAction] = useState('');
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!action || !resolution) {
      alert('Please select an action and provide resolution details.');
      return;
    }
    
    await onResolve(report._id, action, resolution, adminNotes);
    setShowResolutionForm(false);
  };

  const getActionColor = (actionType) => {
    switch(actionType) {
      case 'dismiss': return 'bg-green-500 hover:bg-green-600';
      case 'warn_recruiter': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'suspend_recruiter': return 'bg-orange-500 hover:bg-orange-600';
      case 'close_conversation': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="report-detail-view">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Reports
          </button>
          <div className="text-sm text-gray-500">
            Report ID: {report._id}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-red-600 mb-4">🚩 Report Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Reported By:</h3>
              <p className="text-gray-600">{report.reportedBy?.name} ({report.reportedBy?.role})</p>
              <p className="text-sm text-gray-500">{report.reportedBy?.email}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">Conversation Participants:</h3>
              <p className="text-gray-600">
                <span className="font-medium">Applicant:</span> {report.applicantId?.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Recruiter:</span> {report.recruiterId?.name}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">Job:</h3>
              <p className="text-gray-600">{report.jobId?.title}</p>
              <p className="text-sm text-gray-500">{report.jobId?.companyName}</p>
            </div>
          </div>
          
          {/* Report Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Report Reason:</h3>
              <p className="text-gray-600">{report.reportDetails?.reason}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">Evidence/Description:</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">
                {report.reportDetails?.evidence || 'No additional evidence provided.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">Reported On:</h3>
              <p className="text-gray-600">{formatDate(report.reportDetails?.reportedAt)}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800">Current Status:</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                report.status === 'reported' ? 'bg-red-100 text-red-800' :
                report.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {report.status === 'reported' ? 'New Report' : 
                 report.status === 'under_review' ? 'Under Review' : 
                 'Resolved'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">📱 Conversation Messages</h3>
        <div className="max-h-96 overflow-y-auto space-y-3">
          {messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`p-3 rounded-lg ${
                message.senderId?._id === report.applicantId?._id
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : message.senderId?._id === report.recruiterId?._id
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : 'bg-gray-50 border-l-4 border-gray-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">
                  {message.senderId?.name || 'Unknown'} 
                  <span className="text-gray-500 ml-1">
                    ({message.senderId?.role || 'system'})
                  </span>
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <p className="text-gray-700">
                {message.content?.text || message.content || 'No content'}
              </p>
              
              {/* AI Analysis */}
              {message.aiAnalysis && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <span className="font-medium">AI Analysis:</span>
                  {message.aiAnalysis.inappropriate && (
                    <span className="text-red-600 ml-2">⚠️ Flagged as inappropriate</span>
                  )}
                  {message.aiAnalysis.fraudScore > 50 && (
                    <span className="text-orange-600 ml-2">🔍 High fraud risk</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {report.status !== 'closed' && !showResolutionForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">⚡ Admin Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => { setAction('dismiss'); setShowResolutionForm(true); }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
            >
              ✅ Dismiss Report
            </button>
            <button
              onClick={() => { setAction('warn_recruiter'); setShowResolutionForm(true); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium"
            >
              ⚠️ Warn User
            </button>
            <button
              onClick={() => { setAction('suspend_recruiter'); setShowResolutionForm(true); }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium"
            >
              🚫 Suspend User
            </button>
            <button
              onClick={() => { setAction('close_conversation'); setShowResolutionForm(true); }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
            >
              🔒 Close Chat
            </button>
          </div>
        </div>
      )}

      {/* Resolution Form */}
      {showResolutionForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">📝 Resolution Details</h3>
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Action:
              </label>
              <div className={`px-4 py-2 rounded text-white font-medium ${getActionColor(action)}`}>
                {action === 'dismiss' && '✅ Dismiss Report (No violation found)'}
                {action === 'warn_recruiter' && '⚠️ Issue Warning (Minor violation)'}
                {action === 'suspend_recruiter' && '🚫 Suspend User (Serious violation)'}
                {action === 'close_conversation' && '🔒 Close Conversation (Terminate chat)'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Summary *
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Describe the resolution and any actions taken..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Internal)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="2"
                placeholder="Internal notes for admin team..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`px-6 py-2 text-white rounded font-medium ${getActionColor(action)}`}
              >
                Confirm Resolution
              </button>
              <button
                type="button"
                onClick={() => setShowResolutionForm(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReportDetailView;
