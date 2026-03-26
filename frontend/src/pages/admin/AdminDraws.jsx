import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatCurrency } from '../../utils/formatting';
import api from '../../services/api';

const AdminDraws = () => {
  const [loading, setLoading] = useState(true);
  const [draws, setDraws] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    draw_type: 'random'
  });
  const [formErrors, setFormErrors] = useState({});
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [expandedDrawId, setExpandedDrawId] = useState(null);
  const [drawDetails, setDrawDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [publishConfirm, setPublishConfirm] = useState(false);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const response = await api.get('/draws');
      const drawsData = response.data?.data || response.data || [];
      setDraws(Array.isArray(drawsData) ? drawsData : []);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const month = parseInt(formData.month);
    const year = parseInt(formData.year);
    const currentYear = new Date().getFullYear();

    if (month < 1 || month > 12) {
      errors.month = 'Month must be between 1 and 12';
    }
    if (year < currentYear) {
      errors.year = 'Year cannot be in the past';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSimulate = async () => {
    if (!validateForm()) {
      return;
    }

    setSimulating(true);
    try {
      const response = await api.post('/draws/create', {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        drawType: formData.draw_type,
        simulate: true
      });
      setSimulationResults(response.data);
      toast.success('Draw simulated successfully!');
    } catch (error) {
      console.error('Simulate draw error:', error);
      toast.error(error.response?.data?.message || 'Failed to simulate draw');
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }

    setPublishing(true);
    try {
      await api.post('/draws/create', {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        drawType: formData.draw_type,
        simulate: false
      });
      toast.success('Draw published successfully!');
      setShowCreateModal(false);
      setSimulationResults(null);
      setPublishConfirm(false);
      fetchDraws();
    } catch (error) {
      console.error('Publish draw error:', error);
      toast.error(error.response?.data?.message || 'Failed to publish draw');
    } finally {
      setPublishing(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      draw_type: 'random'
    });
    setFormErrors({});
    setSimulationResults(null);
    setPublishConfirm(false);
    setShowCreateModal(true);
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
            title="Manage Draws"
            description="Create, simulate, and publish monthly draws"
          />

          {/* Create Button */}
          <div className="mb-6">
            <button onClick={openCreateModal} className="btn btn-primary">
              + Create Draw
            </button>
          </div>

          {/* Draws Table */}
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Draw Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Winning Numbers</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Winners</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {draws.map((draw) => (
                  <React.Fragment key={draw.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm font-medium">
                        {new Date(draw.draw_date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex gap-2">
                          {draw.winning_numbers?.slice(0, 5).map((num, idx) => (
                            <span key={idx} className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-full text-xs font-bold">
                              {num}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-xs">5: {draw.five_match_winners || 0}</p>
                          <p className="text-xs">4: {draw.four_match_winners || 0}</p>
                          <p className="text-xs">3: {draw.three_match_winners || 0}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          draw.status === 'published'
                            ? 'bg-success-100 text-success-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {draw.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => toggleDrawExpansion(draw.id)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {expandedDrawId === draw.id ? 'Hide' : 'View'} Details
                        </button>
                      </td>
                    </tr>
                    {expandedDrawId === draw.id && (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 bg-slate-50">
                          {loadingDetails[draw.id] ? (
                            <div className="flex justify-center py-8">
                              <LoadingSpinner />
                            </div>
                          ) : drawDetails[draw.id] ? (
                            <div className="space-y-6">
                              {/* Prize Information */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4">
                                  <p className="text-sm text-slate-600 mb-1">Total Prize Pool</p>
                                  <p className="text-xl font-bold text-primary-600">
                                    {formatCurrency(drawDetails[draw.id].total_prize_pool || 0)}
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                  <p className="text-sm text-slate-600 mb-1">5-Match Prize</p>
                                  <p className="text-xl font-bold text-success-600">
                                    {formatCurrency(drawDetails[draw.id].five_match_prize || 0)}
                                  </p>
                                </div>
                                {drawDetails[draw.id].jackpot_rollover > 0 && (
                                  <div className="bg-white rounded-lg p-4">
                                    <p className="text-sm text-slate-600 mb-1">Jackpot Rollover</p>
                                    <p className="text-xl font-bold text-accent-600">
                                      {formatCurrency(drawDetails[draw.id].jackpot_rollover)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Participants */}
                              {drawDetails[draw.id].participants?.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3">
                                    Participants ({drawDetails[draw.id].participants.length})
                                  </h4>
                                  <div className="overflow-x-auto bg-white rounded-lg">
                                    <table className="w-full text-sm">
                                      <thead className="bg-slate-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left font-semibold">User</th>
                                          <th className="px-3 py-2 text-left font-semibold">Scores</th>
                                          <th className="px-3 py-2 text-left font-semibold">Matches</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200">
                                        {drawDetails[draw.id].participants.map((p, idx) => (
                                          <tr key={idx}>
                                            <td className="px-3 py-2">{p.user_name || 'Anonymous'}</td>
                                            <td className="px-3 py-2 font-mono">{p.scores?.join(', ')}</td>
                                            <td className="px-3 py-2">
                                              {p.matches > 0 ? (
                                                <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs">
                                                  {p.matches}
                                                </span>
                                              ) : (
                                                <span className="text-slate-500">0</span>
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
                                  <h4 className="font-semibold mb-3">
                                    Winners ({drawDetails[draw.id].winners.length})
                                  </h4>
                                  <div className="overflow-x-auto bg-white rounded-lg">
                                    <table className="w-full text-sm">
                                      <thead className="bg-slate-50">
                                        <tr>
                                          <th className="px-3 py-2 text-left font-semibold">User</th>
                                          <th className="px-3 py-2 text-left font-semibold">Match Type</th>
                                          <th className="px-3 py-2 text-left font-semibold">Prize</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-200">
                                        {drawDetails[draw.id].winners.map((w, idx) => (
                                          <tr key={idx}>
                                            <td className="px-3 py-2">{w.user_name || 'Anonymous'}</td>
                                            <td className="px-3 py-2">
                                              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                                                {w.match_type}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 font-semibold">
                                              {formatCurrency(w.prize_amount)}
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
                            <p className="text-center text-slate-600 py-8">No details available</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />

      {/* Create Draw Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Draw"
        size="lg"
      >
        <div className="space-y-6">
          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-slate-700 mb-2">
                  Month (1-12)
                </label>
                <input
                  type="number"
                  id="month"
                  name="month"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={handleInputChange}
                  className={`input ${formErrors.month ? 'input-error' : ''}`}
                />
                {formErrors.month && (
                  <p className="text-danger-600 text-sm mt-1">{formErrors.month}</p>
                )}
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  min={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`input ${formErrors.year ? 'input-error' : ''}`}
                />
                {formErrors.year && (
                  <p className="text-danger-600 text-sm mt-1">{formErrors.year}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="draw_type" className="block text-sm font-medium text-slate-700 mb-2">
                Draw Type
              </label>
              <select
                id="draw_type"
                name="draw_type"
                value={formData.draw_type}
                onChange={handleInputChange}
                className="input"
              >
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
          </div>

          {/* Simulation Results */}
          {simulationResults && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-primary-900">Simulation Results</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-primary-700">Winning Numbers:</p>
                  <div className="flex gap-2 mt-1">
                    {simulationResults.winning_numbers?.map((num, idx) => (
                      <span key={idx} className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-full text-xs font-bold">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-primary-700">Total Prize Pool:</p>
                  <p className="font-bold text-primary-900">{formatCurrency(simulationResults.total_prize_pool || 0)}</p>
                </div>
                <div>
                  <p className="text-primary-700">5-Match Winners:</p>
                  <p className="font-bold text-primary-900">{simulationResults.five_match_winners || 0}</p>
                </div>
                <div>
                  <p className="text-primary-700">4-Match Winners:</p>
                  <p className="font-bold text-primary-900">{simulationResults.four_match_winners || 0}</p>
                </div>
                <div>
                  <p className="text-primary-700">3-Match Winners:</p>
                  <p className="font-bold text-primary-900">{simulationResults.three_match_winners || 0}</p>
                </div>
                {simulationResults.jackpot_rollover > 0 && (
                  <div>
                    <p className="text-primary-700">Jackpot Rollover:</p>
                    <p className="font-bold text-accent-600">{formatCurrency(simulationResults.jackpot_rollover)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn btn-secondary flex-1"
              disabled={simulating || publishing}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSimulate}
              className="btn btn-secondary flex-1"
              disabled={simulating || publishing}
            >
              {simulating ? 'Simulating...' : 'Simulate'}
            </button>
            <button
              type="button"
              onClick={() => setPublishConfirm(true)}
              className="btn btn-primary flex-1"
              disabled={simulating || publishing}
            >
              Publish Draw
            </button>
          </div>
        </div>
      </Modal>

      {/* Publish Confirmation */}
      <ConfirmDialog
        isOpen={publishConfirm}
        onClose={() => setPublishConfirm(false)}
        onConfirm={handlePublish}
        title="Publish Draw"
        message="Are you sure you want to publish this draw? This action cannot be undone and will notify all participants."
        confirmText="Publish"
        confirmColor="primary"
      />
    </div>
  );
};

export default AdminDraws;
