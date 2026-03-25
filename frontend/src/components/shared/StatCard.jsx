/**
 * StatCard Component
 * Display statistics with icon and color
 */

import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-danger-500 to-danger-600',
    accent: 'from-accent-500 to-accent-600'
  };
  
  return (
    <div className="card hover:shadow-xl transition-shadow duration-200">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-slate-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {trend && (
        <div className={`text-sm mt-2 flex items-center gap-1 ${trend.direction === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{trend.value}%</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
