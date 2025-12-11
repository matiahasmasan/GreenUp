import { useEffect, useMemo, useState } from "react";
import Hero from "../../components/Hero";
import MenuSection from "../../components/MenuSection";
import SearchBar from "../../components/SearchBar";
import CategoryTabs, { CATEGORY_OPTIONS } from "../../components/CategoryTabs";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ClientHome({ onNavigate, onAddToCart }) {
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

  return (
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
        onAddToCart={onAddToCart}
      />
    </>
  );
}
