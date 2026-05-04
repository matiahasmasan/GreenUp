import React, { useState, useEffect } from "react";
import { authFetch } from "../../utils/authUtils";
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
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

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

        const response = await authFetch(url);
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const res = await authFetch("/api/order-reviews?limit=50");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load reviews");
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviewsError(err.message || "Failed to load reviews");
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);

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
        showSearch={false} // Add this prop
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

      <div className="checkout-section mt-4">
        <h2 className="checkout-section-title mb-4">Order Reviews</h2>

        {reviewsLoading ? (
          <div className="p-6 text-center">Loading reviews...</div>
        ) : reviewsError ? (
          <div className="status error" style={{ margin: "0 0 1rem" }}>
            {reviewsError}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No reviews yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4" style={{ display: "grid", gap: "0.75rem" }}>
              {reviews.map((r) => (
                <div
                  key={r.id}
                  style={{
                    border: "1px solid rgba(168, 213, 186, 0.45)",
                    borderRadius: "0.75rem",
                    padding: "0.9rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                        <i
                          key={n}
                          className="fas fa-star"
                          aria-hidden="true"
                          style={{
                            color:
                              Number(r.rating) >= n
                                ? "var(--green-500)"
                                : "var(--gray-300)",
                          }}
                        />
                      ))}
                      <span style={{ color: "var(--gray-600)" }}>
                        ({r.rating}/5)
                      </span>
                    </div>

                    <div style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>
                      Order #{r.order_id} • Table {r.table_number} •{" "}
                      {r.customer_name}
                      {r.created_at ? (
                        <>
                          {" "}
                          •{" "}
                          {new Date(r.created_at).toLocaleString("ro-RO", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </>
                      ) : null}
                    </div>
                  </div>

                  {r.comment ? (
                    <div style={{ color: "var(--green-800)" }}>{r.comment}</div>
                  ) : (
                    <div style={{ color: "var(--gray-500)" }}>
                      No comment provided.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
