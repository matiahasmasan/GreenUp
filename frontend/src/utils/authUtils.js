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
 * Decode token to get user info (basic base64 decode, not cryptographic)
 */
export function decodeToken(token) {
  try {
    const decoded = JSON.parse(atob(token));
    return decoded;
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
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getAuthToken();
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
