/**
 * Auth utilities for managing authentication state, tokens, and roles
 */

const TOKEN_KEY = "adminToken";

export const AuthRoles = {
  CLIENT: "client",
  OPERATOR: "operator",
  ADMIN: "admin",
};

/**
 * Save authentication token to localStorage
 */
export function setAuthToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error("Failed to save auth token", e);
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error("Failed to retrieve auth token", e);
    return null;
  }
}

/**
 * Clear authentication token from localStorage
 */
export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error("Failed to clear auth token", e);
  }
}

/**
 * Decode a JWT to get its payload
 */
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
}

/**
 * Get current user info from token
 */
export function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  return decodeToken(token);
}

/**
 * Get user role from token
 */
export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Check if user is authenticated and token is not expired
 */
export function isAuthenticated() {
  const token = getAuthToken();
  if (!token) return false;
  const user = decodeToken(token);
  if (!user) return false;
  if (user.exp && user.exp * 1000 < Date.now()) {
    clearAuthToken();
    return false;
  }
  return true;
}

/**
 * Fetch wrapper that automatically adds the Authorization header
 */
export function authFetch(url, options = {}) {
  const token = getAuthToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/**
 * Check if user has specific role
 */
export function hasRole(role) {
  return getUserRole() === role;
}

/**
 * Check if user has one of multiple roles
 */
export function hasAnyRole(roles) {
  const userRole = getUserRole();
  return roles.includes(userRole);
}

/**
 * Logout user
 */
export function logout() {
  clearAuthToken();
}
