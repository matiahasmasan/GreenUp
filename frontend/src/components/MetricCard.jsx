import React from "react";

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  bgColor,
  trend,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className={`${bgColor} p-2 sm:p-3 rounded-lg`}>
            <i className={`${icon} text-base sm:text-xl ${color}`}></i>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <h3 className="text-md sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
            {value}
          </h3>

          {/* Hide subtitle on mobile (below 640px) */}
          {subtitle && (
            <p className="hidden sm:block text-sm text-gray-500">{subtitle}</p>
          )}

          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs sm:text-sm ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              <i
                className={`fas fa-arrow-${trend.positive ? "up" : "down"}`}
              ></i>
              <span className="font-medium">{trend.value}</span>
              <span className="text-gray-500 hidden sm:inline">
                vs yesterday
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
