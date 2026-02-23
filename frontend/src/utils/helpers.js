/**
 * Utility functions for common operations
 */

/**
 * Formats a date object to a readable string
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return format
    .replace('YYYY', year)
    .replace('MMM', month)
    .replace('DD', String(day).padStart(2, '0'));
};

/**
 * Validates email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};


