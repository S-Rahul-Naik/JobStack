import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    experience: '',
    skills: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const experienceOptions = user?.role === 'recruiter' ? [
    'New to Recruiting - Less than 1 year',
    '1-3 years - Junior Recruiter',
    '3-5 years - Experienced Recruiter',
    '5-10 years - Senior Recruiter',
    '10+ years - Recruiting Expert',
    'HR Professional - Multiple years in HR',
    'Talent Acquisition Specialist'
  ] : [
    'Student - Currently pursuing studies',
    '0 years - Fresh Graduate',
    '1-2 years - Junior Level',
    '2-4 years - Mid Level',
    '4-6 years - Senior Level',
    '6+ years - Expert Level',
    'Career Changer - New to this field'
  ];

  useEffect(() => {
    api.get('/auth/profile')
      .then(res => {
        setForm({ 
          name: res.data.name, 
          email: res.data.email, 
          password: '',
          experience: res.data.experience || '',
          skills: res.data.skills ? res.data.skills.join(', ') : ''
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const updateData = {
        name: form.name,
        email: form.email,
        experience: form.experience
      };
      
      if (form.password) updateData.password = form.password;
      if (form.skills) updateData.skills = form.skills.split(',').map(skill => skill.trim()).filter(skill => skill);

      const res = await api.put('/auth/profile', updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setUser(u => ({ 
        ...u, 
        name: res.data.user.name, 
        email: res.data.user.email, 
        role: res.data.user.role,
        experience: res.data.user.experience,
        skills: res.data.user.skills
      }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Update failed' });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 mt-8 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input 
            name="name" 
            className="input" 
            placeholder="Full Name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            name="email" 
            className="input" 
            type="email"
            placeholder="Email Address" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            name="password" 
            className="input" 
            type="password" 
            placeholder="New Password (leave blank to keep current)" 
            value={form.password} 
            onChange={handleChange} 
          />
        </div>

        {/* Experience Level */}
        {user?.role !== 'admin' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user?.role === 'recruiter' ? 'Recruiting Experience *' : 'Experience Level *'}
            </label>
            <select
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{user?.role === 'recruiter' ? 'Select your recruiting experience' : 'Select your experience level'}</option>
              {experienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Skills (for applicants) */}
        {user?.role === 'applicant' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input
              name="skills"
              type="text"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g., JavaScript, React, Node.js (comma separated)"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple skills with commas
            </p>
          </div>
        )}

        <button type="submit" className="btn w-full">Save Changes</button>
      </form>
      {message.text && (
        <div className={`p-3 rounded mt-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
