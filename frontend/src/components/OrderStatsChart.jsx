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
        const response = await fetch(
          "http://localhost:4000/orders/stats/items"
        );
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

      // Generate colors for the chart
      const colors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#FF6384",
        "#C9CBCF",
        "#4BC0C0",
        "#FF6384",
      ];

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
              position: "right",
              labels: {
                padding: 15,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
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
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div style={{ height: "400px", position: "relative" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Stats Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Item Name</th>
              <th className="px-4 py-3 text-right font-semibold">
                Quantity Sold
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                Times Ordered
              </th>
              <th className="px-4 py-3 text-right font-semibold">
                Total Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {orderStats.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{item.item_name}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {item.total_quantity}
                </td>
                <td className="px-4 py-3 text-right">{item.order_count}</td>
                <td className="px-4 py-3 text-right">
                  {parseFloat(item.total_revenue).toFixed(2)} RON
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
