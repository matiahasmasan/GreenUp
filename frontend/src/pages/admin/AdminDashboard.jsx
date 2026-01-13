import React, { useState, useEffect } from "react";
import MetricCard from "../../components/MetricCard";
import OrderStatsChart from "../../components/OrderStatsChart";
import WeeklyRevenueChart from "../../components/WeeklyRevenueChart";
import OrderFilters from "../../components/OrderFilters";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalRevenue: "0.00",
    cancelledOrders: 0,
    totalProfit: "0.00",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        const queryString = params.toString();
        const url = queryString ? `api/stats?${queryString}` : "api/stats";

        const response = await fetch(url);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [fromDate, toDate]);

  // Helper to get date range display text
  const getDateRangeText = () => {
    if (fromDate && toDate) {
      return `${new Date(fromDate).toLocaleDateString("ro-RO")} - ${new Date(
        toDate
      ).toLocaleDateString("ro-RO")}`;
    } else if (fromDate) {
      return `From ${new Date(fromDate).toLocaleDateString("ro-RO")}`;
    } else if (toDate) {
      return `Until ${new Date(toDate).toLocaleDateString("ro-RO")}`;
    }
    return "All Time";
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="checkout-section mt-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="checkout-section-title">Admin Dashboard</h1>
        </div>

        <div>
          <p className="text-sm text-gray-500">Period</p>
          <p className="text-sm font-medium text-gray-700">
            {getDateRangeText()}
          </p>
        </div>
      </div>

      {/* Date Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
      />

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 mt-6">
        {/* All orders except cancelled */}
        <MetricCard
          title="Active Orders"
          value={stats.activeOrders}
          subtitle="Total successful & pending orders"
          icon="fas fa-shopping-basket"
          color="text-green-600"
          bgColor="bg-green-50"
          trend={{ positive: true, value: "+12%" }}
        />
        {/* Total revenue except cancelled */}
        <MetricCard
          title="Total Revenue"
          value={`${stats.totalRevenue} RON`}
          subtitle="Excluding cancelled orders"
          icon="fas fa-wallet"
          color="text-green-600"
          bgColor="bg-green-50"
          trend={{ positive: true, value: "+12%" }}
        />
        {/* All-time cancelled orders */}
        <MetricCard
          title="Cancelled Orders"
          value={stats.cancelledOrders}
          subtitle="Total orders cancelled"
          icon="fas fa-times-circle"
          color="text-green-600"
          bgColor="bg-green-50"
          trend={{ positive: false, value: "-12%" }}
        />
        {/* Total profit */}
        <MetricCard
          title="Total Profit"
          value={`${stats.totalProfit} RON`}
          subtitle="Total profit"
          icon="fas fa-piggy-bank"
          color="text-green-600"
          bgColor="bg-green-50"
          trend={{ positive: true, value: "+12%" }}
        />
      </div>

      <WeeklyRevenueChart fromDate={fromDate} toDate={toDate} />
      <OrderStatsChart fromDate={fromDate} toDate={toDate} />
    </div>
  );
}
