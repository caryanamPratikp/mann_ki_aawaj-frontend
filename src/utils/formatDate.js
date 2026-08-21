import React, { useState, useEffect } from 'react';

/**
 * Formats timestamps explicitly in Indian Standard Time (IST - Asia/Kolkata, Pune timezone)
 */
export function formatDate(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  // Explicit Pune (Asia/Kolkata) timezone formatting
  const timeFormatted = date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const isSameYear = date.getFullYear() === now.getFullYear();
  const dateFormatted = date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: isSameYear ? undefined : 'numeric',
  });

  return `${dateFormatted}, ${timeFormatted}`;
}

export function formatTimePune(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

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

