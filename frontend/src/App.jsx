import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Hero from "./components/Hero";
import MenuSection from "./components/MenuSection";
import SearchBar from "./components/SearchBar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
        setMenuItems(data);
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

  const emptyStateMessage = searchTerm
    ? "No dishes match your search."
    : "No menu items available yet.";

  return (
    <div className="app">
      <Hero />
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        disabled={loading}
      />
      <MenuSection
        loading={loading}
        error={error}
        menuItems={filteredItems}
        emptyMessage={emptyStateMessage}
      />
    </div>
  );
}

export default App;
