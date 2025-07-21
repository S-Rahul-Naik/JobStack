import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation links for reuse
  const navLinks = (
    <>
      {user && user.role === 'applicant' && (
        <>
          <Link to="/dashboard" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>Dashboard</Link>
          <Link to="/upload-resume" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>Upload Resume</Link>
          <Link to="/my-applications" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>My Applications</Link>
          <Link to="/profile" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>Edit Profile</Link>
        </>
      )}
      {user && user.role === 'recruiter' && (
        <Link to="/recruiter" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>Recruiter Panel</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/admin" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>Admin</Link>
      )}
      {!user && (
        <>
          <Link to="/" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>Login</Link>
          <Link to="/register" className="block md:inline text-white font-semibold hover:underline focus:outline-none py-2 md:py-0" onClick={() => setSideOpen(false)}>Register</Link>
        </>
      )}
    </>
  );

  return (
    <div className="w-full bg-blue-700 shadow-lg rounded-t-2xl sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <span className="text-white font-bold text-2xl tracking-wide">JobStack</span>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 md:gap-8">
          {navLinks}
        </nav>
        {/* Desktop logout */}
        {user && (
          <button
            onClick={handleLogout}
            className="hidden md:inline bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg shadow focus:outline-none transition-all border-2 border-white ml-4"
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
          >
            Logout
          </button>
        )}
        {/* Hamburger for mobile/tablet */}
        <button
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 focus:outline-none"
          onClick={() => setSideOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-7 h-1 bg-white rounded mb-1"></span>
          <span className="block w-7 h-1 bg-white rounded mb-1"></span>
          <span className="block w-7 h-1 bg-white rounded"></span>
        </button>
      </div>
      {/* Side menu overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex">
          <div className="w-72 bg-white h-full shadow-lg flex flex-col relative animate-slideInLeft overflow-y-auto">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setSideOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
            {/* User Profile Section */}
            <div className="pt-8 pb-4 px-6 border-b">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold text-blue-700">
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <div className="font-bold text-lg leading-tight" style={{ color: '#111', minWidth: '120px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || ''}</div>
                  <div className="text-xs text-gray-500">{user?.email || ''}</div>
                </div>
                {/* Rating badge (optional) */}
                <div className="ml-auto flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-yellow-400 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                  4.1
                </div>
              </div>
              {/* Quick access icons */}
              <div className="flex justify-between mt-4 mb-2">
                <button onClick={() => { setSideOpen(false); navigate('/preferences'); }} className="flex flex-col items-center text-xs text-gray-700">
                  <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </span>
                  Preferences
                </button>
                <button onClick={() => { setSideOpen(false); navigate('/upload-resume'); }} className="flex flex-col items-center text-xs text-gray-700">
                  <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </span>
                  Resume
                </button>
                <button onClick={() => { setSideOpen(false); navigate('/my-applications'); }} className="flex flex-col items-center text-xs text-gray-700">
                  <span className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mb-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
                  </span>
                  Applications
                </button>
              </div>
            </div>
            {/* Main navigation links (restored) */}
            <div className="px-6 pt-4 pb-2 border-b">
              <nav className="flex flex-col gap-2">
                {user && user.role === 'applicant' && (
                  <>
                    <button onClick={() => { setSideOpen(false); navigate('/dashboard'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">Dashboard</button>
                    <button onClick={() => { setSideOpen(false); navigate('/upload-resume'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">Upload Resume</button>
                    <button onClick={() => { setSideOpen(false); navigate('/my-applications'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">My Applications</button>
                    <button onClick={() => { setSideOpen(false); navigate('/profile'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">Edit Profile</button>
                  </>
                )}
                {user && user.role === 'recruiter' && (
                  <button onClick={() => { setSideOpen(false); navigate('/recruiter'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">Recruiter Panel</button>
                )}
                {user && user.role === 'admin' && (
                  <button onClick={() => { setSideOpen(false); navigate('/admin'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">Admin</button>
                )}
                {!user && (
                  <>
                    <button onClick={() => { setSideOpen(false); navigate('/'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">Login</button>
                    <button onClick={() => { setSideOpen(false); navigate('/register'); }} className="text-blue-900 font-semibold text-base text-left py-2 hover:underline">Register</button>
                  </>
                )}
              </nav>
            </div>
            {/* Explore section */}
            <div className="px-6 pt-4">
              <div className="text-xs text-gray-500 font-semibold mb-2">EXPLORE</div>
              <button onClick={() => { setSideOpen(false); navigate('/internships'); }} className="flex items-center gap-3 py-2 w-full text-gray-800 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                Internships
              </button>
              <button onClick={() => { setSideOpen(false); navigate('/jobs'); }} className="flex items-center gap-3 py-2 w-full text-gray-800 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h8a1 1 0 001-1v-2h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1z" /></svg>
                Jobs
              </button>
            </div>
            {/* Help & Support section */}
            <div className="px-6 pt-6 pb-4">
              <div className="text-xs text-gray-500 font-semibold mb-2">HELP & SUPPORT</div>
              <button onClick={() => { setSideOpen(false); navigate('/help'); }} className="flex items-center gap-3 py-2 w-full text-gray-800 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M16 10h.01M12 10v.01M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>
                Help Center
              </button>
              <button onClick={() => { setSideOpen(false); navigate('/complaint'); }} className="flex items-center gap-3 py-2 w-full text-gray-800 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414A7 7 0 1116.95 7.05l1.414-1.414z" /></svg>
                Report a Complaint
              </button>
              <button onClick={() => { setSideOpen(false); navigate('/more'); }} className="flex items-center gap-3 py-2 w-full text-gray-800 hover:bg-gray-100 rounded">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                More
              </button>
            </div>
            {/* Logout at bottom */}
            {user && (
              <button
                onClick={() => { setSideOpen(false); handleLogout(); }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg shadow focus:outline-none transition-all border-2 border-white m-6 mt-auto"
                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
              >
                Logout
              </button>
            )}
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setSideOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
