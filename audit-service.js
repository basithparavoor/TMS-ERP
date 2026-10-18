/**
 * THAIBA MODEL SCHOOL — Immutable Audit Trail & Activity Logging Service
 */

import { authService } from './auth-service.js';
import { dbService } from './supabase-client.js';

class AuditService {
  constructor() {
    this.collection = 'audit_logs';
  }

  async log(action, category, details = {}, entityRef = null) {
    const user = authService.getCurrentUser() || {
      id: 'system_daemon',
      name: 'System Daemon',
      role: 'system'
    };

    const entry = {
      id: 'AUD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userScope: user.scope || 'school_wide',
      action: action, // e.g., 'STUDENT_ENROLLED', 'ATTENDANCE_CORRECTION', 'FEE_PAYMENT_COLLECTED'
      category: category, // e.g., 'ACADEMIC', 'FINANCE', 'ATTENDANCE', 'AUTH', 'SECURITY'
      entityRef: entityRef, // e.g., 'TMS-STU-1001', 'INV-2024-001'
      details: typeof details === 'string' ? details : JSON.stringify(details),
      ipAddress: '127.0.0.1 (Campus Intranet / Gateway)',
      clientAgent: navigator.userAgent
    };

    // Immutable append
    const logs = dbService.getLocal(this.collection);
    logs.unshift(entry);
    dbService.setLocal(this.collection, logs);

    // Queue for cloud sync if Supabase is connected
    const client = dbService.getClient();
    if (client && dbService.isOnline) {
      try {
        await client.from(this.collection).insert([entry]);
      } catch (err) {
        // Enqueue for background retry
        const pending = dbService.getLocal('audit_logs_pending');
        pending.push(entry);
        dbService.setLocal('audit_logs_pending', pending);
      }
    }

    console.log(`🛡️ [TMS AUDIT] ${action} by ${user.name} (${user.role}) - ${entry.id}`);
    return entry;
  }

  async getLogs(filterCategory = null) {
    const logs = dbService.getLocal(this.collection);
    if (!filterCategory || filterCategory === 'all') {
      return logs;
    }
    return logs.filter(l => l.category.toLowerCase() === filterCategory.toLowerCase());
  }
}

export const auditService = new AuditService();
export default auditService;
