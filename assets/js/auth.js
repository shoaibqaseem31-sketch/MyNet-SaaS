/**
 * MyNet SaaS — auth.js
 * Authentication logic stub — Supabase-ready.
 *
 * All functions are designed to be replaced with real Supabase calls
 * once the backend is connected. The signatures and return shapes
 * will NOT change, making migration seamless.
 *
 * FUTURE: Replace the stub functions below with Supabase client calls.
 * See: https://supabase.com/docs/reference/javascript/auth-signinwithpassword
 */

'use strict';

import { storageSet, storageGet, storageRemove, storageClear } from './utils.js';

/* ── Session Storage Keys ────────────────────────────────────── */
const SESSION_KEY = 'session';
const USER_KEY = 'user';
/* ── Supabase Client ────────────────────────────────────────── */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://tpvhtqvemcenrvyabhhy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CDAQZYPXdrSKR5DYfSN44g_MYbDY7XG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const user = data.user;
  const profile = user.user_metadata || {};

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: profile.name || '',
      user_id: profile.user_id || '',
      address: profile.address || '',
      phone: profile.phone || '',
    }, { onConflict: 'id' });

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  saveSession(data.session, user);
  window.location.href = '../../Dashboard/Index.html';

  return { success: true, user };
}


/**
 * Register a new user with email and password.
 *
 * @param {string} email
 * @param {string} password
 * @param {Object} metadata  Extra profile fields (name, phone, etc.)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function signUp(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

/**
 * Sign out the current user.
 *
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOut() {
  // TODO: Replace with:
  // const { error } = await supabase.auth.signOut();
  // if (error) return { success: false, error: error.message };

  clearSession();
  return { success: true };
}

/**
 * Request a password reset email.
 *
 * @param {string} email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function requestPasswordReset(email) {
  // TODO: Replace with:
  // const { error } = await supabase.auth.resetPasswordForEmail(email);
  // if (error) return { success: false, error: error.message };
  // return { success: true };

  return {
    success: false,
    error: 'Password reset not connected yet. Supabase integration is pending.',
  };
}

/**
 * Return the currently logged-in user object, or null.
 *
 * @returns {object|null}
 */
export function getCurrentUser() {
  // TODO: Replace with:
  // const { data: { user } } = await supabase.auth.getUser();
  // return user;

  return storageGet(USER_KEY, null);
}

/**
 * Return the current session object, or null.
 *
 * @returns {object|null}
 */
export function getSession() {
  return storageGet(SESSION_KEY, null);
}

/**
 * Returns true if a user session exists.
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  const session = getSession();
  if (!session) return false;
  // Check expiry if session has one (Supabase sessions have expires_at)
  if (session.expires_at) {
    return new Date(session.expires_at * 1000) > new Date();
  }
  return true;
}

/**
 * Returns true if the current user has the 'admin' role.
 * Role is stored in user metadata.
 *
 * @returns {boolean}
 */
export function isAdmin() {
  const user = getCurrentUser();
  if (!user) return false;
  // Supabase stores custom claims in user.user_metadata or user.app_metadata
  return user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
}

/* ── Route Guards ────────────────────────────────────────────── */

/**
 * Redirect to login if the user is not authenticated.
 * Call this at the top of any protected page script.
 *
 * @param {string} [redirectTo='/pages/login.html']
 */
export function requireAuth(redirectTo = '/pages/login.html') {
  if (!isAuthenticated()) {
    window.location.href = redirectTo;
  }
}

/**
 * Redirect to dashboard if the user is already logged in.
 * Call this on login/register pages to skip them if already authed.
 *
 * @param {string} [redirectTo='/pages/dashboard/index.html']
 */
export function redirectIfAuthenticated(redirectTo = '/pages/dashboard/index.html') {
  if (isAuthenticated()) {
    window.location.href = redirectTo;
  }
}

/**
 * Redirect to home if the user is not an admin.
 * Call this at the top of any admin-only page.
 *
 * @param {string} [redirectTo='/pages/dashboard/index.html']
 */
export function requireAdmin(redirectTo = '/pages/dashboard/index.html') {
  if (!isAuthenticated()) {
    window.location.href = '/pages/login.html';
    return;
  }
  if (!isAdmin()) {
    window.location.href = redirectTo;
  }
}

/* ── Internal Session Helpers ────────────────────────────────── */

/**
 * Persist session and user to localStorage.
 * @param {object} session
 * @param {object} user
 */
export function saveSession(session, user) {
  storageSet(SESSION_KEY, session);
  storageSet(USER_KEY, user);
}

/**
 * Remove session and user from localStorage.
 */
export function clearSession() {
  storageRemove(SESSION_KEY);
  storageRemove(USER_KEY);
}
