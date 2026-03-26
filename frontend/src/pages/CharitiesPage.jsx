/**
 * Charities Page
 * Browse and select charities to support
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import { Search, Star, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import GolfBall from '../components/icons/GolfBall';

const CharitiesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState([]);
  const [filteredCharities, setFilteredCharities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectionFormData, setSelectionFormData] = useState({ charityId: null, contributionPercentage: 10 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    // Filter charities based on search query
    if (searchQuery.trim() === '') {
      setFilteredCharities(charities);
    } else {
      const filtered = charities.filter(charity =>
        charity.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCharities(filtered);
    }
  }, [searchQuery, charities]);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const [charitiesRes, myCharityRes] = await Promise.allSettled([
        api.get('/charities'),
        api.get('/charities/my-charity')
      ]);

      if (charitiesRes.status === 'fulfilled') {
        const charitiesData = charitiesRes.value.data;
        setCharities(charitiesData);
        setFilteredCharities(charitiesData);
      }

      if (myCharityRes.status === 'fulfilled' && myCharityRes.value.data.success) {
        setSelectedCharity(myCharityRes.value.data.data);
      }
    } catch (error) {
      console.error('Fetch charities error:', error);
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSelectionModal = (charity) => {
    setSelectionFormData({
      charityId: charity.id,
      contributionPercentage: selectedCharity?.contribution_percentage || 10
    });
    setShowSelectionModal(true);
  };

  const handleCloseSelectionModal = () => {
    setShowSelectionModal(false);
    setSelectionFormData({ charityId: null, contributionPercentage: 10 });
  };

  const handleSelectCharity = async (e) => {
    e.preventDefault();

    if (selectionFormData.contributionPercentage < 10 || selectionFormData.contributionPercentage > 100) {
      toast.error('Contribution percentage must be between 10% and 100%');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/charities/select', {
        charityId: selectionFormData.charityId,
        contributionPercentage: selectionFormData.contributionPercentage
      });

      if (response.data.success) {
        toast.success('Charity selected successfully!');
        handleCloseSelectionModal();
        fetchCharities();
      }
    } catch (error) {
      console.error('Select charity error:', error);
      toast.error(error.response?.data?.message || 'Failed to select charity');
    } finally {
      setSubmitting(false);
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
            title="Our Charities" 
            description="Choose a charity to support with your subscription"
          />

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search charities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Charities Grid */}
          {filteredCharities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharities.map((charity) => {
                const isSelected = selectedCharity?.charity_id === charity.id;
                
                return (
                  <div 
                    key={charity.id}
                    className={`card cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-xl'
                    }`}
                  >
                    {/* Charity Logo */}
                    {charity.logo_url && (
                      <div className="mb-4">
                        <img 
                          src={charity.logo_url} 
                          alt={charity.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Featured Badge */}
                    {charity.is_featured && (
                      <div className="flex items-center gap-1 text-accent-600 mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">Featured</span>
                      </div>
                    )}

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="flex items-center gap-1 text-success-600 mb-2">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-semibold">Your Selected Charity</span>
                      </div>
                    )}

                    {/* Charity Name */}
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{charity.name}</h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {charity.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => navigate(`/charities/${charity.id}`)}
                        className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Learn More
                      </button>
                      <button
                        onClick={() => handleOpenSelectionModal(charity)}
                        className={`btn flex-1 ${isSelected ? 'btn-success' : 'btn-primary'}`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <GolfBall className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No charities found</h3>
              <p className="text-slate-600">
                {searchQuery ? 'Try a different search term' : 'No charities available at the moment'}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Charity Selection Modal */}
      <Modal
        isOpen={showSelectionModal}
        onClose={handleCloseSelectionModal}
        title="Select Charity"
        size="md"
      >
        <form onSubmit={handleSelectCharity} className="space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-900">
              <strong>Note:</strong> A portion of your subscription will go to this charity. 
              The minimum contribution is 10%, but you can choose to give more.
            </p>
          </div>

          <div>
            <label htmlFor="contributionPercentage" className="block text-sm font-medium text-slate-700 mb-1">
              Contribution Percentage (10-100%) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                id="contributionPercentage"
                min="10"
                max="100"
                step="5"
                value={selectionFormData.contributionPercentage}
                onChange={(e) => setSelectionFormData(prev => ({ 
                  ...prev, 
                  contributionPercentage: parseInt(e.target.value) 
                }))}
                className="flex-1"
              />
              <div className="w-16 text-center">
                <span className="text-2xl font-bold text-primary-600">
                  {selectionFormData.contributionPercentage}%
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {selectionFormData.contributionPercentage}% of your subscription will support this charity
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseSelectionModal}
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
                  Selecting...
                </span>
              ) : (
                'Confirm Selection'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CharitiesPage;
