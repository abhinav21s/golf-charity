import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatDate, formatCurrency, getStatusBadgeClass } from '../../utils/formatting';
import api from '../../services/api';

const AdminWinners = () => {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState([]);
  const [filteredWinners, setFilteredWinners] = useState([]);
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [stats, setStats] = useState({
    totalWinners: 0,
    pendingVerifications: 0,
    pendingPayments: 0,
    totalPaid: 0
  });
  const [viewingProof, setViewingProof] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(null);

  useEffect(() => {
    fetchWinners();
    fetchStats();
  }, []);

  useEffect(() => {
    filterWinners();
  }, [winners, filterVerification, filterPayment]);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/winners/admin/all');
      const winnersData = response.data?.data || response.data || [];
      setWinners(Array.isArray(winnersData) ? winnersData : []);
    } catch (error) {
      console.error('Fetch winners error:', error);
      toast.error('Failed to load winners');
      setWinners([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/winners/admin/stats');
      setStats(response.data || stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const filterWinners = () => {
    let filtered = [...winners];

    if (filterVerification !== 'all') {
      filtered = filtered.filter(w => w.verification_status === filterVerification);
    }

    if (filterPayment !== 'all') {
      filtered = filtered.filter(w => w.payment_status === filterPayment);
    }

    setFilteredWinners(filtered);
  };

  const handleViewProof = (winner) => {
    setViewingProof(winner);
    setRejectNotes('');
  };

  const handleApprove = async () => {
    if (!viewingProof) return;

    setVerifying(true);
    try {
      await api.verifyWinner(viewingProof.id, {
        status: 'approved'
      });
      toast.success('Winner verified successfully!');
      setViewingProof(null);
      fetchWinners();
      fetchStats();
    } catch (error) {
      console.error('Approve winner error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve winner');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!viewingProof) return;

    if (!rejectNotes.trim()) {
      toast.error('Please provide rejection notes');
      return;
    }

    setVerifying(true);
    try {
      await api.verifyWinner(viewingProof.id, {
        status: 'rejected',
        notes: rejectNotes
      });
      toast.success('Winner verification rejected');
      setViewingProof(null);
      setRejectNotes('');
      fetchWinners();
      fetchStats();
    } catch (error) {
      console.error('Reject winner error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject winner');
    } finally {
      setVerifying(false);
    }
  };

  const handleMarkAsPaid = async (winnerId) => {
    try {
      await api.markAsPaid(winnerId);
      toast.success('Winner marked as paid!');
      setMarkingPaid(null);
      fetchWinners();
      fetchStats();
    } catch (error) {
      console.error('Mark as paid error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as paid');
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
            title="Manage Winners"
            description="Verify winners and process payments"
          />

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Winners"
              value={stats.totalWinners}
              icon="🏆"
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
            <StatCard
              title="Total Paid"
              value={formatCurrency(stats.totalPaid)}
              icon="✅"
              color="success"
            />
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="verification" className="block text-sm font-medium text-slate-700 mb-2">
                  Verification Status
                </label>
                <select
                  id="verification"
                  value={filterVerification}
                  onChange={(e) => setFilterVerification(e.target.value)}
                  className="input"
                >
                  <option value="all">All</option>
                  <option value="not_submitted">Not Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label htmlFor="payment" className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Status
                </label>
                <select
                  id="payment"
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="input"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Showing {filteredWinners.length} of {winners.length} winners
            </div>
          </div>

          {/* Winners Table */}
          <div className="card overflow-x-auto">
            {filteredWinners.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg mb-2">No winners found</p>
                <p className="text-slate-500 text-sm">Winners will appear here after draws are published</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Draw</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Match Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Prize Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Verification</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredWinners.map((winner) => (
                    <tr key={winner.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm">
                        <div>
                          <p className="font-medium">{winner.user_name}</p>
                          <p className="text-xs text-slate-500">{winner.user_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {new Date(winner.draw_date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                          {winner.match_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold">
                        {formatCurrency(winner.prize_amount)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={getStatusBadgeClass(winner.verification_status, 'verification')}>
                          {winner.verification_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={getStatusBadgeClass(winner.payment_status, 'payment')}>
                          {winner.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex flex-col gap-2">
                          {winner.verification_status === 'pending' && (
                            <button
                              onClick={() => handleViewProof(winner)}
                              className="text-primary-600 hover:text-primary-700 font-medium text-left"
                            >
                              View Proof
                            </button>
                          )}
                          {winner.verification_status === 'approved' && winner.payment_status === 'pending' && (
                            <button
                              onClick={() => setMarkingPaid(winner)}
                              className="text-success-600 hover:text-success-700 font-medium text-left"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* View Proof Modal */}
      <Modal
        isOpen={!!viewingProof}
        onClose={() => setViewingProof(null)}
        title="Verify Winner"
        size="lg"
      >
        {viewingProof && (
          <div className="space-y-6">
            {/* Winner Info */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">User</p>
                  <p className="font-medium">{viewingProof.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Prize Amount</p>
                  <p className="font-medium">{formatCurrency(viewingProof.prize_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Match Type</p>
                  <p className="font-medium">{viewingProof.match_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Draw</p>
                  <p className="font-medium">
                    {new Date(viewingProof.draw_date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Proof Image */}
            {viewingProof.proof_url ? (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Proof of Identity</p>
                <img
                  src={viewingProof.proof_url}
                  alt="Proof"
                  className="w-full rounded-lg border border-slate-200"
                />
              </div>
            ) : (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <p className="text-warning-800">No proof image uploaded yet</p>
              </div>
            )}

            {/* Rejection Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                Rejection Notes (optional)
              </label>
              <textarea
                id="notes"
                rows="3"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="input"
                placeholder="Provide reason for rejection..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setViewingProof(null)}
                className="btn btn-secondary flex-1"
                disabled={verifying}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="btn btn-danger flex-1"
                disabled={verifying}
              >
                {verifying ? 'Processing...' : 'Reject'}
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="btn btn-primary flex-1"
                disabled={verifying}
              >
                {verifying ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Mark as Paid Confirmation */}
      <ConfirmDialog
        isOpen={!!markingPaid}
        onClose={() => setMarkingPaid(null)}
        onConfirm={() => handleMarkAsPaid(markingPaid.id)}
        title="Mark as Paid"
        message={`Confirm that payment of ${formatCurrency(markingPaid?.prize_amount)} has been made to ${markingPaid?.user_name}?`}
        confirmText="Mark as Paid"
        confirmColor="success"
      />
    </div>
  );
};

export default AdminWinners;
