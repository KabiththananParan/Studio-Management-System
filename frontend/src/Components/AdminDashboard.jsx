import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  const statsData = [
    {
      title: 'Total Studios',
      value: '2,547',
      change: '+12%',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
      )
    },
    {
      title: 'Active Users',
      value: '18,423',
      change: '+8%',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      )
    },
    {
      title: 'Monthly Revenue',
      value: '$127,500',
      change: '+15%',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      )
    },
    {
      title: 'Total Bookings',
      value: '4,892',
      change: '+23%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check"><path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m16 20 2 2 4-4"/></svg>
      )
    },
  ];

  const revenueTrendData = [
    { name: 'Jan', revenue: 10000 },
    { name: 'Feb', revenue: 13000 },
    { name: 'Mar', revenue: 16000 },
    { name: 'Apr', revenue: 20000 },
    { name: 'May', revenue: 26000 },
    { name: 'Jun', revenue: 32000 },
  ];

  const studioTypesData = [
    { name: 'Photography', value: 45 },
    { name: 'Recording', value: 30 },
    { name: 'Video', value: 15 },
    { name: 'Art', value: 10 },
  ];
  const PIE_COLORS = ['#3B82F6', '#22C55E', '#F97316', '#EF4444'];

  const topStudiosData = [
    { name: 'Creative Vision Studio', type: 'Photography Studio', bookings: 156, revenue: '$45,200', rating: 4.9 },
    { name: 'Sound Wave Records', type: 'Photography Studio', bookings: 134, revenue: '$38,900', rating: 4.8 },
    { name: 'Pixel Perfect Photo', type: 'Photography Studio', bookings: 128, revenue: '$42,100', rating: 4.7 },
    { name: 'Urban Art Space', type: 'Photography Studio', bookings: 115, revenue: '$34,500', rating: 4.6 },
    { name: 'Digital Dreams Studio', type: 'Photography Studio', bookings: 102, revenue: '$29,800', rating: 4.5 },
  ];

  const usersData = [
    { name: 'Jane Doe', email: 'jane.doe@example.com', status: 'Active', joined: '2024-01-15', id: 1 },
    { name: 'John Smith', email: 'john.smith@example.com', status: 'Active', joined: '2023-11-20', id: 2 },
    { name: 'Emily White', email: 'emily.white@example.com', status: 'Inactive', joined: '2024-03-10', id: 3 },
    { name: 'Michael Brown', email: 'michael.b@example.com', status: 'Active', joined: '2023-09-05', id: 4 },
    { name: 'Sarah Miller', email: 'sarah.m@example.com', status: 'Active', joined: '2024-05-22', id: 5 },
  ];

  const allStudiosData = [
    { name: 'The Art House', owner: 'Alex Johnson', location: 'New York, NY', status: 'Active', id: 1 },
    { name: 'Music Hub', owner: 'Maria Rodriguez', location: 'Los Angeles, CA', status: 'Active', id: 2 },
    { name: 'Film Factory', owner: 'David Chen', location: 'London, UK', status: 'Suspended', id: 3 },
    { name: 'The Photography Den', owner: 'Sophie Kim', location: 'Tokyo, JP', status: 'Active', id: 4 },
  ];

  const bookingsData = [
    { id: '#B001', studio: 'The Art House', user: 'Jane Doe', date: '2024-06-25', status: 'Confirmed', amount: '$500' },
    { id: '#B002', studio: 'Music Hub', user: 'John Smith', date: '2024-06-24', status: 'Confirmed', amount: '$750' },
    { id: '#B003', studio: 'Film Factory', user: 'Emily White', date: '2024-06-23', status: 'Cancelled', amount: '$0' },
    { id: '#B004', studio: 'Creative Vision', user: 'Michael Brown', date: '2024-06-22', status: 'Confirmed', amount: '$620' },
  ];
  
  const paymentsData = [
    { id: '#P001', bookingId: '#B001', user: 'Jane Doe', amount: '$500', date: '2024-06-25', status: 'Completed' },
    { id: '#P002', bookingId: '#B002', user: 'John Smith', amount: '$750', date: '2024-06-24', status: 'Completed' },
    { id: '#P003', bookingId: '#B003', user: 'Emily White', amount: '$200', date: '2024-06-23', status: 'Refunded' },
    { id: '#P004', bookingId: '#B004', user: 'Michael Brown', amount: '$620', date: '2024-06-22', status: 'Completed' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-500 bg-green-100';
      case 'Inactive': return 'text-gray-500 bg-gray-100';
      case 'Suspended': return 'text-red-500 bg-red-100';
      case 'Confirmed': return 'text-green-500 bg-green-100';
      case 'Completed': return 'text-blue-500 bg-blue-100';
      case 'Cancelled': return 'text-red-500 bg-red-100';
      case 'Refunded': return 'text-yellow-500 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-500">Welcome back! Here's what's happening across all studios</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell text-gray-500"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500">{stat.title}</span>
                    <div className={`p-2 rounded-full ${stat.bgColor} ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'} font-semibold`}>
                    {stat.change} from last month
                  </div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Revenue Trend</h2>
                  <select className="border border-gray-300 rounded-lg p-1 text-sm">
                    <option>Last 6 months</option>
                    <option>Last year</option>
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} domain={[8000, 32000]} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ stroke: '#2563EB', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Studio Types</h2>
                  <a href="#" className="text-blue-500 font-medium text-sm">View Details</a>
                </div>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={studioTypesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        className="outline-none"
                      >
                        {studioTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4 flex-wrap">
                  {studioTypesData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                      <span className="text-sm text-gray-600">{entry.name} ({entry.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Top Performing Studios</h2>
                <a href="#" className="text-blue-500 font-medium text-sm">View All Studios</a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STUDIO</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOOKINGS</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REVENUE</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RATING</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topStudiosData.map((studio, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building text-gray-500"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{studio.name}</div>
                              <div className="text-sm text-gray-500">{studio.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{studio.bookings}<div className="text-sm text-gray-500">this month</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{studio.revenue}<div className="text-sm text-gray-500">this month</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            <span>{studio.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-500 hover:text-blue-700">View</a>
                          <span className="text-gray-300 mx-2">|</span>
                          <a href="#" className="text-blue-500 hover:text-blue-700">Edit</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        );
      case 'users':
        return (
          <section>
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersData.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joined}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-500 hover:text-blue-700 mr-2">View</a>
                          <a href="#" className="text-red-500 hover:text-red-700">Delete</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      case 'studios':
        return (
          <section>
            <h1 className="text-3xl font-bold mb-6">Studios</h1>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Studio Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allStudiosData.map((studio) => (
                      <tr key={studio.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{studio.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{studio.owner}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{studio.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(studio.status)}`}>
                            {studio.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-500 hover:text-blue-700 mr-2">View</a>
                          <a href="#" className="text-red-500 hover:text-red-700">Deactivate</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      case 'bookings':
        return (
          <section>
            <h1 className="text-3xl font-bold mb-6">All Bookings</h1>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Studio</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookingsData.map((booking, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.studio}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-blue-500 hover:text-blue-700 mr-2">View</a>
                          <a href="#" className="text-red-500 hover:text-red-700">Cancel</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      case 'payments':
        return (
          <section>
            <h1 className="text-3xl font-bold mb-6">Payments</h1>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentsData.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.bookingId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen font-sans antialiased">
      <aside className="w-64 bg-[#0A0D22] text-white flex flex-col p-4 rounded-3xl m-4 h-full">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
          <span className="text-xl font-bold">StudioPro</span>
        </div>
        <nav className="flex-1">
          <ul>
            <li className="mb-2">
              <button onClick={() => setActiveView('dashboard')} className={`flex items-center space-x-3 px-4 py-2 rounded-xl w-full text-left transition-colors ${activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                <span>Dashboard</span>
              </button>
            </li>
            <li className="mb-2">
              <button onClick={() => setActiveView('users')} className={`flex items-center space-x-3 px-4 py-2 rounded-xl w-full text-left transition-colors ${activeView === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Users</span>
              </button>
            </li>
            <li className="mb-2">
              <button onClick={() => setActiveView('studios')} className={`flex items-center space-x-3 px-4 py-2 rounded-xl w-full text-left transition-colors ${activeView === 'studios' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                <span>Studios</span>
              </button>
            </li>
            <li className="mb-2">
              <button onClick={() => setActiveView('bookings')} className={`flex items-center space-x-3 px-4 py-2 rounded-xl w-full text-left transition-colors ${activeView === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark-check"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><path d="m9 10 2 2 4-4"/></svg>
                <span>All Bookings</span>
              </button>
            </li>
            <li className="mb-2">
              <button onClick={() => setActiveView('payments')} className={`flex items-center space-x-3 px-4 py-2 rounded-xl w-full text-left transition-colors ${activeView === 'payments' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h12a2 2 0 0 1 0 4H5a2 2 0 0 0 0 4h12a2 2 0 0 1 0 4H3"/><path d="M22 7v3"/></svg>
                <span>Payments</span>
              </button>
            </li>
            <li className="mb-2">
              <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                <span>Analytics</span>
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.39a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.39a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>Settings</span>
              </a>
            </li>
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

      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
