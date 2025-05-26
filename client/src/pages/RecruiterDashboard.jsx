// src/pages/RecruiterDashboard.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function RecruiterDashboard() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    applicationDeadline: '',
    companyName: '',
    companyLogo: '', // URL or path
    location: '',
    salary: '',
    jobType: '',
    country: '',
  });

  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' }); // ✅ Toast state
  const [showJobModal, setShowJobModal] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 6;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Job title is required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.requiredSkills.trim()) newErrors.requiredSkills = 'Required skills are required.';
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required.';
    if (!form.location.trim()) newErrors.location = 'Location is required.';
    if (!form.country.trim()) newErrors.country = 'Country is required.';
    if (!form.jobType) newErrors.jobType = 'Job type is required.';
    if (!form.applicationDeadline) newErrors.applicationDeadline = 'Application deadline is required.';
    if (form.salary && !/^\$?\d{1,3}(,\d{3})*(\.\d{2})?(\/year|\/month|\/hr)?$/.test(form.salary.trim())) {
      newErrors.salary = 'Enter a valid salary (e.g., $60,000/year).';
    }
    if (form.companyLogo && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(form.companyLogo.trim())) {
      newErrors.companyLogo = 'Enter a valid image URL (jpg, png, gif, svg, webp).';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    const payload = {
      ...form,
      requiredSkills: form.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill),
      applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline) : undefined,
    };
    try {
      await api.post('/jobs/create', payload);
      setMessage({ type: 'success', text: 'Job posted successfully!' });
      setForm({ title: '', description: '', requiredSkills: '', companyName: '', companyLogo: '', location: '', salary: '', jobType: '', country: '', applicationDeadline: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to post job' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/jobs/applicants/all')
      .then(res => setApplicants(res.data))
      .catch(err => console.error('Error fetching applicants', err));
  }, []);

  useEffect(() => {
    api.get('/jobs/my')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Error fetching jobs', err));
  }, []);

  useEffect(() => {
    if (message.type === 'success' && message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  function downloadApplicantsExcel() {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/jobs/applicants/export/excel', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to download Excel');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'applicants.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Failed to download Excel file.'));
  }

  // Filtered and paginated applicants
  const filteredApplicants = applicants.filter(app => {
    const name = app.applicantId?.name?.toLowerCase() || "";
    const email = app.applicantId?.email?.toLowerCase() || "";
    const job = app.jobId?.title?.toLowerCase() || "";
    return (
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      job.includes(search.toLowerCase())
    );
  });
  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage) || 1;
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * applicantsPerPage,
    currentPage * applicantsPerPage
  );

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-br from-pink-100 via-white to-indigo-100 rounded-2xl shadow-xl p-8 mb-10">
        <h2 className="text-3xl font-extrabold mb-6 text-blue-700 text-center tracking-tight">Post a New Job</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="font-medium mb-1 flex items-center gap-1">
              Job Title
              <span tabIndex={0} className="ml-1 cursor-pointer group relative">
                <svg width="16" height="16" fill="currentColor" className="text-blue-400 inline-block"><circle cx="8" cy="8" r="8" fill="#e0e7ff"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#2563eb">i</text></svg>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-white border border-blue-200 text-xs text-gray-700 rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition pointer-events-none z-20">Enter a descriptive job title (e.g., Software Engineer).</span>
              </span>
            </label>
            <input
              className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
              name="title"
              placeholder="Job Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
          </div>
          <textarea
            className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
            name="description"
            placeholder="Job Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
          />
          {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
          <div className="relative">
            <label className="font-medium mb-1 flex items-center gap-1">
              Required Skills
              <span tabIndex={0} className="ml-1 cursor-pointer group relative">
                <svg width="16" height="16" fill="currentColor" className="text-blue-400 inline-block"><circle cx="8" cy="8" r="8" fill="#e0e7ff"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#2563eb">i</text></svg>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-blue-200 text-xs text-gray-700 rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition pointer-events-none z-20">Comma-separated (e.g., React, Node.js, MongoDB).</span>
              </span>
            </label>
            <input
              className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
              name="requiredSkills"
              placeholder="Required Skills (comma-separated)"
              value={form.requiredSkills}
              onChange={handleChange}
              required
            />
            {errors.requiredSkills && <div className="text-red-600 text-sm mt-1">{errors.requiredSkills}</div>}
          </div>
          <input
            className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
            name="companyName"
            placeholder="Company Name"
            value={form.companyName}
            onChange={handleChange}
            required
          />
          {errors.companyName && <div className="text-red-600 text-sm mt-1">{errors.companyName}</div>}
          <div className="relative">
            <label className="font-medium mb-1 flex items-center gap-1">
              Company Logo URL
              <span tabIndex={0} className="ml-1 cursor-pointer group relative">
                <svg width="16" height="16" fill="currentColor" className="text-blue-400 inline-block"><circle cx="8" cy="8" r="8" fill="#e0e7ff"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#2563eb">i</text></svg>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-blue-200 text-xs text-gray-700 rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition pointer-events-none z-20">Paste a direct image URL (jpg, png, gif, svg, webp). Optional.</span>
              </span>
            </label>
            <input
              className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
              name="companyLogo"
              placeholder="Company Logo URL (optional)"
              value={form.companyLogo}
              onChange={handleChange}
            />
            {errors.companyLogo && <div className="text-red-600 text-sm mt-1">{errors.companyLogo}</div>}
            {form.companyLogo && !errors.companyLogo && (
              <div className="flex items-center mt-2">
                <img
                  src={form.companyLogo}
                  alt="Company Logo Preview"
                  className="w-20 h-20 object-contain rounded bg-gray-100 border border-blue-200 mr-2"
                  onError={e => (e.target.style.display = 'none')}
                />
                <span className="text-xs text-gray-500">Logo Preview</span>
              </div>
            )}
          </div>
          <input
            className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
            name="location"
            placeholder="Location (e.g., City, State)"
            value={form.location}
            onChange={handleChange}
            required
          />
          {errors.location && <div className="text-red-600 text-sm mt-1">{errors.location}</div>}
          <input
            className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
            required
          />
          {errors.country && <div className="text-red-600 text-sm mt-1">{errors.country}</div>}
          <div className="relative">
            <label className="font-medium mb-1 flex items-center gap-1">
              Salary
              <span tabIndex={0} className="ml-1 cursor-pointer group relative">
                <svg width="16" height="16" fill="currentColor" className="text-blue-400 inline-block"><circle cx="8" cy="8" r="8" fill="#e0e7ff"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#2563eb">i</text></svg>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 bg-white border border-blue-200 text-xs text-gray-700 rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition pointer-events-none z-20">Format: $60,000/year, $5000/month, or $30/hr. Optional.</span>
              </span>
            </label>
            <input
              className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
              name="salary"
              placeholder="Salary (e.g., $60,000/year)"
              value={form.salary}
              onChange={handleChange}
            />
            {errors.salary && <div className="text-red-600 text-sm mt-1">{errors.salary}</div>}
          </div>
          <select
            className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            required
          >
            <option value="">Select Job Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
          {errors.jobType && <div className="text-red-600 text-sm mt-1">{errors.jobType}</div>}
          <div className="relative">
            <label className="font-medium mb-1 flex items-center gap-1">
              Application Closing Date & Time
              <span tabIndex={0} className="ml-1 cursor-pointer group relative">
                <svg width="16" height="16" fill="currentColor" className="text-blue-400 inline-block"><circle cx="8" cy="8" r="8" fill="#e0e7ff"/><text x="8" y="12" textAnchor="middle" fontSize="10" fill="#2563eb">i</text></svg>
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-blue-200 text-xs text-gray-700 rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition pointer-events-none z-20">Set the deadline for applications. After this, applicants cannot apply.</span>
              </span>
            </label>
            <input
              type="datetime-local"
              className="input bg-gray-100 border-2 border-blue-200 focus:border-blue-500 transition"
              name="applicationDeadline"
              value={form.applicationDeadline}
              onChange={handleChange}
            />
            {errors.applicationDeadline && <div className="text-red-600 text-sm mt-1">{errors.applicationDeadline}</div>}
          </div>
          <button type="submit" className="btn w-full text-lg py-2 flex items-center justify-center" disabled={loading}>
            {loading && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
        {message.text && (
          <div
            className={`p-3 rounded mt-6 text-base text-center font-semibold ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
            role="alert"
            tabIndex={-1}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-pink-100 via-white to-indigo-100 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
          <h3 className="text-2xl font-bold text-gray-800">Applicants</h3>
          <div className="flex gap-2 items-center">
            <input
              className="input bg-white border-2 border-blue-200 focus:border-blue-500 transition px-3 py-1 text-base rounded"
              placeholder="Search by name, email, or job title"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ minWidth: 220 }}
            />
            <button
              className="btn bg-yellow-500 hover:bg-yellow-600 text-base px-6 py-2"
              onClick={downloadApplicantsExcel}
            >
              Export Applicants to Excel
            </button>
          </div>
        </div>
        {filteredApplicants.length === 0 ? (
          <p className="text-gray-500 text-center">No applicants found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedApplicants.map((app, index) => (
                <div
                  key={index}
                  className={`relative rounded-xl shadow-lg p-6 bg-gradient-to-br from-pink-100 via-white to-indigo-100 border border-blue-100 transition hover:shadow-2xl flex flex-col gap-2 ${app.status === 'shortlisted' ? 'ring-2 ring-green-400' : app.status === 'rejected' ? 'ring-2 ring-red-300' : ''}`}
                  tabIndex={0}
                  aria-label={`Applicant ${app.applicantId.name}`}
                >
                  {/* Cross icon for removing applicant (always visible, top-right) */}
                  <button
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold px-2 z-10 bg-white/70 rounded-full"
                    title="Remove Applicant"
                    onClick={async () => {
                      try {
                        await api.delete(`/jobs/applicants/${app._id}`);
                        setApplicants(prev => prev.filter(a => a._id !== app._id));
                        setMessage({ type: 'success', text: 'Applicant removed and details stored.' });
                      } catch (err) {
                        setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to remove applicant.' });
                      }
                    }}
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700">
                      {app.applicantId.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-blue-900">{app.applicantId.name}</div>
                      <div className="text-gray-500 text-sm">{app.applicantId.email}</div>
                      {/* Show job title */}
                      <div className="text-xs text-gray-700 mt-1">Applied for: <span className="font-semibold">{app.jobId?.title || 'Job'}</span></div>
                      {/* Show application deadline if present */}
                      {app.jobId?.applicationDeadline && (
                        <div className="text-xs text-red-600 mt-1">Deadline: {new Date(app.jobId.applicationDeadline).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Match Score: {app.matchScore}%</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${app.status === 'shortlisted' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>Status: {app.status}</span>
                    {Array.isArray(app.missingSkills) && app.missingSkills.length > 0 && (
                      <span
                        className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold cursor-help"
                        title={`Missing Skills: ${app.missingSkills.join(', ')}`}
                      >
                        Missing Skills: {app.missingSkills.slice(0, 3).join(', ')}{app.missingSkills.length > 3 ? '…' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn bg-green-600 hover:bg-green-700 px-3 py-1 text-sm"
                      disabled={app.status === 'shortlisted'}
                      onClick={async () => {
                        try {
                          await api.patch(`/jobs/applicants/${app._id}/status`, { status: 'shortlisted' });
                          setApplicants(prev => prev.map(a => a._id === app._id ? { ...a, status: 'shortlisted' } : a));
                          setMessage({ type: 'success', text: 'Applicant shortlisted!' });
                        } catch (err) {
                          setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update status.' });
                        }
                      }}
                    >
                      Shortlist
                    </button>
                    <button
                      className="btn bg-red-600 hover:bg-red-700 px-3 py-1 text-sm"
                      disabled={app.status === 'rejected'}
                      onClick={async () => {
                        try {
                          await api.patch(`/jobs/applicants/${app._id}/status`, { status: 'rejected' });
                          setApplicants(prev => prev.map(a => a._id === app._id ? { ...a, status: 'rejected' } : a));
                          setMessage({ type: 'success', text: 'Applicant rejected.' });
                        } catch (err) {
                          setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update status.' });
                        }
                      }}
                    >
                      Reject
                    </button>
                    {app.resumePath && (
                      <a
                        className="btn bg-gray-500 hover:bg-gray-700 px-3 py-1 text-sm"
                        href={`http://localhost:5000/${encodeURI(app.resumePath.replace(/^.*uploads[\\/]/, 'uploads/'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                  {/* Show application date/time */}
                  {app.createdAt && (
                    <div className="text-xs text-green-700 mt-1">Applied on: {new Date(app.createdAt).toLocaleString()}</div>
                  )}
                  {/* Show application closed message if deadline passed */}
                  {app.jobId?.applicationDeadline && app.applicationClosedInfo?.closed && app.applicationClosedInfo.hours >= 1 && (
                    <div className="text-xs text-red-700 mt-1 font-semibold">
                      Applications closed for {app.applicationClosedInfo.hours} hour{app.applicationClosedInfo.hours > 1 ? 's' : ''}
                    </div>
                  )}
                  {/* Remove job description, add View Details button */}
                  <button
                    className="btn bg-blue-200 hover:bg-blue-400 text-blue-900 px-2 py-1 text-xs mt-1"
                    onClick={() => {
                      setModalJob(app); // Pass the full applicant object
                      setShowJobModal(true);
                    }}
                    type="button"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                className="btn px-4 py-1 bg-blue-200 hover:bg-blue-400 text-blue-900 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-base font-semibold">Page {currentPage} of {totalPages}</span>
              <button
                className="btn px-4 py-1 bg-blue-200 hover:bg-blue-400 text-blue-900 disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* New Section: Your Posted Jobs */}
      <div className="bg-gradient-to-br from-blue-100 via-white to-indigo-100 rounded-2xl shadow-xl p-8 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center tracking-tight">Your Posted Jobs</h2>
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center">No jobs posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {jobs.map((job, idx) => (
              <div key={job._id || idx} className="rounded-xl shadow-lg p-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  {job.companyLogo && (
                    <img src={job.companyLogo} alt="Logo" className="w-10 h-10 object-contain rounded bg-gray-100" />
                  )}
                  <div>
                    <div className="font-bold text-lg text-blue-900">{job.title}</div>
                    <div className="text-gray-500 text-sm">{job.companyName}</div>
                  </div>
                </div>
                <div className="text-gray-700 text-sm mb-1">{job.location}, {job.country}</div>
                <div className="text-gray-500 text-xs mb-1">{job.jobType} | {job.salary}</div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="btn bg-green-500 hover:bg-green-600 px-3 py-1 text-xs"
                    onClick={() => {
                      setForm({
                        ...job,
                        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills,
                        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0,16) : '',
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn bg-blue-400 hover:bg-blue-600 px-3 py-1 text-xs"
                    onClick={() => {
                      setForm({
                        ...job,
                        requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : job.requiredSkills,
                        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0,16) : '',
                        title: job.title + ' (Copy)'
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    className="btn bg-red-400 hover:bg-red-600 px-3 py-1 text-xs"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this job?')) {
                        try {
                          await api.delete(`/jobs/${job._id}`);
                          setJobs(jobs => jobs.filter(j => j._id !== job._id));
                          setMessage({ type: 'success', text: 'Job deleted successfully.' });
                        } catch (err) {
                          setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to delete job.' });
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="btn bg-purple-400 hover:bg-purple-600 px-3 py-1 text-xs"
                    onClick={() => {
                      setModalJob({ ...job, jobId: job });
                      setShowJobModal(true);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Details Modal for Applicants */}
      {showJobModal && modalJob && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" tabIndex={-1} aria-modal="true" role="dialog">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative outline-none" tabIndex={0}>
            <button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-600 focus:outline-none"
              onClick={() => setShowJobModal(false)}
              aria-label="Close details modal"
            >
              &times;
            </button>
            {/* Company Logo */}
            {(modalJob.jobId?.companyLogo || modalJob.companyLogo) && (
              <img src={modalJob.jobId?.companyLogo || modalJob.companyLogo} alt="Logo" className="w-20 h-20 object-contain rounded bg-gray-100 mb-2 mx-auto" />
            )}
            <h2 className="text-2xl font-bold mb-2 text-center">{modalJob.jobId?.title || modalJob.title}</h2>
            <div className="text-center text-gray-700 font-medium mb-1">{modalJob.jobId?.companyName || modalJob.companyName}</div>
            <div className="text-center text-gray-500 mb-1">
              {(modalJob.jobId?.location || modalJob.location) && <span>{modalJob.jobId?.location || modalJob.location}</span>}
              {(modalJob.jobId?.country || modalJob.country) && <span>, {modalJob.jobId?.country || modalJob.country}</span>}
            </div>
            <div className="text-center text-gray-500 mb-1">
              {(modalJob.jobId?.salary || modalJob.salary) && <span>💰 {modalJob.jobId?.salary || modalJob.salary} </span>}
              {(modalJob.jobId?.jobType || modalJob.jobType) && <span className="ml-2">🕒 {modalJob.jobId?.jobType || modalJob.jobType}</span>}
            </div>
            <div className="mb-2 text-gray-700"><span className="font-semibold">Description:</span> {modalJob.jobId?.description || modalJob.description || 'No description'}</div>
            <div className="mb-2 text-gray-700"><span className="font-semibold">Required Skills:</span> {(modalJob.jobId?.requiredSkills || modalJob.requiredSkills)?.join(', ')}</div>
            <div className="mb-2 text-gray-700"><span className="font-semibold">Application Deadline:</span> {(modalJob.jobId?.applicationDeadline || modalJob.applicationDeadline) ? new Date(modalJob.jobId?.applicationDeadline || modalJob.applicationDeadline).toLocaleString() : 'N/A'}</div>
            <hr className="my-4" />
            <div className="mb-2 text-lg font-bold text-blue-700">Applicant Details</div>
            <div className="mb-1"><span className="font-semibold">Name:</span> {modalJob.applicantId?.name}</div>
            <div className="mb-1"><span className="font-semibold">Email:</span> {modalJob.applicantId?.email}</div>
            <div className="mb-1"><span className="font-semibold">Status:</span> {modalJob.status}</div>
            <div className="mb-1"><span className="font-semibold">Match Score:</span> {modalJob.matchScore}%</div>
            {Array.isArray(modalJob.missingSkills) && modalJob.missingSkills.length > 0 && (
              <div className="mb-1">
                <span className="font-semibold">Missing Skills:</span>
                <span className="ml-1 text-yellow-800 bg-yellow-100 px-2 py-1 rounded text-xs font-semibold" title={modalJob.missingSkills.join(', ')}>
                  {modalJob.missingSkills.join(', ')}
                </span>
              </div>
            )}
            {Array.isArray(modalJob.matchedSkills) && modalJob.matchedSkills.length > 0 && (
              <div className="mb-1">
                <span className="font-semibold">Matched Skills:</span>
                <span className="ml-1 text-green-800 bg-green-100 px-2 py-1 rounded text-xs font-semibold" title={modalJob.matchedSkills.join(', ')}>
                  {modalJob.matchedSkills.join(', ')}
                </span>
              </div>
            )}
            {modalJob.resumePath && (
              <div className="mb-1"><a className="text-blue-600 underline" href={`http://localhost:5000/${encodeURI(modalJob.resumePath.replace(/^.*uploads[\\/]/, 'uploads/'))}`} target="_blank" rel="noopener noreferrer">View Resume</a></div>
            )}
            <button className="btn w-full mt-4" onClick={() => setShowJobModal(false)} autoFocus>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}