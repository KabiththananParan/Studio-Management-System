import React, { useState } from 'react';
import Sidebar from './Admin/Sidebar';
import Header from './Admin/Header';
import UsersTable from './Admin/UsersTable';


export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-500 bg-green-100';
      case 'Inactive': return 'text-gray-500 bg-gray-100';
      case 'Suspended': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active", joined: "2024-01-10" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive", joined: "2024-03-22" },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen font-sans antialiased">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-8 overflow-y-auto">
        <Header />
        {activeView === 'users' && <UsersTable users={users} getStatusColor={getStatusColor} />}
        {/* Add other views like Dashboard, Studios, Bookings, Payments */}
      </main>
    </div>
  );
}
