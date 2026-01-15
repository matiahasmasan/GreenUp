import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function WeeklyRevenueChart({ fromDate, toDate }) {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);

        const queryString = params.toString();
        const url = queryString
          ? `/api/orders/stats/daily-revenue?${queryString}`
          : "/api/orders/stats/daily-revenue";

        const response = await fetch(url);
        const data = await response.json();
        setDailyData(data);
      } catch (error) {
        console.error("Error fetching daily revenue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyRevenue();
  }, [fromDate, toDate]);

  useEffect(() => {
    if (dailyData.length > 0 && chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      // Format labels to show date + day name
      const labels = dailyData.map((item) => {
        const date = new Date(item.order_date);
        const formattedDate = date.toLocaleDateString("ro-RO", {
          day: "2-digit",
          month: "2-digit",
        });
        return `${formattedDate} (${item.day_name})`;
      });

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Daily Revenue",
              data: dailyData.map((item) => item.daily_revenue),
              borderColor: "rgb(34, 197, 94)",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: "rgb(34, 197, 94)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: "#374151",
                font: {
                  size: 13,
                  weight: "500",
                },
                padding: 15,
              },
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 12,
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgb(34, 197, 94)",
              borderWidth: 1,
              callbacks: {
                label: function (context) {
                  const value = context.parsed.y;
                  return `Revenue: ${value.toFixed(2)} RON`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toFixed(0) + " RON";
                },
                color: "#6B7280",
                font: {
                  size: 12,
                },
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              ticks: {
                color: "#6B7280",
                font: {
                  size: 11,
                },
                maxRotation: 45,
                minRotation: 45,
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [dailyData]);

  if (loading) {
    return (
      <div className="checkout-section mt-4">
        <div className="p-6 text-center">Loading chart...</div>
      </div>
    );
  }

  if (dailyData.length === 0) {
    return (
      <div className="checkout-section mt-4">
        <h2 className="checkout-section-title mb-4">Daily Revenue</h2>
        <div className="p-6 text-center text-gray-500">
          No revenue data available for the selected period
        </div>
      </div>
    );
  }

  // Calculate total revenue for the period
  const totalRevenue = dailyData.reduce(
    (sum, day) => sum + parseFloat(day.daily_revenue),
    0
  );

  // Get period description
  const getPeriodText = () => {
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

  return (
    <div className="checkout-section mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="checkout-section-title">Daily Revenue</h2>
          <p className="text-sm text-gray-500 mt-1">{getPeriodText()}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="text-lg font-semibold text-green-600">
            {totalRevenue.toFixed(2)} RON
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dailyData.length} day{dailyData.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div style={{ height: "320px", position: "relative" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
