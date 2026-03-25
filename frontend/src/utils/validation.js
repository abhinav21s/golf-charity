/**
 * Validation Utility Functions
 * Client-side form validation
 */

/**
 * Validate score form data
 * @param {Object} formData - { score, date }
 * @returns {Object} errors - { score?, date? }
 */
export const validateScoreForm = (formData) => {
  const errors = {};
  
  // Validate score
  if (!formData.score) {
    errors.score = 'Score is required';
  } else {
    const scoreNum = parseInt(formData.score, 10);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      errors.score = 'Score must be between 1 and 45';
    }
  }
  
  // Validate date
  if (!formData.date) {
    errors.date = 'Date is required';
  } else {
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      errors.date = 'Date cannot be in the future';
    }
  }
  
  return errors;
};

/**
 * Validate contribution percentage
 * @param {number} percentage
 * @returns {string|null} error message or null
 */
export const validateContributionPercentage = (percentage) => {
  const num = parseInt(percentage, 10);
  
  if (isNaN(num) || num < 10 || num > 100) {
    return 'Contribution percentage must be between 10 and 100';
  }
  
  return null;
};

/**
 * Validate image file upload
 * @param {File} file
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Please upload a valid image file (JPG, PNG, or GIF)' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File size must be under 5MB' 
    };
  }
  
  return { valid: true };
};

/**
 * Validate required fields
 * @param {Object} formData - object with field values
 * @param {Array} requiredFields - array of required field names
 * @returns {Object} errors - { fieldName?: errorMessage }
 */
export const validateRequiredFields = (formData, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    const value = formData[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });
  
  return errors;
};
