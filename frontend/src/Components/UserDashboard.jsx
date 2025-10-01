import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';

import ProfileView from '../User/ProfileView';

// Icons using lucide-react. The user must include the script tag for lucide-react in their HTML.
// This is a mock component since we're in a single file.
const Icon = ({ name, className = "" }) => {
  const icons = {
    Dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
    ),
    Home: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
    ),
    BookOpen: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    ),
    Calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ),
    Wallet: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M20 7v2a1 1 0 0 0 1 1h1"/><path d="M10 12h2a2 2 0 0 0 0-4H10v4Z"/><path d="M12 16h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2v4Z"/></svg>
    ),
    BarChart: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    ),
    User: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    Star: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    ),
    Menu: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
    ),
    Bell: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18.8 11.2a1 1 0 0 0-.8-.2H5.2c-.4 0-.8.2-1 .5l-2.4 2.1c-.8.7-.2 2.1.8 2.1h18c1 0 1.6-1.4.8-2.1L19 11.5c-.2-.3-.6-.5-.8-.3Z"/><path d="M13.2 21a2 2 0 0 1-2.4 0"/><path d="M12 2c-.1 0-.3.1-.3.2-.2.3-.2.8-.2 1.3V5c0 1.1-.9 2-2 2h-1c-.1 0-.2.1-.2.2V9a1 1 0 0 0 1 1h4c.6 0 1.2-.2 1.6-.7"/></svg>
    ),
    Search: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    ),
    Sun: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    ),
    Moon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    )
  };
  return icons[name] || null;
};



const DashboardView = ({ isDarkMode = false }) => (
  <div className="p-6 md:p-8 space-y-8">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Stat cards would go here with dark mode support
        <div key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-sm border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>{stat.title}</h3>
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              {stat.icon}
            </div>
          </div>
          <p className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.change}</p>
        </div> */}
    </div>

    {/* Upcoming Bookings Section */}
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-sm border transition-colors duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Upcoming Bookings</h2>
        <a href="#" className="text-blue-500 hover:underline text-sm font-medium">View All Bookings</a>
      </div>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Client</th>
              <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Service</th>
              <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Date & Time</th>
              <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Duration</th>
              <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Revenue</th>
              <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const BookingsView = ({ isDarkMode = false }) => (
  <div className="p-6 md:p-8">
    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Bookings</h2>
    <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This page would show a detailed list of all your bookings, both past and future.</p>
  </div>
);

const InvoicesView = ({ isDarkMode = false }) => (
  <div className="p-6 md:p-8">
    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Invoices</h2>
    <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This page would list all your generated invoices for services rendered.</p>
  </div>
);




const ReviewsView = ({ isDarkMode = false }) => (
  <div className="p-6 md:p-8">
    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Reviews & Complaints</h2>
    <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>This page would display client reviews and allow you to submit complaints.</p>
  </div>
);

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // ✅ Added user state
  const [loadingUser, setLoadingUser] = useState(true); // Optional: for loading state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('dashboardTheme');
    return savedTheme === 'dark';
  });
  const navigate = useNavigate();

  // Toggle theme and save preference
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('dashboardTheme', newTheme ? 'dark' : 'light');
  };

   // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data); // ✅ Save user data
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove auth token
    sessionStorage.removeItem("activeSession"); // Clear session flag
    navigate("/"); // Redirect to home page
  };

  const handleNavigation = (path) => {
    navigate(path);
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView isDarkMode={isDarkMode} />;
      case 'My Bookings':
        return <BookingsView isDarkMode={isDarkMode} />;
      case 'Invoices':
        return <InvoicesView isDarkMode={isDarkMode} />;
      case 'Profile':
        return <ProfileView isDarkMode={isDarkMode} />;
      case 'Reviews & Complaints':
        return <ReviewsView isDarkMode={isDarkMode} />;
      default:
        return <DashboardView isDarkMode={isDarkMode} />;
    }
  };

  const navItems = [
    { name: "Dashboard", icon: <Icon name="Dashboard" className="w-5 h-5" />, type: "tab" },
    { name: "My Bookings", icon: <Icon name="Calendar" className="w-5 h-5" />, type: "tab" },
    { name: "Invoices", icon: <Icon name="Wallet" className="w-5 h-5" />, type: "tab" },
    { name: "Profile", icon: <Icon name="User" className="w-5 h-5" />, type: "tab" },
    { name: "Reviews & Complaints", icon: <Icon name="Star" className="w-5 h-5" />, type: "tab" },
  ];

  const navbarItems = [
    { name: "Home", icon: <Icon name="Home" className="w-5 h-5" />, path: "/" },
    { name: "Book Studio", icon: <Icon name="BookOpen" className="w-5 h-5" />, path: "/booking" },
  ];

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen font-sans transition-colors duration-300`}>
      <div className="relative lg:flex">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 ${isDarkMode ? 'bg-gray-800' : 'bg-[#283149]'} text-white w-64 p-6 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-200 ease-in-out z-40`}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">StudioPro</h1>
            <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav>
            <ul>
              {navItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.type === "navigate") {
                        handleNavigation(item.path);
                      } else {
                        setActiveTab(item.name);
                      }
                      setIsSidebarOpen(false); // Close sidebar on selection
                    }}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 ${
                      item.type === "tab" && activeTab === item.name 
                        ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-[#3C4A6B] text-white')
                        : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-300 hover:bg-[#3C4A6B]')
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className={`flex items-center justify-between p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors duration-300`}>
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-md"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Icon name="Menu" className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                {navbarItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="hidden sm:inline font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors duration-200`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <Icon name={isDarkMode ? 'Sun' : 'Moon'} className="w-5 h-5" />
              </button>
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 rounded-full border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-colors duration-200`}
                />
                <Icon name="Search" />
              </div>
              <button className={`relative p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} transition-colors duration-200`}>
                <Icon name="Bell" className="w-6 h-6" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors duration-200`}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">U</div>
                  <span className="hidden md:inline">{loadingUser ? "Loading..." : user?.email}</span> 

                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>


               {isProfileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-xl z-50 py-2`}>
          
                    <a href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSignOut(); // ✅ Call signOut function
                        }}
                        className={`block px-4 py-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}>
                        Sign Out
                    </a>


                  </div>
                )}



              </div>
            </div>
          </header>

          <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen transition-colors duration-300`}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};


export default UserDashboard;