import React from "react";

// Metric Card Component
const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  bgColor,
  trend,
}) => {
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
};

export default function AdminDashboard() {
  // Static data for UI/UX development
  const metrics = {
    ordersToday: {
      value: 47,
      trend: { value: "+12%", positive: true },
    },
    totalRevenue: {
      value: "2,847.50",
      currency: "RON",
      trend: { value: "+8.3%", positive: true },
    },
  };

  return (
    <div className="checkout-section mt-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="checkout-section-title">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of today's performance
          </p>
        </div>

        {/* Quick date display */}
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString("ro-RO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Orders Today"
          value={metrics.ordersToday.value}
          subtitle="Total orders placed"
          icon="fas fa-chart-line"
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend={metrics.ordersToday.trend}
        />
        <MetricCard
          title="Total Revenue"
          value={`${metrics.totalRevenue.value} ${metrics.totalRevenue.currency}`}
          subtitle="Gross sales today"
          icon="fas fa-dollar-sign"
          color="text-green-600"
          bgColor="bg-green-50"
          trend={metrics.totalRevenue.trend}
        />
      </div>
    </div>
  );
}
