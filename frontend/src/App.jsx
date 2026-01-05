import { useEffect, useState } from "react";
import "./App.css";
import FooterBar from "./components/FooterBar";
import AppRouter from "./components/AppRouter";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
  const [cartItems, setCartItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      setRoute(hash || "home");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (key) => {
    let routeKey = key;

    if (key === "home" || key === "menu") setRoute("home");
    else if (key === "cart") setRoute("cart");
    else if (key === "checkout") setRoute("checkout");
    else if (key === "confirmed") setRoute("confirmed");
    else if (key === "login") setRoute("login");
    else if (key === "admin-dashboard") setRoute("admin-dashboard");
    else if (key === "operator-dashboard") setRoute("operator-dashboard");
    else if (key === "products") setRoute("products");
    else if (key === "logout") {
      logout();
      setRoute("login");
      routeKey = "login";
      setCartItems([]);
    } else if (key === "flag") {
      console.log("Not implemented");
    }

    try {
      window.location.hash = routeKey;
    } catch (e) {
      console.error("Failed to set hash:", e);
    }
  };

  const addToCart = (item, quantity) => {
    setCartItems((prevItems) => {
      const itemKey = `${item.name}-${item.price}`;
      const existingItem = prevItems.find(
        (i) => `${i.name}-${i.price}` === itemKey
      );

      if (existingItem) {
        return prevItems.map((i) =>
          `${i.name}-${i.price}` === itemKey
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...prevItems, { ...item, quantity, cartKey: itemKey }];
    });
  };

  const updateCartItemQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === itemKey ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemKey) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartKey !== itemKey)
    );
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
        onClearCart={() => setCartItems([])}
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
