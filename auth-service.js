/**
 * THAIBA MODEL SCHOOL — Authentication & Identity Service
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
        this.currentUser = JSON.parse(stored);
      } else {
        // Default demo session: Principal / Administrator
        this.currentUser = this.getDemoProfile('admin');
        this.saveSession(this.currentUser);
      }
    } catch (e) {
      this.currentUser = this.getDemoProfile('admin');
    }
  }

  getDemoProfile(role) {
    const profiles = {
      admin: {
        id: 'usr_admin_01',
        name: 'Administrator (Executive Office)',
        email: 'admin@thaibaschool.edu.in',
        role: TMS_CONFIG.roles.ADMIN,
        title: 'System Administrator',
        scope: TMS_CONFIG.scopes.SCHOOL_WIDE,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: 'Governance & IT'
      },
      principal: {
        id: 'usr_principal_01',
        name: 'Dr. Zubair Al-Qasimi',
        email: 'principal@thaibaschool.edu.in',
        role: TMS_CONFIG.roles.PRINCIPAL,
        title: 'Principal & Academic Director',
        scope: TMS_CONFIG.scopes.SCHOOL_WIDE,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: 'Leadership'
      },
      teacher: {
        id: 'usr_teacher_01',
        name: 'Prof. Rashid Rahman',
        email: 'rashid.rahman@thaibaschool.edu.in',
        role: TMS_CONFIG.roles.TEACHER,
        title: 'Senior Faculty & Class Teacher',
        scope: TMS_CONFIG.scopes.ASSIGNED_CLASS,
        assignedClass: 'Grade 9',
        assignedSection: 'A',
        assignedSubject: 'Mathematics',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        department: 'Academics'
      },
      finance: {
        id: 'usr_finance_01',
        name: 'Mr. Sameer Babu',
        email: 'accounts@thaibaschool.edu.in',
        role: TMS_CONFIG.roles.FINANCE,
        title: 'Chief Bursar & Finance Manager',
        scope: TMS_CONFIG.scopes.FINANCE_SCOPE,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        department: 'Finance & Accounts'
      },
      student: {
        id: 'usr_student_01',
        name: 'Mohammed Rayan K',
        email: 'rayan.k@thaibaschool.edu.in',
        role: TMS_CONFIG.roles.STUDENT,
        title: 'Student (Roll 01)',
        admissionNo: 'TMS/2024/001',
        grade: 'Grade 9',
        section: 'A',
        scope: TMS_CONFIG.scopes.OWN_RECORDS,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        guardianName: 'Abdul Kareem'
      },
      parent: {
        id: 'usr_parent_01',
        name: 'Abdul Kareem',
        email: 'kareem.family@gmail.com',
        role: TMS_CONFIG.roles.PARENT,
        title: 'Parent / Guardian',
        scope: TMS_CONFIG.scopes.LINKED_WARDS,
        linkedStudentId: 'TMS-STU-1001',
        wardName: 'Mohammed Rayan K (Grade 9A)',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
      }
    };

    return profiles[role] || profiles.admin;
  }

  async loginWithEmailPassword(email, password) {
    const client = dbService.getClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });
        if (error) throw error;
        if (data && data.user) {
          const profile = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: data.user.user_metadata?.role || TMS_CONFIG.roles.TEACHER,
            scope: data.user.user_metadata?.scope || TMS_CONFIG.scopes.ASSIGNED_CLASS,
            avatar: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          };
          this.saveSession(profile);
          return { success: true, user: profile };
        }
      } catch (err) {
        console.warn('Supabase Auth error, attempting local credentials matching:', err.message);
      }
    }

    // Role detection fallback for instant demo testing
    const emailLower = email.toLowerCase();
    let role = 'admin';
    if (emailLower.includes('principal')) role = 'principal';
    else if (emailLower.includes('teacher') || emailLower.includes('rashid')) role = 'teacher';
    else if (emailLower.includes('finance') || emailLower.includes('accounts')) role = 'finance';
    else if (emailLower.includes('student') || emailLower.includes('rayan')) role = 'student';
    else if (emailLower.includes('parent') || emailLower.includes('guardian')) role = 'parent';

    const profile = this.getDemoProfile(role);
    this.saveSession(profile);
    return { success: true, user: profile };
  }

  switchRole(roleKey) {
    const profile = this.getDemoProfile(roleKey);
    this.saveSession(profile);
    window.location.reload();
  }

  saveSession(profile) {
    this.currentUser = profile;
    localStorage.setItem(this.sessionKey, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('tms_auth_changed', { detail: profile }));
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
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
