import { useState, useEffect, useMemo } from "react";
import "../../App.css";
import Pagination from "../../components/common/Pagination";
import { CATEGORY_OPTIONS } from "../../components/CategoryTabs";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function OperatorProducts({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterAvailability, setFilterAvailability] = useState(null);
  const productsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/menu-items`);

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProducts(
        data.map((item) => ({
          ...item,
          category_id: item.category_id ? Number(item.category_id) : null,
        }))
      );
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load products");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchTerm.trim()) {
      const needle = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const haystack = `${item.name ?? ""} ${
          item.description ?? ""
        }`.toLowerCase();
        return haystack.includes(needle);
      });
    }

    // Category filter
    if (filterCategory !== null) {
      if (filterCategory === "uncategorized") {
        filtered = filtered.filter((item) => !item.category_id);
      } else {
        filtered = filtered.filter(
          (item) => item.category_id === filterCategory
        );
      }
    }

    // Availability filter
    if (filterAvailability !== null) {
      const isAvailable = filterAvailability === "available";
      filtered = filtered.filter(
        (item) =>
          (item.is_available === 1 || item.is_available === true) ===
          isAvailable
      );
    }

    return filtered;
  }, [products, searchTerm, filterCategory, filterAvailability]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const getCategoryLabel = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const category = CATEGORY_OPTIONS.find((opt) => opt.id === categoryId);
    return category ? category.label : "Unknown";
  };

  const getAvailabilityStatus = (isAvailable) => {
    const available = isAvailable === 1 || isAvailable === true;
    return {
      text: available ? "Available" : "Out of Stock",
      className: available
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-600",
    };
  };

  return (
    <div className="checkout-section mt-2">
      <h1 className="checkout-section-title">Products</h1>

      {/* Filters */}
      <div className="mt-4 space-y-3">
        <div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={filterCategory === null ? "" : filterCategory}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setFilterCategory(null);
              } else if (value === "uncategorized") {
                setFilterCategory("uncategorized");
              } else {
                setFilterCategory(Number(value));
              }
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
            <option value="uncategorized">Uncategorized</option>
          </select>

          <select
            value={filterAvailability ?? ""}
            onChange={(e) => {
              setFilterAvailability(
                e.target.value === "" ? null : e.target.value
              );
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Out of Stock</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-gray-500 mt-4">Loading products...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <p className="text-gray-600 mt-4">
          {searchTerm || filterCategory !== null || filterAvailability !== null
            ? "No products match your filters."
            : "No products available."}
        </p>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-sm bg-white">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Image
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => {
                  const availability = getAvailabilityStatus(
                    product.is_available
                  );

                  return (
                    <tr
                      key={`${product.name}-${product.price}`}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 font-semibold text-gray-800">
                        {product.name}
                      </td>
                      <td className="px-3 py-3 text-gray-700 max-w-xs truncate">
                        {product.description || "—"}
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {getCategoryLabel(product.category_id)}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-800 font-semibold">
                        {priceFormatter.format(Number(product.price))}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${availability.className}`}
                        >
                          {availability.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={productsPerPage}
            itemName={filteredProducts.length === 1 ? "product" : "products"}
          />
        </div>
      )}
    </div>
  );
}
