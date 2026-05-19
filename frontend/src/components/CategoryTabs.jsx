/* categories */
export const CATEGORY_OPTIONS = [
  { id: 1, label: "Drinks" },
  { id: 2, label: "Appetizers" },
  { id: 3, label: "Mains" },
  { id: 4, label: "dsa" },
];

function CategoryTabs({
  activeCategory,
  onSelect,
  availableCategoryIds = [],
  categories = CATEGORY_OPTIONS,
}) {
  const visibleCategories = categories.filter((option) =>
    availableCategoryIds.includes(option.id),
  );

  return (
    <div className="category-tabs-wrapper">
      <div
        className="category-tabs"
        role="tablist"
        aria-label="Menu categories"
      >
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            className={`category-button ${
              activeCategory === category.id ? "active" : ""
            }`}
            onClick={() => onSelect(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs;
