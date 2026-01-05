import { useState, useCallback, useMemo } from "react";

export function useCart() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((item, quantity) => {
    setCartItems((prevItems) => {
      const itemKey = `${item.name}-${item.price}`;
      const existingItem = prevItems.find(
        (i) => `${i.name}-${i.price}` === itemKey
      );

      if (existingItem) {
        return prevItems.map((i) =>
          `${i.name}-${i.price}` === itemKey
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [...prevItems, { ...item, quantity, cartKey: itemKey }];
    });
  }, []);

  const updateCartItemQuantity = useCallback((itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.cartKey !== itemKey)
      );
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === itemKey ? { ...item, quantity: newQuantity } : item
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
