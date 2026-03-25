import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import { formatCurrency } from '../utils/formatting';
import api from '../services/api';

const DrawsPage = () => {
  const [loading, setLoading] = useState(true);
  const [draws, setDraws] = useState([]);
  const [expandedDrawId, setExpandedDrawId] = useState(null);
  const [drawDetails, setDrawDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const response = await api.get('/draws?status=published');
      const drawsData = response.data?.data || response.data || [];
      const sortedDraws = (Array.isArray(drawsData) ? drawsData : []).sort((a, b) => 
        new Date(b.draw_date) - new Date(a.draw_date)
      );
      setDraws(sortedDraws);
    } catch (error) {
      console.error('Fetch draws error:', error);
      toast.error('Failed to load draws');
      setDraws([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrawDetails = async (drawId) => {
    if (drawDetails[drawId]) return;

    setLoadingDetails(prev => ({ ...prev, [drawId]: true }));
    try {
      const response = await api.get(`/draws/${drawId}`);
      setDrawDetails(prev => ({ ...prev, [drawId]: response.data }));
    } catch (error) {
      console.error('Fetch draw details error:', error);
      toast.error('Failed to load draw details');
    } finally {
      setLoadingDetails(prev => ({ ...prev, [drawId]: false }));
    }
  };

  const toggleDrawExpansion = (drawId) => {
    if (expandedDrawId === drawId) {
      setExpandedDrawId(null);
    } else {
      setExpandedDrawId(drawId);
      fetchDrawDetails(drawId);
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
            title="Draw Results"
            description="View published draw results and winning numbers"
          />

          {draws.length === 0 ? (
            <EmptyState
              icon="🎲"
              title="No Draws Published"
              description="Check back later for draw results"
            />
          ) : (
            <div className="space-y-6">
              {draws.map((draw) => (
                <div key={draw.id} className="card">
                  {/* Draw Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-display font-bold">
                        {new Date(draw.draw_date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Draw Date: {new Date(draw.draw_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDrawExpansion(draw.id)}
                      className="btn-secondary"
                    >
                      {expandedDrawId === draw.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Winning Numbers */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">Winning Numbers</h3>
                    <div className="flex flex-wrap gap-3">
                      {draw.winning_numbers?.map((number, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 flex items-center justify-center bg-primary-600 text-white rounded-full font-bold text-lg"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prize Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">Total Prize Pool</h3>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(draw.total_prize_pool || 0)}
                      </p>
                    </div>
                    {draw.jackpot_rollover > 0 && (
                      <div className="bg-accent-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-slate-600 mb-2">Jackpot Rollover</h3>
                        <p className="text-2xl font-bold text-accent-600">
                          {formatCurrency(draw.jackpot_rollover)}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">Added to next draw</p>
                      </div>
                    )}
                  </div>

                  {/* Prize Breakdown */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">Prize Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">5 Matches</span>
                          <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-medium">
                            {draw.five_match_winners || 0} winners
                          </span>
                        </div>
                        <p className="text-lg font-bold text-success-600">
                          {formatCurrency(draw.five_match_prize || 0)}
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">4 Matches</span>
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                            {draw.four_match_winners || 0} winners
                          </span>
                        </div>
                        <p className="text-lg font-bold text-primary-600">
                          {formatCurrency(draw.four_match_prize || 0)}
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">3 Matches</span>
                          <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-medium">
                            {draw.three_match_winners || 0} winners
                          </span>
                        </div>
                        <p className="text-lg font-bold text-accent-600">
                          {formatCurrency(draw.three_match_prize || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedDrawId === draw.id && (
                    <div className="border-t border-slate-200 pt-6">
                      {loadingDetails[draw.id] ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner />
                        </div>
                      ) : drawDetails[draw.id] ? (
                        <div className="space-y-6">
                          {/* Participants */}
                          {drawDetails[draw.id].participants?.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                Participants ({drawDetails[draw.id].participants.length})
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">User</th>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Scores</th>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Matches</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {drawDetails[draw.id].participants.map((participant, index) => (
                                      <tr key={index}>
                                        <td className="px-4 py-3 text-sm">{participant.user_name || 'Anonymous'}</td>
                                        <td className="px-4 py-3 text-sm font-mono">
                                          {participant.scores?.join(', ') || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                          {participant.matches > 0 ? (
                                            <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-medium">
                                              {participant.matches} matches
                                            </span>
                                          ) : (
                                            <span className="text-slate-500">No matches</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Winners */}
                          {drawDetails[draw.id].winners?.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                Winners ({drawDetails[draw.id].winners.length})
                              </h3>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-slate-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">User</th>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Match Type</th>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Prize Amount</th>
                                      <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {drawDetails[draw.id].winners.map((winner, index) => (
                                      <tr key={index}>
                                        <td className="px-4 py-3 text-sm">{winner.user_name || 'Anonymous'}</td>
                                        <td className="px-4 py-3 text-sm">
                                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                                            {winner.match_type}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold">
                                          {formatCurrency(winner.prize_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            winner.payment_status === 'paid'
                                              ? 'bg-success-100 text-success-700'
                                              : 'bg-warning-100 text-warning-700'
                                          }`}>
                                            {winner.payment_status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-slate-600 py-8">No additional details available</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DrawsPage;
