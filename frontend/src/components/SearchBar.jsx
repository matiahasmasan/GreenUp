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
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
      />
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
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
      </label>
    </div>
  );
}

export default SearchBar;
