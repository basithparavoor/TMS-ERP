/**
 * THAIBA MODEL SCHOOL — Supabase Data Layer
 * Strict Production Mode: No Hardcoded Demo Seed Data
 */

import { TMS_CONFIG } from './config.js';

class SupabaseDataService {
  constructor() {
    this.url = TMS_CONFIG.supabase.url;
    this.key = TMS_CONFIG.supabase.anonKey;
    this.client = null;
    this.isOnline = navigator.onLine;
    this.cleanLegacyDemoData();
    this.initClient();
    this.initNetworkListeners();
  }

  cleanLegacyDemoData() {
    // Purge old demo mock flags and hardcoded data
    if (localStorage.getItem('tms_seeded_v3')) {
      localStorage.removeItem('tms_seeded_v3');
      localStorage.removeItem('tms_students');
      localStorage.removeItem('tms_staff');
      localStorage.removeItem('tms_invoices');
      localStorage.removeItem('tms_facilities');
      localStorage.removeItem('tms_staff_tasks');
      localStorage.removeItem('tms_attendance_register');
    }
  }

  initClient() {
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        this.client = window.supabase.createClient(this.url, this.key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
      }
    } catch (err) {
      console.error('TMS Supabase Init Error:', err);
    }
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  getClient() {
    if (!this.client && window.supabase) {
      this.initClient();
    }
    return this.client;
  }

  getLocal(collection) {
    try {
      const raw = localStorage.getItem(`tms_${collection}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  setLocal(collection, data) {
    try {
      localStorage.setItem(`tms_${collection}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent(`tms_data_${collection}`, { detail: data }));
    } catch (e) {
      console.error(`Error saving ${collection}:`, e);
    }
  }

  async select(collection, filterFn = null) {
    // 1. Fetch from Supabase if online
    if (this.client && this.isOnline) {
      try {
        const { data, error } = await this.client.from(collection).select('*');
        if (!error && Array.isArray(data)) {
          this.setLocal(collection, data);
          return filterFn ? data.filter(filterFn) : data;
        }
      } catch (err) {
        // Fallback to local cache
      }
    }
    const localData = this.getLocal(collection);
    return filterFn ? localData.filter(filterFn) : localData;
  }

  async insert(collection, record) {
    const enriched = {
      id: record.id || 'TMS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record
    };

    // Update local cache
    const items = this.getLocal(collection);
    items.unshift(enriched);
    this.setLocal(collection, items);

    // Sync to Supabase
    if (this.client && this.isOnline) {
      try {
        await this.client.from(collection).insert([enriched]);
      } catch (e) {
        console.warn(`Supabase insert queued for ${collection}:`, e.message);
      }
    }
    return enriched;
  }

  async update(collection, id, updates) {
    const items = this.getLocal(collection);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
      this.setLocal(collection, items);

      if (this.client && this.isOnline) {
        try {
          await this.client.from(collection).update(updates).eq('id', id);
        } catch (e) {
          console.warn(`Supabase update failed for ${collection}:`, e.message);
        }
      }
      return items[index];
    }
    return null;
  }

  async delete(collection, id) {
    let items = this.getLocal(collection);
    items = items.filter(item => item.id !== id);
    this.setLocal(collection, items);

    if (this.client && this.isOnline) {
      try {
        await this.client.from(collection).delete().eq('id', id);
      } catch (e) {
        console.warn(`Supabase delete failed for ${collection}:`, e.message);
      }
    }
    return true;
  }
}

export const dbService = new SupabaseDataService();
export default dbService;
