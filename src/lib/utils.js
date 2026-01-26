import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num) {
  if (!num) return 0;
  return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
}

/**
 * Helper to construct Date object correctly from date string/object and time string
 * Ensures we get YYYY-MM-DD from the date and combine it with the time
 */
export function getDateTime(date, time) {
  if (!date || !time) return null;
  let dateStr;

  // Handle Date object or ISO string (which Date object becomes when serialized)
  if (typeof date === 'object' && date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  } else if (typeof date === 'string') {
    // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss..."
    dateStr = date.split('T')[0];
  } else {
    return null;
  }

  return new Date(`${dateStr}T${time}:00`);
}

/**
 * Robustly serialize Firestore timestamps or their plain object equivalents
 */
export function serializeTimestamp(ts) {
  if (!ts) return null;

  // Handle Firestore Timestamp class
  if (typeof ts.toDate === 'function') {
    try {
      return ts.toDate().toISOString();
    } catch (e) {
      console.error("Error converting timestamp to Date:", e);
    }
  }

  // Handle plain object { seconds, nanoseconds }
  if (typeof ts === 'object' && ts.seconds !== undefined) {
    return new Date(ts.seconds * 1000).toISOString();
  }

  // Already a string or Date
  if (ts instanceof Date) return ts.toISOString();
  if (typeof ts === 'string') return ts;

  return null;
}
