import { Search } from "lucide-react";

function SearchBar({
  value,
  onChange,
  disabled,
  placeholder = "Search...",
  variant = "default", // "default" for client, "simple" for Dashboard/Products operator
  className = "",
}) {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  // Dashboard and Products operator
  if (variant === "simple") {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${className}`}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  // CLIENT
  return (
    <div className="max-w-7xl mx-auto p-2">
      <label className="search-bar">
        <span className="sr-only">Search menu items</span>
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
        />
        <Search className="w-4 h-4" aria-hidden="true" />
      </label>
    </div>
  );
}

export default SearchBar;
