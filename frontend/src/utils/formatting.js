/**
 * Data Formatting Utility Functions
 * Format data for display
 */

/**
 * Format date as "Month Day, Year"
 * @param {string} dateString - ISO date string
 * @returns {string} formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format currency as INR
 * @param {number} amount
 * @returns {string} formatted currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Get status badge CSS class
 * @param {string} status
 * @param {string} type - optional type (verification, payment)
 * @returns {string} Tailwind CSS class
 */
export const getStatusBadgeClass = (status, type) => {
  const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
  
  const colorMapping = {
    // Verification statuses
    not_submitted: 'bg-slate-100 text-slate-700',
    pending: 'bg-warning-100 text-warning-700',
    approved: 'bg-success-100 text-success-700',
    rejected: 'bg-danger-100 text-danger-700',
    // Payment statuses
    paid: 'bg-success-100 text-success-700',
    // Subscription statuses
    active: 'bg-success-100 text-success-700',
    inactive: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-danger-100 text-danger-700',
    expired: 'bg-danger-100 text-danger-700',
    past_due: 'bg-warning-100 text-warning-700'
  };
  
  const colorClass = colorMapping[status] || 'bg-primary-100 text-primary-700';
  return `${baseClasses} ${colorClass}`;
};

/**
 * Get status display text
 * @param {string} status
 * @returns {string} display text
 */
export const getStatusText = (status) => {
  const mapping = {
    not_submitted: 'Not Submitted',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
    active: 'Active',
    inactive: 'Inactive',
    cancelled: 'Cancelled',
    expired: 'Expired',
    past_due: 'Past Due'
  };
  
  return mapping[status] || status;
};

/**
 * Format month number to name
 * @param {number} month - 1-12
 * @returns {string} month name
 */
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[month - 1] || '';
};
