/**
 * THAIBA MODEL SCHOOL — Supabase Data Layer
 * Strict Production Mode: No Hardcoded Demo Seed Data
 *
 * Converts between the database's snake_case columns and the application's
 * camelCase field names at this single boundary, so modules can use one style.
 */

import { TMS_CONFIG } from './config.js';

const toCamel = (key) => key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const toSnake = (key) => key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

function rowFromDb(row) {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;
  return out;
}

function rowToDb(row) {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[toSnake(k)] = v;
  return out;
}

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
            autoRefreshToken: true,
            detectSessionInUrl: true
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
        if (error) throw error;
        if (Array.isArray(data)) {
          const mapped = data.map(rowFromDb);
          this.setLocal(collection, mapped);
          return filterFn ? mapped.filter(filterFn) : mapped;
        }
      } catch (err) {
        console.warn(`Supabase select failed for ${collection}, using local cache:`, err.message);
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

    // Update local cache (camelCase form)
    const items = this.getLocal(collection);
    items.unshift(enriched);
    this.setLocal(collection, items);

    // Sync to Supabase
    if (this.client && this.isOnline) {
      try {
        const { error } = await this.client.from(collection).insert([rowToDb(enriched)]);
        if (error) throw error;
      } catch (e) {
        console.error(`Supabase insert FAILED for ${collection}:`, e.message);
        return { ...enriched, _syncError: e.message };
      }
    }
    return enriched;
  }

  async upsert(collection, record, onConflict = 'id') {
    const enriched = { ...record, updated_at: new Date().toISOString() };

    const items = this.getLocal(collection);
    const index = items.findIndex(item => item.id === enriched.id);
    if (index !== -1) items[index] = { ...items[index], ...enriched };
    else if (enriched.id) items.unshift(enriched);
    this.setLocal(collection, items);

    if (this.client && this.isOnline) {
      try {
        const { error } = await this.client
          .from(collection)
          .upsert(rowToDb(enriched), { onConflict });
        if (error) throw error;
      } catch (e) {
        console.error(`Supabase upsert FAILED for ${collection}:`, e.message);
        return { ...enriched, _syncError: e.message };
      }
    }
    return enriched;
  }

  async update(collection, id, updates) {
    const items = this.getLocal(collection);
    const index = items.findIndex(item => item.id === id);
    const stamped = { ...updates, updated_at: new Date().toISOString() };

    if (index !== -1) {
      items[index] = { ...items[index], ...stamped };
      this.setLocal(collection, items);
    }

    if (this.client && this.isOnline) {
      try {
        const { error } = await this.client.from(collection).update(rowToDb(updates)).eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error(`Supabase update FAILED for ${collection}:`, e.message);
        return index !== -1
          ? { ...items[index], _syncError: e.message }
          : { id, ...stamped, _syncError: e.message };
      }
    }

    return index !== -1 ? items[index] : { id, ...stamped };
  }

  async delete(collection, id) {
    const ids = Array.isArray(id) ? id : [id];
    const idSet = new Set(ids);
    let items = this.getLocal(collection);
    items = items.filter(item => !idSet.has(item.id) && !idSet.has(item.appId) && !idSet.has(item.app_id));
    this.setLocal(collection, items);

    if (this.client && this.isOnline) {
      try {
        for (const singleId of ids) {
          let query = this.client.from(collection).delete();
          if (collection === 'admissions_applications') {
            query = query.or(`id.eq.${singleId},app_id.eq.${singleId}`);
          } else {
            query = query.eq('id', singleId);
          }
          const { error } = await query;
          if (error) throw error;
        }
      } catch (e) {
        console.error(`Supabase delete FAILED for ${collection}:`, e.message);
        return false;
      }
    }
    return true;
  }
}

export const dbService = new SupabaseDataService();
export default dbService;
