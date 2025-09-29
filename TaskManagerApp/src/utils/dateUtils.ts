// Date utility functions for consistent date handling across the app

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 * @param date - Date object to format
 * @returns String in YYYY-MM-DD format
 */
export const formatLocalDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Creates a date string for given year, month, and date in local timezone
 * @param year - Full year (e.g., 2025)
 * @param month - Month (0-based, 0 = January)
 * @param date - Date of the month (1-31)
 * @returns String in YYYY-MM-DD format
 */
export const createLocalDateString = (year: number, month: number, date: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
};

/**
 * Gets today's date as YYYY-MM-DD string in local timezone
 * @returns Today's date in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return formatLocalDate(new Date());
};

/**
 * Compares two dates by their local date strings (ignoring time)
 * @param date1 - First date (can be Date object or ISO string)
 * @param date2 - Second date (can be Date object or ISO string)
 * @returns True if dates are the same day in local timezone
 */
export const isSameLocalDate = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return formatLocalDate(d1) === formatLocalDate(d2);
};