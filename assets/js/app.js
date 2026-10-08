/**
 * MyNet SaaS — app.js
 * Application bootstrap.
 *
 * This is the main entry point for JavaScript. It:
 *   1. Loads on every page via a <script type="module"> tag
 *   2. Sets up global state and event listeners
 *   3. Initialises the toast container
 *   4. Exports the app config for use across modules
 *
 * NOTE: Page-specific logic lives in the <script> block
 *       within each HTML page, not here.
 */

'use strict';

import { qs, createElement } from './utils.js';

/* ── App Configuration ────────────────────────────────────────── */
export const APP_CONFIG = {
  name:    'MyNet SaaS',
  version: '1.0.0',

  // TODO: Replace with real Supabase credentials when connecting
  supabase: {
    url:    '',
    anonKey: '',
  },

  // Navigation paths used across the app
  routes: {
    home:           '/index.html',
    login:          '/pages/login.html',
    register:       '/pages/register.html',
    dashboard:      '/pages/dashboard/index.html',
    paymentHistory: '/pages/dashboard/payment-history.html',
    packageStatus:  '/pages/dashboard/package-status.html',
    cardStatus:     '/pages/dashboard/card-status.html',
    adminDashboard: '/pages/admin/index.html',
    adminCustomers: '/pages/admin/customers.html',
    adminPackages:  '/pages/admin/packages.html',
  },
};

/* ── Bootstrap ────────────────────────────────────────────────── */

function bootstrap() {
  // Ensure toast container exists on every page
  if (!qs('#toast-container')) {
    const container = createElement('div', { attrs: { id: 'toast-container' } });
    document.body.appendChild(container);
  }

  // Mark the current year in any [data-year] placeholders
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  console.info(`[${APP_CONFIG.name}] v${APP_CONFIG.version} initialised.`);
}

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
