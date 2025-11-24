function MenuSection({ loading, error, menuItems, emptyMessage }) {
  return (
    <div className="max-w-7xl mx-auto p-4">
      {loading && <p className="status">Loading menu…</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && (
        <section className="menu-grid">
          {menuItems.map((item) => (
            <article className="menu-card" key={item.name}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="menu-image" />
              )}
              <div className="menu-body">
                <div className="menu-header">
                  <h2>{item.name}</h2>
                  <span className="price">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(Number(item.price))}
                  </span>
                </div>
                <p className="menu-description">{item.description}</p>
              </div>
            </article>
          ))}

          {menuItems.length === 0 && (
            <p className="status">{emptyMessage}</p>
          )}
        </section>
      )}
    </div>
  );
}

export default MenuSection;

