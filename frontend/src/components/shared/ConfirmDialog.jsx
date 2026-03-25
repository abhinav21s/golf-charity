/**
 * ConfirmDialog Component
 * Confirmation dialog for destructive actions
 */

import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  confirmColor = 'danger'
}) => {
  const buttonClasses = {
    primary: 'btn-primary',
    danger: 'btn-danger'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center py-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className={`btn ${buttonClasses[confirmColor]}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
