import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUsers, FaListAlt, FaProjectDiagram, FaComments, FaTimes, FaUserShield, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const regularCards = [
    { 
      name: "Clients", 
      path: "/clients", 
      icon: <FaUsers className="text-blue-600" />,
      bgGradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      hoverBg: "hover:from-blue-100 hover:to-blue-200"
    },
    { 
      name: "Consultations", 
      path: "/consultations", 
      icon: <FaComments className="text-pink-600" />,
      bgGradient: "from-pink-50 to-pink-100",
      borderColor: "border-pink-200",
      hoverBg: "hover:from-pink-100 hover:to-pink-200"
    },
    { 
      name: "Categories", 
      path: "/categories", 
      icon: <FaListAlt className="text-green-600" />,
      bgGradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      hoverBg: "hover:from-green-100 hover:to-green-200"
    },
    { 
      name: "Sub-Categories", 
      path: "/sub-categories", 
      icon: <FaProjectDiagram className="text-purple-600" />,
      bgGradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      hoverBg: "hover:from-purple-100 hover:to-purple-200"
    },
  ];

  const adminCards = [
    { 
      name: "User Management", 
      path: "/admin/users", 
      icon: <FaUserShield className="text-red-600" />,
      bgGradient: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      hoverBg: "hover:from-red-100 hover:to-red-200"
    },
  ];

  const cards = user?.role === 'admin' ? [...regularCards, ...adminCards] : regularCards;

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTithi = () => {
    const tithis = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
      'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya/Purnima'
    ];
    const dayOfMonth = currentTime.getDate();
    return tithis[dayOfMonth % 15];
  };

  // Show approval status for non-admin users
  const showApprovalStatus = user?.role !== 'admin' && (!user?.isApproved || user?.status !== 'approved');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-25 to-yellow-25">
      {/* Approval Status Warning */}
      {showApprovalStatus && (
        <div className={`${
          user?.status === 'rejected' 
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        } border-l-4 p-4 mb-4 mx-4 mt-4 rounded-r-lg`}>
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 mr-3" />
            <div>
              <h4 className="font-semibold">
                {user?.status === 'rejected' ? 'Account Rejected' : 'Account Pending Approval'}
              </h4>
              <p className="text-sm mt-1">
                {user?.status === 'rejected' 
                  ? 'Your account has been rejected. Please contact support for assistance.'
                  : 'Your account is pending admin approval. Some features may be limited until approved.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-orange-100 via-yellow-50 to-orange-100 text-orange-800 px-4 py-3 shadow-lg border-b border-orange-200 flex justify-between items-center sticky top-0 z-50">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-200"
        >
          <div className="w-5 h-5 flex flex-col justify-center">
            <div className={`h-0.5 w-5 bg-white transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
            <div className={`h-0.5 w-5 bg-white my-1 transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
            <div className={`h-0.5 w-5 bg-white transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
          </div>
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            AstroConsult
          </h1>
          {user?.role === 'admin' && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
              Admin
            </span>
          )}
        </div>

        <button
          onClick={logout}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md font-semibold text-white text-sm"
        >
          Logout
        </button>
      </div>

      <div className="flex relative lg:h-screen">
        {/* Left Sidebar - Mechanical Watch */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed left-0 top-0 h-full z-40 w-64 sm:w-72 lg:w-80 xl:w-72 bg-gradient-to-b from-orange-50 via-yellow-25 to-orange-75 flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ease-in-out border-r border-orange-150`}>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <FaTimes size={20} />
          </button>

          <div className="relative mb-6 lg:mb-8">
            {/* Watch Frame */}
            <div className="w-40 sm:w-48 lg:w-52 h-40 sm:h-48 lg:h-52 rounded-full border-4 sm:border-6 lg:border-8 border-orange-300 bg-gradient-to-br from-white to-orange-50 shadow-2xl flex items-center justify-center relative">
              {/* Watch Face */}
              <div className="w-32 sm:w-40 lg:w-44 h-32 sm:h-40 lg:h-44 rounded-full bg-white border-2 border-orange-200 relative flex items-center justify-center shadow-inner">
                {/* Hour Markers */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 sm:w-1 h-4 sm:h-5 lg:h-6 bg-orange-600"
                    style={{
                      transform: `rotate(${i * 30}deg) translateY(-${isMobile ? '14' : '18'}px)`,
                      transformOrigin: `center ${isMobile ? '14' : '18'}px`
                    }}
                  />
                ))}
                
                {/* Hour Numbers */}
                {[12, 3, 6, 9].map((num, i) => (
                  <div
                    key={num}
                    className="absolute text-sm sm:text-base lg:text-lg font-bold text-orange-800"
                    style={{
                      transform: `translate(${[0, isMobile ? 38 : 48, 0, isMobile ? -38 : -48][i]}px, ${[isMobile ? -45 : -55, 0, isMobile ? 38 : 48, 0][i]}px)`
                    }}
                  >
                    {num}
                  </div>
                ))}

                {/* Hour Hand */}
                <div
                  className="absolute w-0.5 sm:w-1 bg-orange-700 rounded origin-bottom z-20"
                  style={{
                    height: isMobile ? '22px' : '28px',
                    transform: `rotate(${(currentTime.getHours() % 12) * 30 + currentTime.getMinutes() * 0.5}deg) translateY(-${isMobile ? '11' : '14'}px)`,
                    transformOrigin: 'center bottom'
                  }}
                />

                {/* Minute Hand */}
                <div
                  className="absolute w-0.5 bg-orange-600 rounded origin-bottom z-30"
                  style={{
                    height: isMobile ? '28px' : '36px',
                    transform: `rotate(${currentTime.getMinutes() * 6}deg) translateY(-${isMobile ? '14' : '18'}px)`,
                    transformOrigin: 'center bottom'
                  }}
                />

                {/* Second Hand */}
                <div
                  className="absolute w-0.5 bg-red-500 rounded origin-bottom z-40"
                  style={{
                    height: isMobile ? '30px' : '38px',
                    transform: `rotate(${currentTime.getSeconds() * 6}deg) translateY(-${isMobile ? '15' : '19'}px)`,
                    transformOrigin: 'center bottom'
                  }}
                />

                {/* Center Dot */}
                <div className="absolute w-2 sm:w-3 h-2 sm:h-3 bg-orange-800 rounded-full z-50" />
              </div>
            </div>
          </div>
          
          {/* Digital Time Display */}
          <div className="text-center px-4">
            <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold tracking-wider text-orange-800 bg-white bg-opacity-80 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg border border-orange-200">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-80 xl:ml-72 lg:mr-64 2xl:mr-72">
          {/* Desktop Navbar */}
          <nav className="hidden lg:flex justify-between items-center bg-gradient-to-r from-orange-100 via-yellow-50 to-orange-100 text-orange-800 px-6 py-5 shadow-lg border-b border-orange-200">
            <div className="flex flex-col">
              <h1 className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                AstroConsult
              </h1>
              {user?.role === 'admin' && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold self-start mt-1">
                  Admin Panel
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-orange-800">{user?.name}</div>
                <div className="text-xs text-orange-600">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg font-semibold text-white hover:shadow-xl transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </nav>

          {/* Cards Section */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8 pb-20 lg:pb-8">
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl ${
              user?.role === 'admin' ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-2 xl:grid-cols-2'
            }`}>
              {cards.map((card) => (
                <div
                  key={card.name}
                  onClick={() => navigate(card.path)}
                  className={`w-full aspect-square flex flex-col items-center justify-center gap-3 lg:gap-4 bg-gradient-to-br ${card.bgGradient} ${card.hoverBg} rounded-2xl lg:rounded-3xl border-2 ${card.borderColor} cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 relative overflow-hidden group active:scale-95 touch-manipulation`}
                  style={{ minHeight: '150px' }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="w-full h-full bg-gradient-to-br from-transparent via-white to-transparent"></div>
                  </div>
                  
                  {/* Icon */}
                  <div className="relative z-10 p-3 lg:p-4 rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow">
                    {React.cloneElement(card.icon, { 
                      size: isMobile ? 24 : window.innerWidth >= 1280 ? 36 : 32,
                      className: card.icon.props.className 
                    })}
                  </div>
                  
                  {/* Text */}
                  <span className="relative z-10 font-bold text-sm sm:text-base lg:text-lg text-gray-700 group-hover:text-gray-800 transition-colors px-2 text-center">
                    {card.name}
                  </span>
                </div>
              ))}
            </div>
          </main>
        </div>
        
        {/* Right Sidebar - Calendar (Desktop Only) */}
        <div className="hidden xl:flex fixed right-0 top-0 h-full w-64 2xl:w-72 bg-gradient-to-b from-orange-50 via-yellow-25 to-orange-75 flex-col items-center justify-center shadow-2xl border-l border-orange-150 p-4 2xl:p-6">
          {/* Calendar */}
          <div className="w-full bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden mb-6">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
              <h3 className="text-lg 2xl:text-xl font-bold text-center">
                {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            
            {/* Days of Week */}
            <div className="grid grid-cols-7 bg-orange-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 2xl:p-3 text-center text-xs 2xl:text-sm font-semibold text-orange-700 border-r border-orange-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {(() => {
                const today = new Date(currentTime);
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const startingDayOfWeek = firstDay.getDay();
                const daysInMonth = lastDay.getDate();
                
                const days = [];
                
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(
                    <div key={`empty-${i}`} className="h-10 2xl:h-12 border-r border-b border-orange-100"></div>
                  );
                }
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const isToday = day === today.getDate();
                  days.push(
                    <div
                      key={day}
                      className={`h-10 2xl:h-12 flex items-center justify-center font-medium border-r border-b border-orange-100 last:border-r-0 transition-colors text-sm ${
                        isToday 
                          ? 'bg-orange-500 text-white font-bold shadow-md' 
                          : 'hover:bg-orange-50 text-gray-700'
                      }`}
                    >
                      {day}
                    </div>
                  );
                }
                
                return days;
              })()}
            </div>
          </div>
          
          <div className="w-full space-y-4">
            {/* Current Date Display */}
            <div className="bg-white bg-opacity-90 rounded-xl p-3 2xl:p-4 shadow-lg border border-orange-200">
              <div className="text-xs 2xl:text-sm font-semibold text-orange-600 mb-2">Today</div>
              <div className="text-xs 2xl:text-sm font-medium text-orange-800 leading-relaxed">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Tithi */}
            <div className="bg-white bg-opacity-90 rounded-xl p-3 2xl:p-4 shadow-lg border border-orange-200">
              <div className="text-xs 2xl:text-sm font-semibold text-orange-600 mb-2">Tithi</div>
              <div className="text-lg 2xl:text-xl font-bold text-orange-900">
                {getTithi()}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Sheet */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-orange-100 to-yellow-50 text-orange-800 p-3 sm:p-4 shadow-2xl border-t border-orange-200 z-10">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-white border-2 border-orange-300 shadow-lg flex flex-col items-center justify-center">
              <div className="text-xs font-bold text-orange-600">
                {currentTime.toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div className="text-lg sm:text-xl font-bold text-orange-800">
                {currentTime.getDate()}
              </div>
            </div>
            
            <div className="flex-1 ml-3 sm:ml-4 space-y-1">
              <div className="text-xs sm:text-sm text-orange-600 font-medium">{formatDate(currentTime)}</div>
              <div className="text-xs sm:text-sm font-bold text-orange-900">Tithi: {getTithi()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}