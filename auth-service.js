/**
 * THAIBA MODEL SCHOOL — Authentication & Identity Service
 * Strict Production Mode:
 *   - Authenticates exclusively against Supabase Auth.
 *   - Authorisation (role/scope) is read ONLY from the server-side `profiles` table.
 *   - Never trusts localStorage, user_metadata, or client-supplied roles.
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';

class AuthService {
  constructor() {
    this.sessionKey = 'tms_auth_session';
    this.currentUser = null;
    // Cache is for UI hydration only; it is always re-validated against the server.
    this.cachedUser = this.readCache();
  }

  readCache() {
    try {
      const raw = localStorage.getItem(this.sessionKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate the current Supabase session and load the authoritative profile.
   * Must be awaited before any authentication decision is made.
   */
  async init() {
    const client = dbService.getClient();
    if (!client) {
      this.currentUser = null;
      this.clearCache();
      return null;
    }

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session || !session.user) {
        this.currentUser = null;
        this.clearCache();
        return null;
      }

      const profile = await this.loadProfile(session.user);
      if (!profile) {
        // Authenticated but no profile / inactive: deny access.
        await client.auth.signOut();
        this.currentUser = null;
        this.clearCache();
        return null;
      }

      this.currentUser = profile;
      this.saveCache(profile);
      return profile;
    } catch (e) {
      console.error('TMS session validation failed:', e);
      this.currentUser = null;
      this.clearCache();
      return null;
    }
  }

  async loadProfile(authUser) {
    const client = dbService.getClient();
    if (!client || !authUser) return null;

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error || !data) {
      console.warn('TMS profile lookup failed:', error?.message);
      return null;
    }

    if (data.is_active === false) return null;

    return this.normalizeProfile(data);
  }

  normalizeProfile(profile) {
    if (!profile || !profile.role) return null;

    const isSuperAdmin =
      profile.role === TMS_CONFIG.roles.ADMIN &&
      profile.scope === TMS_CONFIG.scopes.SCHOOL_WIDE;

    return {
      id: profile.id,
      email: (profile.email || '').toLowerCase(),
      name: profile.name || (profile.email ? profile.email.split('@')[0] : 'TMS User'),
      role: profile.role,
      isSuperAdmin,
      title: profile.title || 'Staff Member',
      scope: profile.scope || TMS_CONFIG.scopes.OWN_RECORDS,
      department: profile.department || '—',
      assignedClass: profile.assigned_class || null,
      assignedSection: profile.assigned_section || null,
      phone: profile.phone || '',
      rawTitle: profile.title || '',
      rawDepartment: profile.department || '',
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
  }

  isAuthenticated() {
    return !!this.currentUser && !!this.currentUser.id && !!this.currentUser.role;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async login(email, password) {
    const client = dbService.getClient();
    if (!client) {
      return { success: false, error: 'Authentication service is unavailable. Please retry.' };
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '');

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email and password are required.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (error || !data || !data.user) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const profile = await this.loadProfile(data.user);
      if (!profile) {
        await client.auth.signOut();
        return {
          success: false,
          error: 'Your account has no assigned role yet. Please contact school administration.'
        };
      }

      this.currentUser = profile;
      this.saveCache(profile);
      return { success: true, user: profile };
    } catch (err) {
      return { success: false, error: 'Sign-in failed. Please try again.' };
    }
  }

  async requestPasswordReset(email) {
    const client = dbService.getClient();
    if (!client) return { success: false, error: 'Service unavailable.' };
    try {
      const { error } = await client.auth.resetPasswordForEmail(
        String(email || '').trim().toLowerCase(),
        { redirectTo: window.location.origin + '/login.html' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Unable to send reset email.' };
    }
  }

  async updateOwnProfile(fields) {
    const client = dbService.getClient();
    if (!client) return { success: false, error: 'Service unavailable.' };
    try {
      const { error } = await client.rpc('update_own_profile', {
        p_name: fields.name || null,
        p_title: fields.title || null,
        p_department: fields.department || null,
        p_phone: fields.phone || null,
        p_avatar: fields.avatar || null
      });
      if (error) return { success: false, error: error.message };
      await this.init();
      return { success: true, user: this.currentUser };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async changePassword(newPassword) {
    const client = dbService.getClient();
    if (!client) return { success: false, error: 'Service unavailable.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    try {
      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async adminSetPassword(userId, newPassword) {
    const client = dbService.getClient();
    if (!client) return { success: false, error: 'Service unavailable.' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    try {
      const { error } = await client.rpc('admin_set_password', {
        p_user_id: userId,
        p_new_password: newPassword
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /** Permanently remove a user's login and profile (admin only). */
  async adminDeleteUser(userId) {
    const client = dbService.getClient();
    if (!client) return { success: false, error: 'Service unavailable.' };
    if (!userId) return { success: false, error: 'No user selected.' };
    if (this.currentUser && this.currentUser.id === userId) {
      return { success: false, error: 'You cannot delete your own account.' };
    }
    try {
      const { error } = await client.rpc('admin_delete_user', { p_user_id: userId });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  saveCache(profile) {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(profile));
    } catch (e) {
      /* ignore quota errors */
    }
    window.dispatchEvent(new CustomEvent('tms_auth_changed', { detail: profile }));
  }

  clearCache() {
    localStorage.removeItem(this.sessionKey);
  }

  async logout() {
    const client = dbService.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        /* ignore */
      }
    }
    this.currentUser = null;
    this.clearCache();
    window.location.href = 'login.html';
  }
}

export const authService = new AuthService();
export default authService;
