import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ApplicantHome({ user }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(() => setJobs([]));
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.clear(); // or use your auth logic
    navigate('/login');
  };

  const handleApply = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      setAppliedJobIds((prev) => [...prev, jobId]);
      setMessage("Applied successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Failed to apply.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen w-full flex flex-col gap-4 pb-24 sm:gap-5">
      {/* Greeting */}
      <div className="px-2 pt-3 sm:px-4 sm:pt-4 w-full">
        <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">Hi, {user?.name || 'Applicant'}! <span className="text-lg sm:text-2xl">👋</span></h1>
        <p className="text-gray-600 text-xs sm:text-base mt-1">Let’s help you land your dream career</p>
      </div>
      {/* To do list */}
      <div className="bg-white rounded-xl shadow px-2 py-3 mx-1 sm:px-4 sm:py-4 sm:mx-2 w-full">
        <h2 className="text-base sm:text-lg font-semibold mb-2">To do list <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">1</span></h2>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-500 text-base sm:text-lg">📝</span>
          <span className="font-medium text-sm sm:text-base">Improve your resume</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mb-2">3 suggestions for you</p>
        <button className="text-blue-600 text-xs sm:text-sm hover:underline" onClick={() => navigate('/resume-tips')}>View suggestions</button>
      </div>
      {/* Trending carousel */}
      <div className="bg-white rounded-xl shadow px-2 py-3 mx-1 sm:px-4 sm:py-4 sm:mx-2 w-full">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-1">Trending on Jobstack <span className="text-orange-500">🔥</span></h2>
        <div className="flex overflow-x-auto gap-2 sm:gap-4 pb-2 hide-scrollbar">
          <div className="min-w-[160px] sm:min-w-[220px] bg-blue-100 rounded-lg p-2 sm:p-4 flex-shrink-0">
            <div className="text-xs font-bold text-blue-700 mb-1">Certification courses</div>
            <div className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Master the in-demand skills!</div>
            <p className="text-xs text-blue-800 mb-2">Get certified and level-up your resume.</p>
            <button className="bg-yellow-400 text-blue-900 font-bold px-2 py-1 sm:px-3 rounded text-xs sm:text-sm">Know more</button>
          </div>
          <div className="min-w-[160px] sm:min-w-[220px] bg-cyan-100 rounded-lg p-2 sm:p-4 flex-shrink-0">
            <div className="text-xs font-bold text-cyan-700 mb-1">Certification courses</div>
            <div className="font-semibold text-cyan-900 mb-2 text-sm sm:text-base">Special offer for students</div>
            <p className="text-xs text-cyan-800 mb-2">Flat 80% OFF on all online trainings.</p>
            <button className="bg-blue-400 text-white font-bold px-2 py-1 sm:px-3 rounded text-xs sm:text-sm">Know more</button>
          </div>
          <div className="min-w-[160px] sm:min-w-[220px] bg-indigo-100 rounded-lg p-2 sm:p-4 flex-shrink-0">
            <div className="text-xs font-bold text-indigo-700 mb-1">Jobs</div>
            <div className="font-semibold text-indigo-900 mb-2 text-sm sm:text-base">Find a Job in Your City!</div>
            <p className="text-xs text-indigo-800 mb-2">25,000+ Freshers Jobs, 800+ Cities</p>
            <button className="bg-orange-500 text-white font-bold px-2 py-1 sm:px-3 rounded text-xs sm:text-sm">Participate now</button>
          </div>
        </div>
        <div className="flex justify-center gap-1 sm:gap-2 mt-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full inline-block"></span>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-300 rounded-full inline-block"></span>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-300 rounded-full inline-block"></span>
        </div>
      </div>
      {/* Recommended for you */}
      <div className="px-2 sm:px-4 w-full">
        <h2 className="text-base sm:text-lg font-semibold mb-2">Recommended for you <span className="text-xs sm:text-sm text-gray-500 font-normal">as per your <button className="text-blue-600 hover:underline" onClick={() => navigate('/preferences')}>preferences</button></span></h2>
        <div className="flex flex-col gap-2 sm:gap-3">
          {jobs.length === 0 && (
            <div className="text-gray-500 text-xs sm:text-sm">No jobs available at the moment.</div>
          )}
          {jobs.map((job, idx) => (
            <div key={job._id || idx} className="bg-white rounded-lg shadow p-2 sm:p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm sm:text-base">{job.title}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{job.jobType}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-700 mb-1">{job.companyName} • {job.location || job.country}</div>
              {job.salary && <div className="text-xs text-gray-500 mb-1">💰 {job.salary}</div>}
              <div className="text-xs text-gray-500 mb-2">Skills: {Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : ''}</div>
              <button
                className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => handleApply(job._id)}
                disabled={appliedJobIds.includes(job._id)}
              >
                {appliedJobIds.includes(job._id) ? "Applied" : "Apply"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Feedback message */}
      {message && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow z-50 text-xs sm:text-sm">{message}</div>
      )}
    </div>
  );
}
