/**
 * MyNet SaaS — utils.js
 * Shared utility helpers used across the entire app.
 * No external dependencies.
 */

'use strict';

/* ── DOM Helpers ─────────────────────────────────────────────── */

/**
 * Shorthand querySelector
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
export function qs(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Shorthand querySelectorAll (returns Array)
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element[]}
 */
export function qsa(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Create an element with optional classes and attributes.
 * @param {string} tag
 * @param {Object} [opts]
 * @param {string|string[]} [opts.cls]
 * @param {Object} [opts.attrs]
 * @param {string} [opts.html]
 * @param {string} [opts.text]
 * @returns {HTMLElement}
 */
export function createElement(tag, { cls, attrs, html, text } = {}) {
  const el = document.createElement(tag);
  if (cls) {
    const classes = Array.isArray(cls) ? cls : cls.split(' ');
    el.classList.add(...classes.filter(Boolean));
  }
  if (attrs) {
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }
  if (html !== undefined) el.innerHTML = html;
  if (text !== undefined) el.textContent = text;
  return el;
}

/* ── Toast Notifications ─────────────────────────────────────── */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='info']
 * @param {number} [duration=3500]
 */
export function showToast(message, type = 'info', duration = 3500) {
  let container = qs('#toast-container');
  if (!container) {
    container = createElement('div', { attrs: { id: 'toast-container' } });
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
  };

  const toast = createElement('div', {
    cls: `toast ${type}`,
    html: `<span class="toast-icon">${icons[type] ?? icons.info}</span>
           <span class="toast-msg">${escapeHtml(message)}</span>`,
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ── Local Storage Wrapper ───────────────────────────────────── */

const STORAGE_PREFIX = 'mynet_';

/**
 * Save a value to localStorage (JSON serialized).
 * @param {string} key
 * @param {*} value
 */
export function storageSet(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('[MyNet] localStorage write failed:', e);
  }
}

/**
 * Read a value from localStorage (JSON parsed).
 * @param {string} key
 * @param {*} [defaultValue=null]
 * @returns {*}
 */
export function storageGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
export function storageRemove(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Clear all MyNet-prefixed keys from localStorage.
 */
export function storageClear() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .forEach(k => localStorage.removeItem(k));
}

/* ── Date & Time Formatting ──────────────────────────────────── */

/**
 * Format a date string or timestamp to a readable format.
 * @param {string|number|Date} date
 * @param {Intl.DateTimeFormatOptions} [opts]
 * @returns {string}
 */
export function formatDate(date, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  try {
    return new Intl.DateTimeFormat('en-US', opts).format(new Date(date));
  } catch {
    return '—';
  }
}

/**
 * Return a human-friendly relative time string (e.g. "3 days ago").
 * @param {string|number|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000  },
    { label: 'week',   secs: 604800   },
    { label: 'day',    secs: 86400    },
    { label: 'hour',   secs: 3600     },
    { label: 'minute', secs: 60       },
  ];

  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

/**
 * Check if a date is in the past (expired).
 * @param {string|number|Date} date
 * @returns {boolean}
 */
export function isExpired(date) {
  return new Date(date).getTime() < Date.now();
}

/**
 * Return days remaining until a future date.
 * Returns 0 if already expired.
 * @param {string|number|Date} date
 * @returns {number}
 */
export function daysUntil(date) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

/* ── String Helpers ──────────────────────────────────────────── */

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a given length with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 40) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/* ── Validation Helpers ──────────────────────────────────────── */

/**
 * Validate an email address.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/**
 * Validate a password (min 8 chars, at least one letter and one number).
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

/**
 * Validate a phone number (basic, accepts international formats).
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return /^\+?[\d\s\-().]{7,15}$/.test(String(phone).trim());
}

/* ── Misc ────────────────────────────────────────────────────── */

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a simple unique ID (for UI use only, not cryptographic).
 * @returns {string}
 */
export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Format a currency amount.
 * @param {number} amount
 * @param {string} [currency='PKR']
 * @param {string} [locale='en-PK']
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'PKR', locale = 'en-PK') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
