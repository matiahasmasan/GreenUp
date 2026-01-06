import React from "react";
import MetricCard from "../../components/MetricCard";

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
    cancelledOrders: {
      value: 3,
      percentage: "6.4%",
      trend: { value: "-2%", positive: false },
    },
    netProfit: {
      value: "1,423.75",
      currency: "RON",
      margin: "50%",
      trend: { value: "+15.2%", positive: true },
    },
  };

  return (
    <div className="checkout-section mt-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="checkout-section-title">Admin Dashboard</h1>
        </div>

        {/* Quick date display */}
        <div>
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString("ro-RO", {
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
        <MetricCard
          title="Cancelled Orders"
          value={metrics.cancelledOrders.value}
          subtitle={`${metrics.cancelledOrders.percentage} of total orders`}
          icon="fas fa-times-circle"
          color="text-red-600"
          bgColor="bg-red-50"
          trend={metrics.cancelledOrders.trend}
        />
        <MetricCard
          title="Net Profit"
          value={`${metrics.netProfit.value} ${metrics.netProfit.currency}`}
          subtitle={`${metrics.netProfit.margin} profit margin`}
          icon="fas fa-piggy-bank"
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend={metrics.netProfit.trend}
        />
      </div>
    </div>
  );
}
