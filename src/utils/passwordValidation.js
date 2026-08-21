/**
 * Standard Password Validation Utility
 * Enforces OWASP Standard Password Security Rules:
 * 1. Minimum 8 characters, maximum 64 characters
 * 2. At least 1 uppercase letter (A-Z)
 * 3. At least 1 lowercase letter (a-z)
 * 4. At least 1 numeric digit (0-9)
 * 5. At least 1 special character (@, $, !, %, *, ?, &, #, -, _, .)
 */

export function validateStandardPassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (password.length > 64) {
    return 'Password must not exceed 64 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least 1 uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least 1 lowercase letter (a-z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least 1 number (0-9).';
  }
  if (!/[@$!%*?&#\-_.]/.test(password)) {
    return 'Password must contain at least 1 special character (@, $, !, %, *, ?, &, #, -, _, .).';
  }
  return null;
}

export function getPasswordStrengthChecks(password = '') {
  return {
    length: password.length >= 8 && password.length <= 64,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[@$!%*?&#\-_.]/.test(password),
  };
}
