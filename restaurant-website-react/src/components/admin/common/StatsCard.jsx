import React from "react";

const StatsCard = ({
  icon,
  label,
  value,
  change,
  trend = "neutral",
  onClick,
}) => {
  const trendColors = {
    up: "text-yellow-600 bg-yellow-50 border-yellow-200",
    down: "text-red-600 bg-red-50 border-red-200",
    neutral: "text-dark-gray bg-gray-50 border-gray-200",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div
      className={`
        bg-white rounded-2xl p-5 sm:p-6 shadow-lg border-2 border-gray-100 relative
        hover:shadow-2xl hover:border-primary/30 transition-all duration-300
        ${onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""}
        flex flex-col items-center text-center min-h-[200px] justify-center
      `}
      onClick={onClick}
    >
      {/* Icon - Centered and Proportional */}
      <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-primary via-primary-light to-primary/80 rounded-2xl flex items-center justify-center shadow-md mb-3 sm:mb-4 transform hover:rotate-6 transition-transform">
        {typeof icon === "string" ? (
          <span className="text-3xl sm:text-4xl">{icon}</span>
        ) : (
          React.createElement(icon, { className: "w-8 h-8 text-white" })
        )}
      </div>

      {/* Label - Centered */}
      <h3 className="text-dark-gray text-xs sm:text-sm mb-2 font-semibold uppercase tracking-wide">
        {label}
      </h3>

      {/* Value - Proportional and Readable */}
      <p className="text-2xl sm:text-3xl font-sans text-primary font-bold mb-2 break-words max-w-full">
        {value}
      </p>

      <div className="absolute top-3 right-1">
        {/* Change Badge - Centered */}
        {change !== undefined && change !== null && (
          <div
            className={`
          px-3 py-1.5 rounded-full text-xs font-bold border-2
          ${trendColors[trend]}
          inline-flex items-center gap-1 shadow-sm
        `}
          >
            <span className="text-sm">{trendIcons[trend]}</span>
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
