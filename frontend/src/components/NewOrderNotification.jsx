import React from "react";

export default function NewOrderNotification({ newOrdersCount }) {
  if (newOrdersCount <= 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-0 z-50"
      style={{
        animation: "slideInOut 5s ease-in-out forwards",
      }}
    >
      <div className="bg-green-600 text-white px-6 py-3 rounded-l-lg shadow-lg flex items-center gap-3">
        <div className="bg-white bg-opacity-20 rounded-full p-2">
          <i className="fas fa-bell text-lg text-green-500"></i>
        </div>
        <div>
          <p className="font-bold text-lg">New Order!</p>
        </div>
      </div>
    </div>
  );
}
