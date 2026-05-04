export default function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
  disableIncrease = false,
  maxMessage = null,
  stopPropagation = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      <div className="quantity-control">
        <button type="button" aria-label="Decrease quantity" onClick={onDecrease}>
          −
        </button>
        <span className="quantity">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={disableIncrease}
          style={disableIncrease ? { opacity: 0.4, cursor: "not-allowed" } : {}}
          onClick={onIncrease}
        >
          +
        </button>
      </div>
      {maxMessage && (
        <p
          style={{
            fontSize: "0.72rem",
            color: "#b45309",
            margin: 0,
            textAlign: "center",
          }}
        >
          {maxMessage}
        </p>
      )}
    </div>
  );
}
