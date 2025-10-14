import { useState, useEffect } from "react";
import axios from "axios";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedToFilter, setAssignedToFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // UI states
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [resolutionDescription, setResolutionDescription] = useState("");
  const [assignToAdmin, setAssignToAdmin] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComplaints: 0,
    limit: 10
  });

  // Category labels
  const categoryLabels = {
    service_quality: 'Service Quality',
    staff_behavior: 'Staff Behavior',
    billing_payment: 'Billing & Payment',
    booking_process: 'Booking Process',
    facility_equipment: 'Facility & Equipment',
    communication: 'Communication',
    delivery_timing: 'Delivery & Timing',
    other: 'Other'
  };

  // Priority colors
  const getPriorityBadgeColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  // Status colors
  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Fetch complaints
  const fetchComplaints = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        assignedTo: assignedToFilter !== "all" ? assignedToFilter : undefined,
        sortBy,
        sortOrder
      };

      // Remove undefined values
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      const response = await axios.get("http://localhost:5000/api/admin/complaints", {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setComplaints(response.data.data.complaints);
        setPagination(response.data.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Fetch complaints error:", error);
      setError(error.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/complaints/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/complaints/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
    }
  };

  // Fetch available admins for assignment
  const fetchAvailableAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/users/admins", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAvailableAdmins(response.data.data.admins || []);
      }
    } catch (error) {
      console.error("Fetch admins error:", error);
      setError("Failed to fetch available admins");
    }
  };

  // Update complaint status
  const updateComplaintStatus = async (complaintId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/complaints/${complaintId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchComplaints(currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Update status error:", error);
      setError(error.response?.data?.message || "Failed to update complaint status");
    }
  };

  // Assign complaint
  const assignComplaint = async () => {
    if (!assignToAdmin) {
      setError("Please select an admin to assign to");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/assign`,
        { adminId: assignToAdmin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowAssignModal(false);
        setAssignToAdmin("");
        setSelectedComplaint(null);
        fetchComplaints(currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Assign complaint error:", error);
      setError(error.response?.data?.message || "Failed to assign complaint");
    }
  };

  // Add complaint response
  const addComplaintResponse = async () => {
    if (!responseMessage.trim()) {
      setError("Response message is required");
      return;
    }

    if (responseMessage.trim().length < 10) {
      setError("Response message must be at least 10 characters long");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/response`,
        { message: responseMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowResponseModal(false);
        setResponseMessage("");
        setSelectedComplaint(null);
        fetchComplaints(currentPage);
      }
    } catch (error) {
      console.error("Add response error:", error);
      setError(error.response?.data?.message || "Failed to add response");
    }
  };

  // Resolve complaint
  const resolveComplaint = async () => {
    if (!resolutionDescription.trim()) {
      setError("Resolution description is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/admin/complaints/${selectedComplaint._id}/resolve`,
        { resolutionDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowResolveModal(false);
        setResolutionDescription("");
        setSelectedComplaint(null);
        fetchComplaints(currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Resolve complaint error:", error);
      setError(error.response?.data?.message || "Failed to resolve complaint");
    }
  };

  // Bulk update complaints
  const bulkUpdateComplaints = async (action, value) => {
    if (selectedComplaints.length === 0) {
      setError("Please select complaints to update");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/admin/complaints/bulk-update",
        { complaintIds: selectedComplaints, action, value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedComplaints([]);
        fetchComplaints(currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      setError(error.response?.data?.message || "Failed to update complaints");
    }
  };

  // Handle search and filter changes
  const handleSearch = () => {
    setCurrentPage(1);
    fetchComplaints(1);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "status":
        setStatusFilter(value);
        break;
      case "category":
        setCategoryFilter(value);
        break;
      case "priority":
        setPriorityFilter(value);
        break;
      case "assignedTo":
        setAssignedToFilter(value);
        break;
      case "sortBy":
        setSortBy(value);
        break;
      case "sortOrder":
        setSortOrder(value);
        break;
    }
    setCurrentPage(1);
    setTimeout(() => fetchComplaints(1), 100);
  };

  // Toggle complaint selection
  const toggleComplaintSelection = (complaintId) => {
    setSelectedComplaints(prev =>
      prev.includes(complaintId)
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  // Select all complaints
  const toggleSelectAll = () => {
    if (selectedComplaints.length === complaints.length) {
      setSelectedComplaints([]);
    } else {
      setSelectedComplaints(complaints.map(complaint => complaint._id));
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Calculate complaint age
  const getComplaintAge = (createdAt) => {
    const days = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  useEffect(() => {
    fetchComplaints();
    fetchStats();
    fetchAnalytics();
    fetchAvailableAdmins();
  }, []);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Complaints Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>
            <button
              onClick={() => window.open(`http://localhost:5000/api/admin/complaints/export?format=csv`, '_blank')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingComplaints || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolutionRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unassignedComplaints || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Complaint Analytics</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Category Breakdown */}
            <div>
              <h4 className="font-medium mb-3">Category Breakdown</h4>
              {analytics.categoryBreakdown && analytics.categoryBreakdown.map((cat, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{categoryLabels[cat._id] || cat._id}</p>
                    <p className="text-sm text-gray-600">
                      Avg Resolution: {cat.avgResolutionDays ? cat.avgResolutionDays.toFixed(1) : "N/A"} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{cat.count}</p>
                    <p className="text-sm text-gray-600">complaints</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Distribution */}
            <div>
              <h4 className="font-medium mb-3">Status Distribution</h4>
              {analytics.statusDistribution && analytics.statusDistribution.map((status, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status._id)}`}>
                      {status._id.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{status.count}</p>
                    <p className="text-sm text-gray-600">
                      {((status.count / (stats.totalComplaints || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Stats */}
          {analytics.resolutionStats && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {analytics.resolutionStats.avgResolutionTime.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Avg Resolution Time (days)</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.resolutionStats.totalResolved}
                </p>
                <p className="text-sm text-gray-600">Total Resolved</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics.resolutionStats.maxResolutionTime.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Longest Resolution (days)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base font-semibold mb-3 text-gray-900 sm:hidden">Search & Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Search */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Search</label>
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search complaints..."
                className="flex-1 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Sort</label>
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:gap-2">
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="userInfo.name">Customer</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedComplaints.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs sm:text-sm font-medium text-blue-700">
                {selectedComplaints.length} complaint(s) selected:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => bulkUpdateComplaints("updateStatus", "in_progress")}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-blue-700 transition-colors font-medium"
            >
              Mark In Progress
            </button>
            <button
              onClick={() => bulkUpdateComplaints("updateStatus", "resolved")}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-green-700 transition-colors font-medium"
            >
              Mark Resolved
            </button>
            <button
              onClick={() => bulkUpdateComplaints("updatePriority", "high")}
              className="bg-orange-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-orange-700 transition-colors font-medium"
            >
              Set High Priority
            </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-gray-500">
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading complaints...</span>
              </div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 px-2">
                {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                  ? "No complaints match your current filters."
                  : "No complaints have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="p-3 sm:p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-2 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedComplaints.includes(complaint._id)}
                        onChange={() => toggleComplaintSelection(complaint._id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 leading-tight mb-1">{complaint.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>{complaint.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {categoryLabels[complaint.category] || complaint.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="font-medium">{complaint.userInfo?.name || "Anonymous"}</span>
                    <span>{getComplaintAge(complaint.createdAt)}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowResponseModal(true);
                      }}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors font-medium"
                    >
                      Respond
                    </button>
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowAssignModal(true);
                      }}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200 transition-colors font-medium"
                    >
                      Assign
                    </button>
                    {complaint.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowResolveModal(true);
                        }}
                        className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200 transition-colors font-medium"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedComplaints.length === complaints.length && complaints.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span>Loading complaints...</span>
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                          ? "No complaints match your current filters."
                          : "No complaints have been submitted yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedComplaints.includes(complaint._id)}
                        onChange={() => toggleComplaintSelection(complaint._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="font-medium mb-1">{complaint.title}</div>
                        <div className="text-gray-500 truncate">{complaint.description}</div>
                        {complaint.bookingId && (
                          <div className="text-xs text-blue-600 mt-1">
                            📅 Related to booking
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.userInfo?.name || "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {complaint.userInfo?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categoryLabels[complaint.category] || complaint.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {complaint.assignedTo ? 
                        `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}` : 
                        <span className="text-gray-400">Unassigned</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getComplaintAge(complaint.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowResponseModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Add Response"
                        >
                          Respond
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowAssignModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Assign"
                        >
                          Assign
                        </button>

                        {complaint.status !== 'resolved' && (
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowResolveModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Resolve"
                          >
                            Resolve
                          </button>
                        )}

                        <div className="relative group">
                          <button className="text-gray-600 hover:text-gray-900">
                            Status ▼
                          </button>
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                            <button
                              onClick={() => updateComplaintStatus(complaint._id, "pending")}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Pending
                            </button>
                            <button
                              onClick={() => updateComplaintStatus(complaint._id, "in_progress")}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() => updateComplaintStatus(complaint._id, "resolved")}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Resolved
                            </button>
                            <button
                              onClick={() => updateComplaintStatus(complaint._id, "closed")}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              Closed
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-3 sm:px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchComplaints(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500 self-center">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchComplaints(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.limit, pagination.totalComplaints)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalComplaints}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => fetchComplaints(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => fetchComplaints(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => fetchComplaints(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-2 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-sm sm:max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add Response
                </h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {selectedComplaint && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Responding to:</p>
                  <p className="font-medium">{selectedComplaint.title}</p>
                  <p className="text-sm">{selectedComplaint.userInfo?.name}</p>
                </div>
              )}
              
              <div className="mb-2">
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Enter your response to this complaint..."
                  className={`w-full h-32 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    responseMessage.trim().length < 10 && responseMessage.trim().length > 0
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-sm ${
                    responseMessage.trim().length < 10 && responseMessage.trim().length > 0
                      ? 'text-red-500' 
                      : 'text-gray-500'
                  }`}>
                    {responseMessage.trim().length < 10 && responseMessage.trim().length > 0 
                      ? `Minimum 10 characters required (${responseMessage.length}/10)`
                      : `${responseMessage.length} characters`
                    }
                  </span>
                  {responseMessage.trim().length >= 10 && (
                    <span className="text-green-500 text-sm">✓ Valid length</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addComplaintResponse}
                  disabled={!responseMessage.trim() || responseMessage.trim().length < 10}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-2 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-sm sm:max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Resolve Complaint
                </h3>
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {selectedComplaint && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Resolving:</p>
                  <p className="font-medium">{selectedComplaint.title}</p>
                  <p className="text-sm">{selectedComplaint.userInfo?.name}</p>
                </div>
              )}
              
              <textarea
                value={resolutionDescription}
                onChange={(e) => setResolutionDescription(e.target.value)}
                placeholder="Describe how this complaint was resolved..."
                className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={resolveComplaint}
                  disabled={!resolutionDescription.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2 sm:p-4">
          <div className="relative top-2 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-sm sm:max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Complaint
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {selectedComplaint && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Assigning:</p>
                  <p className="font-medium">{selectedComplaint.title}</p>
                  <p className="text-sm">{selectedComplaint.userInfo?.name}</p>
                </div>
              )}
              
              <select
                value={assignToAdmin}
                onChange={(e) => setAssignToAdmin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Admin...</option>
                {availableAdmins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.firstName} {admin.lastName}
                  </option>
                ))}
              </select>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={assignComplaint}
                  disabled={!assignToAdmin}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;