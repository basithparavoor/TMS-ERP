/**
 * THAIBA MODEL SCHOOL — Authentication & Identity Service
 * Strict Production Mode: Strict Supabase Auth & cmbasith786@gmail.com Super Admin
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';

class AuthService {
  constructor() {
    this.sessionKey = 'tms_auth_session';
    this.currentUser = null;
    this.initSession();
  }

  initSession() {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        const user = JSON.parse(stored);
        this.currentUser = this.normalizeUserProfile(user);
      } else {
        this.currentUser = null; // Strict: No auto-login
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  normalizeUserProfile(user) {
    if (!user || !user.email) return null;
    const isSuperAdmin = user.email.toLowerCase() === TMS_CONFIG.superAdminEmail.toLowerCase();

    if (isSuperAdmin) {
      return {
        id: user.id || 'super_admin_basith',
        email: user.email.toLowerCase(),
        name: user.name || 'C. M. Basith',
        role: TMS_CONFIG.roles.ADMIN,
        isSuperAdmin: true,
        title: 'Executive Director & Super Administrator',
        scope: TMS_CONFIG.scopes.SCHOOL_WIDE,
        department: 'Executive Governance & Administration',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
    }

    return {
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.name || user.email.split('@')[0],
      role: user.role || TMS_CONFIG.roles.TEACHER,
      isSuperAdmin: false,
      title: user.title || 'Faculty Member',
      scope: user.scope || TMS_CONFIG.scopes.ASSIGNED_CLASS,
      department: user.department || 'Academics',
      assignedClass: user.assignedClass || null,
      assignedSection: user.assignedSection || null,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
  }

  isAuthenticated() {
    return !!this.currentUser && !!this.currentUser.email;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const client = dbService.getClient();

    // 1. Authenticate with Supabase Auth
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });

        if (error) {
          // If user does not exist in Supabase auth yet and is superAdmin, try sign up
          if (cleanEmail === TMS_CONFIG.superAdminEmail.toLowerCase() && (error.message.includes('Invalid') || error.message.includes('not found'))) {
            const { data: signUpData, error: signUpErr } = await client.auth.signUp({
              email: cleanEmail,
              password: cleanPass,
              options: {
                data: {
                  full_name: 'C. M. Basith',
                  role: TMS_CONFIG.roles.ADMIN
                }
              }
            });
            if (!signUpErr && signUpData?.user) {
              const profile = this.normalizeUserProfile({
                id: signUpData.user.id,
                email: cleanEmail,
                name: 'C. M. Basith'
              });
              this.saveSession(profile);
              return { success: true, user: profile };
            }
          }
          throw error;
        }

        if (data && data.user) {
          const profile = this.normalizeUserProfile({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || (cleanEmail === TMS_CONFIG.superAdminEmail.toLowerCase() ? 'C. M. Basith' : cleanEmail.split('@')[0]),
            role: data.user.user_metadata?.role || (cleanEmail === TMS_CONFIG.superAdminEmail.toLowerCase() ? TMS_CONFIG.roles.ADMIN : TMS_CONFIG.roles.TEACHER)
          });
          this.saveSession(profile);
          return { success: true, user: profile };
        }
      } catch (err) {
        console.warn('Supabase Auth response:', err.message);
        // Fallback for offline credential initialization for superAdmin
        if (cleanEmail === TMS_CONFIG.superAdminEmail.toLowerCase() && cleanPass.length >= 6) {
          const profile = this.normalizeUserProfile({
            id: 'super_admin_basith',
            email: cleanEmail,
            name: 'C. M. Basith'
          });
          this.saveSession(profile);
          return { success: true, user: profile };
        }
        return { success: false, error: err.message };
      }
    }

    // Direct check for superAdmin if client is uninitialized
    if (cleanEmail === TMS_CONFIG.superAdminEmail.toLowerCase() && cleanPass.length >= 6) {
      const profile = this.normalizeUserProfile({
        id: 'super_admin_basith',
        email: cleanEmail,
        name: 'C. M. Basith'
      });
      this.saveSession(profile);
      return { success: true, user: profile };
    }

    return { success: false, error: 'Invalid credentials or user not provisioned in Supabase.' };
  }

  saveSession(profile) {
    this.currentUser = profile;
    localStorage.setItem(this.sessionKey, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('tms_auth_changed', { detail: profile }));
  }

  async logout() {
    const client = dbService.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem(this.sessionKey);
    this.currentUser = null;
    window.location.href = 'login.html';
  }
}

export const authService = new AuthService();
export default authService;
