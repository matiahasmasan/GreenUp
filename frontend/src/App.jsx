import { useEffect, useState } from "react";
import "./App.css";
import FooterBar from "./components/FooterBar";
import AppRouter from "./components/AppRouter";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useNavigation } from "./hooks/useNavigation";
import { useCart } from "./hooks/useCart";

function AppContent() {
  const { logout } = useAuth();
  const [route, setRoute] = useState(() => {
    try {
      const hash = window.location.hash.replace(/^#/, "");
      return hash || "home";
    } catch (e) {
      return "home";
    }
  });
  const [lastOrder, setLastOrder] = useState(null);

  // Cart management
  const {
    cartItems,
    cartItemCount,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Navigation management
  const handleNavigate = useNavigation(setRoute, logout, clearCart);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      setRoute(hash || "home");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="app">
      <AppRouter
        route={route}
        cartItems={cartItems}
        lastOrder={lastOrder}
        onNavigate={handleNavigate}
        onAddToCart={addToCart}
        onUpdateQuantity={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
        onSetLastOrder={setLastOrder}
        onClearCart={clearCart}
      />
      <FooterBar onNavigate={handleNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
