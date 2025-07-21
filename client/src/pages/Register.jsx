// src/pages/Register.jsx
import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'applicant' });
  const [message, setMessage] = useState({ type: '', text: '' }); // ✅ Toast state

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      // Fetch full user profile after registration
      const profileRes = await api.get('/auth/profile');
      setUser({ ...profileRes.data, role: res.data.user.role, id: res.data.user._id });
      setMessage({ type: 'success', text: 'Registered successfully!' }); // ✅ Show success
      setTimeout(() => navigate('/dashboard'), 1000); // ✅ Delay before redirect
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Registration failed' }); // ✅ Show error
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow rounded">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Name" className="input" onChange={handleChange} required />
          <input name="email" placeholder="Email" className="input" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} required />
          <select name="role" className="input" onChange={handleChange}>
            <option value="applicant">Applicant</option>
            <option value="recruiter">Recruiter</option>
          </select>
          <button type="submit" className="btn">Register</button>
        </form>

        {/* ✅ Message Display */}
        {message.text && (
          <div className={`p-3 rounded mt-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
