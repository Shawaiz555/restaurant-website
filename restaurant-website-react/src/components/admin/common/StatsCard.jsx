import React from 'react';

const StatsCard = ({ icon, label, value, change, trend = 'neutral', onClick }) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-dark-gray',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl p-6 shadow-lg border border-gray-100
        hover:shadow-xl transition-all duration-300
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
      `}
      onClick={onClick}
    >
      {/* Icon and Change Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-xl flex items-center justify-center text-3xl shadow-sm">
          {icon}
        </div>
        {change !== undefined && change !== null && (
          <span className={`text-sm font-semibold ${trendColors[trend]}`}>
            {trendIcons[trend]} {change}
          </span>
        )}
      </div>

      {/* Label */}
      <h3 className="text-dark-gray text-sm mb-1 font-medium">{label}</h3>

      {/* Value */}
      <p className="text-3xl font-display text-primary font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;
