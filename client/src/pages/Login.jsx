import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ import useAuth
import { jwtDecode } from 'jwt-decode'; // ✅ import jwtDecode
import ProfileCompletionModal from '../components/ProfileCompletionModal';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ✅ get setUser from context

  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field-specific errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
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
      const res = await api.post('/auth/login', form);
      const token = res.data.token;

      localStorage.setItem('token', token);

      // Fetch full user profile after login
      const profileRes = await api.get('/auth/profile');
      const fullUser = { ...profileRes.data, role: res.data.user.role, id: res.data.user._id };
      setUser(fullUser);

      // Check if profile completion is needed
      if (res.data.needsProfileUpdate) {
        setLoginData({ user: fullUser, role: res.data.user.role });
        setShowProfileModal(true);
        setMessage({ type: 'info', text: res.data.message });
      } else {
        setMessage({ type: 'success', text: 'Login successful!' });
        setTimeout(() => {
          const role = res.data.user.role;
          navigate(role === 'recruiter' ? '/recruiter' : role === 'admin' ? '/admin' : '/dashboard');
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Login failed. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
      
      // Handle specific error types
      if (err.response?.status === 401) {
        setErrors({ password: 'Invalid email or password' });
      } else if (err.response?.status === 404) {
        setErrors({ email: 'No account found with this email' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update user context with new profile data
      const updatedUser = { ...loginData.user, ...res.data.user };
      setUser(updatedUser);
      
      setTimeout(() => {
        const role = loginData.role;
        navigate(role === 'recruiter' ? '/recruiter' : role === 'admin' ? '/admin' : '/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleSkipProfile = () => {
    setShowProfileModal(false);
    setMessage({ type: 'success', text: 'Login successful!' });
    setTimeout(() => {
      const role = loginData.role;
      navigate(role === 'recruiter' ? '/recruiter' : role === 'admin' ? '/admin' : '/dashboard');
    }, 1000);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white shadow-xl rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your JobStack account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password" 
                  className={`input ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                  onChange={handleChange} 
                  disabled={loading}
                  required 
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg mt-6 text-sm ${
                message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
                message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up here
                </a>
              </p>
              <p className="text-sm">
                <a href="/forgot-password" className="text-gray-500 hover:text-gray-700">
                  Forgot your password?
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={handleSkipProfile}
        onSubmit={handleProfileUpdate}
        userRole={loginData?.role}
      />
    </>
  );
}
