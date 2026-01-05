import React from "react";

export default function RefreshButton({
  onClick,
  isRefreshing = false,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isRefreshing}
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      title="Refresh orders"
    >
      <i
        className={`fas fa-sync-alt ${isRefreshing ? "animate-spin" : ""}`}
      ></i>
    </button>
  );
}
