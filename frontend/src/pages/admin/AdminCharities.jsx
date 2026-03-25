import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatCurrency } from '../../utils/formatting';
import { validateRequiredFields } from '../../utils/validation';
import api from '../../services/api';

const AdminCharities = () => {
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    website_url: '',
    contact_email: '',
    is_featured: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/charities');
      setCharities(response.data || []);
    } catch (error) {
      console.error('Fetch charities error:', error);
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCharity(null);
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      website_url: '',
      contact_email: '',
      is_featured: false
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (charity) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name || '',
      description: charity.description || '',
      logo_url: charity.logo_url || '',
      website_url: charity.website_url || '',
      contact_email: charity.contact_email || '',
      is_featured: charity.is_featured || false
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = validateRequiredFields(formData, ['name', 'description']);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Transform field names to match backend expectations
      const payload = {
        name: formData.name,
        description: formData.description,
        logoUrl: formData.logo_url,
        websiteUrl: formData.website_url,
        contactEmail: formData.contact_email,
        isFeatured: formData.is_featured
      };

      if (editingCharity) {
        await api.put(`/charities/admin/${editingCharity.id}`, payload);
        toast.success('Charity updated successfully!');
      } else {
        const response = await api.post('/charities/admin/create', payload);
        console.log('Create charity response:', response.data);
        toast.success('Charity created successfully!');
      }
      setShowModal(false);
      fetchCharities();
    } catch (error) {
      console.error('Submit charity error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to save charity';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (charityId) => {
    try {
      await api.delete(`/charities/admin/${charityId}`);
      toast.success('Charity deleted successfully!');
      setDeleteConfirm(null);
      fetchCharities();
    } catch (error) {
      console.error('Delete charity error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete charity');
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
            title="Manage Charities"
            description="Add, edit, and manage charity listings"
          />

          {/* Add Button */}
          <div className="mb-6">
            <button onClick={openAddModal} className="btn btn-primary">
              + Add Charity
            </button>
          </div>

          {/* Charities Table */}
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Featured</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Active</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stats</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {charities.map((charity) => (
                  <tr key={charity.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {charity.logo_url && (
                          <img
                            src={charity.logo_url}
                            alt={charity.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                        )}
                        <span className="font-medium">{charity.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {charity.description}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {charity.is_featured ? (
                        <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-medium">
                          ⭐ Featured
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        charity.is_active
                          ? 'bg-success-100 text-success-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {charity.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div>
                        <p className="text-slate-600">
                          {formatCurrency(charity.total_contributions || 0)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {charity.active_users || 0} users
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(charity)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(charity)}
                          className="text-danger-600 hover:text-danger-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCharity ? 'Edit Charity' : 'Add Charity'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`input ${formErrors.name ? 'input-error' : ''}`}
            />
            {formErrors.name && (
              <p className="text-danger-600 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              className={`input ${formErrors.description ? 'input-error' : ''}`}
            />
            {formErrors.description && (
              <p className="text-danger-600 text-sm mt-1">{formErrors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-slate-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              id="logo_url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleInputChange}
              className="input"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-slate-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={handleInputChange}
              className="input"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-slate-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleInputChange}
              className="input"
              placeholder="contact@charity.org"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-slate-700">
              Featured Charity
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
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
              {submitting ? 'Saving...' : editingCharity ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Charity"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="danger"
      />
    </div>
  );
};

export default AdminCharities;
