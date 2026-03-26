/**
 * Scores Page
 * Score entry and management with 5-score rolling window
 */

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { TrendingUp, TrendingDown, BarChart3, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { validateScoreForm } from '../utils/validation';

const ScoresPage = () => {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({ average: 0, highest: 0, lowest: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [formData, setFormData] = useState({ score: '', date: '' });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const [scoresRes, statsRes] = await Promise.all([
        api.get('/scores'),
        api.get('/scores/stats')
      ]);

      if (scoresRes.data.success) {
        setScores(scoresRes.data.data);
      }

      if (statsRes.data.success) {
        setStats({
          average: statsRes.data.data.averageScore || 0,
          highest: statsRes.data.data.highestScore || 0,
          lowest: statsRes.data.data.lowestScore || 0
        });
      }
    } catch (error) {
      console.error('Fetch scores error:', error);
      toast.error('Failed to load scores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({ score: '', date: new Date().toISOString().split('T')[0] });
    setFormErrors({});
    setEditingScore(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (score) => {
    setFormData({ 
      score: score.score.toString(), 
      date: score.score_date ? new Date(score.score_date).toISOString().split('T')[0] : ''
    });
    setFormErrors({});
    setEditingScore(score);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingScore(null);
    setFormData({ score: '', date: '' });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateScoreForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingScore) {
        // Update existing score
        const response = await api.put(`/scores/${editingScore.id}`, {
          score: parseInt(formData.score),
          date: formData.date
        });
        
        if (response.data.success) {
          toast.success('Score updated successfully');
          handleCloseModal();
          fetchScores();
        }
      } else {
        // Add new score
        const response = await api.post('/scores', {
          score: parseInt(formData.score),
          date: formData.date
        });
        
        if (response.data.success) {
          toast.success(scores.length >= 5 
            ? 'Score added! Oldest score was removed.' 
            : 'Score added successfully'
          );
          handleCloseModal();
          fetchScores();
        }
      }
    } catch (error) {
      console.error('Submit score error:', error);
      toast.error(error.response?.data?.message || 'Failed to save score');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await api.delete(`/scores/${deleteConfirm.id}`);
      
      if (response.data.success) {
        toast.success('Score deleted successfully');
        setDeleteConfirm(null);
        fetchScores();
      }
    } catch (error) {
      console.error('Delete score error:', error);
      toast.error('Failed to delete score');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-8 sm:py-12">
        <div className="container-custom">
          <PageHeader 
            title="My Scores" 
            description="Manage your golf scores for monthly draws"
            action={
              <button 
                onClick={handleOpenAddModal}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Score
              </button>
            }
          />

          {/* Score Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <StatCard
              title="Average Score"
              value={stats.average > 0 ? stats.average.toFixed(1) : '-'}
              icon={BarChart3}
              color="primary"
            />
            <StatCard
              title="Highest Score"
              value={stats.highest || '-'}
              icon={TrendingUp}
              color="success"
            />
            <StatCard
              title="Lowest Score"
              value={stats.lowest || '-'}
              icon={TrendingDown}
              color="accent"
            />
          </div>

          {/* Warning for 5 scores */}
          {scores.length >= 5 && (
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning-900">Maximum scores reached</p>
                <p className="text-sm text-warning-700">
                  You have 5 scores. Adding a new score will automatically remove your oldest score.
                </p>
              </div>
            </div>
          )}

          {/* Scores List */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Your Scores ({scores.length}/5)</h2>
            
            {scores.length > 0 ? (
              <div className="space-y-3">
                {scores.map((score) => (
                  <div 
                    key={score.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{score.score}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {new Date(score.score_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-slate-600">
                          Added {new Date(score.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(score)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit score"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(score)}
                        className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        title="Delete score"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No scores yet</h3>
                <p className="text-slate-600 mb-6">
                  Add your first golf score to start participating in monthly draws
                </p>
                <button 
                  onClick={handleOpenAddModal}
                  className="btn btn-primary"
                >
                  Add Your First Score
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Add/Edit Score Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingScore ? 'Edit Score' : 'Add New Score'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-slate-700 mb-1">
              Score (1-45) *
            </label>
            <input
              type="number"
              id="score"
              name="score"
              value={formData.score}
              onChange={handleInputChange}
              className={`input ${formErrors.score ? 'input-error' : ''}`}
              placeholder="Enter your Stableford score"
              min="1"
              max="45"
            />
            {formErrors.score && (
              <p className="text-sm text-danger-600 mt-1">{formErrors.score}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`input ${formErrors.date ? 'input-error' : ''}`}
              max={new Date().toISOString().split('T')[0]}
            />
            {formErrors.date && (
              <p className="text-sm text-danger-600 mt-1">{formErrors.date}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-secondary flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Saving...
                </span>
              ) : (
                editingScore ? 'Update Score' : 'Add Score'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Score"
        message={`Are you sure you want to delete the score of ${deleteConfirm?.score} from ${deleteConfirm ? new Date(deleteConfirm.score_date).toLocaleDateString() : ''}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="danger"
      />
    </div>
  );
};

export default ScoresPage;
