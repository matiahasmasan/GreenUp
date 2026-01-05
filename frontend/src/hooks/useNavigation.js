import { useCallback } from "react";

export function useNavigation(setRoute, logout, setCartItems) {
  const handleNavigate = useCallback(
    (key) => {
      let routeKey = key;

      if (key === "home" || key === "menu") {
        setRoute("home");
      } else if (key === "cart") {
        setRoute("cart");
      } else if (key === "checkout") {
        setRoute("checkout");
      } else if (key === "confirmed") {
        setRoute("confirmed");
      } else if (key === "login") {
        setRoute("login");
      } else if (key === "admin-dashboard") {
        setRoute("admin-dashboard");
      } else if (key === "operator-dashboard") {
        setRoute("operator-dashboard");
      } else if (key === "products") {
        setRoute("products");
      } else if (key === "logout") {
        logout();
        setRoute("login");
        routeKey = "login";
        setCartItems([]);
      } else if (key === "flag") {
        console.log("Not implemented");
      }

      try {
        window.location.hash = routeKey;
      } catch (e) {
        console.error("Failed to set hash:", e);
      }
    },
    [setRoute, logout, setCartItems]
  );

  return handleNavigate;
}
