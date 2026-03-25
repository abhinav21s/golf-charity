import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { formatCurrency } from '../../utils/formatting';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalPrizePool: 0,
    totalCharityContributions: 0,
    pendingVerifications: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/admin/users/count'),
        api.get('/admin/subscriptions/active-count'),
        api.get('/admin/draws/total-prize-pool'),
        api.get('/admin/charities/total-contributions'),
        api.get('/admin/winners/pending-verifications'),
        api.get('/admin/winners/pending-payments')
      ]);

      const newStats = { ...stats };

      if (results[0].status === 'fulfilled') {
        newStats.totalUsers = results[0].value.data.count || 0;
      }
      if (results[1].status === 'fulfilled') {
        newStats.activeSubscriptions = results[1].value.data.count || 0;
      }
      if (results[2].status === 'fulfilled') {
        newStats.totalPrizePool = results[2].value.data.total || 0;
      }
      if (results[3].status === 'fulfilled') {
        newStats.totalCharityContributions = results[3].value.data.total || 0;
      }
      if (results[4].status === 'fulfilled') {
        newStats.pendingVerifications = results[4].value.data.count || 0;
      }
      if (results[5].status === 'fulfilled') {
        newStats.pendingPayments = results[5].value.data.count || 0;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Fetch statistics error:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

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
            title="Admin Dashboard"
            description="Platform overview and statistics"
          />

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="👥"
              color="primary"
            />
            <StatCard
              title="Active Subscriptions"
              value={stats.activeSubscriptions}
              icon="✅"
              color="success"
            />
            <StatCard
              title="Total Prize Pool"
              value={formatCurrency(stats.totalPrizePool)}
              icon="💰"
              color="accent"
            />
            <StatCard
              title="Charity Contributions"
              value={formatCurrency(stats.totalCharityContributions)}
              icon="💙"
              color="primary"
            />
            <StatCard
              title="Pending Verifications"
              value={stats.pendingVerifications}
              icon="⏳"
              color="warning"
            />
            <StatCard
              title="Pending Payments"
              value={stats.pendingPayments}
              icon="💸"
              color="danger"
            />
          </div>

          {/* Quick Navigation */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg transition-all duration-200 text-left transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-lg mb-1">Manage Users</h3>
                <p className="text-sm text-slate-600">View and manage user accounts</p>
              </button>

              <button
                onClick={() => navigate('/admin/charities')}
                className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg transition-all duration-200 text-left transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">💙</div>
                <h3 className="font-semibold text-lg mb-1">Manage Charities</h3>
                <p className="text-sm text-slate-600">Add, edit, and remove charities</p>
              </button>

              <button
                onClick={() => navigate('/admin/draws')}
                className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg transition-all duration-200 text-left transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">🎲</div>
                <h3 className="font-semibold text-lg mb-1">Manage Draws</h3>
                <p className="text-sm text-slate-600">Create and publish draws</p>
              </button>

              <button
                onClick={() => navigate('/admin/winners')}
                className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg transition-all duration-200 text-left transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-semibold text-lg mb-1">Manage Winners</h3>
                <p className="text-sm text-slate-600">Verify winners and process payments</p>
              </button>

              <button
                onClick={() => navigate('/draws')}
                className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg transition-all duration-200 text-left transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-lg mb-1">View Draw Results</h3>
                <p className="text-sm text-slate-600">See published draw results</p>
              </button>

              <button
                onClick={() => navigate('/charities')}
                className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg transition-all duration-200 text-left transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">🌟</div>
                <h3 className="font-semibold text-lg mb-1">View Charities</h3>
                <p className="text-sm text-slate-600">Browse charity listings</p>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
