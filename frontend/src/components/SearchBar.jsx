function SearchBar({ value, onChange, disabled }) {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <label className="search-bar">
        <span className="sr-only">Search menu items</span>
        <input
          type="search"
          placeholder="Search dishes..."
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
