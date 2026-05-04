import { useState, useCallback, useMemo } from "react";

function getMaxAllowedQuantity(item) {
  const stock = item?.stocks != null ? Number(item.stocks) : null;
  return stock !== null && Number.isFinite(stock) && stock >= 0 ? stock : null;
}

export function useCart() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((item, quantity) => {
    setCartItems((prevItems) => {
      const itemKey = `${item.name}-${item.price}`;
      const existingItem = prevItems.find(
        (i) => `${i.name}-${i.price}` === itemKey
      );
      const safeRequestedQty = Math.max(1, Number(quantity) || 1);

      if (existingItem) {
        const maxQty = getMaxAllowedQuantity(existingItem);
        const nextQty = existingItem.quantity + safeRequestedQty;
        return prevItems.map((i) =>
          `${i.name}-${i.price}` === itemKey
            ? {
                ...i,
                quantity: maxQty === null ? nextQty : Math.min(nextQty, maxQty),
              }
            : i
        );
      }

      const maxQty = getMaxAllowedQuantity(item);
      const initialQty =
        maxQty === null ? safeRequestedQty : Math.min(safeRequestedQty, maxQty);
      return [...prevItems, { ...item, quantity: initialQty, cartKey: itemKey }];
    });
  }, []);

  const updateCartItemQuantity = useCallback((itemKey, newQuantity) => {
    const parsedQty = Number(newQuantity);
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cartKey !== itemKey)
      );
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === itemKey
          ? {
              ...item,
              quantity: (() => {
                const maxQty = getMaxAllowedQuantity(item);
                return maxQty === null ? parsedQty : Math.min(parsedQty, maxQty);
              })(),
            }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((itemKey) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartKey !== itemKey)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    cartItemCount,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  };
}
