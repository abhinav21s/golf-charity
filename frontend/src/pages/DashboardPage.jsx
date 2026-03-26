import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import { formatDate, formatCurrency } from '../utils/formatting';
import api from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [scores, setScores] = useState([]);
  const [charity, setCharity] = useState(null);
  const [participation, setParticipation] = useState([]);
  const [winnings, setWinnings] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/subscriptions/my-subscription'),
        api.get('/scores?limit=5'),
        api.get('/charities/my/charity'),
        api.get('/draws/my/participation'),
        api.get('/winners/my/winnings')
      ]);

      // Subscription
      if (results[0].status === 'fulfilled' && results[0].value.data.success) {
        setSubscription(results[0].value.data.data);
      }

      // Scores
      if (results[1].status === 'fulfilled' && results[1].value.data.success) {
        setScores(results[1].value.data.data || []);
      }

      // Charity
      if (results[2].status === 'fulfilled') {
        const charityData = results[2].value.data?.data;
        if (charityData && charityData.charities) {
          setCharity({
            ...charityData.charities,
            contribution_percentage: charityData.contribution_percentage
          });
        }
      }

      // Participation
      if (results[3].status === 'fulfilled') {
        setParticipation(results[3].value.data.slice(0, 3) || []);
      }

      // Winnings
      if (results[4].status === 'fulfilled') {
        const winningsData = results[4].value.data || [];
        const total = winningsData.reduce((sum, w) => sum + (w.prize_amount || 0), 0);
        const paid = winningsData.filter(w => w.payment_status === 'paid').reduce((sum, w) => sum + (w.prize_amount || 0), 0);
        const pending = total - paid;
        setWinnings({ total, paid, pending });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateScoreStats = () => {
    if (scores.length === 0) return { average: 0, highest: 0, lowest: 0 };
    const values = scores.map(s => s.score);
    return {
      average: (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1),
      highest: Math.max(...values),
      lowest: Math.min(...values)
    };
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

  const stats = calculateScoreStats();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-12">
        <div className="container-custom">
          <PageHeader
            title="Dashboard"
            description="Your golf charity platform overview"
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Scores"
              value={scores.length}
              icon="📊"
              color="primary"
            />
            <StatCard
              title="Average Score"
              value={stats.average}
              icon="⛳"
              color="success"
            />
            <StatCard
              title="Total Winnings"
              value={formatCurrency(winnings.total)}
              icon="🏆"
              color="accent"
            />
            <StatCard
              title="Pending Payout"
              value={formatCurrency(winnings.pending)}
              icon="💰"
              color="warning"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subscription Status */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Plan:</span>
                    <span className="font-semibold capitalize">{subscription.plan_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-success-100 text-success-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Renewal Date:</span>
                    <span className="font-medium">{formatDate(subscription.end_date)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600 mb-4">No active subscription</p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="btn btn-primary"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>

            {/* Selected Charity */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Selected Charity</h2>
              {charity ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {charity.logo_url && (
                      <img
                        src={charity.logo_url}
                        alt={charity.name}
                        className="w-16 h-16 object-contain rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{charity.name}</h3>
                      <p className="text-sm text-slate-600">
                        {charity.contribution_percentage}% of winnings
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/charities')}
                    className="btn btn-secondary w-full"
                  >
                    Change Charity
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600 mb-4">No charity selected</p>
                  <button
                    onClick={() => navigate('/charities')}
                    className="btn btn-primary"
                  >
                    Select Charity
                  </button>
                </div>
              )}
            </div>

            {/* Recent Scores */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Scores</h2>
                <button
                  onClick={() => navigate('/scores')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {scores.length > 0 ? (
                <div className="space-y-3">
                  {scores.map((score) => (
                    <div
                      key={score.id}
                      className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0"
                    >
                      <span className="text-slate-600">{formatDate(score.score_date)}</span>
                      <span className="font-semibold text-lg">{score.score}</span>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-slate-200 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-600">Average</p>
                      <p className="font-semibold text-primary-600">{stats.average}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Highest</p>
                      <p className="font-semibold text-success-600">{stats.highest}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Lowest</p>
                      <p className="font-semibold text-accent-600">{stats.lowest}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600 mb-4">No scores recorded</p>
                  <button
                    onClick={() => navigate('/scores')}
                    className="btn btn-primary"
                  >
                    Add Score
                  </button>
                </div>
              )}
            </div>

            {/* Draw Participation */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Draw Participation</h2>
              {participation.length > 0 ? (
                <div className="space-y-3">
                  {participation.map((draw, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">
                          {new Date(draw.draw_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        {draw.matches > 0 && (
                          <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-medium">
                            {draw.matches} matches
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Your scores: {draw.user_scores?.join(', ') || 'N/A'}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/draws')}
                    className="btn btn-secondary w-full mt-2"
                  >
                    View All Draws
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-600">No draw participation yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
