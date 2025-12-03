import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import SearchBar from "./components/SearchBar";
import CategoryTabs, { CATEGORY_OPTIONS } from "./components/CategoryTabs";
import FooterBar from "./components/FooterBar";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ConfirmedOrder from "./pages/ConfirmedOrder";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [route, setRoute] = useState("home");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMenu() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/menu-items`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Unable to load menu");
        }

        const data = await res.json();
        setMenuItems(
          data.map((item) => ({
            ...item,
            category_id: item.category_id ? Number(item.category_id) : null,
          }))
        );
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load menu");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
    return () => controller.abort();
  }, []);

  const filteredItems = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return menuItems;

    return menuItems.filter((item) => {
      const haystack = `${item.name ?? ""} ${
        item.description ?? ""
      }`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [menuItems, searchTerm]);

  const availableCategoryIds = useMemo(() => {
    const ids = Array.from(
      new Set(filteredItems.map((item) => item.category_id).filter(Boolean))
    );
    const order = CATEGORY_OPTIONS.map((option) => option.id);
    return ids.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [filteredItems]);

  useEffect(() => {
    if (!availableCategoryIds.length) {
      if (activeCategory !== null) {
        setActiveCategory(null);
      }
      return;
    }

    if (activeCategory && !availableCategoryIds.includes(activeCategory)) {
      setActiveCategory(null);
    }
  }, [activeCategory, availableCategoryIds]);

  const emptyStateMessage =
    filteredItems.length === 0
      ? searchTerm
        ? "No dishes match your search."
        : "No menu items available yet."
      : "";

  const handleNavigate = (key) => {
    if (key === "home" || key === "menu") setRoute("home");
    else if (key === "cart") setRoute("cart");
    else if (key === "checkout") setRoute("checkout");
    else if (key === "confirmed") setRoute("confirmed");
    else if (key === "flag") {
      // placeholder for language toggle
      console.log("Toggle language (not implemented)");
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
      {route === "home" && (
        <>
          <Hero />
          <div className="menu-controls">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              disabled={loading}
            />
            <CategoryTabs
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
              availableCategoryIds={availableCategoryIds}
            />
          </div>
          <MenuSection
            loading={loading}
            error={error}
            menuItems={filteredItems}
            emptyMessage={emptyStateMessage}
            selectedCategory={activeCategory}
            onAddToCart={addToCart}
          />
        </>
      )}

      {route === "cart" && (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onNavigate={handleNavigate}
        />
      )}

      {route === "checkout" && (
        <Checkout
          cartItems={cartItems}
          onNavigate={handleNavigate}
          onSetLastOrder={setLastOrder}
        />
      )}

      {route === "confirmed" && (
        <ConfirmedOrder lastOrder={lastOrder} onNavigate={handleNavigate} />
      )}

      <FooterBar onNavigate={handleNavigate} cartItemCount={cartItemCount} />
    </div>
  );
}

export default App;
