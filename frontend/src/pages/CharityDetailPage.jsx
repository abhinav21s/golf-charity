import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Modal from '../components/shared/Modal';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatting';
import { validateContributionPercentage } from '../utils/validation';
import api from '../services/api';

const CharityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [charity, setCharity] = useState(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [contributionPercentage, setContributionPercentage] = useState(10);
  const [percentageError, setPercentageError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCharityDetails();
  }, [id]);

  const fetchCharityDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/charities/${id}`);
      setCharity(response.data);
    } catch (error) {
      console.error('Fetch charity error:', error);
      if (error.response?.status === 404) {
        toast.error('Charity not found');
        navigate('/charities');
      } else {
        toast.error('Failed to load charity details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharity = async (e) => {
    e.preventDefault();
    
    const error = validateContributionPercentage(contributionPercentage);
    if (error) {
      setPercentageError(error);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/charities/select', {
        charity_id: charity.id,
        contribution_percentage: contributionPercentage
      });
      toast.success('Charity selected successfully!');
      setShowSelectionModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Select charity error:', error);
      toast.error(error.response?.data?.error || 'Failed to select charity');
    } finally {
      setSubmitting(false);
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

  if (!charity) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-12">
        <div className="container-custom max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/charities')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <span>←</span>
            <span>Back to Charities</span>
          </button>

          <div className="card">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-slate-200">
              {charity.logo_url && (
                <img
                  src={charity.logo_url}
                  alt={charity.name}
                  className="w-32 h-32 object-contain rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-3xl font-display font-bold">{charity.name}</h1>
                  {charity.is_featured && (
                    <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                {user && (
                  <button
                    onClick={() => setShowSelectionModal(true)}
                    className="btn-primary"
                  >
                    Select This Charity
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {charity.description}
              </p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {charity.website_url && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Website</h3>
                  <a
                    href={charity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {charity.website_url}
                  </a>
                </div>
              )}
              {charity.contact_email && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Contact Email</h3>
                  <a
                    href={`mailto:${charity.contact_email}`}
                    className="text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {charity.contact_email}
                  </a>
                </div>
              )}
            </div>

            {/* Events */}
            {charity.events && charity.events.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Events & Programs</h2>
                <ul className="space-y-2">
                  {charity.events.map((event, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-slate-700">{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contributions */}
            {charity.total_contributions !== undefined && (
              <div className="bg-slate-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Total Contributions</h2>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(charity.total_contributions)}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  From our community members
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Selection Modal */}
      <Modal
        isOpen={showSelectionModal}
        onClose={() => setShowSelectionModal(false)}
        title="Select Charity"
      >
        <form onSubmit={handleSelectCharity} className="space-y-4">
          <p className="text-slate-600">
            Choose what percentage of your winnings you'd like to contribute to {charity.name}.
          </p>
          
          <div>
            <label htmlFor="percentage" className="block text-sm font-medium text-slate-700 mb-2">
              Contribution Percentage (10-100%)
            </label>
            <input
              type="number"
              id="percentage"
              min="10"
              max="100"
              value={contributionPercentage}
              onChange={(e) => {
                setContributionPercentage(e.target.value);
                setPercentageError('');
              }}
              className={`input ${percentageError ? 'input-error' : ''}`}
            />
            {percentageError && (
              <p className="text-danger-600 text-sm mt-1">{percentageError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSelectionModal(false)}
              className="btn-secondary flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? 'Selecting...' : 'Confirm Selection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CharityDetailPage;
