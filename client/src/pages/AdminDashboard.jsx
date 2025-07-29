import { useEffect, useState } from 'react';
import api from '../services/api';
import ReportDetailView from '../components/Admin/ReportDetailView';
import ReportNotifications from '../components/Admin/ReportNotifications';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [reportMessages, setReportMessages] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin data', err);
      setMessage({ type: 'error', text: 'Failed to load admin data' });
      setLoading(false);
    }
  };

  const loadUsers = async (page = 1, role = roleFilter) => {
    try {
      let url = `/admin/users?page=${page}&limit=10`;
      if (role && role !== 'all') {
        url += `&role=${role}`;
      }
      const res = await api.get(url);
      setUsers(res.data.users);
      setCurrentPage(page);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load users' });
    }
  };

  const loadJobs = async (page = 1) => {
    try {
      const res = await api.get(`/admin/jobs?page=${page}&limit=10`);
      setJobs(res.data.jobs);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load jobs' });
    }
  };

  const downloadUsersExcel = async () => {
    try {
      let url = '/admin/users/export';
      if (roleFilter && roleFilter !== 'all') {
        url += `?role=${roleFilter}`;
      }
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url2 = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url2;
      
      const filename = roleFilter === 'all' ? 'all_users.xlsx' : 
                      roleFilter === 'recruiter' ? 'recruiters.xlsx' : 
                      'applicants.xlsx';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url2);
      
      setMessage({ type: 'success', text: `${filename} downloaded successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to download Excel file' });
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage({ type: 'success', text: 'User deleted successfully' });
      if (activeTab === 'users') loadUsers(currentPage);
      loadDashboardData(); // Refresh stats
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setMessage({ type: 'success', text: 'Job deleted successfully' });
      if (activeTab === 'jobs') loadJobs(currentPage);
      loadDashboardData(); // Refresh stats
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete job' });
    }
  };

  // Report Management Functions
  const loadReports = async (page = 1) => {
    try {
      console.log('Loading reports, page:', page);
      const res = await api.get(`/admin/reports?page=${page}&limit=10`);
      console.log('Reports response:', res.data);
      setReports(res.data.conversations || []);
      setCurrentPage(page);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setMessage({ type: 'error', text: 'Failed to load reports: ' + (err.response?.data?.msg || err.message) });
    }
  };

  const loadReportMessages = async (conversationId) => {
    try {
      console.log('Loading report messages for conversation:', conversationId);
      const res = await api.get(`/admin/reports/${conversationId}/messages`);
      console.log('Report messages response:', res.data);
      setReportMessages(res.data.messages || []);
      setSelectedReport(res.data.conversation);
    } catch (err) {
      console.error('Failed to load report messages:', err);
      setMessage({ type: 'error', text: 'Failed to load report messages: ' + (err.response?.data?.msg || err.message) });
    }
  };

  const resolveReport = async (conversationId, action, resolution, adminNotes) => {
    try {
      console.log('Resolving report:', { conversationId, action, resolution, adminNotes });
      await api.put(`/admin/reports/${conversationId}/resolve`, {
        action,
        resolution,
        adminNotes
      });
      
      setMessage({ type: 'success', text: `Report ${action === 'dismiss' ? 'dismissed' : 'resolved'} successfully` });
      setSelectedReport(null);
      loadReports(currentPage);
      loadDashboardData(); // Refresh stats
    } catch (err) {
      console.error('Failed to resolve report:', err);
      setMessage({ type: 'error', text: 'Failed to resolve report: ' + (err.response?.data?.msg || err.message) });
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers(1, roleFilter);
    } else if (activeTab === 'jobs') {
      loadJobs();
    } else if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, roleFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  const { stats, analytics, recentActivities } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <ReportNotifications 
          onReportClick={(reportId) => {
            setActiveTab('reports');
            if (reportId) {
              loadReportMessages(reportId);
            }
          }}
        />
      </div>

      {/* Toast Message */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
          {message.text}
          <button 
            onClick={() => setMessage({ type: '', text: '' })} 
            className="float-right text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'User Management', icon: '👥' },
            { id: 'jobs', label: 'Job Management', icon: '💼' },
            { id: 'reports', label: 'Reports Management', icon: '🚩' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="text-blue-100">Total Users</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{stats?.totalJobs || 0}</div>
              <div className="text-green-100">Total Jobs</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{stats?.totalApplications || 0}</div>
              <div className="text-yellow-100">Applications</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{stats?.activeJobs || 0}</div>
              <div className="text-purple-100">Active Jobs</div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{stats?.expiredJobs || 0}</div>
              <div className="text-red-100">Expired Jobs</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{stats?.totalReports || 0}</div>
              <div className="text-orange-100">Active Reports</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">{stats?.recentUsers || 0}</div>
              <div className="text-indigo-100">New Users (30d)</div>
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">User Role Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {analytics?.userRoles && Object.entries(analytics.userRoles).map(([role, count]) => (
                <div key={role} className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-800">{count}</div>
                  <div className="text-gray-600 capitalize">{role}s</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Recent Job Postings</h3>
              <div className="space-y-3">
                {recentActivities?.recentJobs?.slice(0, 5).map((job, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.companyName}</div>
                    <div className="text-xs text-gray-500">
                      by {job.recruiterId?.name} • {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Recent Applications</h3>
              <div className="space-y-3">
                {recentActivities?.recentApplications?.slice(0, 5).map((app, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="font-medium">{app.applicantId?.name}</div>
                    <div className="text-sm text-gray-600">Applied for: {app.jobId?.title}</div>
                    <div className="text-xs text-gray-500">
                      Status: {app.status} • {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Recruiters */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Top Recruiters</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Recruiter</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Jobs Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.topRecruiters?.map((recruiter, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{recruiter.name}</td>
                      <td className="py-2">{recruiter.email}</td>
                      <td className="py-2">{recruiter.jobCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">User Management</h3>
              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="applicant">Applicants Only</option>
                  <option value="recruiter">Recruiters Only</option>
                  <option value="admin">Admins Only</option>
                </select>
                <button 
                  onClick={downloadUsersExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                >
                  📊 Download Excel
                </button>
                <button 
                  onClick={() => loadUsers(1, roleFilter)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="mb-4 text-sm text-gray-600">
              Showing {roleFilter === 'all' ? 'all users' : `${roleFilter}s only`} ({users.length} users)
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'recruiter' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadUsers(Math.max(1, currentPage - 1), roleFilter)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => loadUsers(Math.min(totalPages, currentPage + 1), roleFilter)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Job Management</h3>
              <button 
                onClick={() => loadJobs(1)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recruiter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{job.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{job.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{job.recruiterId?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{job.applicationCount || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          new Date(job.applicationDeadline) > new Date()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {new Date(job.applicationDeadline) > new Date() ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteJob(job._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {!selectedReport ? (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-red-600">🚩 Reported Conversations</h3>
                  <button 
                    onClick={() => loadReports(1)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Refresh Reports
                  </button>
                </div>
                
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg">✅ No active reports</div>
                    <p className="text-gray-400">All conversations are running smoothly!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reports.map((report) => (
                          <tr key={report._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{report.reportedBy?.name}</div>
                                <div className="text-sm text-gray-500">({report.reportedBy?.role})</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {report.applicantId?.name} ↔ {report.recruiterId?.name}
                              </div>
                              <div className="text-sm text-gray-500">{report.jobId?.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{report.reportDetails?.reason}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(report.reportDetails?.reportedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                report.status === 'reported' ? 'bg-red-100 text-red-800' :
                                report.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {report.status === 'reported' ? 'New Report' : 
                                 report.status === 'under_review' ? 'Under Review' : 
                                 'Resolved'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => loadReportMessages(report._id)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadReports(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => loadReports(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Report Detail View */
            <ReportDetailView 
              report={selectedReport}
              messages={reportMessages}
              onResolve={resolveReport}
              onBack={() => setSelectedReport(null)}
            />
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Application Status Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics?.applicationStats && Object.entries(analytics.applicationStats).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-800">{count}</div>
                  <div className="text-gray-600 capitalize">{status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Monthly Job Postings</h3>
            <div className="space-y-2">
              {analytics?.monthlyJobs?.map((month, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{month._id.year}/{month._id.month}</span>
                  <span className="font-semibold">{month.count} jobs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
