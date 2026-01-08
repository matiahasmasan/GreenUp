import React, { useState, useEffect } from "react";
import MetricCard from "../../components/MetricCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalRevenue: "0.00",
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:4000/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* All orders except cancelled */}
        <MetricCard
          title="Active Orders"
          value={stats.activeOrders}
          subtitle="Total successful & pending orders"
          icon="fas fa-shopping-basket"
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>
    </div>
  );
}
