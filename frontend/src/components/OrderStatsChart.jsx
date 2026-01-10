import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function OrderStatsChart() {
  const [orderStats, setOrderStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const response = await fetch("/api/orders/stats/items");
        const data = await response.json();
        setOrderStats(data);
      } catch (error) {
        console.error("Error fetching order stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, []);

  useEffect(() => {
    if (orderStats.length > 0 && chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");

      const generateGreenShades = (count) =>
        Array.from({ length: count }, (_, i) => {
          const lightness = 90 - i * (60 / count);
          return `hsl(130, 45%, ${lightness}%)`;
        });

      const colors = generateGreenShades(10);

      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: orderStats.map((item) => item.item_name),
          datasets: [
            {
              label: "Total Quantity Sold",
              data: orderStats.map((item) => item.total_quantity),
              backgroundColor: colors.slice(0, orderStats.length),
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label;

                  const value = context.parsed;
                  const total = context.dataset.data.reduce(
                    (a, b) => Number(a) + Number(b),
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} units (${percentage}%)`;
                },
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
  }, [orderStats]);

  if (loading) {
    return (
      <div className="checkout-section mt-4">
        <div className="p-6 text-center">Loading chart...</div>
      </div>
    );
  }

  if (orderStats.length === 0) {
    return (
      <div className="checkout-section mt-4">
        <h2 className="checkout-section-title mb-4">Order Statistics</h2>
        <div className="p-6 text-center text-gray-500">
          No order data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-section mt-4">
      <h2 className="checkout-section-title mb-4">Most Sold Items</h2>

      {/* Chart Container */}
      <div className="bg-white rounded-lg p-2 shadow-sm">
        <div style={{ height: "320px", position: "relative" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
