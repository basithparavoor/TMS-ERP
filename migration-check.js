/**
 * THAIBA MODEL SCHOOL — Database migration self-check
 *
 * The ERP relies on add-on objects created by `schema-update-2.sql`. If that
 * migration has not been applied to the connected Supabase project, every
 * request to those tables returns HTTP 404 and features fail silently.
 *
 * This helper probes for the tables and shows one clear, dismissible banner
 * explaining exactly what to do, instead of a wall of console 404s.
 */

import { dbService } from './supabase-client.js';

const REQUIRED_TABLES = [
  'admission_form_fields',
  'admission_fees',
  'admission_settings',
  'notifications',
  'notification_reads',
  'parent_credentials',
  'staff_credentials',
  'login_aliases',
  'app_settings'
];

let shown = false;

function banner(missing) {
  if (shown) return;
  if (document.getElementById('tms-migration-banner')) return;
  shown = true;

  const el = document.createElement('div');
  el.id = 'tms-migration-banner';
  el.setAttribute('role', 'alert');
  el.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
    'background:#7f1d1d', 'color:#fff', 'padding:12px 16px',
    'font-family:system-ui,Segoe UI,sans-serif', 'font-size:13px',
    'line-height:1.5', 'box-shadow:0 4px 14px rgba(0,0,0,.35)'
  ].join(';');

  el.innerHTML = `
    <div style="display:flex;gap:12px;align-items:flex-start;max-width:1100px;margin:0 auto;">
      <div style="flex:1;">
        <strong style="font-size:14px;">Database setup incomplete — required tables are missing.</strong><br>
        Open your Supabase project → <strong>SQL Editor</strong>, paste the full contents of
        <code style="background:rgba(255,255,255,.15);padding:1px 5px;border-radius:4px;">schema-update-2.sql</code>
        and click <strong>Run</strong>. Then reload this page.<br>
        <span style="opacity:.85;">Missing: ${missing.join(', ')}</span>
      </div>
      <button type="button" aria-label="Dismiss"
        style="flex-shrink:0;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;">
        Dismiss
      </button>
    </div>
  `;
  el.querySelector('button').addEventListener('click', () => el.remove());
  document.body.appendChild(el);
}

/**
 * Probe for the add-on tables. Returns the list of missing table names.
 * Never throws: an unreachable/offline database reports nothing.
 */
export async function checkMigration() {
  const client = dbService.getClient ? dbService.getClient() : null;
  if (!client) return [];

  const missing = [];
  await Promise.all(REQUIRED_TABLES.map(async (table) => {
    try {
      const { error } = await client.from(table).select('id').limit(1);
      if (!error) return;
      const code = error.code || '';
      const msg = error.message || '';
      if (code === '42P01' || code === 'PGRST205' || /does not exist|schema cache|not find the table/i.test(msg)) {
        missing.push(table);
      }
    } catch (e) {
      // Network/permission error — not a missing-table signal.
    }
  }));

  if (missing.length) banner(missing.sort());
  return missing;
}

export default checkMigration;
