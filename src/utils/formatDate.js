import React, { useState, useEffect } from 'react';

/**
 * Parses any date input (ISO string, epoch ms, Date object) robustly into a valid JavaScript Date.
 * Handles unzoned ISO-like strings (e.g. "2026-09-03T05:20:00" or "2026-09-03 05:20:00")
 * by assuming UTC (appending 'Z'), as all backend datetime values represent UTC in this application.
 * Strings with explicit timezone offsets (+05:30, -04:00, Z) are parsed natively according to standard ISO-8601.
 *
 * @param {string|number|Date} dateInput
 * @returns {Date|null} Valid Date object or null if unparseable
 */
export function parseDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput === 'string') {
    let str = dateInput.trim();
    if (!str) return null;

    // Matches unzoned ISO dates: "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD HH:mm:ss" with optional subseconds
    // without existing 'Z' or timezone offset (+HH:mm / -HH:mm)
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?$/.test(str)) {
      str = str.replace(' ', 'T') + 'Z';
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Formats timestamps into relative time (e.g., 'Just now', '5m ago', '2h ago', '3d ago')
 * or localized absolute date/time for older items.
 *
 * Automatically handles slight future clock drift (e.g. client clock behind server clock).
 *
 * @param {string|number|Date} dateInput
 * @param {string|number|Date} [referenceNow] Optional reference 'now' for testing/custom timelines
 * @returns {string} Human-friendly formatted time string
 */
export function formatDate(dateInput, referenceNow) {
  if (!dateInput) return 'Just now';

  const date = parseDate(dateInput);
  if (!date) {
    return typeof dateInput === 'string' && dateInput.trim() ? dateInput : 'Just now';
  }

  const now = referenceNow ? parseDate(referenceNow) || new Date() : new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle client/server clock skew:
  // If the timestamp is up to 15 minutes in the future, treat it as 'Just now'
  if (diffMs < 0) {
    if (diffMs > -15 * 60 * 1000) {
      return 'Just now';
    }
    return date.toLocaleDateString();
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  // For older items (>= 7 days), display localized date and time in the viewer's local timezone
  const isSameYear = date.getFullYear() === now.getFullYear();
  const timeFormatted = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dateFormatted = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: isSameYear ? undefined : 'numeric',
  });

  return `${dateFormatted}, ${timeFormatted}`;
}

/**
 * Explicit Pune (Asia/Kolkata) timezone time formatting
 */
export function formatTimePune(dateInput) {
  if (!dateInput) return '';
  const date = parseDate(dateInput);
  if (!date) return typeof dateInput === 'string' ? dateInput : '';

  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Re-exports and aliases for backward-compatibility and consistent UI usage
 */
export const formatRelativeTime = formatDate;
export const getRelativeTime = formatDate;

/**
 * Real-time self-updating timestamp ticker component
 */
export function RealtimeTimestamp({ date, className, style }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 15000); // Live ticker updates every 15 seconds
    return () => clearInterval(interval);
  }, []);

  return React.createElement('span', { className, style }, formatDate(date));
}


