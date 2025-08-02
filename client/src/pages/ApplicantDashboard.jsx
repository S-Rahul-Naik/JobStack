import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import ApplicantHome from './ApplicantHome';

export default function ApplicantDashboard() {
  const [jobs, setJobs] = useState([]);
  const [resume, setResume] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({ country: '', jobType: '', postingDate: '' });
  const [showJobModal, setShowJobModal] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const [user, setUser] = useState({ name: 'Applicant', email: '' });
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [jobsRes, userRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/auth/me').catch(() => ({ data: { name: 'Applicant', email: '' } }))
        ]);
        setJobs(jobsRes.data);
        setUser(userRes.data);
      } catch (err) {
        console.error('Failed to fetch initial data', err);
        setMessage({ type: 'error', text: 'Failed to load dashboard data' });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!jobsLoading) {
        setJobsLoading(true);
        try {
          const res = await api.get('/jobs');
          setJobs(res.data);
        } catch (err) {
          console.error('Failed to refresh jobs', err);
        } finally {
          setJobsLoading(false);
        }
      }
    }, 30000); // Refresh every 30 seconds instead of 10

    return () => clearInterval(interval);
  }, [jobsLoading]);

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
    
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobId', selectedJob);
    
    try {
      const res = await api.post('/resumes/upload', formData);
      setMatchScore(res.data.matchScore);
      setMessage({ type: 'success', text: 'Resume uploaded and matched successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Upload failed.' });
    } finally {
      setUploadLoading(false);
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

  // --- UI/UX Redesign ---
  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Mobile: show only ApplicantHome */}
      <div className="block lg:hidden">
        <ApplicantHome user={user} />
      </div>
      {/* Desktop: show full dashboard */}
      <div className="hidden lg:block">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">Hi, {user.name || 'Applicant'}! <span className="text-2xl">👋</span></h1>
            <p className="text-gray-600 mt-1">Let’s help you land your dream career</p>
          </div>
          {/* Responsive grid: To do, Trending, Recommended */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* To do list */}
            <div className="bg-white rounded-xl shadow p-4 mb-4 lg:mb-0">
              <h2 className="text-lg font-semibold mb-2">To do list <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">1</span></h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500">📝</span>
                <span className="font-medium">Improve your resume</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">3 suggestions for you</p>
              <button className="text-blue-600 text-sm hover:underline" onClick={() => navigate('/resume-tips')}>View suggestions</button>
            </div>
            {/* Trending carousel */}
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-1">Trending on Jobstack <span className="text-orange-500">🔥</span></h2>
                {/* Carousel placeholder */}
                <div className="flex overflow-x-auto gap-4 pb-2">
                  <div className="min-w-[220px] bg-blue-100 rounded-lg p-4 flex-shrink-0">
                    <div className="text-xs font-bold text-blue-700 mb-1">Certification courses</div>
                    <div className="font-semibold text-blue-900 mb-2">Master the in-demand skills!</div>
                    <p className="text-xs text-blue-800 mb-2">Get certified and level-up your resume.</p>
                    <button className="bg-yellow-400 text-blue-900 font-bold px-3 py-1 rounded">Know more</button>
                  </div>
                  <div className="min-w-[220px] bg-cyan-100 rounded-lg p-4 flex-shrink-0">
                    <div className="text-xs font-bold text-cyan-700 mb-1">Certification courses</div>
                    <div className="font-semibold text-cyan-900 mb-2">Special offer for students</div>
                    <p className="text-xs text-cyan-800 mb-2">Flat 80% OFF on all online trainings.</p>
                    <button className="bg-blue-400 text-white font-bold px-3 py-1 rounded">Know more</button>
                  </div>
                  <div className="min-w-[220px] bg-indigo-100 rounded-lg p-4 flex-shrink-0">
                    <div className="text-xs font-bold text-indigo-700 mb-1">Jobs</div>
                    <div className="font-semibold text-indigo-900 mb-2">Find a Job in Your City!</div>
                    <p className="text-xs text-indigo-800 mb-2">25,000+ Freshers Jobs, 800+ Cities</p>
                    <button className="bg-orange-500 text-white font-bold px-3 py-1 rounded">Participate now</button>
                  </div>
                </div>
                {/* Carousel dots */}
                <div className="flex justify-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full inline-block"></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full inline-block"></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full inline-block"></span>
                </div>
              </div>
            </div>
          </div>
          {/* Recommended for you */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">
                Recommended for you 
                <span className="text-sm text-gray-500 font-normal ml-2">
                  as per your <button className="text-blue-600 hover:underline" onClick={() => navigate('/preferences')}>preferences</button>
                </span>
              </h2>
              {jobsLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing jobs...
                </div>
              )}
            </div>
            {/* Filter Controls (collapsible on mobile) */}
            <div className="mb-4 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium">Country</label>
                <input
                  className="input"
                  placeholder="Country"
                  value={filters.country}
                  onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Job Type</label>
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
                <label className="block text-xs font-medium">Posted Within</label>
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
            {/* Job cards */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map(job => {
                const isClosed = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);
                return (
                  <li key={job._id} className="bg-white border p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col cursor-pointer" onClick={() => { setModalJob(job); setShowJobModal(true); }}>
                    {job.companyLogo && (
                      <img src={job.companyLogo} alt="Logo" className="w-12 h-12 object-contain rounded bg-gray-100 mb-2" />
                    )}
                    <h3 className="text-base font-semibold mb-1">{job.title}</h3>
                    <div className="text-gray-700 font-medium text-sm mb-1">{job.companyName}</div>
                    <div className="text-xs text-gray-500 mb-1">
                      {job.location && <span>{job.location}, </span>}
                      {job.country && <span>{job.country}</span>}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {job.salary && <span>💰 {job.salary} </span>}
                      {job.jobType && <span className="ml-2">🕒 {job.jobType}</span>}
                    </div>
                    <p className="text-xs mb-1 line-clamp-2">{job.description}</p>
                    <p className="text-xs text-gray-500 mb-2">Skills: {job.requiredSkills.join(', ')}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        className="btn mt-0 text-xs px-2 py-1"
                        onClick={e => { e.stopPropagation(); handleApply(job._id); }}
                        disabled={isClosed}
                        style={isClosed ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                      >
                        Apply
                      </button>
                      {isClosed && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Closed</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
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
          {/* Resume Match Section */}
          <div className="mt-10 bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Upload Resume for Match Score</h3>
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
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleResumeChange}
              disabled={uploadLoading}
              className="mb-2"
            />
            <button 
              className="btn mt-2 flex items-center justify-center"
              onClick={handleUpload}
              disabled={uploadLoading || !resume || !selectedJob}
            >
              {uploadLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Resume...
                </>
              ) : (
                'Upload and Match'
              )}
            </button>
            {matchScore !== null && (
              <div className="mt-4">
                <p className="font-bold text-green-600">Match Score: {matchScore}%</p>
              </div>
            )}
          </div>
          {/* Toast Feedback */}
          {message.text && (
            <div className={`fixed bottom-4 right-4 z-50 p-3 rounded text-sm shadow-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
