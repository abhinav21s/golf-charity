/**
 * ErrorState Component
 * Display when data fetching fails
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
    <p className="text-slate-600 mb-6 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-primary">
        Try Again
      </button>
    )}
  </div>
);

export default ErrorState;
