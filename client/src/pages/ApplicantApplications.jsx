import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ApplicantApplications() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' }); // ✅ Toast

  useEffect(() => {
    api.get('/applications/my')
      .then(res => setApplications(res.data))
      .catch(err => {
        console.error('Error fetching your applications', err);
        setMessage({
          type: 'error',
          text: 'Failed to load applications. Please try again.',
        });
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow rounded">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">My Applications</h2>

        {/* ✅ Toast */}
        {message.text && (
          <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {applications.length === 0 ? (
          <p>You haven't applied to any jobs yet.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((app, index) => (
              <li key={index} className="border p-4 rounded shadow">
                <p><strong>Job:</strong> {app.jobId.title}</p>
                <p><strong>Description:</strong> {app.jobId.description}</p>
                <p><strong>Status:</strong> {app.status}</p>
                <p><strong>Match Score:</strong> {app.matchScore}%</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
