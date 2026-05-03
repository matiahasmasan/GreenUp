import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_OPTIONS } from "./CategoryTabs";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const LOW_STOCK_THRESHOLD = 5;

function MenuSection({
  loading,
  error,
  menuItems,
  emptyMessage,
  selectedCategory,
  onAddToCart,
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

  const handleAddToCart = (item, qty) => {
    onAddToCart(item, qty);
    setExpandedCard(null);
    setQuantity(1);
  };

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
                    const isUnavailable =
                      item.is_available === 0 || item.is_available === false;

                    // Stock helpers
                    const stock =
                      item.stocks != null ? Number(item.stocks) : null;
                    const hasStockTracking = stock !== null;
                    const isOutOfStock = hasStockTracking && stock <= 0;
                    const isLowStock =
                      hasStockTracking &&
                      stock > 0 &&
                      stock <= LOW_STOCK_THRESHOLD;
                    const effectivelyUnavailable =
                      isUnavailable || isOutOfStock;

                    return (
                      <article
                        className={
                          "menu-card" +
                          (isExpanded ? " expanded" : "") +
                          (effectivelyUnavailable ? " unavailable" : "")
                        }
                        key={id}
                        role="button"
                        tabIndex={effectivelyUnavailable ? -1 : 0}
                        aria-expanded={isExpanded}
                        aria-disabled={effectivelyUnavailable}
                        onClick={() => {
                          if (effectivelyUnavailable) return;
                          if (isExpanded) {
                            setExpandedCard(null);
                          } else {
                            setExpandedCard(id);
                            setQuantity(1);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (effectivelyUnavailable) return;
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
                            <div className="menu-header-title">
                              <h2>{item.name}</h2>
                              {(isUnavailable || isOutOfStock) && (
                                <span className="text-xs text-red-600 font-bold">
                                  OUT OF STOCK
                                </span>
                              )}
                              {isLowStock && !effectivelyUnavailable && (
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    color: "#b45309",
                                    background: "#fef3c7",
                                    border: "1px solid #fcd34d",
                                    borderRadius: "4px",
                                    padding: "1px 6px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Only {stock} left!
                                </span>
                              )}
                            </div>
                            <span className="price">
                              {priceFormatter.format(Number(item.price))}
                            </span>
                          </div>
                          <p className="menu-description">{item.description}</p>

                          {isExpanded && !effectivelyUnavailable && (
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
                                  disabled={
                                    hasStockTracking && quantity >= stock
                                  }
                                  style={
                                    hasStockTracking && quantity >= stock
                                      ? {
                                          opacity: 0.4,
                                          cursor: "not-allowed",
                                        }
                                      : {}
                                  }
                                  onClick={() => {
                                    if (hasStockTracking && quantity >= stock)
                                      return;
                                    setQuantity((q) => q + 1);
                                  }}
                                >
                                  +
                                </button>
                              </div>

                              {/* Stock limit reached notice */}
                              {hasStockTracking && quantity >= stock && (
                                <p
                                  style={{
                                    fontSize: "0.72rem",
                                    color: "#b45309",
                                    margin: "0.25rem 0 0",
                                    textAlign: "center",
                                    width: "100%",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Max available: {stock}
                                </p>
                              )}

                              <button
                                type="button"
                                className="add-to-cart"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(item, quantity);
                                }}
                              >
                                Add to cart
                              </button>
                            </div>
                          )}
                          {isExpanded && effectivelyUnavailable && (
                            <div
                              style={{
                                padding: "0.75rem 0",
                                textAlign: "center",
                                color: "var(--green-500)",
                                fontWeight: 600,
                              }}
                            >
                              Out of Stock
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
