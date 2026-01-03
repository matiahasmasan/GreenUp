// src/hooks/useOrderPolling.js

import { useState, useEffect, useRef } from "react";

const POLLING_INTERVAL = 5000; // 5 seconds

export function useOrderPolling(apiBaseUrl) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const pollingIntervalRef = useRef(null);
  const previousOrdersCountRef = useRef(0);
  const modalsOpenRef = useRef(false);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const res = await fetch(`${apiBaseUrl}/history`);

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      const normalizedData = data.map((order) => ({
        ...order,
        status: order.status || "pending",
      }));

      // Detect new orders
      if (silent && previousOrdersCountRef.current > 0) {
        const newCount = normalizedData.length - previousOrdersCountRef.current;
        if (newCount > 0) {
          setNewOrdersCount((prev) => prev + newCount);
          setTimeout(() => {
            setNewOrdersCount(0);
          }, 5000);
        }
      }

      previousOrdersCountRef.current = normalizedData.length;
      setOrders(normalizedData);
      setError("");
    } catch (err) {
      if (!silent) {
        setError(err.message || "Failed to load orders");
      }
      console.error("Error:", err);
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchOrders();
    setNewOrdersCount(0);
  };

  const setModalsOpen = (open) => {
    modalsOpenRef.current = open;
  };

  useEffect(() => {
    fetchOrders();

    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(() => {
        if (!document.hidden && !modalsOpenRef.current) {
          fetchOrders(true);
        }
      }, POLLING_INTERVAL);
    };

    startPolling();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      } else {
        startPolling();
        fetchOrders(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    orders,
    loading,
    error,
    isRefreshing,
    newOrdersCount,
    fetchOrders,
    handleManualRefresh,
    setModalsOpen,
    setOrders,
  };
}
