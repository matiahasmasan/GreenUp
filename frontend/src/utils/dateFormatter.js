/**
 * Formats an ISO date string into a readable format: "Dec 20, 8:51 PM"
 */
export const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  // Check if date is valid to prevent "Invalid Date" errors
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
