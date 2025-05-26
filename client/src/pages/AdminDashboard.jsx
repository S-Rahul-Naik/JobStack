import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' }); // ✅ Toast

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => {
        setStats(res.data.stats);
        setUsers(res.data.users);
        setJobs(res.data.jobs);
      })
      .catch(err => {
        console.error('Failed to load admin data', err);
        setMessage({ type: 'error', text: 'Failed to load admin data' });
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow rounded">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

        {/* ✅ Toast Message */}
        {message.text && (
          <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded font-semibold">Total Users: {stats.totalUsers}</div>
          <div className="bg-green-100 p-4 rounded font-semibold">Total Jobs: {stats.totalJobs}</div>
          <div className="bg-yellow-100 p-4 rounded font-semibold">Total Applications: {stats.totalApplications}</div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Users</h3>
          <ul className="space-y-2">
            {users.map((u, i) => (
              <li key={i} className="border rounded p-2">
                <span className="font-medium">{u.name}</span> – {u.email} <span className="text-sm text-gray-600">({u.role})</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Jobs</h3>
          <ul className="space-y-2">
            {jobs.map((j, i) => (
              <li key={i} className="border rounded p-2">
                {j.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
