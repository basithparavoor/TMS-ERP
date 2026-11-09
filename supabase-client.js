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

const KNOWN_STUDENT_COLS = new Set([
  'id', 'admission_no', 'roll_no', 'full_name', 'gender', 'dob', 'grade', 'section',
  'guardian_name', 'guardian_phone', 'blood_group', 'address', 'status', 'leave_status',
  'created_at', 'updated_at', 'user_id', 'photo', 'application_id', 'aadhaar',
  'allergies', 'medical_conditions', 'emergency_physician', 'emergency_hospital_phone', 'medical_notes'
]);

function rowFromDb(row, collection = null) {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v;

  if (row.medical_notes && typeof row.medical_notes === 'string' && row.medical_notes.includes('__tms_meta__')) {
    try {
      const parsed = JSON.parse(row.medical_notes);
      if (parsed && parsed.__tms_meta__) {
        Object.assign(out, parsed.__tms_meta__);
        out.medicalNotes = parsed.note || '';
      }
    } catch (e) {}
  }

  // Normalize aadharNo / aadhaar
  if (!out.aadharNo && out.aadhaar) out.aadharNo = out.aadhaar;
  if (!out.aadhaar && out.aadharNo) out.aadhaar = out.aadharNo;

  if (collection === 'academic_classes') {
    if (!out.name && out.grade) out.name = out.grade;
    if (!out.room && out.roomNo) out.room = out.roomNo;
  }

  if (collection === 'app_settings') {
    if (!out.key && out.id) out.key = out.id;
    if (!out.id && out.key) out.id = out.key;
  }

  return out;
}

function rowToDb(row, collection = null) {
  if (!row || typeof row !== 'object') return row;

  if (collection === 'academic_classes') {
    const classOut = {};
    const gradeVal = row.grade || row.name || '';
    if (gradeVal) classOut.grade = gradeVal;
    if (row.id) classOut.id = row.id;
    if (row.section !== undefined) classOut.section = row.section;
    if (row.roomNo !== undefined || row.room !== undefined) classOut.roomNo = row.roomNo || row.room;
    if (row.capacity !== undefined) classOut.capacity = Number(row.capacity) || 35;
    if (row.teacher !== undefined) classOut.teacher = row.teacher;
    if (row.teacherId !== undefined) classOut.teacherId = row.teacherId;
    if (row.periods !== undefined) classOut.periods = Number(row.periods) || 35;
    if (row.status !== undefined) classOut.status = row.status || 'Active';
    if (row.created_at !== undefined) classOut.created_at = row.created_at;
    return classOut;
  }

  if (collection === 'academic_sessions') {
    const sessOut = {};
    const KNOWN_SESS = new Set(['id', 'sessionName', 'startDate', 'endDate', 'isCurrent', 'terms', 'status', 'created_at']);
    for (const [k, v] of Object.entries(row)) {
      if (KNOWN_SESS.has(k)) sessOut[k] = v;
      else if (k === 'session_name') sessOut.sessionName = v;
      else if (k === 'start_date') sessOut.startDate = v;
      else if (k === 'end_date') sessOut.endDate = v;
      else if (k === 'is_current') sessOut.isCurrent = v;
    }
    return sessOut;
  }

  if (collection === 'academic_periods') {
    const perOut = {};
    const KNOWN_PER = new Set(['id', 'name', 'periodNo', 'startTime', 'endTime', 'durationMins', 'isBreak', 'orderIndex', 'status', 'created_at']);
    for (const [k, v] of Object.entries(row)) {
      if (KNOWN_PER.has(k)) perOut[k] = v;
      else if (k === 'period_no') perOut.periodNo = v;
      else if (k === 'start_time') perOut.startTime = v;
      else if (k === 'end_time') perOut.endTime = v;
      else if (k === 'duration_mins') perOut.durationMins = v;
      else if (k === 'is_break') perOut.isBreak = v;
      else if (k === 'order_index') perOut.orderIndex = v;
    }
    return perOut;
  }

  if (collection === 'academic_subjects') {
    const subjOut = {};
    const KNOWN_SUBJ = new Set(['id', 'code', 'name', 'classification', 'credits', 'hod', 'lab', 'created_at']);
    for (const [k, v] of Object.entries(row)) {
      if (KNOWN_SUBJ.has(k)) subjOut[k] = v;
    }
    return subjOut;
  }

  if (collection === 'app_settings') {
    const settingsOut = {};
    const rowId = row.id || row.key;
    if (rowId) settingsOut.id = String(rowId);
    if (row.value !== undefined) settingsOut.value = row.value;
    if (row.created_at !== undefined) settingsOut.created_at = row.created_at;
    if (row.updated_at !== undefined) settingsOut.updated_at = row.updated_at;
    return settingsOut;
  }

  const out = {};
  const meta = {};

  for (const [k, v] of Object.entries(row)) {
    const snake = toSnake(k);
    if (collection === 'students' && !KNOWN_STUDENT_COLS.has(snake)) {
      meta[k] = v;
    } else {
      out[snake] = v;
    }
  }

  if (collection === 'students' && Object.keys(meta).length > 0) {
    let existingMeta = {};
    if (out.medical_notes && typeof out.medical_notes === 'string') {
      try {
        const parsed = JSON.parse(out.medical_notes);
        if (parsed && parsed.__tms_meta__) existingMeta = parsed.__tms_meta__;
      } catch (e) {}
    }
    const combinedMeta = { ...existingMeta, ...meta };
    out.medical_notes = JSON.stringify({
      __tms_meta__: combinedMeta,
      note: row.medicalNotes || row.medical_notes || ''
    });
  }

  // Sync aadharNo / aadhaar
  if (row.aadharNo && !out.aadhaar) out.aadhaar = row.aadharNo;

  if (collection === 'students') {
    // 1. Ensure section is always present (students relation has NOT NULL constraint on section)
    if (!out.section || !String(out.section).trim()) {
      out.section = 'A';
    }

    // 2. Ensure grade is never empty
    if (!out.grade && (row.grade || row.class)) {
      out.grade = row.grade || row.class;
    } else if (!out.grade) {
      out.grade = 'STD-I';
    }

    // 3. Ensure full_name and status
    if (!out.full_name && row.fullName) {
      out.full_name = row.fullName;
    }
    if (!out.status) {
      out.status = 'active';
    }
  }

  // Universal Sanitization for ANY collection:
  // Convert empty strings "" in date/time/timestamp/numeric fields to null to satisfy PostgreSQL strict typings
  for (const [col, val] of Object.entries(out)) {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      const isDateCol = col.endsWith('_date') || col.endsWith('_at') || col.includes('dob') || col === 'date' || col === 'due_date' || col === 'paid_date' || col === 'start_date' || col === 'end_date' || col === 'join_date';
      if (trimmed === '' && isDateCol) {
        out[col] = null;
      }
    }
  }

  return out;
}

class SupabaseDataService {
  constructor() {
    this.url = TMS_CONFIG.supabase.url;
    this.key = TMS_CONFIG.supabase.anonKey;
    this.client = null;
    this.isOnline = navigator.onLine;
    this._memCache = new Map();
    this._memCacheTime = new Map();
    // Missing tables cache (in-memory + sessionStorage) to avoid repeated 404s
    try {
      const storedMissing = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tms_missing_tables') : null;
      this._missingTables = storedMissing ? new Set(JSON.parse(storedMissing)) : new Set();
    } catch {
      this._missingTables = new Set();
    }
    this._cacheTTL = 60000; // 60 seconds memory cache
    this.cleanLegacyDemoData();
    this.initClient();
    this.initNetworkListeners();
    if (this.isOnline) {
      setTimeout(() => this.processQueue(), 1500);
    }
  }

  _recordMissingTable(collection) {
    if (!this._missingTables) this._missingTables = new Set();
    this._missingTables.add(collection);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('tms_missing_tables', JSON.stringify(Array.from(this._missingTables)));
      }
    } catch { /* ignore */ }
  }

  getQueue() {
    try {
      const raw = localStorage.getItem('tms_offline_queue');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  setQueue(queue) {
    try {
      localStorage.setItem('tms_offline_queue', JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('tms_sync_queue_changed', { detail: { count: queue.length } }));
    } catch (e) { /* ignore */ }
  }

  addToQueue(action, collection, payload) {
    const queue = this.getQueue();
    queue.push({
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      action,
      collection,
      payload,
      timestamp: new Date().toISOString()
    });
    this.setQueue(queue);
  }

  async processQueue() {
    if (!this.client || !this.isOnline) return;
    const queue = this.getQueue();
    if (!queue.length) return;

    console.log(`[Offline Sync] Processing ${queue.length} queued mutation(s)...`);
    const remaining = [];

    for (const item of queue) {
      try {
        if (item.action === 'insert') {
          await this.client.from(item.collection).insert([rowToDb(item.payload, item.collection)]);
        } else if (item.action === 'upsert') {
          await this.client.from(item.collection).upsert(rowToDb(item.payload, item.collection));
        } else if (item.action === 'update') {
          await this.client.from(item.collection).update(rowToDb(item.payload.updates, item.collection)).eq('id', item.payload.id);
        } else if (item.action === 'delete') {
          await this.client.from(item.collection).delete().eq('id', item.payload.id);
        }
      } catch (err) {
        const isFatal = /row-level security|policy|permission denied|42501|403|unauthorized|schema cache|syntax for type|violates not-null|violates check/i.test(err.message || '') || err.code === '42501' || err.code === '22007' || err.code === '23502';
        if (!isFatal) {
          console.warn(`[Offline Sync] Item ${item.id} retry deferred:`, err.message);
          remaining.push(item);
        } else {
          console.warn(`[Offline Sync] Dropped ${item.collection} item ${item.id} due to cloud constraint/policy:`, err.message);
        }
      }
    }

    this.setQueue(remaining);
    if (!remaining.length && window.UIComponents) {
      window.UIComponents.showToast('All offline changes synced with campus server!', 'success');
    }
  }

  cleanLegacyDemoData() {
    // Purge old demo mock flags, sample data, and hardcoded templates
    try {
      const demoKeys = [
        'tms_seeded_v3',
        'tms_mock_users'
      ];
      demoKeys.forEach(k => localStorage.removeItem(k));

      // Sanitize and purge any stuck queue entries from offline queue
      const rawQueue = localStorage.getItem('tms_offline_queue');
      if (rawQueue) {
        try {
          const parsed = JSON.parse(rawQueue);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map(item => {
              if (item.collection === 'app_settings' && item.payload) {
                if (item.payload.key && !item.payload.id) {
                  item.payload.id = item.payload.key;
                  delete item.payload.key;
                }
              }
              if (item.collection === 'students' && item.payload) {
                if (!item.payload.section || !String(item.payload.section).trim()) {
                  item.payload.section = 'A';
                }
                const DATE_COLS = ['dob', 'admissionDate', 'classJoinDate', 'admission_date', 'class_join_date'];
                for (const d of DATE_COLS) {
                  if (item.payload[d] !== undefined && (item.payload[d] === '' || (typeof item.payload[d] === 'string' && !item.payload[d].trim()))) {
                    item.payload[d] = null;
                  }
                }
              }
              return item;
            }).filter(item => {
              if (item.collection === 'app_settings' && item.payload && item.payload.key) return false;
              if (item.collection === 'academic_classes' && item.payload && item.payload.name) return false;
              return true;
            });
            localStorage.setItem('tms_offline_queue', JSON.stringify(cleaned));
          }
        } catch (_) {
          localStorage.removeItem('tms_offline_queue');
        }
      }

      const collections = [
        'assignments',
        'calendar_events',
        'syllabus_topics',
        'students',
        'staff',
        'invoices',
        'facilities',
        'staff_tasks',
        'attendance_register',
        'attendance_records',
        'admissions_applications'
      ];
      collections.forEach(col => {
        const raw = localStorage.getItem(`tms_${col}`);
        if (raw && (raw.includes('hw_1') || raw.includes('ev_1') || raw.includes('syl-1') || raw.includes('demo') || raw.includes('TMS-VCZR7PVGW') || raw.includes('TMS-IAM89T42J') || raw.includes('TMS-V7YXHBQAF'))) {
          localStorage.removeItem(`tms_${col}`);
        }
      });
    } catch (e) { /* ignore */ }
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
      this.processQueue();
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
      this.invalidateCache(collection);
      localStorage.setItem(`tms_${collection}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent(`tms_data_${collection}`, { detail: data }));
    } catch (e) {
      console.error(`Error saving ${collection}:`, e);
    }
  }

  invalidateCache(collection = null) {
    if (collection) {
      this._memCache.delete(collection);
      this._memCacheTime.delete(collection);
    } else {
      this._memCache.clear();
      this._memCacheTime.clear();
    }
  }

  async select(collection, filterFn = null, forceRefresh = false) {
    if (this._missingTables && this._missingTables.has(collection)) {
      const local = this.getLocal(collection);
      return filterFn ? local.filter(filterFn) : [...local];
    }
    const now = Date.now();

    // 1. In-Memory RAM Cache (Instant 0ms)
    if (!forceRefresh && this._memCache.has(collection)) {
      const cachedTime = this._memCacheTime.get(collection) || 0;
      if (now - cachedTime < this._cacheTTL) {
        const cached = this._memCache.get(collection);
        return filterFn ? cached.filter(filterFn) : [...cached];
      }
    }

    // 2. LocalStorage Instant Cache (0ms response - eliminates tab shifting latency)
    const localData = this.getLocal(collection);
    if (!forceRefresh && Array.isArray(localData) && localData.length > 0) {
      this._memCache.set(collection, localData);
      this._memCacheTime.set(collection, now);

      // Background silent revalidation (non-blocking)
      if (this.client && this.isOnline && !this._missingTables.has(collection)) {
        this.client.from(collection).select('*').then(({ data, error }) => {
          if (error) {
            if (error.code === '42P01' || error.status === 404 || String(error.message || '').includes('does not exist') || String(error.message || '').includes('404')) {
              this._recordMissingTable(collection);
            }
            return;
          }
          if (!error && Array.isArray(data)) {
            const mapped = data.map(r => rowFromDb(r, collection));
            const currentLocal = this.getLocal(collection);
            if (mapped.length > 0 || currentLocal.length === 0) {
              this._memCache.set(collection, mapped);
              this._memCacheTime.set(collection, Date.now());
              this.setLocal(collection, mapped);
            }
          }
        }).catch(() => {});
      }

      return filterFn ? localData.filter(filterFn) : [...localData];
    }

    // 3. Fetch from Supabase if online (when forced or first time on empty cache)
    if (this.client && this.isOnline && !this._missingTables.has(collection)) {
      try {
        const { data, error } = await this.client.from(collection).select('*');
        if (error) throw error;
        if (Array.isArray(data)) {
          let mapped = data.map(r => rowFromDb(r, collection));
          if (mapped.length > 0 || localData.length === 0) {
            // Preserve locally saved records that may not yet exist on the remote database
            if (localData && localData.length > 0) {
              const mappedIds = new Set(mapped.map(m => m.id));
              const localUnsynced = localData.filter(loc => loc && loc.id && !mappedIds.has(loc.id));
              if (localUnsynced.length > 0) {
                mapped = [...mapped, ...localUnsynced];
              }
            }
            this._memCache.set(collection, mapped);
            this._memCacheTime.set(collection, now);
            this.setLocal(collection, mapped);
            return filterFn ? mapped.filter(filterFn) : [...mapped];
          }
        }
      } catch (err) {
        if (err && (err.code === '42P01' || err.status === 404 || String(err.message || '').includes('404') || String(err.message || '').includes('does not exist'))) {
          this._recordMissingTable(collection);
        }
        console.warn(`Supabase select failed for ${collection}, using local cache:`, err.message);
      }
    }

    this._memCache.set(collection, localData);
    this._memCacheTime.set(collection, now);
    return filterFn ? localData.filter(filterFn) : [...localData];
  }

  async insert(collection, record) {
    this.invalidateCache(collection);
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
        const { error } = await this.client.from(collection).insert([rowToDb(enriched, collection)]);
        if (error) throw error;
      } catch (e) {
        console.error(`Supabase insert FAILED for ${collection}:`, e.message);
        this.addToQueue('insert', collection, enriched);
        return { ...enriched, _syncError: e.message, _queued: true };
      }
    } else {
      this.addToQueue('insert', collection, enriched);
    }
    return enriched;
  }

  async upsert(collection, record, onConflict = 'id') {
    this.invalidateCache(collection);
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
          .upsert(rowToDb(enriched, collection), { onConflict });
        if (error) throw error;
      } catch (e) {
        const isRlsError = /row-level security|policy|permission denied|42501|403|unauthorized/i.test(e.message || '') || e.code === '42501';
        if (!isRlsError) {
          console.error(`Supabase upsert FAILED for ${collection}:`, e.message);
          this.addToQueue('upsert', collection, enriched);
        } else {
          console.warn(`Supabase upsert for ${collection} stored locally (cloud policy restricted):`, e.message);
        }
        return { ...enriched, _syncError: e.message, _queued: !isRlsError };
      }
    } else {
      this.addToQueue('upsert', collection, enriched);
    }
    return enriched;
  }

  async update(collection, id, updates) {
    this.invalidateCache(collection);
    const items = this.getLocal(collection);
    const index = items.findIndex(item => item.id === id);
    const stamped = { ...updates, updated_at: new Date().toISOString() };

    if (index !== -1) {
      items[index] = { ...items[index], ...stamped };
      this.setLocal(collection, items);
    }

    if (this.client && this.isOnline) {
      try {
        const { error } = await this.client.from(collection).update(rowToDb(updates, collection)).eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error(`Supabase update FAILED for ${collection}:`, e.message);
        this.addToQueue('update', collection, { id, updates: stamped });
        return index !== -1
          ? { ...items[index], _syncError: e.message, _queued: true }
          : { id, ...stamped, _syncError: e.message, _queued: true };
      }
    } else {
      this.addToQueue('update', collection, { id, updates: stamped });
    }

    return index !== -1 ? items[index] : { id, ...stamped };
  }

  async delete(collection, id) {
    this.invalidateCache(collection);
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
        for (const singleId of ids) {
          this.addToQueue('delete', collection, { id: singleId });
        }
        return false;
      }
    } else {
      for (const singleId of ids) {
        this.addToQueue('delete', collection, { id: singleId });
      }
    }
    return true;
  }
}

export const dbService = new SupabaseDataService();
export default dbService;
