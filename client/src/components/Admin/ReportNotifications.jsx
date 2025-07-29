// client/src/components/Admin/ReportNotifications.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import './ReportNotifications.css';

const ReportNotifications = ({ onReportClick }) => {
  const [reportCount, setReportCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    fetchReportCount();
    fetchRecentReports();
    
    // Poll for new reports every 30 seconds
    const interval = setInterval(() => {
      fetchReportCount();
      fetchRecentReports();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchReportCount = async () => {
    try {
      const res = await api.get('/admin/reports?page=1&limit=1');
      setReportCount(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch report count:', err);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const res = await api.get('/admin/reports?page=1&limit=5');
      setRecentReports(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch recent reports:', err);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const reportDate = new Date(date);
    const diffInMinutes = Math.floor((now - reportDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="report-notifications">
      <button
        className="report-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        title={`${reportCount} pending reports`}
      >
        🚩
        {reportCount > 0 && (
          <span className="report-badge">{reportCount > 99 ? '99+' : reportCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="report-dropdown">
          <div className="report-dropdown-header">
            <h3>Recent Reports</h3>
            <span className="report-count">{reportCount} pending</span>
          </div>
          
          <div className="report-list">
            {recentReports.length === 0 ? (
              <div className="no-reports">
                <span>✅ No pending reports</span>
              </div>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report._id}
                  className="report-item"
                  onClick={() => {
                    onReportClick(report._id);
                    setShowDropdown(false);
                  }}
                >
                  <div className="report-item-header">
                    <span className="report-reason">{report.reportDetails?.reason}</span>
                    <span className="report-time">{formatTime(report.reportDetails?.reportedAt)}</span>
                  </div>
                  <div className="report-item-details">
                    <span className="report-conversation">
                      {report.applicantId?.name} ↔ {report.recruiterId?.name}
                    </span>
                  </div>
                  <div className="report-item-status">
                    <span className={`status-indicator ${report.status}`}>
                      {report.status === 'reported' ? 'New' : 'Under Review'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="report-dropdown-footer">
            <button
              onClick={() => {
                onReportClick();
                setShowDropdown(false);
              }}
              className="view-all-reports"
            >
              View All Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportNotifications;
