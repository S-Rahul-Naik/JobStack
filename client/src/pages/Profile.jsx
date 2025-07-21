import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        setForm({ name: res.data.name, email: res.data.email, password: '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', form);
      setMessage({ type: 'success', text: 'Profile updated!' });
      setUser(u => ({ ...u, name: res.data.user.name, email: res.data.user.email, role: res.data.user.role }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Update failed' });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-6 mt-8 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" className="input" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" className="input" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" className="input" type="password" placeholder="New Password (leave blank to keep)" value={form.password} onChange={handleChange} />
        <button type="submit" className="btn">Save Changes</button>
      </form>
      {message.text && (
        <div className={`p-3 rounded mt-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
