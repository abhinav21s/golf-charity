import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../utils/formatting';
import { validateImageFile } from '../utils/validation';
import api from '../services/api';

const WinningsPage = () => {
  const [loading, setLoading] = useState(true);
  const [winnings, setWinnings] = useState([]);
  const [uploadingWinnerId, setUploadingWinnerId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchWinnings();
  }, []);

  const fetchWinnings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/winners/my/winnings');
      const winningsData = response.data?.data?.winnings || response.data?.winnings || [];
      setWinnings(winningsData);
    } catch (error) {
      console.error('Fetch winnings error:', error);
      toast.error('Failed to load winnings');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const total = winnings.reduce((sum, w) => sum + (w.prize_amount || 0), 0);
    const paid = winnings
      .filter(w => w.payment_status === 'paid')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0);
    const pending = total - paid;
    return { total, paid, pending };
  };

  const handleFileSelect = (winnerId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    handleUploadProof(winnerId, file);
  };

  const handleUploadProof = async (winnerId, file) => {
    setUploadingWinnerId(winnerId);
    try {
      const formData = new FormData();
      formData.append('proof', file);

      await api.post(`/winners/${winnerId}/upload-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Proof uploaded successfully!');
      fetchWinnings();
    } catch (error) {
      console.error('Upload proof error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload proof');
    } finally {
      setUploadingWinnerId(null);
      setSelectedFile(null);
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

  const summary = calculateSummary();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-12">
        <div className="container-custom">
          <PageHeader
            title="My Winnings"
            description="View your prize winnings and upload verification proof"
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Won"
              value={formatCurrency(summary.total)}
              icon="🏆"
              color="success"
            />
            <StatCard
              title="Total Paid"
              value={formatCurrency(summary.paid)}
              icon="✅"
              color="primary"
            />
            <StatCard
              title="Pending"
              value={formatCurrency(summary.pending)}
              icon="⏳"
              color="warning"
            />
          </div>

          {/* Winnings List */}
          {winnings.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-600 text-lg">No winnings yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Keep playing and you might win in the next draw!
              </p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Draw</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Match Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Prize Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Verification</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {winnings.map((winning) => (
                    <tr key={winning.id}>
                      <td className="px-4 py-4 text-sm">
                        <div>
                          <p className="font-medium">
                            {new Date(winning.draw_date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(winning.draw_date)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                          {winning.match_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold">
                        {formatCurrency(winning.prize_amount)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={getStatusBadgeClass(winning.verification_status, 'verification')}>
                          {winning.verification_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={getStatusBadgeClass(winning.payment_status, 'payment')}>
                          {winning.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {winning.verification_status === 'pending' && !winning.proof_image_url && (
                          <div>
                            <input
                              type="file"
                              id={`file-${winning.id}`}
                              accept="image/jpeg,image/jpg,image/png,image/gif"
                              onChange={(e) => handleFileSelect(winning.id, e)}
                              className="hidden"
                              disabled={uploadingWinnerId === winning.id}
                            />
                            <label
                              htmlFor={`file-${winning.id}`}
                              className={`btn btn-primary text-xs cursor-pointer inline-block ${
                                uploadingWinnerId === winning.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {uploadingWinnerId === winning.id ? 'Uploading...' : 'Upload Proof'}
                            </label>
                          </div>
                        )}
                        {winning.verification_status === 'pending' && winning.proof_image_url && (
                          <span className="text-xs text-slate-600">Under review</span>
                        )}
                        {winning.verification_status === 'approved' && (
                          <span className="text-xs text-success-600">✓ Verified</span>
                        )}
                        {winning.verification_status === 'rejected' && (
                          <div>
                            <span className="text-xs text-danger-600 block mb-1">Rejected</span>
                            <input
                              type="file"
                              id={`file-retry-${winning.id}`}
                              accept="image/jpeg,image/jpg,image/png,image/gif"
                              onChange={(e) => handleFileSelect(winning.id, e)}
                              className="hidden"
                              disabled={uploadingWinnerId === winning.id}
                            />
                            <label
                              htmlFor={`file-retry-${winning.id}`}
                              className={`btn btn-secondary text-xs cursor-pointer inline-block ${
                                uploadingWinnerId === winning.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {uploadingWinnerId === winning.id ? 'Uploading...' : 'Reupload'}
                            </label>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h3 className="font-semibold text-primary-900 mb-2">📋 Verification Process</h3>
            <ul className="text-sm text-primary-800 space-y-1">
              <li>• Upload proof of identity for winnings verification</li>
              <li>• Accepted formats: JPG, JPEG, PNG, GIF (max 5MB)</li>
              <li>• Admin will review and approve your submission</li>
              <li>• Payment will be processed after approval</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WinningsPage;
