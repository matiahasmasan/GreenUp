import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import SearchBar from "./components/SearchBar";
import CategoryTabs, { CATEGORY_OPTIONS } from "./components/CategoryTabs";
import FooterBar from "./components/FooterBar";
import Cart from "./pages/Cart";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [route, setRoute] = useState("home");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

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
    if (key === "home") setRoute("home");
    else if (key === "cart") setRoute("cart");
    else if (key === "flag") {
      // placeholder for language toggle
      console.log("Toggle language (not implemented)");
    }
  };

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
          />
        </>
      )}

      {route === "cart" && <Cart />}

      <FooterBar onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
