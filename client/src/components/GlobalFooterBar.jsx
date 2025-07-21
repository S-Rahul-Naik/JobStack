import { useLocation, useNavigate } from 'react-router-dom';

export default function GlobalFooterBar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Define footer nav items
  const items = [
    {
      label: 'Home',
      icon: (
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v6a2 2 0 002 2h4a2 2 0 002-2v-6m-6 0h6" /></svg>
      ),
      to: '/dashboard',
      match: ['/dashboard', '/'],
    },
    {
      label: 'Internships',
      icon: (
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      ),
      to: '/internships',
      match: ['/internships'],
    },
    {
      label: 'Jobs',
      icon: (
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h8a1 1 0 001-1v-2h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1z" /></svg>
      ),
      to: '/jobs',
      match: ['/jobs'],
    },
    {
      label: 'Courses',
      icon: (
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
      ),
      to: '/courses',
      match: ['/courses'],
      dot: true,
    },
  ];

  // Only show on small screens
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow z-50 flex md:hidden justify-around items-center py-1">
      {items.map((item) => {
        const isActive = item.match.some((m) => location.pathname === m);
        return (
          <button
            key={item.label}
            className={`flex-1 flex flex-col items-center justify-center py-1 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
            onClick={() => navigate(item.to)}
          >
            <div className="relative">
              {item.icon}
              {item.dot && <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>}
            </div>
            <span className="text-xs mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
