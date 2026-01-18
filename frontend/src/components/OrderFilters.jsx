import { Calendar } from "lucide-react";
import SearchBar from "./SearchBar";

export default function OrderFilters({
  searchTerm,
  onSearchChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  showSearch = true, // Default to true for backward compatibility
}) {
  return (
    <div className="mt-4 space-y-4">
      {showSearch && (
        <div>
          {/* Searchbar */}
          <SearchBar
            variant="simple"
            placeholder="Search order..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
        {/* Date range filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
          <div className="flex flex-col flex-1">
            <label className="text-xs font-medium text-gray-600 mb-2">
              From date
            </label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors appearance-none"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-xs font-medium text-gray-600 mb-2">
              To date
            </label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors appearance-none"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
