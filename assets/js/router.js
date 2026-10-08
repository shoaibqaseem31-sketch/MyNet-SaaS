/**
 * MyNet SaaS — router.js
 * Lightweight client-side hash router.
 *
 * Pages are separate HTML files (multi-page app), so this router
 * is used only within a single page's shell to handle tab-style
 * or section navigation without a full page reload.
 *
 * For inter-page navigation (e.g., login → dashboard), use
 * standard window.location.href assignments.
 */

'use strict';

/**
 * @typedef {Object} Route
 * @property {string} path      - Hash path, e.g. '#/overview'
 * @property {Function} handler - Function called when route is matched
 * @property {string} [title]   - Optional page title suffix
 */

export class Router {
  /**
   * @param {Route[]} routes
   * @param {string}  [defaultPath='#/']
   */
  constructor(routes = [], defaultPath = '#/') {
    this._routes     = routes;
    this._defaultPath = defaultPath;
    this._activeClass = 'nav-link--active';

    this._onHashChange = this._onHashChange.bind(this);
    window.addEventListener('hashchange', this._onHashChange);
  }

  /**
   * Add a route dynamically.
   * @param {Route} route
   */
  addRoute(route) {
    this._routes.push(route);
    return this;
  }

  /**
   * Start the router and resolve the current hash.
   */
  start() {
    if (!window.location.hash) {
      window.location.hash = this._defaultPath;
    } else {
      this._resolve(window.location.hash);
    }
    return this;
  }

  /**
   * Programmatically navigate to a path.
   * @param {string} path
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Destroy the router (remove event listeners).
   */
  destroy() {
    window.removeEventListener('hashchange', this._onHashChange);
  }

  /* ── Private ─────────────────────────────────────────────── */

  _onHashChange() {
    this._resolve(window.location.hash);
  }

  _resolve(hash) {
    const path  = hash || this._defaultPath;
    const route = this._routes.find(r => r.path === path);

    if (route) {
      this._updateTitle(route.title);
      this._updateNavLinks(path);
      route.handler(path);
    } else {
      // Fallback to default route
      const fallback = this._routes.find(r => r.path === this._defaultPath);
      if (fallback) {
        window.location.hash = this._defaultPath;
      } else {
        console.warn(`[Router] No route found for: ${path}`);
      }
    }
  }

  _updateTitle(suffix) {
    const base = 'MyNet SaaS';
    document.title = suffix ? `${suffix} — ${base}` : base;
  }

  _updateNavLinks(activePath) {
    document.querySelectorAll('[data-route]').forEach(link => {
      const linkPath = link.getAttribute('data-route');
      link.classList.toggle(this._activeClass, linkPath === activePath);
    });
  }
}
