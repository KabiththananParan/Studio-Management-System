import React from 'react';

export default function Sidebar({ activeView, setActiveView }) {
  return (
    <aside className="w-64 bg-[#0A0D22] text-white flex flex-col p-4 rounded-3xl m-4 h-full">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
        <span className="text-xl font-bold">StudioPro</span>
      </div>
      <nav className="flex-1">
        <ul>
          {[
            { name: 'Dashboard', key: 'dashboard' },
            { name: 'Users', key: 'users' },
            { name: 'Packages', key: 'packages' },
            { name: 'All Bookings', key: 'bookings' },
            { name: 'Payments', key: 'payments' },
          ].map(item => (
            <li key={item.key} className="mb-2">
              <button
                onClick={() => setActiveView(item.key)}
                className={`flex items-center space-x-3 px-4 py-2 rounded-xl w-full text-left transition-colors ${
                  activeView === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center space-x-3 px-4 py-2 rounded-xl mt-auto">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
        <div>
          <div className="text-sm font-semibold">Admin User</div>
          <div className="text-xs text-gray-400">System Administrator</div>
        </div>
      </div>
    </aside>
  );
}
