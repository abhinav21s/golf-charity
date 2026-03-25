/**
 * PageHeader Component
 * Consistent page title and description layout
 */

import React from 'react';

const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
    <div>
      <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 text-slate-900">
        {title}
      </h1>
      {description && (
        <p className="text-slate-600 text-base sm:text-lg">
          {description}
        </p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
