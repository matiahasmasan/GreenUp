import { ChevronDown, Filter, Package } from "lucide-react";
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

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
        {/* Category Filter */}
        <div className="flex flex-col flex-1">
          <div className="relative">
            <select
              value={filterCategory === null ? "" : filterCategory}
              onChange={(e) => {
                const value = e.target.value;
                onCategoryChange(value === "" ? null : Number(value));
              }}
              className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Availability Filter */}
        <div className="flex flex-col flex-1">
          <div className="relative">
            <select
              value={filterAvailability ?? ""}
              onChange={(e) => {
                onAvailabilityChange(
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors appearance-none bg-white"
            >
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Out of Stock</option>
            </select>
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
