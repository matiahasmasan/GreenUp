import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function WeeklyRevenueChart() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchWeeklyRevenue = async () => {
      try {
        const response = await fetch("/api/orders/stats/weekly-revenue");
        const data = await response.json();
        setWeeklyData(data);
      } catch (error) {
        console.error("Error fetching weekly revenue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyRevenue();
  }, []);

  useEffect(() => {
    if (weeklyData.length > 0 && chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: weeklyData.map((item) => item.day_name),
          datasets: [
            {
              label: "Daily Revenue",
              data: weeklyData.map((item) => item.daily_revenue),
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
                  return `Revenue: $${value.toFixed(2)}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "$" + value.toFixed(0);
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
                  size: 12,
                },
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
  }, [weeklyData]);

  if (loading) {
    return (
      <div className="checkout-section mt-4">
        <div className="p-6 text-center">Loading chart...</div>
      </div>
    );
  }

  if (weeklyData.length === 0) {
    return (
      <div className="checkout-section mt-4">
        <h2 className="checkout-section-title mb-4">Weekly Revenue</h2>
        <div className="p-6 text-center text-gray-500">
          No revenue data available yet
        </div>
      </div>
    );
  }

  // Calculate total weekly revenue
  const totalRevenue = weeklyData.reduce(
    (sum, day) => sum + parseFloat(day.daily_revenue),
    0
  );

  return (
    <div className="checkout-section mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="checkout-section-title">Weekly Revenue</h2>
        <div className="text-sm text-gray-600">
          Total:{" "}
          <span className="font-semibold text-green-600">
            ${totalRevenue.toFixed(2)}
          </span>
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
