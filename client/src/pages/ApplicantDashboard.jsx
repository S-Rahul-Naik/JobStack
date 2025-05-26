import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ApplicantDashboard() {
  const [jobs, setJobs] = useState([]);
  const [resume, setResume] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({ country: '', jobType: '', postingDate: '' });
  const [showJobModal, setShowJobModal] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Failed to fetch jobs', err));
  }, []);

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setMessage({ type: 'success', text: 'Applied successfully!' });
      setSelectedJob(jobId);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to apply.' });
    }
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!resume || !selectedJob) {
      setMessage({ type: 'error', text: 'Select a job and a resume file' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobId', selectedJob);

    try {
      const res = await api.post('/resumes/upload', formData);
      setMatchScore(res.data.matchScore);
      setMessage({ type: 'success', text: 'Resume uploaded and matched successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Upload failed.' });
    }
  };

  // Filtering logic
  const filteredJobs = jobs.filter(job => {
    const countryMatch = !filters.country || (job.country && job.country.toLowerCase().includes(filters.country.toLowerCase()));
    const jobTypeMatch = !filters.jobType || (job.jobType && job.jobType === filters.jobType);
    let postingDateMatch = true;
    if (filters.postingDate) {
      const daysAgo = parseInt(filters.postingDate, 10);
      const postedDate = new Date(job.createdAt);
      const now = new Date();
      const diffDays = (now - postedDate) / (1000 * 60 * 60 * 24);
      postingDateMatch = diffDays <= daysAgo;
    }
    return countryMatch && jobTypeMatch && postingDateMatch;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow rounded">
      <h2 className="text-3xl font-bold mb-4">Available Jobs</h2>

      {/* ✅ Toast Feedback */}
      {message.text && (
        <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Country</label>
          <input
            className="input"
            placeholder="Country"
            value={filters.country}
            onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Job Type</label>
          <select
            className="input"
            value={filters.jobType}
            onChange={e => setFilters(f => ({ ...f, jobType: e.target.value }))}
          >
            <option value="">All</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Posted Within</label>
          <select
            className="input"
            value={filters.postingDate}
            onChange={e => setFilters(f => ({ ...f, postingDate: e.target.value }))}
          >
            <option value="">Any time</option>
            <option value="1">Last 1 day</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
        <button
          className="btn bg-gray-400 hover:bg-gray-600"
          onClick={() => setFilters({ country: '', jobType: '', postingDate: '' })}
          type="button"
        >
          Reset Filters
        </button>
      </div>

      <ul className="space-y-4">
        {filteredJobs.map(job => {
          const isClosed = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);
          return (
            <li key={job._id} className="border p-4 rounded shadow flex gap-4 items-center cursor-pointer hover:bg-blue-50 transition"
                onClick={() => { setModalJob(job); setShowJobModal(true); }}>
              {/* Company Logo */}
              {job.companyLogo && (
                <img src={job.companyLogo} alt="Logo" className="w-16 h-16 object-contain rounded bg-gray-100 mr-4" />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <div className="text-gray-700 font-medium mb-1">{job.companyName}</div>
                <div className="text-sm text-gray-500 mb-1">
                  {job.location && <span>{job.location}, </span>}
                  {job.country && <span>{job.country}</span>}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {job.salary && <span>💰 {job.salary} </span>}
                  {job.jobType && <span className="ml-2">🕒 {job.jobType}</span>}
                </div>
                <p className="mb-1">{job.description}</p>
                <p className="text-sm text-gray-500">Skills: {job.requiredSkills.join(', ')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="btn mt-0"
                    onClick={e => { e.stopPropagation(); handleApply(job._id); }}
                    disabled={isClosed}
                    style={isClosed ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    Apply to this job
                  </button>
                  {isClosed && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Closed</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Job Details Modal */}
      {showJobModal && modalJob && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] relative">
            <button className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-600" onClick={() => setShowJobModal(false)}>&times;</button>
            {modalJob.companyLogo && (
              <img src={modalJob.companyLogo} alt="Logo" className="w-20 h-20 object-contain rounded bg-gray-100 mb-2 mx-auto" />
            )}
            <h2 className="text-2xl font-bold mb-2 text-center">{modalJob.title}</h2>
            <div className="text-center text-gray-700 font-medium mb-1">{modalJob.companyName}</div>
            <div className="text-center text-gray-500 mb-1">
              {modalJob.location && <span>{modalJob.location}, </span>}
              {modalJob.country && <span>{modalJob.country}</span>}
            </div>
            <div className="text-center text-gray-500 mb-1">
              {modalJob.salary && <span>💰 {modalJob.salary} </span>}
              {modalJob.jobType && <span className="ml-2">🕒 {modalJob.jobType}</span>}
            </div>
            <div className="mb-2 text-gray-700"><span className="font-semibold">Description:</span> {modalJob.description}</div>
            <div className="mb-2 text-gray-700"><span className="font-semibold">Required Skills:</span> {modalJob.requiredSkills?.join(', ')}</div>
            <div className="mb-2 text-gray-700"><span className="font-semibold">Application Deadline:</span> {modalJob.applicationDeadline ? new Date(modalJob.applicationDeadline).toLocaleString() : 'N/A'}</div>
            <button className="btn w-full mt-4" onClick={() => setShowJobModal(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="mt-8 border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">Upload Resume for Match Score</h3>
        {/* Job selection dropdown for matching */}
        <label className="block mb-2 font-medium">Select Job to Match:</label>
        <select
          className="input mb-2"
          value={selectedJob || ''}
          onChange={e => setSelectedJob(e.target.value)}
        >
          <option value="" disabled>Select a job</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
        <input type="file" accept="application/pdf" onChange={handleResumeChange} />
        <button className="btn mt-2" onClick={handleUpload}>
          Upload and Match
        </button>
        {/* ✅ Match Score and Skills */}
        {matchScore !== null && (
          <div className="mt-4">
            <p className="font-bold text-green-600">Match Score: {matchScore}%</p>
            {Array.isArray(message.data?.matchedSkills) && message.data.matchedSkills.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold">Matched Skills:</span>
                <span className="ml-1 text-green-800 bg-green-100 px-2 py-1 rounded text-xs font-semibold">{message.data.matchedSkills.join(', ')}</span>
              </div>
            )}
            {Array.isArray(message.data?.missingSkills) && message.data.missingSkills.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold">Missing Skills:</span>
                <span className="ml-1 text-yellow-800 bg-yellow-100 px-2 py-1 rounded text-xs font-semibold">{message.data.missingSkills.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
