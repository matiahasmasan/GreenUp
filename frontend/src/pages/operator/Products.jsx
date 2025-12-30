import { useState, useEffect, useMemo } from "react";
import "../../App.css";
import Pagination from "../../components/common/Pagination";
import { CATEGORY_OPTIONS } from "../../components/CategoryTabs";
import SearchBar from "../../components/SearchBar";
import Modal from "../../components/common/Modal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function OperatorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterAvailability, setFilterAvailability] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productError, setProductError] = useState("");
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

  // Action handlers
  const handleView = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setViewModalOpen(true);
      setProductError("");
    } else {
      setProductError("Product not found");
    }
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedProduct(null);
    setProductError("");
  };

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
      filtered = filtered.filter((item) => item.category_id === filterCategory);
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
          <SearchBar
            variant="simple"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={filterCategory === null ? "" : filterCategory}
            onChange={(e) => {
              const value = e.target.value;
              setFilterCategory(value === "" ? null : Number(value));
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
                    Name
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => {
                  return (
                    <tr
                      key={`${product.name}-${product.price}`}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-3 font-semibold text-gray-800">
                        {product.name}
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {getCategoryLabel(product.category_id)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-2">
                          {/* VIEW BUTTON */}
                          <button
                            onClick={() => handleView(product.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-blue-600 transition"
                            title="View product"
                          >
                            <i className="fas fa-eye "></i>
                          </button>
                        </div>
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

      {/* View Product Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        title={`Product: ${selectedProduct?.name || ""}`}
        variant="view"
        loading={false}
        error={productError}
        footerButtons={
          <button
            onClick={handleCloseModal}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
          >
            Close
          </button>
        }
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Product Name
                </p>
                <p className="text-gray-800">{selectedProduct.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Category
                </p>
                <p className="text-gray-800">
                  {getCategoryLabel(selectedProduct.category_id)}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Price
                </p>
                <p className="text-lg font-bold text-green-600">
                  {priceFormatter.format(Number(selectedProduct.price))}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Availability
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                    getAvailabilityStatus(selectedProduct.is_available)
                      .className
                  }`}
                >
                  {getAvailabilityStatus(selectedProduct.is_available).text}
                </span>
              </div>
            </div>

            {/* Product Image */}
            {selectedProduct.image_url && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Product Image
                </p>
                <div className="flex justify-center">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-64 h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}

            {/* Product Description */}
            {selectedProduct.description && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Description
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedProduct.description}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
