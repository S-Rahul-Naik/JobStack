import { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage({ type: 'success', text: 'If your email exists, a reset link has been sent.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.msg || 'Error sending reset link' });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-8 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn">Send Reset Link</button>
      </form>
      {message.text && (
        <div className={`p-3 rounded mt-4 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
