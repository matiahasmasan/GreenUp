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
    <div className="mt-4 space-y-3">
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
      <div className="flex gap-3 flex-wrap items-center">
        {/* Date range filter */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
