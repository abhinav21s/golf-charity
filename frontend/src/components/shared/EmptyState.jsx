/**
 * EmptyState Component
 * Display when no data is available
 */

import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    <Icon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn btn-primary">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
