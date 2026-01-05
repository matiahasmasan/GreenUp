import React from "react";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import ConfirmedOrder from "../pages/ConfirmedOrder";
import AdminLogin from "../pages/AdminLogin";
import ClientHome from "../pages/client/Home";
import OperatorDashboard from "../pages/operator/Dashboard";
import OperatorProducts from "../pages/operator/Products";
import AdminDashboardPlaceholder from "./AdminDashboardPlaceholder";
import NotFound from "../pages/NotFound";

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

  if (route === "login") {
    return <AdminLogin onNavigate={onNavigate} />;
  }

  if (route === "admin-dashboard") {
    return <AdminDashboardPlaceholder onNavigate={onNavigate} />;
  }

  if (route === "operator-dashboard") {
    return <OperatorDashboard onNavigate={onNavigate} />;
  }

  if (route === "products") {
    return <OperatorProducts onNavigate={onNavigate} />;
  }

  // 404 Not Found
  return <NotFound onNavigate={onNavigate} />;
}
