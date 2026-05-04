import React from "react";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import ConfirmedOrder from "../pages/ConfirmedOrder";
import LeaveFeedback from "../pages/LeaveFeedback";
import AdminLogin from "../pages/AdminLogin";
import ClientHome from "../pages/client/Home";
import OperatorDashboard from "../pages/operator/Dashboard";
import OperatorProducts from "../pages/operator/Products";
import AdminDashboard from "../pages/admin/AdminDashboard";
import NotFound from "../pages/NotFound";
import { useAuth } from "../context/AuthContext";

export default function AppRouter({
  route,
  cartItems,
  lastOrder,
  onNavigate,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onSetLastOrder,
  onClearCart,
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  // Guard: must be logged in, optionally with one of the allowed roles.
  // If not authenticated → show login.
  // If authenticated but wrong role → redirect to their own dashboard.
  const guard = (element, allowedRoles) => {
    if (!user) return <AdminLogin onNavigate={onNavigate} />;
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "operator") {
        return <OperatorDashboard onNavigate={onNavigate} />;
      }
      return <NotFound onNavigate={onNavigate} />;
    }
    return element;
  };

  if (route === "home") {
    return <ClientHome onNavigate={onNavigate} onAddToCart={onAddToCart} />;
  }

  if (route === "cart") {
    return (
      <Cart
        cartItems={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onNavigate={onNavigate}
      />
    );
  }

  if (route === "checkout") {
    return (
      <Checkout
        cartItems={cartItems}
        onNavigate={onNavigate}
        onSetLastOrder={onSetLastOrder}
        onClearCart={onClearCart}
      />
    );
  }

  if (route === "confirmed") {
    return <ConfirmedOrder lastOrder={lastOrder} onNavigate={onNavigate} />;
  }

  if (route === "feedback") {
    return <LeaveFeedback lastOrder={lastOrder} onNavigate={onNavigate} />;
  }

  if (route === "login") {
    return <AdminLogin onNavigate={onNavigate} />;
  }

  if (route === "admin-dashboard") {
    return guard(<AdminDashboard onNavigate={onNavigate} />, ["admin"]);
  }

  if (route === "operator-dashboard") {
    return guard(<OperatorDashboard onNavigate={onNavigate} />, ["operator", "admin"]);
  }

  if (route === "products") {
    return guard(<OperatorProducts onNavigate={onNavigate} />, ["operator", "admin"]);
  }

  // 404 Not Found
  return <NotFound onNavigate={onNavigate} />;
}
