import SearchBar from "./SearchBar";
import { CATEGORY_OPTIONS } from "./CategoryTabs";

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterAvailability,
  onAvailabilityChange,
}) {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <SearchBar
          variant="simple"
          placeholder="Search products..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      <div className="flex gap-3 flex-wrap">
        <select
          value={filterCategory === null ? "" : filterCategory}
          onChange={(e) => {
            const value = e.target.value;
            onCategoryChange(value === "" ? null : Number(value));
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
            onAvailabilityChange(e.target.value === "" ? null : e.target.value);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Out of Stock</option>
        </select>
      </div>
    </div>
  );
}
