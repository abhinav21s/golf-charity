import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import { formatDate } from '../../utils/formatting';
import api from '../../services/api';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userScores, setUserScores] = useState({});
  const [loadingScores, setLoadingScores] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      const usersData = response.data?.data || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'active') {
          return user.subscription_status === 'active';
        } else if (filterStatus === 'inactive') {
          return user.subscription_status !== 'active';
        }
        return true;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const fetchUserScores = async (userId) => {
    if (userScores[userId]) return;

    setLoadingScores(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await api.get(`/admin/users/${userId}/scores`);
      setUserScores(prev => ({ ...prev, [userId]: response.data || [] }));
    } catch (error) {
      console.error('Fetch user scores error:', error);
      toast.error('Failed to load user scores');
    } finally {
      setLoadingScores(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleUserExpansion = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      fetchUserScores(userId);
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="py-12">
          <div className="container-custom">
            <LoadingSpinner size="lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-12">
        <div className="container-custom">
          <PageHeader
            title="Manage Users"
            description="View and manage user accounts"
          />

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                  Search Users
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Subscription</option>
                  <option value="inactive">Inactive Subscription</option>
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Showing {currentUsers.length} of {filteredUsers.length} users
            </div>
          </div>

          {/* Users Table */}
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Subscription</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Registered</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm font-medium">{user.name}</td>
                      <td className="px-4 py-4 text-sm">{user.email}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-accent-100 text-accent-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {user.subscription_status ? (
                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.subscription_status === 'active'
                                ? 'bg-success-100 text-success-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {user.subscription_status}
                            </span>
                            {user.subscription_plan && (
                              <p className="text-xs text-slate-600 mt-1">
                                {user.subscription_plan}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">No subscription</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => toggleUserExpansion(user.id)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {expandedUserId === user.id ? 'Hide' : 'View'} Details
                        </button>
                      </td>
                    </tr>
                    {expandedUserId === user.id && (
                      <tr>
                        <td colSpan="6" className="px-4 py-4 bg-slate-50">
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">User Details</h3>
                            
                            {/* User Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-slate-600">User ID</p>
                                <p className="font-medium">{user.id}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Email Verified</p>
                                <p className="font-medium">
                                  {user.email_verified ? '✓ Yes' : '✗ No'}
                                </p>
                              </div>
                            </div>

                            {/* Scores */}
                            <div>
                              <h4 className="font-semibold mb-2">Golf Scores</h4>
                              {loadingScores[user.id] ? (
                                <LoadingSpinner size="sm" />
                              ) : userScores[user.id]?.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-white">
                                      <tr>
                                        <th className="px-3 py-2 text-left font-semibold">Score</th>
                                        <th className="px-3 py-2 text-left font-semibold">Date</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {userScores[user.id].map((score) => (
                                        <tr key={score.id}>
                                          <td className="px-3 py-2 font-medium">{score.score}</td>
                                          <td className="px-3 py-2 text-slate-600">
                                            {formatDate(score.score_date)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-slate-600 text-sm">No scores recorded</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
