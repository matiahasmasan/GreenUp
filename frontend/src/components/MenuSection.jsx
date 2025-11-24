import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_OPTIONS } from "./CategoryTabs";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function MenuSection({
  loading,
  error,
  menuItems,
  emptyMessage,
  selectedCategory,
}) {
  const sectionRefs = useRef({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const groupedSections = useMemo(() => {
    const groups = CATEGORY_OPTIONS.map((option) => ({
      id: option.id,
      label: option.label,
      items: menuItems.filter((item) => item.category_id === option.id),
    })).filter((group) => group.items.length > 0);

    const uncategorized = menuItems.filter((item) => !item.category_id);
    if (uncategorized.length) {
      groups.push({
        id: "other",
        label: "Other",
        items: uncategorized,
      });
    }

    return groups;
  }, [menuItems]);

  useEffect(() => {
    if (!selectedCategory) return;
    const target = sectionRefs.current[selectedCategory];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedCategory, groupedSections]);

  return (
    <div className="max-w-7xl mx-auto p-2">
      {loading && <p className="status">Loading menu…</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <>
          {groupedSections.length === 0 ? (
            <p className="status">{emptyMessage}</p>
          ) : (
            groupedSections.map((section) => (
              <section
                key={section.id}
                className="category-section"
                ref={(node) => {
                  if (node) {
                    sectionRefs.current[section.id] = node;
                  } else {
                    delete sectionRefs.current[section.id];
                  }
                }}
              >
                <div className="category-header">
                  <h2>{section.label}</h2>
                  <span className="category-count">
                    {section.items.length} item
                    {section.items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="menu-grid">
                  {section.items.map((item) => {
                    const id = `${section.id}-${item.name}`;
                    const isExpanded = expandedCard === id;
                    return (
                      <article
                        className={
                          "menu-card" + (isExpanded ? " expanded" : "")
                        }
                        key={id}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedCard(null);
                          } else {
                            setExpandedCard(id);
                            setQuantity(1);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (isExpanded) setExpandedCard(null);
                            else {
                              setExpandedCard(id);
                              setQuantity(1);
                            }
                          }
                        }}
                      >
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className={
                              "menu-image" + (isExpanded ? " large" : "")
                            }
                          />
                        )}
                        <div className="menu-body">
                          <div className="menu-header">
                            <h2>{item.name}</h2>
                            <span className="price">
                              {priceFormatter.format(Number(item.price))}
                            </span>
                          </div>
                          <p className="menu-description">{item.description}</p>

                          {isExpanded && (
                            <div className="card-actions">
                              <div
                                className="quantity-control"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                  }
                                >
                                  −
                                </button>
                                <span className="quantity">{quantity}</span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  onClick={() => setQuantity((q) => q + 1)}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                className="add-to-cart"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  /* intentionally no-op for now */
                                }}
                              >
                                Add to cart
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default MenuSection;
