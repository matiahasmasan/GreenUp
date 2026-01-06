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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              <i
                className={`fas fa-arrow-${trend.positive ? "up" : "down"}`}
              ></i>
              <span className="font-medium">{trend.value}</span>
              <span className="text-gray-500">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <i className={`${icon} text-xl ${color}`}></i>
        </div>
      </div>
    </div>
  );
}
