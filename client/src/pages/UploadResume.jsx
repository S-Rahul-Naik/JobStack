import { useEffect, useState } from 'react';
import api from '../services/api';

export default function UploadResume() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [resume, setResume] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' }); // ✅ Toast

  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error('Failed to load jobs', err));
  }, []);

  const handleUpload = async () => {
    if (!selectedJob || !resume) {
      setMessage({ type: 'error', text: 'Please select a job and upload a resume.' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobId', selectedJob);

    try {
      const res = await api.post('/resumes/upload', formData);
      setMatchScore(res.data.matchScore);
      setMatchedSkills(res.data.matchedSkills || []);
      setMissingSkills(res.data.missingSkills || []);
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.msg || 'Upload failed',
      });
      setMatchScore(null);
      setMatchedSkills([]);
      setMissingSkills([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow rounded">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Upload Resume for Matching</h2>

        <select
          className="input mb-4"
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
        >
          <option value="">-- Select a Job --</option>
          {jobs.map(job => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResume(e.target.files[0])}
          className="mb-4 block"
        />

        <button className="btn" onClick={handleUpload}>
          Upload & Match
        </button>

        {/* ✅ Toast Message */}
        {message.text && (
          <div className={`p-3 rounded mt-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {/* ✅ Match Score */}
        {matchScore !== null && (
          <div className="mt-4">
            <p className="font-bold text-green-600">Match Score: {matchScore}%</p>
            {matchedSkills.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold">Matched Skills:</span>
                <span className="ml-1 text-green-800 bg-green-100 px-2 py-1 rounded text-xs font-semibold">{matchedSkills.join(', ')}</span>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold">Missing Skills:</span>
                <span className="ml-1 text-yellow-800 bg-yellow-100 px-2 py-1 rounded text-xs font-semibold">{missingSkills.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
