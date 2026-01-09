import { useState, useEffect, useMemo } from "react";
import "../../App.css";
import Pagination from "../../components/common/Pagination";
import { CATEGORY_OPTIONS } from "../../components/CategoryTabs";
import EditProductModal from "../../components/EditProductModal";
import ViewProductModal from "../../components/ViewProductModal";
import ProductFilters from "../../components/ProductFilters";
import CreateProductModal from "../../components/CreateProductModal";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
/* possible feature: automatic toggle of item stock based on availability but leave the manual toggle */

export default function OperatorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterAvailability, setFilterAvailability] = useState(null);
  const [tempAvailability, setTempAvailability] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productError, setProductError] = useState("");
  const productsPerPage = 5;
  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  // for profit features
  // TO DO: add security to backend
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
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
  const handleView = (product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
    setProductError("");
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedProduct(null);
    setProductError("");
  };

  // Action handlers
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setTempAvailability(product.is_available === 1);
    setEditModalOpen(true);
    setProductError("");
  };

  const handleSaveAvailability = async () => {
    if (!selectedProduct) return;

    try {
      setEditLoading(true);
      const res = await fetch(`${API_BASE_URL}/menu-items/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedProduct.name,
          is_available: tempAvailability,
        }),
      });

      if (!res.ok) throw new Error("Failed to update availability");

      setProducts((prev) =>
        prev.map((p) =>
          p.name === selectedProduct.name
            ? { ...p, is_available: tempAvailability }
            : p
        )
      );

      setEditModalOpen(false);
    } catch (err) {
      setProductError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateProduct = async (formData) => {
    try {
      setCreateLoading(true);
      setProductError("");

      const res = await fetch(`${API_BASE_URL}/menu-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          image_url: formData.image_url,
          category_id: Number(formData.category_id),
          is_available: formData.is_available,
          stocks: Number(formData.stocks),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      await fetchProducts(); // Refresh the product list
      setCreateModalOpen(false);
    } catch (err) {
      setProductError(err.message);
    } finally {
      setCreateLoading(false);
    }
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

  return (
    <div className="checkout-section mt-2">
      <div className="flex justify-between items-center mb-2">
        <h1 className="checkout-section-title">Products</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Add Product"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        filterCategory={filterCategory}
        onCategoryChange={(value) => {
          setFilterCategory(value);
          setCurrentPage(1);
        }}
        filterAvailability={filterAvailability}
        onAvailabilityChange={(value) => {
          setFilterAvailability(value);
          setCurrentPage(1);
        }}
      />

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
                            onClick={() => handleView(product)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-blue-600 transition"
                            title="View product"
                          >
                            <i className="fas fa-eye "></i>
                          </button>
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-yellow-600 transition"
                          >
                            <i className="fas fa-edit"></i>
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
      <ViewProductModal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        selectedProduct={selectedProduct}
        loading={false}
        error={productError}
        isAdmin={isAdmin}
      />
      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        selectedProduct={selectedProduct}
        loading={editLoading}
        error={productError}
        tempAvailability={tempAvailability}
        onAvailabilityChange={setTempAvailability}
        onSave={handleSaveAvailability}
      />
      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setProductError("");
        }}
        onSave={handleCreateProduct}
        loading={createLoading}
        error={productError}
      />
    </div>
  );
}
