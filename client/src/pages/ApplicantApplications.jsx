import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const statusMap = {
  'applied': { label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  'under review': { label: 'Under review', color: 'bg-gray-100 text-gray-700' },
  'inactive': { label: 'Inactive', color: 'bg-gray-100 text-gray-500' },
  'rejected': { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  'shortlisted': { label: 'Shortlisted', color: 'bg-green-100 text-green-700' },
};

export default function ApplicantApplications() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [applicantsCount, setApplicantsCount] = useState({});
  const [loadingCounts, setLoadingCounts] = useState({});
  const [modalApp, setModalApp] = useState(null);
  const [modalType, setModalType] = useState('review'); // 'review' or 'missing'

  useEffect(() => {
    api.get('/applications/my')
      .then(res => setApplications(res.data))
      .catch(() => setMessage({ type: 'error', text: 'Failed to load applications. Please try again.' }));
  }, []);

  useEffect(() => {
    // Fetch applicants count for each jobId
    const fetchCounts = async () => {
      const jobsToFetch = applications
        .map(app => app.jobId?._id)
        .filter((id, idx, arr) => id && !(id in applicantsCount) && arr.indexOf(id) === idx);
      if (jobsToFetch.length === 0) return;
      const newLoading = { ...loadingCounts };
      jobsToFetch.forEach(id => { newLoading[id] = true; });
      setLoadingCounts(newLoading);
      for (const jobId of jobsToFetch) {
        try {
          const res = await api.get(`/jobs/${jobId}/applicants/count`);
          setApplicantsCount(prev => ({ ...prev, [jobId]: res.data.count }));
        } catch {
          setApplicantsCount(prev => ({ ...prev, [jobId]: 'N/A' }));
        } finally {
          setLoadingCounts(prev => ({ ...prev, [jobId]: false }));
        }
      }
    };
    if (applications.length > 0) fetchCounts();
    // eslint-disable-next-line
  }, [applications]);

  return (
    <div className="max-w-lg mx-auto p-2 pt-6">
      <h2 className="text-2xl font-bold text-center mb-4">My applications</h2>
      {message.text && (
        <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>
      )}
      {applications.length === 0 ? (
        <p className="text-center text-gray-500">You haven't applied to any jobs yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app, idx) => {
            const job = app.jobId || {};
            const company = job.companyName || job.company || job.title?.split(' ')[0] || 'Company';
            const status = (app.status || '').toLowerCase();
            const statusObj = statusMap[status] || statusMap['applied'];
            const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '';
            const count = applicantsCount[job._id];
            const isLoading = loadingCounts[job._id];
            return (
              <div key={idx} className="bg-white rounded-xl shadow border px-4 py-3 flex flex-col gap-1">
                <div className="font-semibold text-base text-gray-900 flex items-center gap-2">
                  {company}
                  <span className="ml-2 text-xs font-normal text-gray-500">{job.title}</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">{job.description}</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusObj.color}`}>{statusObj.label}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 00-8 0v3m12 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1" /></svg>
                    {isLoading ? <span className="animate-pulse">...</span> : (count !== undefined ? `${count} Applicants` : 'Applicants')}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500"><svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Applied on {appliedDate}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <button onClick={() => { setModalApp(app); setModalType('review'); }} className="text-blue-700 text-sm font-medium hover:underline">Review application</button>
                  <button onClick={() => { setModalApp(app); setModalType('missing'); }} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>Missing skill</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Modal for review/missing skills */}
      {modalApp && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[320px] max-w-[90vw] relative">
            <button className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-600" onClick={() => setModalApp(null)}>&times;</button>
            {modalType === 'review' ? (
              <>
                <h3 className="text-xl font-bold mb-2 text-blue-700">{modalApp.jobId?.title || 'Application Details'}</h3>
                <div className="mb-1 text-gray-700"><span className="font-semibold">Company:</span> {modalApp.jobId?.companyName || '-'}</div>
                <div className="mb-1 text-gray-700"><span className="font-semibold">Status:</span> {modalApp.status}</div>
                <div className="mb-1 text-gray-700"><span className="font-semibold">Match Score:</span> {modalApp.matchScore}%</div>
                <div className="mb-1 text-gray-700"><span className="font-semibold">Applied on:</span> {modalApp.createdAt ? new Date(modalApp.createdAt).toLocaleString() : '-'}</div>
                <div className="mb-1 text-gray-700"><span className="font-semibold">Description:</span> {modalApp.jobId?.description}</div>
                <div className="mb-1 text-gray-700"><span className="font-semibold">Missing Skills:</span> {modalApp.missingSkills && modalApp.missingSkills.length > 0 ? (
                  <span className="ml-1 text-yellow-800 bg-yellow-100 px-2 py-1 rounded text-xs font-semibold">{modalApp.missingSkills.join(', ')}</span>
                ) : <span className="ml-1 text-green-700">None 🎉</span>}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2 text-yellow-700 flex items-center gap-2"><svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>Missing Skills</h3>
                {modalApp.missingSkills && modalApp.missingSkills.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {modalApp.missingSkills.map((skill, i) => (
                      <span key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold shadow">{skill}</span>
                    ))}
                  </div>
                ) : <div className="text-green-700 font-semibold">No missing skills! 🎉</div>}
                <button className="mt-4 text-blue-700 underline text-sm font-medium" onClick={() => setModalType('review')}>View full application</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
