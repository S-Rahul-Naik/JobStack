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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Login failed' });
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
      <div className="max-w-md mx-auto p-6 bg-white shadow-md mt-10 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" placeholder="Email" className="input" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} required />
          <button type="submit" className="btn">Login</button>
        </form>

        {message.text && (
          <div className={`p-3 rounded mt-4 text-sm ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 
            message.type === 'info' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </div>
        )}
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
