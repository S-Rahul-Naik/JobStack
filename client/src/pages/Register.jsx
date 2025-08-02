// src/pages/Register.jsx
import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'applicant' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      // Fetch full user profile after registration
      const profileRes = await api.get('/auth/profile');
      setUser({ ...profileRes.data, role: res.data.user.role, id: res.data.user._id });
      setMessage({ type: 'success', text: 'Registered successfully!' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
      
      // Handle specific error types
      if (err.response?.data?.msg?.includes('email')) {
        setErrors({ email: 'Email already exists' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join JobStack</h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                id="name"
                name="name" 
                placeholder="Enter your full name" 
                className={`input ${errors.name ? 'border-red-500 bg-red-50' : ''}`}
                onChange={handleChange} 
                disabled={loading}
                required 
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                id="email"
                name="email" 
                type="email"
                placeholder="Enter your email" 
                className={`input ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                onChange={handleChange} 
                disabled={loading}
                required 
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                id="password"
                name="password" 
                type="password" 
                placeholder="Create a strong password" 
                className={`input ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                onChange={handleChange} 
                disabled={loading}
                required 
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I want to
              </label>
              <select 
                id="role" 
                name="role" 
                className="input" 
                onChange={handleChange}
                disabled={loading}
                value={form.role}
              >
                <option value="applicant">🔍 Find Jobs (Job Seeker)</option>
                <option value="recruiter">🏢 Hire Talent (Recruiter)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Message Display */}
          {message.text && (
            <div className={`p-4 rounded-lg mt-6 text-sm ${
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
              'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
