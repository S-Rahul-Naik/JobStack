import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <h1 className="text-xl font-bold">JobStack</h1>
      <div className="flex gap-4 items-center">
        {!user && (
          <>
            <Link to="/" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
        {user && user.role === 'applicant' && (
          <>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/upload-resume" className="hover:underline">Upload Resume</Link>
            <Link to="/my-applications" className="hover:underline">My Applications</Link>
            <Link to="/profile" className="hover:underline">Edit Profile</Link>
          </>
        )}
        {user && user.role === 'recruiter' && (
          <Link to="/recruiter" className="hover:underline">Recruiter Panel</Link>
        )}
        {user && user.role === 'admin' && (
          <Link to="/admin" className="hover:underline">Admin</Link>
        )}
        {user && (
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
        )}
      </div>
    </nav>
  );
}
