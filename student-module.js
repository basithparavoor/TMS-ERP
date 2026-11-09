
export const SAMPLE_STUDENTS = [];

/**
 * THAIBA MODEL SCHOOL — Student Lifecycle, Admissions & Identity Module
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';
import { UIComponents } from './ui-components.js';
import { auditService } from './audit-service.js';
import { PermissionEngine, CAPABILITIES } from './permission-engine.js';
import { downloadCsv, exportPdf, formatPdfFilename } from './export-utils.js';
import { TMS_LOGO } from './logo.js';
import { admissionService } from './admission-service.js';
import { BiometricCredentialModal } from './biometric-credential-modal.js';


export const DEFAULT_STUDENT_FIELDS = [
  { key: 'admissionNo', label: 'ID', category: 'Core Identity', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'TMS/2026/001', sample2: 'TMS/2026/002', keywords: ['id', 'admission no', 'admission', 'adm no', 'student id'] },
  { key: 'fullName', label: 'NAME', category: 'Core Identity', type: 'text', defaultType: 'text', required: true, active: true, sample1: 'Aayan Khan', sample2: 'Fatima Zahra', keywords: ['name', 'full name', 'student name', 'candidate name'] },
  { key: 'grade', label: 'CLASS', category: 'Core Identity', type: 'dropdown', defaultType: 'dropdown', required: true, active: true, options: ['STD-I', 'STD-II', 'STD-III', 'STD-IV', 'STD-V', 'STD-VI', 'STD-VII', 'STD-VIII', 'STD-IX', 'STD-X', 'STD-XI', 'STD-XII', 'Nursery', 'LKG', 'UKG'], sample1: 'STD-IV', sample2: 'STD-II', keywords: ['class', 'grade', 'standard'] },
  { key: 'govtStudentId', label: 'GOVERNMENT STUDENT ID', category: 'Government IDs', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'WB19041234567', sample2: 'WB19041234568', keywords: ['government student id', 'govt student id', 'banglar shiksha id', 'banglar shiksha', 'govt id'] },
  { key: 'apaarId', label: 'APAAR ID', category: 'Government IDs', type: 'text', defaultType: 'text', required: false, active: true, sample1: '987654321012', sample2: '987654321013', keywords: ['apaar id', 'apaar', 'one nation one student id', 'abc id'] },
  { key: 'minorityId', label: 'MINORITY ID', category: 'Government IDs', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'MIN-WB-00441', sample2: 'MIN-WB-00442', keywords: ['minority id', 'minority', 'oasid', 'oikyshiree'] },
  { key: 'kanyashreeId', label: 'KANYASHREE ID', category: 'Government IDs', type: 'text', defaultType: 'text', required: false, active: true, sample1: '1906050010115001', sample2: '1906050010115002', keywords: ['kanyashree id', 'kanyashree', 'kp id'] },
  { key: 'previousSchool', label: 'Previous School Name', category: 'Academic History', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Harirampur High School', sample2: 'Malda Model Academy', keywords: ['previous school name', 'previous school', 'last school', 'prev school'] },
  { key: 'bloodGroup', label: 'Blood Group', category: 'Demographics & Health', type: 'dropdown', defaultType: 'dropdown', required: false, active: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'], sample1: 'O+', sample2: 'B+', keywords: ['blood group', 'blood', 'bloodgroup'] },
  { key: 'isOrphan', label: 'is Orphan', category: 'Demographics & Health', type: 'button', defaultType: 'button', required: false, active: true, options: ['No', 'Yes'], sample1: 'No', sample2: 'Yes', keywords: ['is orphan', 'orphan', 'orphan status'] },
  { key: 'category', label: 'Category', category: 'Demographics & Health', type: 'dropdown', defaultType: 'dropdown', required: false, active: true, options: ['Day Scholar', 'Hosteler', 'TSQ', 'GENERAL', 'OBC-A', 'OBC-B', 'SC', 'ST', 'EWS', 'ORPHAN'], sample1: 'Day Scholar', sample2: 'Hosteler', keywords: ['category', 'caste', 'social category', 'day scholar', 'hosteller'] },
  { key: 'status', label: 'Enrollment Status', category: 'Core Identity', type: 'button', defaultType: 'button', required: true, active: true, options: ['Active', 'Inactive', 'On Leave', 'Transferred'], sample1: 'Active', sample2: 'Active', keywords: ['enrollment status', 'status', 'student status'] },
  { key: 'gender', label: 'Gender', category: 'Demographics & Health', type: 'button', defaultType: 'button', required: true, active: true, options: ['Male', 'Female', 'Other'], sample1: 'Male', sample2: 'Female', keywords: ['gender', 'sex'] },
  { key: 'admissionDate', label: 'Admission Date', category: 'Core Identity', type: 'date', defaultType: 'date', required: false, active: true, sample1: '2024-04-05', sample2: '2024-04-08', keywords: ['admission date', 'adm date', 'date of admission'] },
  { key: 'classJoinDate', label: 'Class Join Date', category: 'Core Identity', type: 'date', defaultType: 'date', required: false, active: true, sample1: '2024-04-10', sample2: '2024-04-10', keywords: ['class join date', 'join date', 'date of joining'] },
  { key: 'village', label: 'Village', category: 'Residential Address', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Chanchal', sample2: 'Harirampur', keywords: ['village', 'gram', 'city', 'town'] },
  { key: 'postOffice', label: 'Post Office', category: 'Residential Address', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Chanchal PO', sample2: 'Harirampur PO', keywords: ['post office', 'po', 'p.o.'] },
  { key: 'policeStation', label: 'Police Station', category: 'Residential Address', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Chanchal PS', sample2: 'Harirampur PS', keywords: ['police station', 'ps', 'p.s.'] },
  { key: 'district', label: 'District', category: 'Residential Address', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Malda', sample2: 'Dakshin Dinajpur', keywords: ['district', 'dist', 'dist.'] },
  { key: 'state', label: 'State', category: 'Residential Address', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'West Bengal', sample2: 'West Bengal', keywords: ['state', 'province'] },
  { key: 'pinCode', label: 'Pin Code', category: 'Residential Address', type: 'text', defaultType: 'text', required: false, active: true, sample1: '732123', sample2: '733125', keywords: ['pin code', 'pin', 'pincode', 'postal code', 'zip'] },
  { key: 'phone', label: 'Phone Number', category: 'Contact & Communication', type: 'text', defaultType: 'text', required: false, active: true, sample1: '+91 98311 00001', sample2: '+91 98311 00002', keywords: ['phone number', 'phone', 'primary phone', 'mobile'] },
  { key: 'whatsapp', label: 'Whatsapp Number', category: 'Contact & Communication', type: 'text', defaultType: 'text', required: false, active: true, sample1: '+91 98311 00001', sample2: '+91 98311 00002', keywords: ['whatsapp number', 'whatsapp', 'wa phone'] },
  { key: 'email', label: 'Email', category: 'Contact & Communication', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'student1@thaibamodel.in', sample2: 'student2@thaibamodel.in', keywords: ['email', 'email id', 'e-mail'] },
  { key: 'fatherName', label: 'Father Name', category: 'Father Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Tariq Khan', sample2: 'Irfan Zahra', keywords: ['father name', 'father', 'fathers name'] },
  { key: 'fatherOccupation', label: 'Fathers Occupation', category: 'Father Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Business', sample2: 'Teacher', keywords: ['fathers occupation', 'father occupation', 'father job'] },
  { key: 'fatherQualification', label: 'Fathers Educational Qualification', category: 'Father Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Graduate', sample2: 'Post Graduate', keywords: ['fathers educational qualification', 'father qualification', 'father education'] },
  { key: 'fatherPhone', label: 'Fathers Phone', category: 'Father Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: '+91 98311 00001', sample2: '+91 98311 00002', keywords: ['fathers phone', 'father phone', 'father mobile'] },
  { key: 'fatherWhatsapp', label: 'Fathers Whatsapp', category: 'Father Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: '+91 98311 00001', sample2: '+91 98311 00002', keywords: ['fathers whatsapp', 'father whatsapp'] },
  { key: 'motherName', label: 'Mother Name', category: 'Mother Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Parveen Begum', sample2: 'Nasreen Sultana', keywords: ['mother name', 'mother', 'mothers name'] },
  { key: 'motherOccupation', label: 'Mothers Occupation', category: 'Mother Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Homemaker', sample2: 'Government Service', keywords: ['mothers occupation', 'mother occupation', 'mother job'] },
  { key: 'motherQualification', label: 'Mothers Educational Qualification', category: 'Mother Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Higher Secondary', sample2: 'Graduate', keywords: ['mothers educational qualification', 'mother qualification', 'mother education'] },
  { key: 'motherPhone', label: 'Mothers Phone', category: 'Mother Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: '+91 98311 00003', sample2: '+91 98311 00004', keywords: ['mothers phone', 'mother phone', 'mother mobile'] },
  { key: 'motherWhatsapp', label: 'Mothers Whatsapp', category: 'Mother Details', type: 'text', defaultType: 'text', required: false, active: true, sample1: '+91 98311 00003', sample2: '+91 98311 00004', keywords: ['mothers whatsapp', 'mother whatsapp'] },
  { key: 'guardianName', label: 'Guardian Name', category: 'Guardian & Financial', type: 'text', defaultType: 'text', required: false, active: true, sample1: 'Tariq Khan', sample2: 'Irfan Zahra', keywords: ['guardian name', 'guardian', 'primary guardian'] },
  { key: 'relation', label: 'Relation', category: 'Guardian & Financial', type: 'dropdown', defaultType: 'dropdown', required: false, active: true, options: ['Father', 'Mother', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Brother', 'Sister', 'Legal Guardian', 'Other'], sample1: 'Father', sample2: 'Mother', keywords: ['relation', 'guardian relation', 'relationship'] },
  { key: 'guardianPhone', label: 'Guardians Phone', category: 'Guardian & Financial', type: 'text', defaultType: 'text', required: false, active: true, sample1: '+91 98311 00001', sample2: '+91 98311 00002', keywords: ['guardians phone', 'guardian phone', 'guardian mobile'] },
  { key: 'annualIncome', label: 'Annual Family Income', category: 'Guardian & Financial', type: 'text', defaultType: 'text', required: false, active: true, sample1: '120000', sample2: '240000', keywords: ['annual family income', 'annual income', 'family income', 'income'] },
  { key: 'aadharNo', label: 'Aadhar No', category: 'Government IDs', type: 'text', defaultType: 'text', required: false, active: true, sample1: '2345 6789 0123', sample2: '3456 7890 1234', keywords: ['aadhar no', 'aadhar', 'aadhaar', 'aadhaar no', 'uid'] },
  { key: 'religion', label: 'Religion', category: 'Demographics & Health', type: 'dropdown', defaultType: 'dropdown', required: false, active: true, options: ['Islam', 'Hinduism', 'Christianity', 'Sikhism', 'Buddhism', 'Jainism', 'Other'], sample1: 'Islam', sample2: 'Islam', keywords: ['religion', 'faith'] },
  { key: 'dob', label: 'Date of Birth', category: 'Demographics & Health', type: 'date', defaultType: 'date', required: false, active: true, sample1: '2015-04-12', sample2: '2017-08-23', keywords: ['date of birth', 'dob', 'birth date'] }
];

export const STUDENT_IMPORT_FIELDS = DEFAULT_STUDENT_FIELDS;
export const STUDENT_FIELD_CONFIG_STORAGE_KEY = 'tms_student_field_config';
export class StudentModule {

  /**
   * Retrieve active field configurations, merged with user-defined overrides (control types, required, active, options)
   */
  static getFieldConfigs() {
    let overrides = {};
    try {
      const stored = localStorage.getItem(STUDENT_FIELD_CONFIG_STORAGE_KEY);
      if (stored) overrides = JSON.parse(stored) || {};
    } catch (e) {}

    return DEFAULT_STUDENT_FIELDS.map(df => {
      const ov = overrides[df.key] || {};
      let opts = ov.options;
      if (typeof opts === 'string') {
        opts = opts.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (!opts || !Array.isArray(opts) || !opts.length) {
        opts = df.options ? [...df.options] : [];
      }
      return {
        ...df,
        type: ov.type || df.type,
        required: ov.required !== undefined ? ov.required : df.required,
        active: ov.active !== undefined ? ov.active : df.active,
        options: opts
      };
    });
  }

  /**
   * Save customized field configurations
   */
  static async saveFieldConfigs(newConfigs) {
    try {
      localStorage.setItem(STUDENT_FIELD_CONFIG_STORAGE_KEY, JSON.stringify(newConfigs));
      try {
        await dbService.upsert('app_settings', { id: 'student_field_config', value: newConfigs });
      } catch (err) {}
    } catch (e) {
      console.warn('Could not persist student field configs:', e);
    }
  }

  /**
   * Render HTML control for a field based on configured type (button pills, dropdown, date, text, textarea, number)
   */
  static renderFieldControl(field, value = '', idPrefix = 'fld') {
    const esc = (v) => UIComponents.escapeHtml(v);
    const inputId = `${idPrefix}-${field.key}`;
    const reqAttr = field.required ? 'required' : '';
    const currentVal = value !== undefined && value !== null ? String(value) : '';

    // Normalize options
    let opts = field.options;
    if (typeof opts === 'string') {
      opts = opts.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(opts) || !opts.length) {
      const df = DEFAULT_STUDENT_FIELDS.find(x => x.key === field.key);
      if (df && df.options && df.options.length) {
        opts = [...df.options];
      } else {
        opts = field.type === 'button' ? ['Yes', 'No'] : ['Option 1', 'Option 2'];
      }
    }

    if (field.type === 'button') {
      const activeVal = currentVal || opts[0] || 'Yes';
      return `
        <div class="tms-btn-pills" data-fkey="${esc(field.key)}">
          <input type="hidden" id="${esc(inputId)}" name="${esc(field.key)}" value="${esc(activeVal)}">
          ${opts.map(opt => `
            <button type="button" class="tms-pill-btn ${String(opt) === String(activeVal) ? 'active' : ''}" data-val="${esc(opt)}">${esc(opt)}</button>
          `).join('')}
        </div>
      `;
    }

    if (field.type === 'dropdown') {
      return `
        <select class="form-select" id="${esc(inputId)}" name="${esc(field.key)}" ${reqAttr}>
          <option value="">-- Select ${esc(field.label)} --</option>
          ${opts.map(opt => `
            <option value="${esc(opt)}" ${String(opt) === String(currentVal) ? 'selected' : ''}>${esc(opt)}</option>
          `).join('')}
        </select>
      `;
    }

    if (field.type === 'date') {
      const dVal = currentVal ? currentVal.slice(0, 10) : '';
      return `<input type="date" class="form-input" id="${esc(inputId)}" name="${esc(field.key)}" value="${esc(dVal)}" ${reqAttr}>`;
    }

    if (field.type === 'textarea') {
      return `<textarea class="form-textarea" id="${esc(inputId)}" name="${esc(field.key)}" rows="2" placeholder="Enter ${esc(field.label)}..." ${reqAttr}>${esc(currentVal)}</textarea>`;
    }

    if (field.type === 'number') {
      return `<input type="number" class="form-input" id="${esc(inputId)}" name="${esc(field.key)}" value="${esc(currentVal)}" placeholder="Enter ${esc(field.label)}..." ${reqAttr}>`;
    }

    // Default: text
    return `<input type="text" class="form-input" id="${esc(inputId)}" name="${esc(field.key)}" value="${esc(currentVal)}" placeholder="Enter ${esc(field.label)}..." ${reqAttr}>`;
  }

  /**
   * Bind interactive events on pill buttons inside any modal container
   */
  static bindFieldControls(container) {
    if (!container) return;
    container.querySelectorAll('.tms-btn-pills').forEach(pillsWrap => {
      const hiddenInput = pillsWrap.querySelector('input[type="hidden"]');
      pillsWrap.querySelectorAll('.tms-pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          pillsWrap.querySelectorAll('.tms-pill-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (hiddenInput) {
            hiddenInput.value = btn.dataset.val;
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      });
    });
  }

  /**
   * Modal to customize student form field themes, controls (dropdown, button pills, text, date), required flags & options
   */
  static openCustomizeFieldsModal(container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const configs = this.getFieldConfigs();
    const categories = Array.from(new Set(configs.map(f => f.category || 'General')));

    const bodyHtml = `
      <div style="font-family:inherit;">
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-weight:700; color:#166534; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
              <i data-lucide="sliders-horizontal" style="width:16px; height:16px;"></i> Form &amp; Theme Customizer
            </div>
            <div style="font-size:0.78rem; color:#475569; margin-top:2px;">
              Configure whether each of the 41 fields displays as a <strong>Dropdown menu</strong>, <strong>Segmented Button Pills</strong>, <strong>Date picker</strong>, or <strong>Text</strong>, and set Required flags.
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-reset-field-defaults" style="font-size:0.75rem;">
            <i data-lucide="rotate-ccw"></i> Reset All Defaults
          </button>
        </div>

        <!-- Filter bar -->
        <div style="display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap; align-items:center;">
          <input type="text" id="cfg-field-search" class="form-input form-input-sm" placeholder="Search field by name..." style="flex:1; min-width:200px; height:34px;">
          <div style="min-width:210px;" id="cfg-category-filter-wrap">
            <select id="cfg-category-filter" class="form-select form-select-sm" style="width:100%;">
              <option value="">All Categories (${configs.length})</option>
              ${categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Table of 41 fields with sticky header and fixed height scroll -->
        <div class="table-responsive" style="max-height: 52vh; overflow-y: auto; overflow-x: auto; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #ffffff;">
          <table class="tms-table" style="font-size:0.8rem; width:100%; border-collapse:collapse; min-width:680px;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:1.5px solid #cbd5e1; position:sticky; top:0; z-index:10; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <th style="padding:10px 12px; text-align:left; background:#f8fafc; width:220px;">Field / Header</th>
                <th style="padding:10px 12px; text-align:left; background:#f8fafc; width:130px;">Category</th>
                <th style="padding:10px 12px; text-align:left; background:#f8fafc; width:165px;">Control Theme</th>
                <th style="padding:10px 12px; text-align:left; background:#f8fafc;">Options (Dropdown / Button)</th>
                <th style="padding:10px 12px; text-align:center; background:#f8fafc; width:75px;">Required?</th>
                <th style="padding:10px 12px; text-align:center; background:#f8fafc; width:70px;">Active?</th>
              </tr>
            </thead>
            <tbody id="cfg-fields-tbody">
              ${configs.map(f => {
                const isChoice = ['dropdown', 'button'].includes(f.type);
                const optsVal = (f.options || []).join(', ');
                return `
                  <tr class="cfg-field-row" data-key="${esc(f.key)}" data-cat="${esc(f.category || '')}" data-name="${esc(f.label.toLowerCase())}" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:8px 12px; font-weight:700; color:#0f172a; vertical-align:middle;">
                      ${esc(f.label)}
                      <div style="font-size:0.7rem; color:#64748b; font-family:var(--font-mono); font-weight:400;">${esc(f.key)}</div>
                    </td>
                    <td style="padding:8px 12px; vertical-align:middle;">
                      <span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.7rem; font-weight:600;">${esc(f.category || 'General')}</span>
                    </td>
                    <td style="padding:8px 12px; vertical-align:middle;">
                      <select class="form-select form-select-sm cfg-fld-type" data-key="${esc(f.key)}" style="width:100%;">
                        <option value="text" ${f.type === 'text' ? 'selected' : ''}>Text Input</option>
                        <option value="dropdown" ${f.type === 'dropdown' ? 'selected' : ''}>Dropdown Menu</option>
                        <option value="button" ${f.type === 'button' ? 'selected' : ''}>Button Pills</option>
                        <option value="date" ${f.type === 'date' ? 'selected' : ''}>Date Picker</option>
                        <option value="number" ${f.type === 'number' ? 'selected' : ''}>Number</option>
                        <option value="textarea" ${f.type === 'textarea' ? 'selected' : ''}>Textarea</option>
                      </select>
                    </td>
                    <td style="padding:8px 12px; vertical-align:middle;">
                      <input type="text" class="form-input form-input-sm cfg-fld-options" data-key="${esc(f.key)}" value="${esc(optsVal)}" placeholder="Comma-separated, e.g. Yes, No" style="width:100%; height:32px; font-size:0.76rem; padding:4px 8px; border-radius:6px; transition:all 0.15s ease; background:${isChoice ? '#ffffff' : '#f8fafc'}; border:1.5px solid ${isChoice ? '#3b82f6' : '#e2e8f0'}; color:${isChoice ? '#0f172a' : '#94a3b8'};" ${isChoice ? '' : 'disabled'}>
                    </td>
                    <td style="padding:8px 12px; text-align:center; vertical-align:middle;">
                      <input type="checkbox" class="cfg-fld-req" data-key="${esc(f.key)}" ${f.required ? 'checked' : ''} style="width:17px; height:17px; cursor:pointer; accent-color:#2563eb;">
                    </td>
                    <td style="padding:8px 12px; text-align:center; vertical-align:middle;">
                      <input type="checkbox" class="cfg-fld-act" data-key="${esc(f.key)}" ${f.active !== false ? 'checked' : ''} style="width:17px; height:17px; cursor:pointer; accent-color:#16a34a;">
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()" style="padding:8px 20px; font-weight:700;">Cancel</button>
      <button class="btn btn-primary" id="btn-save-field-customizations" style="background:#0e623b; border-color:#0e623b; padding:8px 24px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
        <i data-lucide="check"></i> Save Field Settings
      </button>
    `;

    UIComponents.openModal({
      title: 'Customize Student Fields & Form Controls',
      bodyHtml,
      footerHtml,
      maxWidth: '920px'
    });

    const searchInput = document.getElementById('cfg-field-search');
    const catSelect = document.getElementById('cfg-category-filter');
    const filterRows = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const cat = catSelect?.value || '';
      document.querySelectorAll('.cfg-field-row').forEach(row => {
        const name = row.dataset.name || '';
        const rCat = row.dataset.cat || '';
        const matchQ = !q || name.includes(q);
        const matchCat = !cat || rCat === cat;
        row.style.display = matchQ && matchCat ? '' : 'none';
      });
    };
    searchInput?.addEventListener('input', filterRows);
    catSelect?.addEventListener('change', filterRows);

    // Live control theme switcher: toggles options input state and populates defaults
    const handleTypeChange = (select) => {
      if (!select) return;
      const key = select.dataset.key;
      const optInput = document.querySelector(`.cfg-fld-options[data-key="${key}"]`);
      if (optInput) {
        const isChoice = ['dropdown', 'button'].includes(select.value);
        optInput.disabled = !isChoice;
        if (isChoice) {
          optInput.style.backgroundColor = '#ffffff';
          optInput.style.borderColor = '#3b82f6';
          optInput.style.color = '#0f172a';
          if (!optInput.value.trim()) {
            if (key === 'gender') optInput.value = 'Male, Female, Other';
            else if (key === 'isOrphan') optInput.value = 'No, Yes';
            else if (key === 'bloodGroup') optInput.value = 'A+, A-, B+, B-, O+, O-, AB+, AB-';
            else if (key === 'status') optInput.value = 'Active, Inactive, On Leave, Transferred';
            else if (key === 'category') optInput.value = 'GENERAL, OBC-A, OBC-B, SC, ST, EWS, ORPHAN';
            else if (key === 'religion') optInput.value = 'Islam, Hinduism, Christianity, Sikhism, Other';
            else if (key === 'relation') optInput.value = 'Father, Mother, Grandfather, Grandmother, Uncle, Guardian';
            else if (key === 'grade') optInput.value = 'STD-I, STD-II, STD-III, STD-IV, STD-V, STD-VI, STD-VII, STD-VIII, STD-IX, STD-X, STD-XI, STD-XII, Nursery, LKG, UKG';
            else optInput.value = 'Option 1, Option 2, Option 3';
          }
          optInput.focus();
        } else {
          optInput.style.backgroundColor = '#f8fafc';
          optInput.style.borderColor = '#e2e8f0';
          optInput.style.color = '#94a3b8';
        }
      }
    };

    // Both direct listener and table body delegation
    document.querySelectorAll('.cfg-fld-type').forEach(select => {
      select.addEventListener('change', () => handleTypeChange(select));
      select.addEventListener('input', () => handleTypeChange(select));
    });

    const fieldsTbody = document.getElementById('cfg-fields-tbody');
    fieldsTbody?.addEventListener('change', (e) => {
      const select = e.target.closest('.cfg-fld-type');
      if (select) handleTypeChange(select);
    });
    fieldsTbody?.addEventListener('input', (e) => {
      const select = e.target.closest('.cfg-fld-type');
      if (select) handleTypeChange(select);
    });

    catSelect?.addEventListener('input', filterRows);

    // Enhance all custom selects inside the modal immediately
    const modalBody = document.getElementById('global-modal-body');
    if (modalBody && typeof UIComponents.enhanceAllSelects === 'function') {
      UIComponents.enhanceAllSelects(modalBody);
    }

    document.getElementById('btn-reset-field-defaults')?.addEventListener('click', () => {
      if (confirm('Reset all field customization settings to system defaults?')) {
        localStorage.removeItem(STUDENT_FIELD_CONFIG_STORAGE_KEY);
        UIComponents.closeModal();
        UIComponents.showToast('Field settings reset to system defaults.', 'info');
        StudentModule.openCustomizeFieldsModal(container);
      }
    });

    document.getElementById('btn-save-field-customizations')?.addEventListener('click', async () => {
      const overrides = {};
      document.querySelectorAll('.cfg-field-row').forEach(row => {
        const key = row.dataset.key;
        const typeEl = row.querySelector('.cfg-fld-type');
        const optEl = row.querySelector('.cfg-fld-options');
        const reqEl = row.querySelector('.cfg-fld-req');
        const actEl = row.querySelector('.cfg-fld-act');

        const type = typeEl ? typeEl.value : 'text';
        const rawOpts = optEl ? optEl.value : '';
        let options = rawOpts.split(',').map(s => s.trim()).filter(Boolean);

        // Fallback for choice controls if options left empty
        if (['dropdown', 'button'].includes(type) && !options.length) {
          const df = DEFAULT_STUDENT_FIELDS.find(x => x.key === key);
          options = df && df.options && df.options.length ? [...df.options] : ['Option 1', 'Option 2'];
        }

        const required = !!reqEl?.checked;
        const active = !!actEl?.checked;

        overrides[key] = { type, required, active, options };
      });

      await StudentModule.saveFieldConfigs(overrides);
      UIComponents.closeModal();
      UIComponents.showToast('Student field configurations saved successfully!', 'success');
      StudentModule.render(container);
    });

    UIComponents.refreshIcons();
  }

  static openEnrollmentModal(container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const fields = this.getFieldConfigs().filter(f => f.active !== false);

    const categoriesOrder = [
      'Core Identity',
      'Government IDs',
      'Demographics & Health',
      'Contact & Communication',
      'Residential Address',
      'Father Details',
      'Mother Details',
      'Guardian & Financial',
      'Academic History'
    ];

    const fieldsByCategory = {};
    fields.forEach(f => {
      const cat = f.category || 'General';
      if (!fieldsByCategory[cat]) fieldsByCategory[cat] = [];
      fieldsByCategory[cat].push(f);
    });

    const categoryIcons = {
      'Core Identity': 'user-check',
      'Government IDs': 'badge-check',
      'Demographics & Health': 'heart-pulse',
      'Contact & Communication': 'phone-call',
      'Residential Address': 'map-pin',
      'Father Details': 'user',
      'Mother Details': 'user',
      'Guardian & Financial': 'shield',
      'Academic History': 'graduation-cap'
    };

    const bodyHtml = `
      <form id="form-enroll-student" style="font-family:inherit;">
        <!-- Historical toggle -->
        <div style="margin-bottom:14px; padding:12px 14px; background:rgba(37,99,235,0.06); border:1.5px solid rgba(37,99,235,0.25); border-radius:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-weight:700; font-size:0.88rem; color:#1e40af; display:flex; align-items:center; gap:6px;">
              <i data-lucide="history" style="width:16px;height:16px;"></i> Previous Year / Already Admitted Student?
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Check this to manually enter their original historical Admission Number and Roll Number.</div>
          </div>
          <label style="display:inline-flex; align-items:center; cursor:pointer; gap:6px; font-weight:700; font-size:0.85rem; color:#1e40af;">
            <input type="checkbox" id="adm-is-historical" style="width:18px; height:18px; cursor:pointer;">
            <span>Manual Admission No</span>
          </label>
        </div>

        <div id="historical-fields-container" style="display:none; margin-bottom:14px; padding:12px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label" style="font-weight:700; color:#1e40af;">Original Admission Number *</label>
              <input class="form-input font-mono" id="adm-manual-no" placeholder="e.g. TMS/2022/045 or 1042">
            </div>
            <div class="form-group">
              <label class="form-label">Original Roll Number</label>
              <input class="form-input font-mono" id="adm-manual-roll" placeholder="e.g. 14">
            </div>
          </div>
        </div>

        <!-- Render categories -->
        ${categoriesOrder.filter(cat => fieldsByCategory[cat] && fieldsByCategory[cat].length > 0).map(cat => {
          const catFields = fieldsByCategory[cat];
          const icon = categoryIcons[cat] || 'folder';
          return `
            <div class="tms-section-card">
              <div class="tms-section-card-header">
                <div class="tms-section-title">
                  <i data-lucide="${icon}" style="width:16px; height:16px; color:#2563eb;"></i>
                  <span>${esc(cat)}</span>
                </div>
                <span style="font-size:0.72rem; color:#64748b; font-weight:600;">${catFields.length} fields</span>
              </div>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
                ${catFields.map(f => `
                  <div class="form-group" style="${f.type === 'textarea' ? 'grid-column:1/-1;' : ''}">
                    <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
                      <span>${esc(f.label)} ${f.required ? '<span style="color:#ef4444;">*</span>' : ''}</span>
                      <span style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">${esc(f.type)}</span>
                    </label>
                    ${StudentModule.renderFieldControl(f, '', 'adm')}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-enrollment" style="background:#0e623b; border-color:#0e623b;">
        <i data-lucide="user-plus"></i> Confirm Enrollment
      </button>
    `;

    UIComponents.openModal({
      title: 'Enroll Student — All Statutory & Academic Fields',
      bodyHtml,
      footerHtml,
      maxWidth: '880px'
    });

    StudentModule.bindFieldControls(document.getElementById('form-enroll-student'));

    const histCb = document.getElementById('adm-is-historical');
    const histContainer = document.getElementById('historical-fields-container');
    if (histCb && histContainer) {
      histCb.addEventListener('change', () => {
        histContainer.style.display = histCb.checked ? 'block' : 'none';
      });
    }

    document.getElementById('btn-save-enrollment')?.addEventListener('click', async () => {
      const record = {};
      const missingRequired = [];

      fields.forEach(f => {
        const input = document.getElementById(`adm-${f.key}`);
        const val = input ? input.value.trim() : '';
        record[f.key] = val;
        if (f.required && !val && f.key !== 'admissionNo') {
          missingRequired.push(f.label);
        }
      });

      if (missingRequired.length > 0) {
        UIComponents.showToast(`Please fill required fields: ${missingRequired.join(', ')}`, 'warning');
        return;
      }

      const isHistorical = document.getElementById('adm-is-historical')?.checked;
      let admissionNo = '';
      let rollNo = record.rollNo || '';

      if (isHistorical) {
        admissionNo = document.getElementById('adm-manual-no')?.value.trim();
        rollNo = document.getElementById('adm-manual-roll')?.value.trim() || rollNo;
        if (!admissionNo) {
          UIComponents.showToast('Please enter the historical admission number.', 'warning');
          return;
        }
      } else {
        if (!record.admissionNo) {
          const existing = await dbService.select('students');
          const maxSeq = existing.reduce((max, s) => {
            const m = String(s.admissionNo || '').match(/(\d+)\s*$/);
            return m ? Math.max(max, parseInt(m[1], 10)) : max;
          }, 0);
          const nextSeq = maxSeq + 1;
          admissionNo = `TMS/${new Date().getFullYear()}/${nextSeq.toString().padStart(3, '0')}`;
          if (!rollNo) rollNo = nextSeq.toString().padStart(2, '0');
        } else {
          admissionNo = record.admissionNo;
        }
      }

      record.admissionNo = admissionNo;
      record.rollNo = rollNo;
      record.status = record.status || 'Active';
      record.section = record.section && String(record.section).trim() ? String(record.section).trim() : 'A';
      if (record.dob !== undefined && (record.dob === '' || !String(record.dob).trim())) record.dob = null;
      if (record.admissionDate !== undefined && (record.admissionDate === '' || !String(record.admissionDate).trim())) record.admissionDate = null;
      if (record.classJoinDate !== undefined && (record.classJoinDate === '' || !String(record.classJoinDate).trim())) record.classJoinDate = null;

      if (!record.address) {
        record.address = [
          record.village,
          record.postOffice ? `PO: ${record.postOffice}` : '',
          record.policeStation ? `PS: ${record.policeStation}` : '',
          record.district,
          record.state,
          record.pinCode
        ].filter(Boolean).join(', ');
      }

      if (!record.guardianName) record.guardianName = record.fatherName || record.motherName || '';
      if (!record.guardianPhone) record.guardianPhone = record.fatherPhone || record.phone || '';

      const btn = document.getElementById('btn-save-enrollment');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Saving...';
      }

      const newStudent = await dbService.insert('students', record);
      if (newStudent._syncError) {
        UIComponents.showToast(`Enrollment could not be saved: ${newStudent._syncError}`, 'danger');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i data-lucide="user-plus"></i> Confirm Enrollment';
        }
        return;
      }

      await auditService.log('STUDENT_ENROLLED', 'ACADEMIC', { admissionNo, fullName: record.fullName, grade: record.grade, isHistorical: !!isHistorical }, newStudent.id);
      UIComponents.closeModal();
      UIComponents.showToast(`Student ${record.fullName} successfully enrolled (${admissionNo})!`, 'success');
      StudentModule.render(container);
    });

    UIComponents.refreshIcons();
  }

  
  /**
   * Determine whether student is a non-residential Day Scholar
   */
  static isDayScholar(s) {
    if (!s) return true;
    if (s.boardingType === 'day_scholar') return true;
    if (s.boardingType === 'hosteller' || s.boardingType === 'residential') return false;
    const cat = String(s.category || '').trim();
    if (/day[\s_-]*scholar/i.test(cat)) return true;
    if (/hostel|boarder|residential|tsq|tahfiz/i.test(cat)) return false;
    if (s.hostelBlock && s.hostelBlock.trim() && s.hostelRoom && s.hostelRoom.trim()) return false;
    return true;
  }

  /**
   * Determine whether student is a residential hosteller / boarder
   */
  static isHosteller(s) {
    return !this.isDayScholar(s);
  }

  static async render(container) {
    // Fetch students from database (with clean-up if legacy demo students were cached)
    let rawStudents = (await dbService.select('students')) || [];
    if (rawStudents.some(s => s && String(s.id).startsWith('std-'))) {
      rawStudents = rawStudents.filter(s => s && !String(s.id).startsWith('std-') && !String(s.admissionNo).startsWith('TPS-2026-'));
      dbService.setLocal('students', rawStudents);
      dbService.invalidateCache('students');
    }
    const students = rawStudents;
    const esc = (v) => UIComponents.escapeHtml(v);
    const canManage = PermissionEngine.can(CAPABILITIES.MANAGE_STUDENTS);

    const applications = await dbService.select('admissions_applications');
    const invoices = await dbService.select('invoices');
    this._students = students;
    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const clearanceValue = totalBilled > 0 ? `${((totalCollected / totalBilled) * 100).toFixed(1)}%` : '—';

    // Extract dynamic unique classes from current students list
    const existingGrades = Array.from(new Set(students.map(s => String(s.grade || s.class || '').trim()).filter(Boolean)));
    const standardGrades = ['Nursery', 'LKG', 'UKG', 'STD-I', 'STD-II', 'STD-III', 'STD-IV', 'STD-V', 'STD-VI', 'STD-VII', 'STD-VIII', 'STD-IX', 'STD-X', 'STD-XI', 'STD-XII', '5', '6', '7', '8', '9', '10', '11', '12'];
    const allGradeOptions = Array.from(new Set([...existingGrades, ...standardGrades]));
    allGradeOptions.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    // Extract dynamic categories
    const existingCats = Array.from(new Set(students.map(s => String(s.category || '').trim()).filter(Boolean)));
    const standardCats = ['Day Scholar', 'Hosteler', 'TSQ', 'GENERAL', 'OBC-A', 'OBC-B', 'SC', 'ST', 'EWS', 'ORPHAN'];
    const allCategoryOptions = Array.from(new Set([...existingCats, ...standardCats]));

    // Extract dynamic wings
    const existingWings = Array.from(new Set(students.map(s => String(s.hostelBlock || '').trim()).filter(Boolean)));
    const standardWings = ['Hazrat Bilal Boys Wing', 'Fatima-tuz-Zahra Girls Wing', 'Thaiba Boys Hostel Block A', 'Thaiba Girls Hostel Campus'];
    const allWingOptions = Array.from(new Set([...existingWings, ...standardWings]));

    container.innerHTML = `
      <div class="tms-content-wrapper">
        ${UIComponents.renderPageHeader({
          title: 'Student Lifecycle & Directory',
          subtitle: 'Student information system, admissions pipeline, guardian records, and printable biometric ID cards.',
          breadcrumbs: [{ label: 'Student Directory' }],
          badge: `${students.length} Enrolled`,
          actionsHtml: `
            <button class="btn btn-secondary" id="btn-infirmary-roster"><i data-lucide="cross"></i> Medical Roster</button>
            <button class="btn btn-secondary" id="btn-hostel-mgmt" style="font-weight:700;"><i data-lucide="home" style="color:#16a34a;"></i> Hostel &amp; Beds</button>
            <button class="btn btn-secondary" id="btn-bulk-print-id-cards"><i data-lucide="printer"></i> Bulk Print PVC ID</button>
            <button class="btn btn-secondary" id="btn-batch-download-student-forms" style="font-weight:700;"><i data-lucide="file-down" style="color:#0e623b;"></i> Download Forms (PDF)</button>
            <a href="/admission" target="_blank" class="btn btn-secondary"><i data-lucide="file-text"></i> Admission Form (A4)</a>
            ${canManage ? `
            <button class="btn btn-secondary" id="btn-bulk-import-students"><i data-lucide="file-up"></i> Bulk Import (CSV)</button>
            <button class="btn btn-secondary" id="btn-customize-student-fields"><i data-lucide="sliders-horizontal"></i> Customize Fields</button>
            <button class="btn btn-primary" id="btn-new-admission"><i data-lucide="user-plus"></i> New Enrollment</button>` : ''}
          `
        })}

      <div class="kpi-grid">
        ${UIComponents.renderKpiCard({ title: 'Total Enrolled Students', value: `${students.length}`, icon: 'users', color: 'blue', subtitle: TMS_CONFIG.academic.currentYear })}
        ${UIComponents.renderKpiCard({ title: 'Active Students', value: `${students.filter(s => s.status === 'Active').length}`, icon: 'check-circle', color: 'emerald', subtitle: 'Regular Attendance' })}
        ${UIComponents.renderKpiCard({ title: 'New Admissions', value: `${applications.length} Applied`, icon: 'file-text', color: 'amber', subtitle: 'Submitted Applications' })}
        ${UIComponents.renderKpiCard({ title: 'Fee Clearance Ratio', value: clearanceValue, icon: 'receipt', color: 'rose', subtitle: 'Term 1 Invoices' })}
      </div>

      <!-- Students List Card -->
      <div class="card">
        <div class="card-header">
          <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap; width: 100%;">
            <div>
              <h3 class="card-title">Enrolled Students Roster</h3>
              <p class="card-desc" style="margin-top: 2px;">Comprehensive student profiles with zero horizontal scrolling and multi-criteria filters.</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <div class="tms-view-toggle" id="student-view-toggle">
                <button type="button" class="view-btn" data-view="cards" title="Switch to Cards View">
                  <i data-lucide="layout-grid"></i> Cards
                </button>
                <button type="button" class="view-btn" data-view="table" title="Switch to Table View">
                  <i data-lucide="table"></i> Table
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Multi-Criteria Table Filter & Search Panel -->
        <div class="tms-student-filter-bar" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <!-- Primary Controls Row -->
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <!-- Search Input -->
            <div style="position:relative; flex:1 1 220px; min-width:200px; max-width:320px;">
              <i data-lucide="search" style="position:absolute; left:11px; top:50%; transform:translateY(-50%); width:15px; height:15px; color:#94a3b8; pointer-events:none;"></i>
              <input type="text" class="form-input" id="search-student-input" placeholder="Search name, ID, phone, village..." style="padding-left:34px; height:36px; font-size:0.83rem; width:100%;">
            </div>

            <!-- Quick Filter Selects -->
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <!-- Class Filter -->
              <div style="display:flex; align-items:center; gap:4px;">
                <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Class:</span>
                <select id="filter-student-class" class="form-select form-select-sm" style="height:36px; min-width:110px; font-size:0.8rem; font-weight:600;">
                  <option value="">All Classes</option>
                  ${allGradeOptions.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}
                </select>
              </div>

              <!-- Category Filter -->
              <div style="display:flex; align-items:center; gap:4px;">
                <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Category:</span>
                <select id="filter-student-category" class="form-select form-select-sm" style="height:36px; min-width:120px; font-size:0.8rem; font-weight:600;">
                  <option value="">All Categories</option>
                  ${allCategoryOptions.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
                </select>
              </div>

              <!-- Boarding Filter -->
              <div style="display:flex; align-items:center; gap:4px;">
                <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Boarding:</span>
                <select id="filter-student-boarding" class="form-select form-select-sm" style="height:36px; min-width:130px; font-size:0.8rem; font-weight:600;">
                  <option value="">All Boarding</option>
                  <option value="day_scholar">☀ Day Scholar</option>
                  <option value="hosteller">🏠 Hosteller (All)</option>
                  <option value="hosteller_assigned">✓ Hosteller (Bed Assigned)</option>
                  <option value="hosteller_unassigned">⚠ Hosteller (Bed Pending)</option>
                </select>
              </div>

              <!-- Gender Filter -->
              <div style="display:flex; align-items:center; gap:4px;">
                <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Gender:</span>
                <select id="filter-student-gender" class="form-select form-select-sm" style="height:36px; min-width:105px; font-size:0.8rem; font-weight:600;">
                  <option value="">All Genders</option>
                  <option value="male">👦 Boys / Male</option>
                  <option value="female">👧 Girls / Female</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div style="display:flex; align-items:center; gap:4px;">
                <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Status:</span>
                <select id="filter-student-status" class="form-select form-select-sm" style="height:36px; min-width:105px; font-size:0.8rem; font-weight:600;">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on leave">On Leave</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>

              <!-- More Filters Toggle Button -->
              <button type="button" class="btn btn-secondary btn-sm" id="btn-toggle-more-filters" style="height:36px; padding:0 12px; font-weight:700; display:inline-flex; align-items:center; gap:5px;" title="Show Blood Group, Hostel Wing, Orphan filters">
                <i data-lucide="sliders-horizontal" style="width:14px; height:14px;"></i>
                <span>More</span>
                <span id="more-filters-badge" class="badge" style="display:none; background:#2563eb; color:#ffffff; font-size:0.68rem; padding:1px 6px; border-radius:9999px;">0</span>
              </button>

              <!-- Reset Filters Button -->
              <button type="button" class="btn btn-secondary btn-sm" id="btn-reset-student-filters" style="height:36px; padding:0 10px; font-weight:700; color:#64748b;" title="Reset all filters">
                <i data-lucide="rotate-ccw" style="width:13px; height:13px;"></i> Reset
              </button>
            </div>
          </div>

          <!-- Secondary Filters Row (Collapsible) -->
          <div id="more-filters-collapse" style="display:none; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0; gap:12px; flex-wrap:wrap; align-items:center;">
            <!-- Blood Group Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Blood:</span>
              <select id="filter-student-blood" class="form-select form-select-sm" style="height:34px; min-width:105px; font-size:0.8rem;">
                <option value="">All Bloods</option>
                <option value="a+">A+</option>
                <option value="a-">A-</option>
                <option value="b+">B+</option>
                <option value="b-">B-</option>
                <option value="o+">O+</option>
                <option value="o-">O-</option>
                <option value="ab+">AB+</option>
                <option value="ab-">AB-</option>
              </select>
            </div>

            <!-- Hostel Wing Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Hostel Wing:</span>
              <select id="filter-student-wing" class="form-select form-select-sm" style="height:34px; min-width:140px; font-size:0.8rem;">
                <option value="">All Wings</option>
                ${allWingOptions.map(w => `<option value="${esc(w)}">${esc(w)}</option>`).join('')}
              </select>
            </div>

            <!-- Orphan Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase;">Orphan:</span>
              <select id="filter-student-orphan" class="form-select form-select-sm" style="height:34px; min-width:105px; font-size:0.8rem;">
                <option value="">All</option>
                <option value="yes">Orphans Only</option>
                <option value="no">Non-Orphans</option>
              </select>
            </div>
          </div>

          <!-- Active Filter Chips & Live Result Counter -->
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:8px; border-top:1px solid #f1f5f9; font-size:0.78rem;">
            <div id="active-filter-chips" style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; min-height:22px;">
              <span style="color:#94a3b8; font-size:0.72rem;">No filters active</span>
            </div>
            <div style="font-weight:700; color:#475569; margin-left:auto;">
              Showing <span id="filtered-students-count" style="color:#0f172a; font-weight:800;">${students.length}</span> of <span style="color:#0f172a; font-weight:800;">${students.length}</span> students
            </div>
          </div>
        </div>

        ${canManage ? `
        <div class="bulk-actions-toolbar" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:14px; padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:10px;">
          <div style="font-weight:700; font-size:0.85rem; display:flex; align-items:center; gap:6px; margin-right:4px;">
            <i data-lucide="check-square" style="width:16px; height:16px; color:#2563eb;"></i>
            <span><span id="students-selected-count">0</span> Selected</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-select-all">Select All</button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-clear">Clear</button>
          
          <span style="height:18px; width:1px; background:var(--border-color); margin:0 4px;"></span>

          <button type="button" class="btn btn-primary btn-sm" id="btn-students-bulk-edit" title="Batch edit any data field across selected students">
            <i data-lucide="sliders"></i> Bulk Edit Fields
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-bulk-class" title="Reassign Grade / Class & Section">
            <i data-lucide="arrow-up-right"></i> Move Class
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-bulk-status" title="Batch change enrollment status">
            <i data-lucide="shield-check"></i> Status
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-bulk-roll" title="Renumber roll numbers sequentially">
            <i data-lucide="list-ordered"></i> Auto Roll
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-bulk-export" title="Export all fields of selected students">
            <i data-lucide="download"></i> Export CSV
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-bulk-download-forms" title="Download Official Student Bio-Data Dossier Forms (PDF)" style="font-weight:700; color:#0e623b; border-color:#86efac; background:#ffffff;">
            <i data-lucide="file-text" style="color:#0e623b;"></i> Download PDF Forms (<span id="bulk-forms-count">0</span>)
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-students-bulk-delete" style="color:#ef4444;" title="Delete selected students">
            <i data-lucide="trash-2"></i> Delete
          </button>
        </div>` : ''}

        <!-- Cards View (Default on Mobile, zero side scroll) -->
        <div id="students-cards-view-container" class="tms-cards-grid">
          ${students.length ? students.map(s => `
            <div class="tms-data-card student-card" data-student-card="${esc(s.id)}">
              <div class="tms-data-card-header">
                <div style="display: flex; gap: 10px; align-items: center;">
                  ${canManage ? `<input type="checkbox" class="student-row-check" value="${esc(s.id)}">` : ''}
                  <div>
                    <div class="tms-data-card-title">${esc(s.fullName)}</div>
                    <div class="tms-data-card-subtitle font-mono">${esc(s.admissionNo)} • Roll: ${esc(s.rollNo || '—')}</div>
                  </div>
                </div>
                <span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}">${esc(s.status)}</span>
              </div>
              <div class="tms-data-card-body">
                <div class="tms-data-card-row">
                  <span class="tms-data-card-label">Class & Section</span>
                  <span class="tms-data-card-value">${esc(s.grade)} - ${esc(s.section)}</span>
                </div>
                <div class="tms-data-card-row">
                  <span class="tms-data-card-label">Blood Group</span>
                  <span class="tms-data-card-value">${esc(s.bloodGroup || s.blood_group || '—')}</span>
                </div>
                <div class="tms-data-card-row">
                  <span class="tms-data-card-label">Guardian</span>
                  <span class="tms-data-card-value">${esc(s.guardianName || '—')}</span>
                </div>
                <div class="tms-data-card-row">
                  <span class="tms-data-card-label">Contact</span>
                  <span class="tms-data-card-value">
                    ${s.guardianPhone ? `<a href="tel:${esc(s.guardianPhone)}" style="color: #16a34a; text-decoration: none; font-family: var(--font-mono);">${esc(s.guardianPhone)}</a>` : '—'}
                  </span>
                </div>
                ${(s.allergies || s.medical_conditions) ? `
                  <div class="tms-data-card-row full-width">
                    <span class="badge badge-danger" style="font-size: 0.72rem; align-self: flex-start;">
                      <i data-lucide="alert-circle" style="width: 12px; height: 12px; display: inline;"></i> ${esc(s.allergies ? `Allergy: ${s.allergies}` : s.medical_conditions)}
                    </span>
                  </div>
                ` : ''}
              </div>
              <div class="tms-data-card-actions">
                <button class="btn btn-secondary btn-sm btn-print-id" data-id="${esc(s.id)}" title="Print ID Card"><i data-lucide="id-card"></i> ID</button>
                <button class="btn btn-secondary btn-sm btn-download-student-form" data-id="${esc(s.id)}" title="Download Bio-Data Form (PDF)" style="color: #0e623b;"><i data-lucide="file-text"></i> Form</button>
                <button class="btn btn-secondary btn-sm btn-merit-log" data-id="${esc(s.id)}" title="Merits &amp; Conduct" style="color: #16a34a;"><i data-lucide="shield-check"></i> Merit</button>
                <button class="btn btn-secondary btn-sm btn-view-profile" data-id="${esc(s.id)}" title="View Details"><i data-lucide="eye"></i> View</button>
                ${canManage ? `
                  <button class="btn btn-secondary btn-sm btn-edit-student" data-id="${esc(s.id)}" title="Edit student"><i data-lucide="pencil"></i></button>
                  <button class="btn btn-secondary btn-sm btn-del-student" data-id="${esc(s.id)}" title="Delete student" style="color:#ef4444;"><i data-lucide="trash-2"></i></button>
                ` : ''}
              </div>
            </div>
          `).join('') : '<p style="text-align:center; color:var(--text-muted); padding:30px; grid-column: 1 / -1;">No students enrolled yet.</p>'}
        </div>

        <!-- Table View (Default Luxury View) -->
        <div class="table-responsive" id="students-table-view-container" style="display: block; margin-top: 14px;">
          <table class="tms-table" id="students-table" style="background:#ffffff; border:1px solid #E2E8F0; border-radius:14px; overflow:hidden; box-shadow:var(--shadow-xs); width:100%;">
            <thead>
              <tr style="background:#F8FAFC; border-bottom:1.5px solid #E2E8F0;">
                <th style="width:46px; text-align:center; padding:12px 14px;">
                  <input type="checkbox" id="students-select-all-cb" class="tms-table-checkbox" title="Select All">
                </th>
                <th style="padding:12px 16px; font-weight:800; font-size:0.75rem; letter-spacing:0.04em; color:#475569;">STUDENT INFO</th>
                <th style="padding:12px 16px; font-weight:800; font-size:0.75rem; letter-spacing:0.04em; color:#475569;">ID NUMBER</th>
                <th style="padding:12px 16px; font-weight:800; font-size:0.75rem; letter-spacing:0.04em; color:#475569;">CLASS</th>
                <th style="padding:12px 16px; font-weight:800; font-size:0.75rem; letter-spacing:0.04em; color:#475569;">CATEGORY / BOARDING</th>
                <th style="padding:12px 16px; font-weight:800; font-size:0.75rem; letter-spacing:0.04em; color:#475569;">PARENT / CONTACT</th>
                <th style="padding:12px 16px; font-weight:800; font-size:0.75rem; letter-spacing:0.04em; color:#475569;">STATUS</th>
                <th style="padding:12px 16px; text-align:right; font-weight:800; font-size:0.75rem; letter-spacing:0.04em; color:#475569;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${students.length ? students.map(s => `
                <tr data-student-row="${esc(s.id)}" style="border-bottom:1px solid #F1F5F9; transition:background 0.15s ease;">
                  <td style="text-align:center; padding:14px;">
                    <input type="checkbox" class="student-row-check tms-table-checkbox" value="${esc(s.id)}">
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                      <div class="tms-student-avatar">
                        ${s.photo ? `<img src="${esc(s.photo)}" alt="${esc(s.fullName)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML = '${s.gender === 'Girl' || s.gender === 'Female' ? '👧' : '👦'}';">` : (s.gender === 'Girl' || s.gender === 'Female' ? '👧' : '👦')}
                      </div>
                      <div>
                        <div style="font-weight:800; font-size:0.92rem; color:#0F172A;">${esc(s.fullName)}</div>
                        <div style="font-size:0.78rem; color:#64748B; margin-top:2px;">
                          ${esc(s.gender || 'Student')} • DOB: ${esc((s.dob || '').slice(0, 10) || '—')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="padding:14px 16px;">
                    <span class="tms-id-badge">${esc(s.admissionNo || '—')}</span>
                  </td>
                  <td style="padding:14px 16px;">
                    <span style="font-weight:800; font-size:0.92rem; color:#0F172A;">${esc(s.grade || s.class || 'STD-I')}</span>
                  </td>
                  <td style="padding:14px 16px;">
                    ${StudentModule.isDayScholar(s) ? `
                      <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                        <span class="tms-category-badge" style="background:#f1f5f9; color:#475569; font-size:0.75rem; font-weight:700; padding:3px 9px; border-radius:6px; border:1px solid #e2e8f0;">
                          ${esc(s.category || 'Day Scholar')}
                        </span>
                      </div>
                    ` : (s.hostelBlock && s.hostelBlock.trim() && s.hostelRoom && s.hostelRoom.trim()) ? `
                      <div style="display:flex; flex-direction:column; gap:3px; align-items:flex-start;">
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                          <span class="tms-category-badge" style="background:#ecfdf5; color:#0e623b; font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:6px; border:1px solid #bbf7d0;">
                            ${esc(s.category || 'Hosteler')}
                          </span>
                          <span style="font-size:0.78rem; font-weight:700; color:#1e293b; display:inline-flex; align-items:center; gap:4px;">
                            <i data-lucide="home" style="width:12px; height:12px; color:#16a34a; flex-shrink:0;"></i>
                            <span>${esc(s.hostelBlock)}</span>
                          </span>
                        </div>
                        <div style="font-size:0.74rem; color:#64748b; font-family:var(--font-mono); display:flex; align-items:center; gap:6px; margin-top:1px;">
                          <span>${esc(s.hostelRoom)} • ${esc(s.hostelBed || 'Bed 1')}</span>
                          <button type="button" class="btn btn-secondary btn-sm btn-change-bed" data-id="${esc(s.id)}" title="Change Room/Bed" style="padding:1px 7px; font-size:0.68rem; border-radius:5px; color:#0e623b; font-weight:700; height:20px; line-height:18px;">
                            <i data-lucide="bed" style="width:11px; height:11px;"></i> Change
                          </button>
                        </div>
                      </div>
                    ` : `
                      <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                          <span class="tms-category-badge" style="background:#fef3c7; color:#92400e; font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:6px; border:1px solid #fde68a;">
                            ${esc(s.category || 'Hosteler')}
                          </span>
                          <span class="badge" style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; font-size:0.7rem; font-weight:700; padding:1px 6px; border-radius:5px; display:inline-flex; align-items:center; gap:3px;">
                            <i data-lucide="alert-circle" style="width:10px; height:10px;"></i> Pending Bed
                          </span>
                        </div>
                        <button type="button" class="btn btn-primary btn-sm btn-change-bed" data-id="${esc(s.id)}" title="Assign Hostel Room & Bed" style="background:#0e623b; border-color:#0e623b; padding:2px 9px; font-size:0.71rem; border-radius:6px; color:#ffffff; font-weight:700; display:inline-flex; align-items:center; gap:4px; height:22px;">
                          <i data-lucide="plus" style="width:11px; height:11px;"></i> Assign Bed
                        </button>
                      </div>
                    `}
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="font-weight:700; font-size:0.86rem; color:#1E293B;">${esc(s.guardianName || s.parentName || 'Parent')}</div>
                    <div style="font-size:0.78rem; color:#64748B; display:flex; align-items:center; gap:5px; margin-top:2px; font-family:var(--font-mono);">
                      <span>${esc(s.guardianPhone || '—')}</span>
                      ${s.guardianPhone ? `<a href="https://wa.me/91${esc(s.guardianPhone).replace(/[^0-9]/g, '')}" target="_blank" title="WhatsApp Message" style="color:#16a34a; display:inline-flex; align-items:center;"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/></svg></a>` : ''}
                    </div>
                  </td>
                  <td style="padding:14px 16px;">
                    <span class="tms-status-pill">${esc((s.status || 'active').toLowerCase())}</span>
                  </td>
                  <td style="padding:14px 16px; text-align:right;">
                    <div style="display:flex; gap:6px; justify-content:flex-end; align-items:center;">
                      <button type="button" class="tms-table-action-btn btn-view-profile" data-id="${esc(s.id)}" title="View Profile">
                        <i data-lucide="eye" style="width:16px;height:16px;"></i>
                      </button>
                      <button type="button" class="tms-table-action-btn btn-print-id" data-id="${esc(s.id)}" title="Print Smart PVC ID Card" style="color:#0e623b;">
                        <i data-lucide="credit-card" style="width:16px;height:16px;"></i>
                      </button>
                      <button type="button" class="tms-table-action-btn btn-download-student-form" data-id="${esc(s.id)}" title="Download Official Student Bio-Data Form (PDF)" style="color:#0e623b;">
                        <i data-lucide="file-text" style="width:16px;height:16px;"></i>
                      </button>
                      <button type="button" class="tms-table-action-btn btn-edit-student" data-id="${esc(s.id)}" title="Edit Student">
                        <i data-lucide="edit-3" style="width:16px;height:16px;"></i>
                      </button>
                      <button type="button" class="tms-table-action-btn btn-del-student" data-id="${esc(s.id)}" title="Delete Student" style="color:#ef4444;">
                        <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 40px;">No students enrolled yet.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

    this.bindEvents(container);
    UIComponents.refreshIcons();
  }

  static openStudentEditModal(student, container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const s = student || {};
    const isDayScholar = StudentModule.isDayScholar(s);
    const fields = this.getFieldConfigs().filter(f => f.active !== false);

    const categoriesOrder = [
      'Core Identity',
      'Government IDs',
      'Demographics & Health',
      'Contact & Communication',
      'Residential Address',
      'Father Details',
      'Mother Details',
      'Guardian & Financial',
      'Academic History'
    ];

    const fieldsByCategory = {};
    fields.forEach(f => {
      const cat = f.category || 'General';
      if (!fieldsByCategory[cat]) fieldsByCategory[cat] = [];
      fieldsByCategory[cat].push(f);
    });

    const categoryIcons = {
      'Core Identity': 'user-check',
      'Government IDs': 'badge-check',
      'Demographics & Health': 'heart-pulse',
      'Contact & Communication': 'phone-call',
      'Residential Address': 'map-pin',
      'Father Details': 'user',
      'Mother Details': 'user',
      'Guardian & Financial': 'shield',
      'Academic History': 'graduation-cap'
    };

    const bodyHtml = `
      <div style="font-family:inherit;">
        <!-- Top Photo Upload Card -->
        <div style="background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:16px; padding:18px 20px; display:flex; gap:18px; align-items:center; margin-bottom:20px;">
          <div style="position:relative; width:80px; height:106px; border-radius:10px; overflow:hidden; background:#E2E8F0; border:2px solid #CBD5E1; flex-shrink:0; cursor:pointer;" id="ed-photo-box" title="Click to browse photo">
            <img id="ed-photo-preview" src="${esc(s.photo || '')}" alt="${esc(s.fullName || 'Student')}" style="width:100%; height:100%; object-fit:cover; display:${s.photo ? 'block' : 'none'};" onerror="this.style.display='none'; document.getElementById('ed-photo-empty').style.display='flex';">
            <div id="ed-photo-empty" style="width:100%; height:100%; display:${s.photo ? 'none' : 'flex'}; align-items:center; justify-content:center; color:#94A3B8; font-size:2rem;">
              ${s.gender === 'Girl' || s.gender === 'Female' ? '👧' : '👦'}
            </div>
            <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(15,23,42,0.75); color:#ffffff; font-size:0.62rem; font-weight:700; text-align:center; padding:3px 2px; text-transform:uppercase;">
              Click to Browse
            </div>
            <input type="file" id="ed-photo-file" accept="image/*" style="display:none;">
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
              <h4 style="margin:0; font-size:1.15rem; font-weight:800; color:#0F172A;">${esc(s.fullName || 'Student')}</h4>
              <span class="tms-id-badge" style="font-size:0.75rem; padding:2px 10px;">${esc(s.admissionNo || '')}</span>
            </div>
            <p style="margin:0 0 6px 0; font-size:0.84rem; color:#64748B;">
              Upload student photograph. Changes sync across ID cards, attendance sheets, and profile views.
            </p>
            <div style="font-size:0.74rem; color:#94A3B8; font-family:var(--font-mono);">
              JPG, PNG or WebP • Max size: 2MB • Aspect: 3:4
            </div>
          </div>
        </div>

        <form id="form-edit-student">
          <!-- Hostel Boarding Section -->
          <div class="tms-section-card" style="margin-bottom:14px;" id="ed-hostel-section-card">
            <div class="tms-section-card-header">
              <div class="tms-section-title">
                <i data-lucide="home" style="width:16px; height:16px; color:#16a34a;"></i>
                <span>Hostel &amp; Residential Boarding</span>
              </div>
              <span id="ed-hostel-status-pill" class="badge" style="font-size:0.72rem; padding:3px 10px; font-weight:700; background:${isDayScholar ? '#f1f5f9' : '#dcfce7'}; color:${isDayScholar ? '#64748b' : '#15803d'};">
                ${isDayScholar ? '☀️ Day Scholar' : '🏠 Hosteller'}
              </span>
            </div>

            <!-- Day Scholar Notice -->
            <div id="ed-hostel-day-scholar-notice" style="${isDayScholar ? 'display:flex;' : 'display:none;'} padding:12px 14px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; margin-bottom:10px; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.2rem;">☀️</span>
                <div>
                  <div style="font-weight:700; font-size:0.84rem; color:#166534;">Enrolled as Day Scholar</div>
                  <div style="font-size:0.74rem; color:#15803d;">Hostel &amp; bed allocation is not required for Day Scholars.</div>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-ed-assign-bed" style="font-size:0.75rem; font-weight:700; white-space:nowrap; border-color:#86efac; color:#166534; background:#ffffff;">
                <i data-lucide="plus" style="width:12px; height:12px;"></i> Convert to Hosteller &amp; Assign Bed
              </button>
            </div>

            <div id="ed-hostel-fields-wrap" style="${isDayScholar ? 'display:none;' : 'display:grid;'} grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; padding:12px 14px; background:#f8fafc; border-radius:10px;">
              <div>
                <label class="form-label" style="font-size:0.78rem; font-weight:700;">Hostel Wing / Block</label>
                <input type="text" class="form-input" id="ed-hostel-block" name="hostelBlock" value="${esc(s.hostelBlock || '')}" placeholder="e.g. Hazrat Bilal Boys Wing, Fatima Girls Wing">
              </div>
              <div>
                <label class="form-label" style="font-size:0.78rem; font-weight:700;">Room Number</label>
                <input type="text" class="form-input" id="ed-hostel-room" name="hostelRoom" value="${esc(s.hostelRoom || '')}" placeholder="e.g. Room 101, Room 204">
              </div>
              <div>
                <label class="form-label" style="font-size:0.78rem; font-weight:700;">Bed Number</label>
                <input type="text" class="form-input" id="ed-hostel-bed" name="hostelBed" value="${esc(s.hostelBed || '')}" placeholder="e.g. Bed 1, Bed B-2">
              </div>
            </div>
          </div>
          <!-- Render categories -->
          ${categoriesOrder.filter(cat => fieldsByCategory[cat] && fieldsByCategory[cat].length > 0).map(cat => {
            const catFields = fieldsByCategory[cat];
            const icon = categoryIcons[cat] || 'folder';
            return `
              <div class="tms-section-card">
                <div class="tms-section-card-header">
                  <div class="tms-section-title">
                    <i data-lucide="${icon}" style="width:16px; height:16px; color:#2563eb;"></i>
                    <span>${esc(cat)}</span>
                  </div>
                  <span style="font-size:0.72rem; color:#64748b; font-weight:600;">${catFields.length} fields</span>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
                  ${catFields.map(f => {
                    const currentVal = s[f.key] ?? '';
                    return `
                      <div class="form-group" style="${f.type === 'textarea' ? 'grid-column:1/-1;' : ''}">
                        <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
                          <span>${esc(f.label)} ${f.required ? '<span style="color:#ef4444;">*</span>' : ''}</span>
                          <span style="font-size:0.68rem; color:#94a3b8; text-transform:uppercase;">${esc(f.type)}</span>
                        </label>
                        ${StudentModule.renderFieldControl(f, currentVal, 'ed')}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </form>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()" style="border-radius:12px; padding:10px 22px; font-weight:700;">Cancel</button>
      <button class="btn btn-primary" id="ed-save" style="border-radius:12px; padding:10px 30px; font-weight:700; background:#0E623B; border-color:#0E623B;">
        <i data-lucide="check"></i> Save Changes
      </button>
    `;

    UIComponents.openModal({
      title: `Edit Student Record — ${esc(s.fullName || '')}`,
      bodyHtml,
      footerHtml,
      maxWidth: '880px'
    });

    StudentModule.bindFieldControls(document.getElementById('form-edit-student'));

    // Photo file picker
    const photoBox = document.getElementById('ed-photo-box');
    const photoFile = document.getElementById('ed-photo-file');
    const photoPreview = document.getElementById('ed-photo-preview');
    const photoEmpty = document.getElementById('ed-photo-empty');
    let uploadedPhotoUrl = s.photo || '';

    if (photoBox && photoFile) {
      photoBox.addEventListener('click', () => photoFile.click());
      photoFile.addEventListener('change', () => {
        const file = photoFile.files && photoFile.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedPhotoUrl = e.target.result;
            if (photoPreview) {
              photoPreview.src = uploadedPhotoUrl;
              photoPreview.style.display = 'block';
            }
            if (photoEmpty) photoEmpty.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Day Scholar / Hosteller Dynamic Section Toggle
    document.getElementById('btn-ed-assign-bed')?.addEventListener('click', () => {
      const catInput = document.getElementById('ed-category');
      if (catInput) {
        catInput.value = 'Hosteler';
        catInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const notice = document.getElementById('ed-hostel-day-scholar-notice');
      if (notice) notice.style.display = 'none';
      const wrap = document.getElementById('ed-hostel-fields-wrap');
      if (wrap) wrap.style.display = 'grid';
      const pill = document.getElementById('ed-hostel-status-pill');
      if (pill) {
        pill.textContent = '🏠 Hosteller';
        pill.style.background = '#dcfce7';
        pill.style.color = '#15803d';
      }
      document.getElementById('ed-hostel-block')?.focus();
    });

    document.getElementById('ed-category')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const isDay = /day[\s_-]*scholar/i.test(val);
      const notice = document.getElementById('ed-hostel-day-scholar-notice');
      const wrap = document.getElementById('ed-hostel-fields-wrap');
      const pill = document.getElementById('ed-hostel-status-pill');
      if (isDay) {
        if (notice) notice.style.display = 'flex';
        if (wrap) wrap.style.display = 'none';
        if (pill) {
          pill.textContent = '☀️ Day Scholar';
          pill.style.background = '#f1f5f9';
          pill.style.color = '#64748b';
        }
      } else {
        if (notice) notice.style.display = 'none';
        if (wrap) wrap.style.display = 'grid';
        if (pill) {
          pill.textContent = '🏠 Hosteller';
          pill.style.background = '#dcfce7';
          pill.style.color = '#15803d';
        }
      }
    });

    document.getElementById('ed-save')?.addEventListener('click', async () => {
      const updates = { photo: uploadedPhotoUrl };
      const missingRequired = [];

      fields.forEach(f => {
        const input = document.getElementById(`ed-${f.key}`);
        const val = input ? input.value.trim() : '';
        updates[f.key] = val;
        if (f.required && !val) {
          missingRequired.push(f.label);
        }
      });

      const edHostelBlock = document.getElementById('ed-hostel-block')?.value?.trim() || '';
      const edHostelRoom = document.getElementById('ed-hostel-room')?.value?.trim() || '';
      const edHostelBed = document.getElementById('ed-hostel-bed')?.value?.trim() || '';
      updates.hostelBlock = edHostelBlock;
      updates.hostelRoom = edHostelRoom;
      updates.hostelBed = edHostelBed;

      if (missingRequired.length > 0) {
        UIComponents.showToast(`Please fill required fields: ${missingRequired.join(', ')}`, 'warning');
        return;
      }

      if (!updates.address) {
        updates.address = [
          updates.village,
          updates.postOffice ? `PO: ${updates.postOffice}` : '',
          updates.policeStation ? `PS: ${updates.policeStation}` : '',
          updates.district,
          updates.state,
          updates.pinCode
        ].filter(Boolean).join(', ');
      }

      const saveBtn = document.getElementById('ed-save');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Saving...';
      }

      try {
        await dbService.update('students', s.id, updates);
        await auditService.log('STUDENT_UPDATED', 'ACADEMIC', { id: s.id, ...updates }, s.id);
        UIComponents.closeModal();
        UIComponents.showToast(`Student ${updates.fullName || s.fullName} updated!`, 'success');
        StudentModule.render(container);
      } catch (err) {
        UIComponents.showToast(`Could not update student: ${err.message}`, 'danger');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i data-lucide="check"></i> Save Changes';
        }
      }
    });

    UIComponents.refreshIcons();
  }

  static async deleteStudents(rows, container) {
    const label = rows.length === 1 ? `Delete ${rows[0].fullName}?` : `Delete ${rows.length} selected students?`;
    const ok = await UIComponents.confirm({
      title: 'Delete Student Record(s)',
      message: `Are you sure you want to proceed? ${label} This removes student records, guardian links, and credentials permanently.`,
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash-2'
    });
    if (!ok) return;
    const rowIds = new Set(rows.map(r => r.id));
    for (const s of rows) {
      // eslint-disable-next-line no-await-in-loop
      await dbService.delete('students', s.id);
      // eslint-disable-next-line no-await-in-loop
      await auditService.log('STUDENT_DELETED', 'STUDENTS', { studentId: s.id, admissionNo: s.admissionNo, name: s.fullName }, s.id);
    }
    this._students = (this._students || []).filter(s => !rowIds.has(s.id));
    dbService.setLocal('students', this._students);
    dbService.invalidateCache('students');

    UIComponents.showToast(`${rows.length} student(s) deleted.`, 'success');
    await StudentModule.render(container);
  }

  static bindEvents(container) {
    // View Switcher (Cards vs Table)
    const viewToggle = container.querySelector('#student-view-toggle');
    const cardsContainer = container.querySelector('#students-cards-view-container');
    const tableContainer = container.querySelector('#students-table-view-container');
    const savedView = localStorage.getItem('tms_student_view_mode') || 'table';

    const setView = (mode) => {
      localStorage.setItem('tms_student_view_mode', mode);
      if (viewToggle) {
        viewToggle.querySelectorAll('.view-btn').forEach((b) => {
          b.classList.toggle('active', b.dataset.view === mode);
        });
      }
      if (cardsContainer) cardsContainer.style.display = mode === 'cards' ? 'grid' : 'none';
      if (tableContainer) tableContainer.style.display = mode === 'table' ? 'block' : 'none';
    };

    if (viewToggle) {
      viewToggle.querySelectorAll('.view-btn').forEach((b) => {
        b.addEventListener('click', () => setView(b.dataset.view));
      });
    }
    setView(savedView);

    // Multi-Criteria Filtering Engine
    const searchInput = container.querySelector('#search-student-input');
    const classFilter = container.querySelector('#filter-student-class');
    const catFilter = container.querySelector('#filter-student-category');
    const boardFilter = container.querySelector('#filter-student-boarding');
    const genderFilter = container.querySelector('#filter-student-gender');
    const statusFilter = container.querySelector('#filter-student-status');
    const bloodFilter = container.querySelector('#filter-student-blood');
    const wingFilter = container.querySelector('#filter-student-wing');
    const orphanFilter = container.querySelector('#filter-student-orphan');
    const countDisplay = container.querySelector('#filtered-students-count');
    const chipsContainer = container.querySelector('#active-filter-chips');
    const moreBtn = container.querySelector('#btn-toggle-more-filters');
    const moreCollapse = container.querySelector('#more-filters-collapse');
    const moreBadge = container.querySelector('#more-filters-badge');
    const resetBtn = container.querySelector('#btn-reset-student-filters');

    // Toggle more filters collapse
    if (moreBtn && moreCollapse) {
      moreBtn.addEventListener('click', () => {
        const isHidden = moreCollapse.style.display === 'none' || !moreCollapse.style.display;
        moreCollapse.style.display = isHidden ? 'flex' : 'none';
        moreBtn.classList.toggle('active', isHidden);
        UIComponents.refreshIcons();
      });
    }

    const applyFilters = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const selClass = (classFilter?.value || '').toLowerCase().trim();
      const selCat = (catFilter?.value || '').toLowerCase().trim();
      const selBoard = (boardFilter?.value || '').toLowerCase().trim();
      const selGender = (genderFilter?.value || '').toLowerCase().trim();
      const selStatus = (statusFilter?.value || '').toLowerCase().trim();
      const selBlood = (bloodFilter?.value || '').toLowerCase().trim();
      const selWing = (wingFilter?.value || '').toLowerCase().trim();
      const selOrphan = (orphanFilter?.value || '').toLowerCase().trim();

      // Count secondary filters for badge
      let moreCount = 0;
      if (selBlood) moreCount++;
      if (selWing) moreCount++;
      if (selOrphan) moreCount++;
      if (moreBadge) {
        moreBadge.innerText = moreCount;
        moreBadge.style.display = moreCount > 0 ? 'inline-block' : 'none';
      }

      // Update active filter chips
      if (chipsContainer) {
        const chips = [];
        if (q) chips.push({ label: `Search: "${q}"`, clear: () => { if (searchInput) searchInput.value = ''; } });
        if (selClass) chips.push({ label: `Class: ${classFilter.options[classFilter.selectedIndex].text}`, clear: () => { classFilter.value = ''; } });
        if (selCat) chips.push({ label: `Category: ${catFilter.options[catFilter.selectedIndex].text}`, clear: () => { catFilter.value = ''; } });
        if (selBoard) chips.push({ label: `Boarding: ${boardFilter.options[boardFilter.selectedIndex].text}`, clear: () => { boardFilter.value = ''; } });
        if (selGender) chips.push({ label: `Gender: ${genderFilter.options[genderFilter.selectedIndex].text}`, clear: () => { genderFilter.value = ''; } });
        if (selStatus) chips.push({ label: `Status: ${statusFilter.options[statusFilter.selectedIndex].text}`, clear: () => { statusFilter.value = ''; } });
        if (selBlood) chips.push({ label: `Blood: ${bloodFilter.options[bloodFilter.selectedIndex].text}`, clear: () => { bloodFilter.value = ''; } });
        if (selWing) chips.push({ label: `Wing: ${wingFilter.options[wingFilter.selectedIndex].text}`, clear: () => { wingFilter.value = ''; } });
        if (selOrphan) chips.push({ label: `Orphan: ${orphanFilter.options[orphanFilter.selectedIndex].text}`, clear: () => { orphanFilter.value = ''; } });

        if (chips.length > 0) {
          chipsContainer.innerHTML = chips.map((c, i) => `
            <span class="badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:9999px; display:inline-flex; align-items:center; gap:5px;">
              <span>${UIComponents.escapeHtml(c.label)}</span>
              <button type="button" class="btn-clear-filter-chip" data-idx="${i}" style="border:none; background:transparent; padding:0; cursor:pointer; color:#0284c7; display:inline-flex; align-items:center; font-size:0.85rem; line-height:1; font-weight:bold;">×</button>
            </span>
          `).join('');

          chipsContainer.querySelectorAll('.btn-clear-filter-chip').forEach(b => {
            b.addEventListener('click', () => {
              const idx = parseInt(b.dataset.idx, 10);
              if (chips[idx]) {
                chips[idx].clear();
                applyFilters();
              }
            });
          });
        } else {
          chipsContainer.innerHTML = '<span style="color:#94a3b8; font-size:0.72rem;">No filters active</span>';
        }
      }

      let visibleCount = 0;

      // Filter each student
      students.forEach(s => {
        let match = true;

        // Search text
        if (q) {
          const searchable = [
            s.fullName, s.admissionNo, s.grade, s.class, s.category,
            s.fatherName, s.motherName, s.phone, s.guardianPhone,
            s.whatsapp, s.village, s.district, s.aadharNo, s.govtStudentId,
            s.hostelRoom, s.hostelBlock
          ].filter(Boolean).join(' ').toLowerCase();
          if (!searchable.includes(q)) match = false;
        }

        // Class / Grade
        if (match && selClass) {
          const g = String(s.grade || s.class || '').toLowerCase().trim();
          if (g !== selClass && !g.includes(selClass) && !selClass.includes(g)) {
            match = false;
          }
        }

        // Category
        if (match && selCat) {
          const cat = String(s.category || '').toLowerCase().trim();
          if (cat !== selCat && !cat.includes(selCat)) match = false;
        }

        // Boarding Status
        if (match && selBoard) {
          const isDay = StudentModule.isDayScholar(s);
          const isHost = StudentModule.isHosteller(s);
          const hasBed = Boolean(s.hostelBlock && s.hostelRoom);
          if (selBoard === 'day_scholar' && !isDay) match = false;
          else if (selBoard === 'hosteller' && !isHost) match = false;
          else if (selBoard === 'hosteller_assigned' && (!isHost || !hasBed)) match = false;
          else if (selBoard === 'hosteller_unassigned' && (!isHost || hasBed)) match = false;
        }

        // Gender
        if (match && selGender) {
          const g = String(s.gender || '').toLowerCase().trim();
          if (selGender === 'male' && !['male', 'boy', 'm'].includes(g)) match = false;
          if (selGender === 'female' && !['female', 'girl', 'f'].includes(g)) match = false;
        }

        // Status
        if (match && selStatus) {
          const st = String(s.status || 'active').toLowerCase().trim();
          if (st !== selStatus) match = false;
        }

        // Blood Group
        if (match && selBlood) {
          const bg = String(s.bloodGroup || '').toLowerCase().trim();
          if (bg !== selBlood) match = false;
        }

        // Hostel Wing
        if (match && selWing) {
          const hw = String(s.hostelBlock || '').toLowerCase().trim();
          if (!hw.includes(selWing)) match = false;
        }

        // Orphan
        if (match && selOrphan) {
          const isOrph = String(s.isOrphan || '').toLowerCase().trim() === 'yes';
          if (selOrphan === 'yes' && !isOrph) match = false;
          if (selOrphan === 'no' && isOrph) match = false;
        }

        if (match) visibleCount++;

        // Update table row
        const row = container.querySelector(`tr[data-student-row="${s.id}"]`);
        if (row) row.style.display = match ? '' : 'none';

        // Update card
        const card = container.querySelector(`.student-card[data-student-card="${s.id}"]`);
        if (card) card.style.display = match ? 'flex' : 'none';
      });

      if (countDisplay) countDisplay.innerText = visibleCount;

      // Handle empty state banner in table
      let emptyRow = container.querySelector('#students-filter-empty-row');
      if (visibleCount === 0) {
        if (!emptyRow) {
          const tbody = container.querySelector('#students-table tbody');
          if (tbody) {
            emptyRow = document.createElement('tr');
            emptyRow.id = 'students-filter-empty-row';
            emptyRow.innerHTML = `
              <td colspan="9" style="text-align:center; padding:36px 16px; color:#64748b;">
                <div style="font-size:1.8rem; margin-bottom:8px;">🔍</div>
                <div style="font-weight:700; font-size:0.95rem; color:#1e293b; margin-bottom:4px;">No students match the selected filters</div>
                <div style="font-size:0.8rem; color:#64748b; margin-bottom:12px;">Try adjusting your search criteria or resetting filters.</div>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-empty-reset-filters" style="font-weight:700;">
                  <i data-lucide="rotate-ccw"></i> Reset All Filters
                </button>
              </td>
            `;
            tbody.appendChild(emptyRow);
            emptyRow.querySelector('#btn-empty-reset-filters')?.addEventListener('click', resetFilters);
            UIComponents.refreshIcons();
          }
        } else {
          emptyRow.style.display = '';
        }
      } else if (emptyRow) {
        emptyRow.style.display = 'none';
      }
    };

    const resetFilters = () => {
      if (searchInput) searchInput.value = '';
      if (classFilter) classFilter.value = '';
      if (catFilter) catFilter.value = '';
      if (boardFilter) boardFilter.value = '';
      if (genderFilter) genderFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      if (bloodFilter) bloodFilter.value = '';
      if (wingFilter) wingFilter.value = '';
      if (orphanFilter) orphanFilter.value = '';
      applyFilters();
    };

    searchInput?.addEventListener('input', applyFilters);
    classFilter?.addEventListener('change', applyFilters);
    catFilter?.addEventListener('change', applyFilters);
    boardFilter?.addEventListener('change', applyFilters);
    genderFilter?.addEventListener('change', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);
    bloodFilter?.addEventListener('change', applyFilters);
    wingFilter?.addEventListener('change', applyFilters);
    orphanFilter?.addEventListener('change', applyFilters);
    resetBtn?.addEventListener('click', resetFilters);

    /* ---- Selection, bulk actions, edit & delete ---- */
    const students = this._students || [];
    const canManage = PermissionEngine.can(CAPABILITIES.MANAGE_STUDENTS);
    // De-duplicate checked student IDs using Set (prevents 2x double-count from responsive mobile cards + desktop table)
    const checked = () => Array.from(new Set(Array.from(container.querySelectorAll('.student-row-check:checked')).map((c) => c.value)));
    const syncCount = () => {
      const selectedIds = checked();
      const cnt = selectedIds.length;
      const el = container.querySelector('#students-selected-count');
      if (el) el.innerText = cnt;
      const bulkFormsEl = container.querySelector('#bulk-forms-count');
      if (bulkFormsEl) bulkFormsEl.innerText = cnt;
      const selectAllEl = container.querySelector('#students-select-all-cb');
      if (selectAllEl) {
        const totalUnique = (this._students || students).length;
        selectAllEl.checked = totalUnique > 0 && cnt === totalUnique;
        selectAllEl.indeterminate = cnt > 0 && cnt < totalUnique;
      }
    };
    const selectedStudents = () => (this._students || students).filter((s) => checked().includes(s.id));

    container.querySelectorAll('.student-row-check').forEach((c) => {
      c.addEventListener('change', () => {
        // Sync both desktop table checkbox and mobile card checkbox for this student
        const sid = c.value;
        const state = c.checked;
        container.querySelectorAll(`.student-row-check[value="${sid}"]`).forEach((b) => { b.checked = state; });
        syncCount();
      });
    });
    const selectAllCb = container.querySelector('#students-select-all-cb');
    if (selectAllCb) {
      selectAllCb.addEventListener('change', () => {
        container.querySelectorAll('.student-row-check').forEach((c) => { c.checked = selectAllCb.checked; });
        syncCount();
      });
    }
    const selectAllBtn = container.querySelector('#btn-students-select-all');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        container.querySelectorAll('.student-row-check').forEach((c) => { c.checked = true; });
        syncCount();
      });
    }
    const clearBtn = container.querySelector('#btn-students-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        container.querySelectorAll('.student-row-check').forEach((c) => { c.checked = false; });
        syncCount();
      });
    }
    const bulkDelete = container.querySelector('#btn-students-bulk-delete');
    if (bulkDelete) {
      bulkDelete.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Select at least one student.', 'warning'); return; }
        this.deleteStudents(rows, container);
      });
    }
    const bulkImportBtn = container.querySelector('#btn-bulk-import-students');
    if (bulkImportBtn) {
      bulkImportBtn.addEventListener('click', () => StudentModule.openBulkImportModal(container));
    }
    const customizeFieldsBtn = container.querySelector('#btn-customize-student-fields');
    if (customizeFieldsBtn) {
      customizeFieldsBtn.addEventListener('click', () => StudentModule.openCustomizeFieldsModal(container));
    }

    const bulkEditBtn = container.querySelector('#btn-students-bulk-edit');
    if (bulkEditBtn) {
      bulkEditBtn.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Please select at least one student.', 'warning'); return; }
        StudentModule.openBulkEditModal(rows, container);
      });
    }

    const bulkClassBtn = container.querySelector('#btn-students-bulk-class');
    if (bulkClassBtn) {
      bulkClassBtn.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Please select at least one student.', 'warning'); return; }
        StudentModule.openBulkClassModal(rows, container);
      });
    }

    const bulkStatusBtn = container.querySelector('#btn-students-bulk-status');
    if (bulkStatusBtn) {
      bulkStatusBtn.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Please select at least one student.', 'warning'); return; }
        StudentModule.openBulkStatusModal(rows, container);
      });
    }

    const bulkRollBtn = container.querySelector('#btn-students-bulk-roll');
    if (bulkRollBtn) {
      bulkRollBtn.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Please select at least one student.', 'warning'); return; }
        StudentModule.openBulkRollModal(rows, container);
      });
    }
    const bulkExport = container.querySelector('#btn-students-bulk-export');
    if (bulkExport) {
      bulkExport.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) { UIComponents.showToast('Select at least one student.', 'warning'); return; }
        const fields = StudentModule.getFieldConfigs();
        const header = fields.map(f => f.label);
        const data = rows.map((s) => fields.map(f => s[f.key] !== undefined && s[f.key] !== null ? s[f.key] : ''));
        downloadCsv(`TMS-Students-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...data]);
        UIComponents.showToast(`${rows.length} student(s) exported with all ${fields.length} columns.`, 'success');
      });
    }

    const bulkDownloadForms = container.querySelector('#btn-students-bulk-download-forms');
    if (bulkDownloadForms) {
      bulkDownloadForms.addEventListener('click', () => {
        const rows = selectedStudents();
        if (!rows.length) {
          UIComponents.showToast('Please select at least one student checkbox.', 'warning');
          return;
        }
        StudentModule.bulkDownloadStudentDossiers(rows);
      });
    }

    const batchFormsTopBtn = container.querySelector('#btn-batch-download-student-forms');
    if (batchFormsTopBtn) {
      batchFormsTopBtn.addEventListener('click', () => {
        const rows = selectedStudents();
        if (rows.length > 0) {
          StudentModule.bulkDownloadStudentDossiers(rows);
        } else {
          StudentModule.openBatchDownloadModal(container, this._students || students);
        }
      });
    }
    container.querySelectorAll('.btn-edit-student').forEach((b) =>
      b.addEventListener('click', () => {
        const s = students.find((x) => x.id === b.dataset.id);
        if (s) this.openStudentEditModal(s, container);
      }));
    container.querySelectorAll('.btn-del-student').forEach((b) =>
      b.addEventListener('click', () => {
        const s = students.find((x) => x.id === b.dataset.id);
        if (s) this.deleteStudents([s], container);
      }));

    container.querySelectorAll('.btn-change-bed, .btn-assign-hostel-bed').forEach((b) =>
      b.addEventListener('click', () => {
        const s = (this._students || students).find((x) => x.id === b.dataset.id);
        if (s) StudentModule.openHostelBedModal(s, container);
      }));

    const hostelMgmtBtn = container.querySelector('#btn-hostel-mgmt');
    if (hostelMgmtBtn) {
      hostelMgmtBtn.addEventListener('click', () => StudentModule.openHostelManagementModal(container));
    }

    const newAdmBtn = container.querySelector('#btn-new-admission');
    if (newAdmBtn) {
      newAdmBtn.addEventListener('click', () => StudentModule.openEnrollmentModal(container));
    }
    // Bulk ID Card generator button
    const bulkIdBtn = container.querySelector('#btn-bulk-print-id-cards');
    if (bulkIdBtn) {
      bulkIdBtn.addEventListener('click', () => StudentModule.openBulkIdCardModal());
    }

    // Medical & Infirmary Roster Button
    const infirmaryBtn = container.querySelector('#btn-infirmary-roster');
    if (infirmaryBtn) {
      infirmaryBtn.addEventListener('click', () => StudentModule.openInfirmaryRosterModal(this._students || []));
    }

    // Individual ID Card generator
    container.querySelectorAll('.btn-print-id').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const students = await dbService.select('students');
        const s = students.find(item => item.id === id);
        if (!s) return;
        await StudentModule.openStudentIdCardModal(s);
      });
    });

    // Individual Student Bio-Data Dossier Form Download
    container.querySelectorAll('.btn-download-student-form').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const students = await dbService.select('students');
        const s = students.find(item => item.id === id);
        if (!s) return;
        StudentModule.downloadStudentDossier(s);
      });
    });

    // Merit & Demerit Log Modal
    container.querySelectorAll('.btn-merit-log').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const students = await dbService.select('students');
        const s = students.find(item => item.id === id);
        if (!s) return;
        await StudentModule.openMeritModal(s, container);
      });
    });

    // Comprehensive Student Profile Modal
    container.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const students = (this._students && this._students.length) ? this._students : ((await dbService.select('students')) || []);
        const allStudents = students || [];
        const s = allStudents.find(item => item.id === id);
        if (!s) return;
        await StudentModule.openStudentProfileModal(s, container);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Student Behavioral Merit & Demerit Conduct Ledger                  */
  /* ------------------------------------------------------------------ */
  static async openMeritModal(student, container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const allMerits = await dbService.select('student_merits') || [];
    const studentMerits = allMerits.filter(m => m.studentId === student.id || m.admissionNo === student.admissionNo);

    // Compute Net Points
    let netScore = 0;
    studentMerits.forEach(m => {
      const pts = parseInt(m.points, 10) || 0;
      if (m.type === 'merit') netScore += pts;
      else netScore -= Math.abs(pts);
    });

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Student Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">${esc(student.fullName)}</div>
            <div style="font-size: 0.8rem; color: #64748b;">Adm: <strong class="font-mono">${esc(student.admissionNo)}</strong> • Roll: <strong>${esc(student.rollNo || '—')}</strong> • Class: <strong>${esc(student.grade)} ${esc(student.section || 'A')}</strong></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700;">Conduct Score</div>
            <span class="badge ${netScore >= 20 ? 'badge-success' : netScore >= 0 ? 'badge-info' : 'badge-danger'}" style="font-size: 1.05rem; padding: 4px 12px; margin-top: 2px;">
              ${netScore > 0 ? '+' : ''}${netScore} Points
            </span>
          </div>
        </div>

        <!-- Add Award / Demerit Form -->
        <div style="background: #ffffff; border: 1.5px solid #16a34a; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 0.88rem; font-weight: 700; color: #166534; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="plus-circle" style="width: 16px; height: 16px;"></i> Award Merit Badge or Record Disciplinary Notice
          </div>
          <div style="display: grid; grid-template-columns: 140px 1fr 100px; gap: 10px; margin-bottom: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Action Type</label>
              <select class="form-select" id="inp-merit-type" style="padding: 6px 10px; font-size: 0.82rem;">
                <option value="merit">🌟 Merit Badge</option>
                <option value="demerit">⚠️ Demerit / Notice</option>
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Category / Recognition</label>
              <select class="form-select" id="inp-merit-cat" style="padding: 6px 10px; font-size: 0.82rem;">
                <option value="Quranic Adab & Sunnah Etiquette|10">🌟 Quranic Adab & Sunnah Etiquette (+10 pts)</option>
                <option value="Academic Excellence & Olympiad|15">📚 Academic Excellence & Olympiad (+15 pts)</option>
                <option value="100% Punctuality & Perfect Attendance|10">⏰ 100% Punctuality & Attendance (+10 pts)</option>
                <option value="Peer Assistance & Campus Service|10">🤝 Peer Assistance & Campus Service (+10 pts)</option>
                <option value="Co-Curricular, Arts & Speech Contest|10">🎨 Co-Curricular & Speech (+10 pts)</option>
                <option value="Late Arrival to Morning Assembly|5">⚠️ Late Arrival to Morning Assembly (-5 pts)</option>
                <option value="Homework Incompletion / Neglect|5">⚠️ Homework Incompletion (-5 pts)</option>
                <option value="Uniform / Dress Code Infraction|5">⚠️ Uniform / Dress Code Infraction (-5 pts)</option>
                <option value="Classroom Disruptive Behavior|10">⚠️ Classroom Disruptive Behavior (-10 pts)</option>
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.75rem;">Points</label>
              <input type="number" class="form-input font-mono" id="inp-merit-points" value="10" style="padding: 6px 10px; font-size: 0.82rem; text-align: center;">
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end;">
            <div style="flex: 1;">
              <label class="form-label" style="font-size: 0.75rem;">Teacher's Note / Context</label>
              <input type="text" class="form-input" id="inp-merit-notes" placeholder="e.g. Demonstrated exceptional humility and kindness helping Grade 1 students." style="padding: 6px 10px; font-size: 0.82rem;">
            </div>
            <button class="btn btn-primary" id="btn-save-merit-entry" style="padding: 6px 16px; font-size: 0.82rem;">
              <i data-lucide="check"></i> Record Entry
            </button>
          </div>
        </div>

        <!-- History Ledger -->
        <div>
          <div style="font-size: 0.82rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
            Conduct &amp; Merit History Timeline:
          </div>
          <div style="max-height: 240px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${studentMerits.length ? `
              <table class="tms-table" style="font-size: 0.8rem;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th style="width: 80px;">Type</th>
                    <th>Category</th>
                    <th>Teacher's Note</th>
                    <th style="width: 75px; text-align: center;">Points</th>
                    <th style="width: 90px;">Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${studentMerits.map(m => `
                    <tr>
                      <td>
                        <span class="badge ${m.type === 'merit' ? 'badge-success' : 'badge-danger'}" style="font-size: 0.7rem;">
                          ${m.type === 'merit' ? 'MERIT' : 'DEMERIT'}
                        </span>
                      </td>
                      <td><strong>${esc(m.category)}</strong></td>
                      <td style="color: #64748b;">${esc(m.reason || '—')}</td>
                      <td style="text-align: center; font-weight: 700; color: ${m.type === 'merit' ? '#16a34a' : '#dc2626'};" class="font-mono">
                        ${m.type === 'merit' ? '+' : '-'}${Math.abs(m.points)}
                      </td>
                      <td style="font-size: 0.75rem; color: #64748b;">${esc(m.date || (m.createdAt || '').slice(0, 10))}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 0.85rem;">
                No merit or discipline events recorded yet for this student. Student is in perfect standing.
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    UIComponents.openModal({
      title: `Student Behavioral & Merit Log — ${student.fullName}`,
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
      `
    });

    UIComponents.refreshIcons();

    // Auto-update points when category changes
    const catSelect = document.getElementById('inp-merit-cat');
    const ptsInput = document.getElementById('inp-merit-points');
    const typeSelect = document.getElementById('inp-merit-type');
    if (catSelect && ptsInput) {
      catSelect.addEventListener('change', () => {
        const parts = catSelect.value.split('|');
        if (parts[1]) ptsInput.value = parts[1];
        if (parts[0].startsWith('⚠️')) {
          typeSelect.value = 'demerit';
        } else {
          typeSelect.value = 'merit';
        }
      });
    }

    // Save entry
    const saveBtn = document.getElementById('btn-save-merit-entry');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const catVal = catSelect.value.split('|')[0];
        const points = parseInt(ptsInput.value, 10) || 10;
        const notes = document.getElementById('inp-merit-notes').value.trim();
        const type = typeSelect.value;

        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving...';

        await dbService.insert('student_merits', {
          studentId: student.id,
          studentName: student.fullName,
          admissionNo: student.admissionNo,
          grade: student.grade,
          type,
          category: catVal,
          points,
          reason: notes,
          date: new Date().toISOString().split('T')[0]
        });

        await auditService.log('MERIT_AWARDED', 'STUDENTS', {
          student: student.fullName,
          admissionNo: student.admissionNo,
          type,
          category: catVal,
          points
        });

        UIComponents.showToast(`${type === 'merit' ? '🌟 Merit badge' : '⚠️ Disciplinary note'} saved!`, 'success');
        StudentModule.openMeritModal(student, container);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Comprehensive 360-Degree Student Profile Viewer                    */
  /* ------------------------------------------------------------------ */
  static async openStudentProfileModal(student, container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const s = student || {};

    const formatVal = (v) => {
      if (v === null || v === undefined) return '';
      const str = String(v).trim();
      return str === '—' ? '' : str;
    };

    const renderProp = (label, val, icon = null, mono = false, copyable = false, actionType = null) => {
      const cleanVal = formatVal(val);
      const isFilled = cleanVal !== '';

      let actionLink = '';
      if (isFilled && actionType === 'phone') {
        actionLink = `<a href="tel:${esc(cleanVal)}" title="Call ${esc(label)}" style="color:#2563eb; display:inline-flex; align-items:center; margin-left:4px; padding:2px;"><i data-lucide="phone-outgoing" style="width:12px;height:12px;"></i></a>`;
      } else if (isFilled && actionType === 'wa') {
        const num = cleanVal.replace(/[^0-9]/g, '');
        actionLink = `<a href="https://wa.me/${esc(num)}" target="_blank" rel="noopener" title="WhatsApp ${esc(label)}" style="color:#16a34a; display:inline-flex; align-items:center; margin-left:4px; padding:2px;"><i data-lucide="message-square" style="width:12px;height:12px;"></i></a>`;
      } else if (isFilled && actionType === 'mail') {
        actionLink = `<a href="mailto:${esc(cleanVal)}" title="Email ${esc(label)}" style="color:#0284c7; display:inline-flex; align-items:center; margin-left:4px; padding:2px;"><i data-lucide="mail" style="width:12px;height:12px;"></i></a>`;
      }

      return `
        <div class="tms-prop-card" style="background:#ffffff; border:1.5px solid #f1f5f9; border-radius:10px; padding:9px 12px; display:flex; flex-direction:column; justify-content:center; min-height:54px; box-shadow:0 1px 2px rgba(0,0,0,0.02); transition:all 0.15s ease;">
          <div style="font-size:0.67rem; font-weight:700; color:#64748b; letter-spacing:0.04em; text-transform:uppercase; display:flex; align-items:center; gap:5px; margin-bottom:3px;">
            ${icon ? `<i data-lucide="${icon}" style="width:12px;height:12px;color:#94a3b8;flex-shrink:0;"></i>` : ''}
            <span>${esc(label)}</span>
          </div>
          <div style="font-size:0.86rem; font-weight:700; color:${isFilled ? '#0f172a' : '#94a3b8'}; ${mono ? 'font-family:var(--font-mono);' : ''} display:flex; align-items:center; justify-content:space-between; gap:6px;">
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; min-width:0;">
              ${isFilled ? esc(cleanVal) : '<span style="font-weight:500; font-style:italic; font-size:0.78rem; color:#94a3b8;">Not Recorded</span>'}
              ${actionLink}
            </span>
            ${copyable && isFilled ? `<button type="button" class="btn-copy-prop" data-val="${esc(cleanVal)}" title="Copy ${esc(label)}" style="background:transparent; border:none; padding:3px; cursor:pointer; color:#94a3b8; display:inline-flex; align-items:center; justify-content:center; border-radius:4px; transition:color 0.15s ease;"><i data-lucide="copy" style="width:12px; height:12px;"></i></button>` : ''}
          </div>
        </div>
      `;
    };

    const isGirl = s.gender === 'Girl' || s.gender === 'Female';
    const statusColor = s.status === 'Active' ? '#16a34a' : '#d97706';
    const statusBg = s.status === 'Active' ? '#dcfce7' : '#fef3c7';

    const bodyHtml = `
      <div style="font-family:var(--font-sans, system-ui, -apple-system, sans-serif); padding:2px 0;">
        <!-- Top Profile Banner -->
        <div style="background:linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border:1.5px solid #e2e8f0; border-radius:14px; padding:16px 18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
          <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
            <!-- Avatar with ring and badge -->
            <div style="position:relative; flex-shrink:0;">
              <div style="width:76px; height:76px; border-radius:50%; overflow:hidden; background:#f1f5f9; border:2.5px solid #16a34a; box-shadow:0 3px 10px rgba(22,163,74,0.18); display:flex; align-items:center; justify-content:center; font-size:2.2rem;">
                ${s.photo ? `<img src="${esc(s.photo)}" alt="${esc(s.fullName)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML = '${isGirl ? '👧' : '👦'}';">` : (isGirl ? '👧' : '👦')}
              </div>
              <span style="position:absolute; bottom:2px; right:2px; width:14px; height:14px; background:#16a34a; border:2.5px solid #ffffff; border-radius:50%;" title="Active Record"></span>
            </div>

            <!-- Identity Header -->
            <div style="flex:1; min-width:240px;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
                <h3 style="margin:0; font-size:1.35rem; font-weight:800; color:#0f172a; letter-spacing:-0.02em;">
                  ${esc(s.fullName || 'Student')}
                </h3>
                <span class="badge" style="background:${statusBg}; color:${statusColor}; font-weight:700; font-size:0.75rem; padding:3px 10px; border-radius:9999px;">
                  ● ${esc(s.status || 'Active')}
                </span>
                <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-family:var(--font-mono); font-size:0.75rem; padding:3px 10px; border-radius:9999px;">
                  ID: ${esc(s.admissionNo || '—')}
                </span>
                ${s.rollNo ? `<span class="badge" style="background:#f1f5f9; color:#475569; font-weight:700; font-family:var(--font-mono); font-size:0.75rem; padding:3px 10px; border-radius:9999px;">Roll: ${esc(s.rollNo)}</span>` : ''}
              </div>

              <!-- Quick Metrics Chips -->
              <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; font-size:0.78rem;">
                <span style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:3px 9px; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                  <i data-lucide="graduation-cap" style="width:13px; height:13px; color:#2563eb;"></i>
                  Class: <strong style="color:#0f172a;">${esc(s.grade || '—')}</strong>
                </span>
                <span style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:3px 9px; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                  <i data-lucide="${isGirl ? 'user-check' : 'user'}" style="width:13px; height:13px; color:#8b5cf6;"></i>
                  Gender: <strong style="color:#0f172a;">${esc(s.gender || '—')}</strong>
                </span>
                <span style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:3px 9px; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                  <i data-lucide="calendar" style="width:13px; height:13px; color:#f59e0b;"></i>
                  DOB: <strong style="color:#0f172a;">${esc(s.dob || '—')}</strong>
                </span>
                <span style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:3px 9px; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                  <i data-lucide="droplet" style="width:13px; height:13px; color:#ef4444;"></i>
                  Blood: <strong style="color:#0f172a;">${esc(s.bloodGroup || '—')}</strong>
                </span>
                <span style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:3px 9px; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                  <i data-lucide="shield" style="width:13px; height:13px; color:#10b981;"></i>
                  Religion: <strong style="color:#0f172a;">${esc(s.religion || '—')}</strong>
                </span>
                <span style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:3px 9px; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                  <i data-lucide="tag" style="width:13px; height:13px; color:#06b6d4;"></i>
                  Category: <strong style="color:#0f172a;">${esc(s.category || '—')}</strong>
                </span>
                <span style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:3px 9px; color:#334155; display:inline-flex; align-items:center; gap:5px;">
                  <i data-lucide="heart" style="width:13px; height:13px; color:#ec4899;"></i>
                  Orphan: <strong style="color:#0f172a;">${esc(s.isOrphan || 'No')}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tab Rail -->
        <div class="tms-profile-tab-rail" style="display:flex; gap:6px; margin-bottom:14px; overflow-x:auto; padding-bottom:4px; border-bottom:1.5px solid #e2e8f0;">
          <button type="button" class="btn btn-sm btn-prof-tab active" data-tab="statutory" style="border-radius:9999px; padding:5px 14px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; background:#0e623b; border-color:#0e623b; color:#ffffff;">
            <i data-lucide="badge-check" style="width:14px; height:14px;"></i> Statutory &amp; IDs
          </button>
          <button type="button" class="btn btn-sm btn-prof-tab btn-secondary" data-tab="family" style="border-radius:9999px; padding:5px 14px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; background:#ffffff; border-color:#cbd5e1; color:#475569;">
            <i data-lucide="users" style="width:14px; height:14px;"></i> Parents &amp; Guardian
          </button>
          <button type="button" class="btn btn-sm btn-prof-tab btn-secondary" data-tab="address" style="border-radius:9999px; padding:5px 14px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; background:#ffffff; border-color:#cbd5e1; color:#475569;">
            <i data-lucide="map-pin" style="width:14px; height:14px;"></i> Address &amp; Contact
          </button>
          <button type="button" class="btn btn-sm btn-prof-tab btn-secondary" data-tab="academic" style="border-radius:9999px; padding:5px 14px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; background:#ffffff; border-color:#cbd5e1; color:#475569;">
            <i data-lucide="graduation-cap" style="width:14px; height:14px;"></i> Academic History
          </button>
          <button type="button" class="btn btn-sm btn-prof-tab btn-secondary" data-tab="all" style="border-radius:9999px; padding:5px 14px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; background:#ffffff; border-color:#cbd5e1; color:#475569;">
            <i data-lucide="layout-grid" style="width:14px; height:14px;"></i> View All
          </button>
        </div>

        <!-- TAB PANE 1: Statutory & Portal IDs -->
        <div class="prof-pane" id="prof-pane-statutory" style="display:block;">
          <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:14px 16px; margin-bottom:14px;">
            <div style="font-size:0.75rem; font-weight:800; color:#0369a1; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              <i data-lucide="badge-check" style="width:15px; height:15px; color:#0284c7;"></i> Statutory Government &amp; Portal Identifiers
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:10px;">
              ${renderProp('Aadhaar Number', s.aadharNo || s.aadhaar, 'fingerprint', true, true)}
              ${renderProp('APAAR ID', s.apaarId, 'shield-check', true, true)}
              ${renderProp('Govt / Banglar Shiksha ID', s.govtStudentId, 'landmark', true, true)}
              ${renderProp('Minority ID', s.minorityId, 'award', true, true)}
              ${renderProp('Kanyashree ID', s.kanyashreeId, 'sparkles', true, true)}
            </div>
          </div>
        </div>

        <!-- TAB PANE 2: Parents & Guardian -->
        <div class="prof-pane" id="prof-pane-family" style="display:none;">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-bottom:14px;">
            <!-- Father Card -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <div style="font-size:0.76rem; font-weight:800; color:#1e40af; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:7px;">
                <div style="width:24px; height:24px; border-radius:6px; background:#dbeafe; display:flex; align-items:center; justify-content:center; color:#2563eb;">
                  <i data-lucide="user" style="width:14px; height:14px;"></i>
                </div>
                Father Details
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${renderProp('Father Name', s.fatherName)}
                ${renderProp('Occupation', s.fatherOccupation)}
                ${renderProp('Educational Qualification', s.fatherQualification)}
                ${renderProp('Phone Number', s.fatherPhone, 'phone', true, true, 'phone')}
                ${renderProp('WhatsApp', s.fatherWhatsapp, 'message-circle', true, true, 'wa')}
              </div>
            </div>

            <!-- Mother Card -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <div style="font-size:0.76rem; font-weight:800; color:#7c3aed; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:7px;">
                <div style="width:24px; height:24px; border-radius:6px; background:#ede9fe; display:flex; align-items:center; justify-content:center; color:#7c3aed;">
                  <i data-lucide="heart-handshake" style="width:14px; height:14px;"></i>
                </div>
                Mother Details
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${renderProp('Mother Name', s.motherName)}
                ${renderProp('Occupation', s.motherOccupation)}
                ${renderProp('Educational Qualification', s.motherQualification)}
                ${renderProp('Phone Number', s.motherPhone, 'phone', true, true, 'phone')}
                ${renderProp('WhatsApp', s.motherWhatsapp, 'message-circle', true, true, 'wa')}
              </div>
            </div>

            <!-- Guardian & Financial -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <div style="font-size:0.76rem; font-weight:800; color:#b45309; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:7px;">
                <div style="width:24px; height:24px; border-radius:6px; background:#fef3c7; display:flex; align-items:center; justify-content:center; color:#d97706;">
                  <i data-lucide="shield" style="width:14px; height:14px;"></i>
                </div>
                Guardian &amp; Financials
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${renderProp('Guardian Name', s.guardianName)}
                ${renderProp('Relationship', s.relation || 'Parent')}
                ${renderProp('Guardian Phone', s.guardianPhone, 'phone-call', true, true, 'phone')}
                ${renderProp('Annual Family Income', s.annualIncome ? ('₹ ' + Number(s.annualIncome).toLocaleString('en-IN')) : null, 'indian-rupee')}
              </div>
            </div>
          </div>
        </div>

        <!-- TAB PANE 3: Address & Contact -->
        <div class="prof-pane" id="prof-pane-address" style="display:none;">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-bottom:14px;">
            <!-- Residential Address -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <div style="font-size:0.76rem; font-weight:800; color:#b91c1c; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:7px;">
                <div style="width:24px; height:24px; border-radius:6px; background:#fee2e2; display:flex; align-items:center; justify-content:center; color:#dc2626;">
                  <i data-lucide="map-pin" style="width:14px; height:14px;"></i>
                </div>
                Residential Address
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                ${renderProp('Village / Town', s.village)}
                ${renderProp('Post Office', s.postOffice)}
                ${renderProp('Police Station', s.policeStation)}
                ${renderProp('District', s.district)}
                ${renderProp('State', s.state || 'West Bengal')}
                ${renderProp('PIN Code', s.pinCode, 'hash', true)}
              </div>
            </div>

            <!-- Direct Contact -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <div style="font-size:0.76rem; font-weight:800; color:#0e623b; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:7px;">
                <div style="width:24px; height:24px; border-radius:6px; background:#dcfce7; display:flex; align-items:center; justify-content:center; color:#16a34a;">
                  <i data-lucide="phone-call" style="width:14px; height:14px;"></i>
                </div>
                Direct Communication
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${renderProp('Primary Phone', s.phone, 'phone', true, true, 'phone')}
                ${renderProp('WhatsApp Number', s.whatsapp, 'message-circle', true, true, 'wa')}
                ${renderProp('Email Address', s.email, 'mail', true, true, 'mail')}
              </div>
            </div>
          </div>
        </div>

        <!-- TAB PANE 4: Academic History -->
        <div class="prof-pane" id="prof-pane-academic" style="display:none;">
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.02); margin-bottom:14px;">
            <div style="font-size:0.76rem; font-weight:800; color:#0e623b; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:7px;">
              <div style="width:24px; height:24px; border-radius:6px; background:#dcfce7; display:flex; align-items:center; justify-content:center; color:#16a34a;">
                <i data-lucide="graduation-cap" style="width:14px; height:14px;"></i>
              </div>
              Academic Enrollment &amp; Schooling Lifecycle
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px;">
              ${renderProp('Current Standard', `${s.grade || '—'} (Sec ${s.section || 'A'})`, 'book-open')}
              ${renderProp('Roll Number', s.rollNo || 'Unassigned', 'hash', true)}
              ${renderProp('Admission Date', s.admissionDate, 'calendar')}
              ${renderProp('Class Join Date', s.classJoinDate, 'calendar-check')}
              ${renderProp('Previous School', s.previousSchool, 'building')}
              ${renderProp('Enrollment Status', s.status || 'Active', 'check-circle')}
              ${StudentModule.isDayScholar(s) ? `
                ${renderProp('Residential Status', 'Day Scholar (Non-Residential)', 'sun')}
              ` : `
                ${renderProp('Hostel Wing / Block', s.hostelBlock || 'Unassigned Wing', 'home')}
                ${renderProp('Hostel Room', s.hostelRoom || 'Unassigned Room', 'door-closed', true)}
                ${renderProp('Hostel Bed', s.hostelBed || 'Unassigned Bed', 'bed', true)}
                <div style="grid-column: 1 / -1; margin-top: 6px;">
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-prof-change-bed" style="font-weight:700; border-radius:8px;">
                    <i data-lucide="bed" style="color:#16a34a;"></i> ${s.hostelRoom ? 'Change Hostel Bed' : 'Assign Hostel Bed'}
                  </button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-modal-enroll-biometrics" style="border-radius:12px; padding:9px 18px; font-weight:700; background:#0E623B; border-color:#0E623B; display:inline-flex; align-items:center; gap:7px;">
            <i data-lucide="radio" style="width:16px; height:16px;"></i> Smart Biometrics &amp; NFC
          </button>
          <button class="btn btn-secondary" id="btn-modal-print-id-card" style="border-radius:12px; padding:9px 16px; font-weight:700; color:#0e623b; border-color:#86efac; display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="credit-card" style="width:15px; height:15px;"></i> Print PVC ID Card
          </button>
          <button class="btn btn-secondary" id="btn-modal-download-form" style="border-radius:12px; padding:9px 16px; font-weight:700; color:#0e623b; border-color:#86efac; display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="file-text" style="width:15px; height:15px;"></i> Download PDF Form
          </button>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary" id="btn-modal-edit-student" style="border-radius:12px; padding:9px 18px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="edit-3" style="width:15px; height:15px;"></i> Edit Record
          </button>
          <button class="btn btn-secondary" id="btn-modal-del-student" style="border-radius:12px; padding:9px 18px; font-weight:700; color:#EF4444; border-color:#FCA5A5; display:inline-flex; align-items:center; gap:6px;">
            <i data-lucide="trash-2" style="width:15px; height:15px;"></i> Delete
          </button>
        </div>
      </div>
    `;

    UIComponents.openModal({
      title: `Student Profile — ${esc(s.fullName || 'Student')}`,
      bodyHtml,
      footerHtml,
      maxWidth: '880px'
    });

    // Tab navigation logic
    const tabButtons = document.querySelectorAll('.btn-prof-tab');
    const panes = document.querySelectorAll('.prof-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => {
          b.classList.remove('btn-primary', 'active');
          b.classList.add('btn-secondary');
          b.style.backgroundColor = '#ffffff';
          b.style.borderColor = '#cbd5e1';
          b.style.color = '#475569';
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary', 'active');
        btn.style.backgroundColor = '#0e623b';
        btn.style.borderColor = '#0e623b';
        btn.style.color = '#ffffff';

        const tab = btn.dataset.tab;
        if (tab === 'all') {
          panes.forEach(p => p.style.display = 'block');
        } else {
          panes.forEach(p => p.style.display = 'none');
          const target = document.getElementById(`prof-pane-${tab}`);
          if (target) target.style.display = 'block';
        }
        UIComponents.refreshIcons();
      });
    });

    // One-click copy handler for copy buttons
    document.querySelectorAll('.btn-copy-prop').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const val = btn.dataset.val;
        if (val && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(val);
            UIComponents.showToast(`Copied "${val}" to clipboard!`, 'info');
          } catch (_) {}
        }
      });
    });

    document.getElementById('btn-prof-change-bed')?.addEventListener('click', () => {
      UIComponents.closeModal();
      StudentModule.openHostelBedModal(s, container);
    });

    document.getElementById('btn-modal-enroll-biometrics')?.addEventListener('click', () => {
      UIComponents.closeModal();
      BiometricCredentialModal.open({
        person: s,
        type: 'student',
        onSave: (updated) => {
          Object.assign(s, updated);
          StudentModule.render(container);
        }
      });
    });

    document.getElementById('btn-modal-print-id-card')?.addEventListener('click', async () => {
      UIComponents.closeModal();
      await StudentModule.openStudentIdCardModal(s);
    });

    document.getElementById('btn-modal-download-form')?.addEventListener('click', () => {
      StudentModule.downloadStudentDossier(s);
    });

    document.getElementById('btn-modal-edit-student')?.addEventListener('click', () => {
      UIComponents.closeModal();
      StudentModule.openStudentEditModal(s, container);
    });

    document.getElementById('btn-modal-del-student')?.addEventListener('click', () => {
      UIComponents.closeModal();
      StudentModule.deleteStudents([s], container);
    });
    UIComponents.refreshIcons();
  }

  /**
   * Interactive modal to assign, change, or vacate student hostel wing, room, and bed
   */
  static openHostelBedModal(student, container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const s = student || {};

    const isBoarder = StudentModule.isHosteller(s);
    const hasBed = Boolean(s.hostelBlock && s.hostelBlock.trim() && s.hostelRoom && s.hostelRoom.trim() && isBoarder);
    const isGirl = s.gender === 'Girl' || s.gender === 'Female';

    const defaultWing = s.hostelBlock || (isGirl ? 'Fatima-tuz-Zahra Girls Wing' : 'Hazrat Bilal Boys Wing');
    const defaultRoom = s.hostelRoom || 'Room 101';
    const defaultBed = s.hostelBed || 'Bed 1';

    const bodyHtml = `
      <form id="form-hostel-bed-allocation" style="font-family:inherit;">
        <!-- Student Identity Header -->
        <div style="background:linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border:1.5px solid #bbf7d0; border-radius:12px; padding:14px 16px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:46px; height:46px; border-radius:50%; background:#dcfce7; color:#16a34a; display:flex; align-items:center; justify-content:center; font-size:1.4rem;">
              ${isGirl ? '👧' : '👦'}
            </div>
            <div>
              <div style="font-weight:800; font-size:1.05rem; color:#0f172a;">${esc(s.fullName || 'Student')}</div>
              <div style="font-size:0.78rem; color:#475569; display:flex; align-items:center; gap:8px;">
                <span>ID: <strong class="font-mono">${esc(s.admissionNo || '—')}</strong></span>
                <span>•</span>
                <span>Class: <strong>${esc(s.grade || '—')}</strong></span>
                <span>•</span>
                <span>Gender: <strong>${esc(s.gender || '—')}</strong></span>
              </div>
            </div>
          </div>
          <span class="badge" style="font-size:0.78rem; padding:4px 12px; border-radius:9999px; background:${hasBed ? '#dcfce7' : '#f1f5f9'}; color:${hasBed ? '#15803d' : '#64748b'}; font-weight:700;">
            ${hasBed ? '● Bed Assigned' : (isBoarder ? '⚠️ Hosteller (Bed Pending)' : '○ Day Scholar')}
          </span>
        </div>

        <!-- Boarding Status Selection -->
        <div style="margin-bottom:16px;">
          <label style="display:block; font-size:0.78rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:6px;">
            Boarding Enrollment Type
          </label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <label id="lbl-board-dayscholar" style="border:1.5px solid ${!isBoarder ? '#16a34a' : '#e2e8f0'}; background:${!isBoarder ? '#f0fdf4' : '#ffffff'}; border-radius:10px; padding:12px; cursor:pointer; display:flex; align-items:flex-start; gap:10px; transition:all 0.15s ease;">
              <input type="radio" name="boardingType" value="day_scholar" ${!isBoarder ? 'checked' : ''} style="margin-top:3px; accent-color:#16a34a;">
              <div>
                <div style="font-weight:700; font-size:0.88rem; color:#0f172a;">Day Scholar</div>
                <div style="font-size:0.74rem; color:#64748b;">No hostel bed assigned. Student attends campus daily.</div>
              </div>
            </label>
            <label id="lbl-board-hostel" style="border:1.5px solid ${isBoarder ? '#16a34a' : '#e2e8f0'}; background:${isBoarder ? '#f0fdf4' : '#ffffff'}; border-radius:10px; padding:12px; cursor:pointer; display:flex; align-items:flex-start; gap:10px; transition:all 0.15s ease;">
              <input type="radio" name="boardingType" value="hostel_boarder" ${isBoarder ? 'checked' : ''} style="margin-top:3px; accent-color:#16a34a;">
              <div>
                <div style="font-weight:700; font-size:0.88rem; color:#0f172a;">Hostel Resident</div>
                <div style="font-size:0.74rem; color:#64748b;">Full residential boarding with allocated wing, room &amp; bed.</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Bed Allocation Form Fields -->
        <div id="hostel-allocation-fields" style="display:${isBoarder ? 'block' : 'none'}; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:16px;">
          <div style="font-size:0.8rem; font-weight:800; color:#1e40af; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="bed" style="width:16px; height:16px;"></i> Bed &amp; Dormitory Assignment
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:12px;">
            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700;">Hostel Wing / Block *</label>
              <select id="alloc-hostel-wing" class="form-select" style="width:100%; height:38px;">
                <option value="Hazrat Bilal Boys Wing" ${defaultWing.includes('Boys') ? 'selected' : ''}>Hazrat Bilal Boys Wing</option>
                <option value="Fatima-tuz-Zahra Girls Wing" ${defaultWing.includes('Girls') ? 'selected' : ''}>Fatima-tuz-Zahra Girls Wing</option>
                <option value="Thaiba Boys Hostel Block A" ${defaultWing.includes('Block A') ? 'selected' : ''}>Thaiba Boys Hostel Block A</option>
                <option value="Thaiba Boys Hostel Block B" ${defaultWing.includes('Block B') ? 'selected' : ''}>Thaiba Boys Hostel Block B</option>
                <option value="Thaiba Girls Hostel Campus" ${defaultWing.includes('Girls Hostel Campus') ? 'selected' : ''}>Thaiba Girls Hostel Campus</option>
              </select>
            </div>

            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700;">Room Number *</label>
              <input type="text" id="alloc-hostel-room" class="form-input" value="${esc(defaultRoom)}" placeholder="e.g. Room 101, Room 204" style="height:38px;">
            </div>

            <div>
              <label class="form-label" style="font-size:0.78rem; font-weight:700;">Bed Number *</label>
              <input type="text" id="alloc-hostel-bed" class="form-input" value="${esc(defaultBed)}" placeholder="e.g. Bed 1, Bed B-2" style="height:38px;">
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size:0.78rem; font-weight:700;">Warden / Boarding Notes (Optional)</label>
            <input type="text" id="alloc-hostel-notes" class="form-input" placeholder="e.g. Allotted by Warden, Lower bunk preferred..." style="height:36px;">
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()" style="padding:8px 18px; font-weight:700;">Cancel</button>
      <button type="button" class="btn btn-primary" id="btn-save-hostel-bed" style="background:#0e623b; border-color:#0e623b; padding:8px 22px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
        <i data-lucide="check"></i> Save Bed Allotment
      </button>
    `;

    UIComponents.openModal({
      title: 'Hostel & Bed Allocation',
      bodyHtml,
      footerHtml,
      maxWidth: '640px'
    });

    const allocFields = document.getElementById('hostel-allocation-fields');
    const lblDay = document.getElementById('lbl-board-dayscholar');
    const lblHostel = document.getElementById('lbl-board-hostel');

    document.querySelectorAll('input[name="boardingType"]').forEach(r => {
      r.addEventListener('change', () => {
        const isHostel = r.value === 'hostel_boarder';
        if (allocFields) allocFields.style.display = isHostel ? 'block' : 'none';
        if (lblDay && lblHostel) {
          lblDay.style.borderColor = isHostel ? '#e2e8f0' : '#16a34a';
          lblDay.style.backgroundColor = isHostel ? '#ffffff' : '#f0fdf4';
          lblHostel.style.borderColor = isHostel ? '#16a34a' : '#e2e8f0';
          lblHostel.style.backgroundColor = isHostel ? '#f0fdf4' : '#ffffff';
        }
      });
    });

    document.getElementById('btn-save-hostel-bed')?.addEventListener('click', async () => {
      const type = document.querySelector('input[name="boardingType"]:checked')?.value;
      const isBoarder = type === 'hostel_boarder';

      const wing = isBoarder ? (document.getElementById('alloc-hostel-wing')?.value || '').trim() : '';
      const room = isBoarder ? (document.getElementById('alloc-hostel-room')?.value || '').trim() : '';
      const bed = isBoarder ? (document.getElementById('alloc-hostel-bed')?.value || '').trim() : '';

      if (isBoarder && (!room || !bed)) {
        UIComponents.showToast('Please provide both Room Number and Bed Number for hostel boarders.', 'warning');
        return;
      }

      const updates = {
        hostelBlock: isBoarder ? wing : '',
        hostelRoom: isBoarder ? room : '',
        hostelBed: isBoarder ? bed : ''
      };

      if (!isBoarder) {
        updates.category = 'Day Scholar';
        updates.boardingType = 'day_scholar';
      } else {
        updates.boardingType = 'hosteller';
        if (!s.category || /day[\s_-]*scholar/i.test(s.category)) {
          updates.category = 'Hosteler';
        }
      }

      Object.assign(s, updates);

      // Persist to database
      try {
        await dbService.update('students', s.id, updates);
      } catch (e) {
        console.warn('Could not update student hostel bed:', e);
      }

      // Update local hostel allocations roster
      try {
        let allocations = JSON.parse(localStorage.getItem('tms_hostel_allocations') || '[]');
        allocations = allocations.filter(a => a.studentId !== s.id && a.rollNo !== s.admissionNo);
        if (isBoarder) {
          allocations.push({
            id: 'ha-' + Date.now(),
            studentId: s.id,
            studentName: s.fullName,
            rollNo: s.admissionNo,
            classGrade: s.grade,
            wing,
            roomNo: room,
            bedNo: bed,
            guardianPhone: s.guardianPhone || s.phone || '',
            status: 'Active'
          });
        }
        localStorage.setItem('tms_hostel_allocations', JSON.stringify(allocations));
      } catch (_) {}

      UIComponents.closeModal();
      UIComponents.showToast(isBoarder ? `Bed ${bed} (${room}) assigned to ${s.fullName}!` : `${s.fullName} set as Day Scholar (hostel bed vacated).`, 'success');
      StudentModule.render(container);
    });

    UIComponents.refreshIcons();
  }

  /**
   * Dedicated Hostel Management Hub with Bed Rosters and Room Allocations
   */
  static openHostelManagementModal(container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const students = this._students || [];

    const hostellers = students.filter(s => StudentModule.isHosteller(s));
    const dayScholars = students.filter(s => StudentModule.isDayScholar(s));

    const allocatedHostellers = hostellers.filter(s => s.hostelBlock && s.hostelBlock.trim() && s.hostelRoom && s.hostelRoom.trim());
    const unallocatedHostellers = hostellers.filter(s => !s.hostelBlock || !s.hostelBlock.trim() || !s.hostelRoom || !s.hostelRoom.trim());

    const boysHostel = allocatedHostellers.filter(s => s.gender === 'Boy' || s.gender === 'Male');
    const girlsHostel = allocatedHostellers.filter(s => s.gender === 'Girl' || s.gender === 'Female');

    const bodyHtml = `
      <div style="font-family:inherit;">
        <!-- Top KPI Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:12px 14px;">
            <div style="font-size:0.72rem; font-weight:700; color:#166534; text-transform:uppercase;">Hostel Boarders</div>
            <div style="font-size:1.4rem; font-weight:800; color:#14532d; margin-top:2px;">${hostellers.length} Students</div>
            <div style="font-size:0.72rem; color:#475569; margin-top:2px;">Active in residential dorms</div>
          </div>
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:12px 14px;">
            <div style="font-size:0.72rem; font-weight:700; color:#1e40af; text-transform:uppercase;">Boys Wing Occupancy</div>
            <div style="font-size:1.4rem; font-weight:800; color:#1e3a8a; margin-top:2px;">${boysHostel.length} Boys</div>
            <div style="font-size:0.72rem; color:#475569; margin-top:2px;">Hazrat Bilal Campus</div>
          </div>
          <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:12px; padding:12px 14px;">
            <div style="font-size:0.72rem; font-weight:700; color:#7e22ce; text-transform:uppercase;">Girls Wing Occupancy</div>
            <div style="font-size:1.4rem; font-weight:800; color:#581c87; margin-top:2px;">${girlsHostel.length} Girls</div>
            <div style="font-size:0.72rem; color:#475569; margin-top:2px;">Fatima-tuz-Zahra Campus</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px;">
            <div style="font-size:0.72rem; font-weight:700; color:#475569; text-transform:uppercase;">Day Scholars</div>
            <div style="font-size:1.4rem; font-weight:800; color:#0f172a; margin-top:2px;">${dayScholars.length} Students</div>
            <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">Attending campus daily</div>
          </div>
        </div>

        <!-- View Switcher -->
        <div style="display:flex; gap:8px; border-bottom:1.5px solid #e2e8f0; margin-bottom:14px; padding-bottom:8px;">
          <button type="button" class="btn btn-primary btn-sm btn-hostel-tab" data-tab="roster" id="tab-hostel-roster" style="font-weight:700; background:#0e623b; border-color:#0e623b; color:#ffffff;">
            <i data-lucide="list"></i> Student Roster (${hostellers.length})
          </button>
          <button type="button" class="btn btn-secondary btn-sm btn-hostel-tab" data-tab="matrix" id="tab-hostel-matrix" style="font-weight:700; background:#ffffff; border-color:#cbd5e1; color:#475569;">
            <i data-lucide="layout-grid"></i> Visual Rooms &amp; Bed Matrix
          </button>
        </div>

        <div id="hostel-view-roster">
          <!-- Filter and Search Toolbar -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <input type="text" id="hostel-filter-input" class="form-input form-input-sm" placeholder="Search boarder, room, bed..." style="width:220px; height:34px;">
              <select id="hostel-filter-wing" class="form-select form-select-sm" style="height:34px; min-width:130px; font-size:0.78rem;">
                <option value="">All Wings</option>
                <option value="hazrat bilal">Hazrat Bilal Boys Wing</option>
                <option value="fatima">Fatima Girls Wing</option>
                <option value="block a">Block A</option>
                <option value="block b">Block B</option>
                <option value="campus">Girls Campus</option>
              </select>
              <select id="hostel-filter-status" class="form-select form-select-sm" style="height:34px; min-width:120px; font-size:0.78rem;">
                <option value="">All Allocations</option>
                <option value="assigned">Bed Assigned</option>
                <option value="pending">Bed Pending</option>
              </select>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-primary btn-sm" id="btn-quick-allocate-bed" style="background:#0e623b; border-color:#0e623b; font-weight:700;">
                <i data-lucide="plus"></i> Allocate Bed to Student
              </button>
              <a href="#/admin" class="btn btn-secondary btn-sm" id="btn-goto-hostel-admin" style="font-weight:700;">
                <i data-lucide="sliders"></i> Full Hostel Settings
              </a>
            </div>
          </div>

          <!-- Bed Allotment Table -->
          <div class="table-responsive" style="max-height:46vh; overflow-y:auto; border:1.5px solid #e2e8f0; border-radius:10px; background:#ffffff;">
            <table class="tms-table" style="width:100%; font-size:0.8rem; border-collapse:collapse;">
              <thead>
                <tr style="background:#f8fafc; border-bottom:1.5px solid #cbd5e1; position:sticky; top:0; z-index:10;">
                  <th style="padding:10px 12px; text-align:left;">Student</th>
                  <th style="padding:10px 12px; text-align:left;">Class</th>
                  <th style="padding:10px 12px; text-align:left;">Hostel Wing</th>
                  <th style="padding:10px 12px; text-align:left;">Room No</th>
                  <th style="padding:10px 12px; text-align:left;">Bed No</th>
                  <th style="padding:10px 12px; text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody id="hostel-roster-tbody">
                ${hostellers.length ? hostellers.map(s => `
                  <tr class="hostel-roster-row" data-name="${esc(s.fullName.toLowerCase())}" data-room="${esc((s.hostelRoom || '').toLowerCase())}" data-wing="${esc((s.hostelBlock || '').toLowerCase())}" data-status="${Boolean(s.hostelBlock && s.hostelRoom) ? 'assigned' : 'pending'}" style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:8px 12px;">
                      <div style="font-weight:700; color:#0f172a;">${esc(s.fullName)}</div>
                      <div style="font-size:0.7rem; color:#64748b; font-family:var(--font-mono);">${esc(s.admissionNo)}</div>
                    </td>
                    <td style="padding:8px 12px; font-weight:600;">${esc(s.grade || '—')}</td>
                    ${Boolean(s.hostelBlock && s.hostelRoom) ? `
                      <td style="padding:8px 12px; font-weight:600; color:#1e40af;">${esc(s.hostelBlock)}</td>
                      <td style="padding:8px 12px; font-weight:700; font-family:var(--font-mono); color:#0f172a;">${esc(s.hostelRoom)}</td>
                      <td style="padding:8px 12px; font-weight:700; font-family:var(--font-mono); color:#16a34a;">${esc(s.hostelBed || 'Bed 1')}</td>
                      <td style="padding:8px 12px; text-align:right;">
                        <button type="button" class="btn btn-secondary btn-sm btn-edit-hostel-bed" data-id="${esc(s.id)}" style="padding:2px 8px; font-size:0.72rem; font-weight:700; margin-right:4px;">
                          <i data-lucide="edit-2" style="width:12px;height:12px;"></i> Change
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm btn-vacate-hostel-bed" data-id="${esc(s.id)}" style="padding:2px 8px; font-size:0.72rem; font-weight:700; color:#ef4444; border-color:#fca5a5;">
                          <i data-lucide="x" style="width:12px;height:12px;"></i> Vacate
                        </button>
                      </td>
                    ` : `
                      <td style="padding:8px 12px;"><span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">Pending Wing</span></td>
                      <td style="padding:8px 12px; color:#94a3b8;">—</td>
                      <td style="padding:8px 12px; color:#94a3b8;">—</td>
                      <td style="padding:8px 12px; text-align:right;">
                        <button type="button" class="btn btn-primary btn-sm btn-edit-hostel-bed" data-id="${esc(s.id)}" style="background:#0e623b; border-color:#0e623b; padding:2px 8px; font-size:0.72rem; font-weight:700; color:#ffffff;">
                          <i data-lucide="plus" style="width:12px;height:12px;"></i> Assign Bed
                        </button>
                      </td>
                    `}
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="padding:30px; text-align:center; color:#64748b;">
                      No students currently allocated to hostel beds. Click <strong>"Allocate Bed to Student"</strong> above to assign a room.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Visual Matrix View -->
        <div id="hostel-view-matrix" style="display:none; max-height:48vh; overflow-y:auto; padding:4px;">
          <div style="display:flex; flex-direction:column; gap:16px;">
            ${[
              { name: 'Thaiba Boys Hostel Block A', badge: 'Boys Wing', color: '#1e40af', rooms: ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202'] },
              { name: 'Thaiba Girls Hostel Campus', badge: 'Girls Wing', color: '#7e22ce', rooms: ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202'] },
              { name: 'Hazrat Bilal Boys Wing', badge: 'Boys Wing', color: '#0e623b', rooms: ['Room 101', 'Room 102', 'Room 103'] },
              { name: 'Fatima-tuz-Zahra Girls Wing', badge: 'Girls Wing', color: '#b45309', rooms: ['Room 101', 'Room 102', 'Room 103'] }
            ].map(w => `
              <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:12px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
                  <div style="font-weight:800; font-size:0.92rem; color:${w.color}; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="building" style="width:16px; height:16px;"></i>
                    ${esc(w.name)}
                  </div>
                  <span class="badge" style="font-size:0.72rem; padding:2px 8px; border-radius:9999px; background:#f1f5f9; color:#475569; font-weight:700;">
                    ${w.badge} • ${w.rooms.length} Rooms
                  </span>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
                  ${w.rooms.map(rm => {
                    const beds = ['Bed 1', 'Bed 2'];
                    return `
                      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px;">
                        <div style="font-weight:700; font-size:0.82rem; color:#0f172a; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                          <span style="font-family:var(--font-mono);">${esc(rm)}</span>
                          <span style="font-size:0.7rem; color:#64748b;">Capacity: 2 Beds</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                          ${beds.map(bed => {
                            const occupant = hostellers.find(s => 
                              (s.hostelBlock || '').toLowerCase().includes(w.name.toLowerCase().slice(0, 12)) &&
                              (s.hostelRoom || '').toLowerCase().trim() === rm.toLowerCase().trim() &&
                              (s.hostelBed || '').toLowerCase().trim() === bed.toLowerCase().trim()
                            );
                            if (occupant) {
                              return `
                                <div style="background:#ffffff; border:1.5px solid #fca5a5; border-radius:8px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                                  <div style="display:flex; align-items:center; gap:6px; min-width:0;">
                                    <span style="font-size:0.68rem; font-weight:800; color:#ef4444; background:#fee2e2; padding:2px 5px; border-radius:4px; flex-shrink:0;">${bed}</span>
                                    <div style="min-width:0;">
                                      <div style="font-weight:700; font-size:0.78rem; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(occupant.fullName)}</div>
                                      <div style="font-size:0.68rem; color:#64748b;">${esc(occupant.grade || '')} • ${esc(occupant.admissionNo || '')}</div>
                                    </div>
                                  </div>
                                  <div style="display:flex; gap:3px; flex-shrink:0;">
                                    <button type="button" class="btn btn-secondary btn-sm btn-edit-hostel-bed" data-id="${esc(occupant.id)}" style="padding:1px 6px; font-size:0.68rem; font-weight:700;">Edit</button>
                                    <button type="button" class="btn btn-secondary btn-sm btn-vacate-hostel-bed" data-id="${esc(occupant.id)}" style="padding:1px 6px; font-size:0.68rem; font-weight:700; color:#ef4444; border-color:#fca5a5;">Vacate</button>
                                  </div>
                                </div>
                              `;
                            } else {
                              return `
                                <div style="background:#f0fdf4; border:1.5px dashed #86efac; border-radius:8px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                                  <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-size:0.68rem; font-weight:800; color:#16a34a; background:#dcfce7; padding:2px 5px; border-radius:4px;">${bed}</span>
                                    <span style="font-size:0.75rem; font-weight:600; color:#15803d;">Available</span>
                                  </div>
                                  <button type="button" class="btn btn-primary btn-sm btn-matrix-allocate" data-wing="${esc(w.name)}" data-room="${esc(rm)}" data-bed="${esc(bed)}" style="background:#0e623b; border-color:#0e623b; padding:1px 8px; font-size:0.68rem; font-weight:700; color:#ffffff;">
                                    + Assign
                                  </button>
                                </div>
                              `;
                            }
                          }).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()" style="padding:8px 20px; font-weight:700;">Close</button>
    `;

    UIComponents.openModal({
      title: 'Hostel & Residential Boarding Management',
      bodyHtml,
      footerHtml,
      maxWidth: '860px'
    });

    // Tab switcher logic
    const tabRoster = document.getElementById('tab-hostel-roster');
    const tabMatrix = document.getElementById('tab-hostel-matrix');
    const viewRoster = document.getElementById('hostel-view-roster');
    const viewMatrix = document.getElementById('hostel-view-matrix');

    tabRoster?.addEventListener('click', () => {
      tabRoster.className = 'btn btn-primary btn-sm btn-hostel-tab';
      tabRoster.style.background = '#0e623b';
      tabRoster.style.borderColor = '#0e623b';
      tabRoster.style.color = '#ffffff';

      tabMatrix.className = 'btn btn-secondary btn-sm btn-hostel-tab';
      tabMatrix.style.background = '#ffffff';
      tabMatrix.style.borderColor = '#cbd5e1';
      tabMatrix.style.color = '#475569';

      if (viewRoster) viewRoster.style.display = 'block';
      if (viewMatrix) viewMatrix.style.display = 'none';
      UIComponents.refreshIcons();
    });

    tabMatrix?.addEventListener('click', () => {
      tabMatrix.className = 'btn btn-primary btn-sm btn-hostel-tab';
      tabMatrix.style.background = '#0e623b';
      tabMatrix.style.borderColor = '#0e623b';
      tabMatrix.style.color = '#ffffff';

      tabRoster.className = 'btn btn-secondary btn-sm btn-hostel-tab';
      tabRoster.style.background = '#ffffff';
      tabRoster.style.borderColor = '#cbd5e1';
      tabRoster.style.color = '#475569';

      if (viewRoster) viewRoster.style.display = 'none';
      if (viewMatrix) viewMatrix.style.display = 'block';
      UIComponents.refreshIcons();
    });

    // Matrix + Assign handler
    document.querySelectorAll('.btn-matrix-allocate').forEach(btn => {
      btn.addEventListener('click', () => {
        const wing = btn.dataset.wing;
        const room = btn.dataset.room;
        const bed = btn.dataset.bed;

        const pool = unallocatedHostellers.length ? unallocatedHostellers : students;
        const studentOptions = pool.map(s => {
          const isH = StudentModule.isHosteller(s);
          return `<option value="${esc(s.id)}">${esc(s.fullName)} (${esc(s.admissionNo)}) - ${esc(s.grade)} [${isH ? 'Hosteller - Pending Bed' : 'Day Scholar'}]</option>`;
        }).join('');

        const pickHtml = `
          <div style="padding:10px 0;">
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:0.82rem;">
              <strong>Target Bed:</strong> ${esc(wing)} • <strong>${esc(room)}</strong> • <span style="color:#16a34a; font-weight:700;">${esc(bed)}</span>
            </div>
            <p style="font-size:0.86rem; color:#475569; margin-bottom:10px;">Select student to allocate to this vacant bed:</p>
            <select id="pick-matrix-student" class="form-select" style="width:100%; height:38px;">
              ${studentOptions}
            </select>
          </div>
        `;

        UIComponents.openModal({
          title: `Assign ${bed} in ${room}`,
          bodyHtml: pickHtml,
          footerHtml: `
            <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
            <button class="btn btn-primary" id="btn-confirm-matrix-alloc" style="background:#0e623b; border-color:#0e623b; font-weight:700;">Confirm Allocation</button>
          `,
          maxWidth: '520px'
        });

        document.getElementById('btn-confirm-matrix-alloc')?.addEventListener('click', async () => {
          const chosenId = document.getElementById('pick-matrix-student')?.value;
          const chosen = students.find(x => x.id === chosenId);
          if (chosen) {
            chosen.hostelBlock = wing;
            chosen.hostelRoom = room;
            chosen.hostelBed = bed;
            chosen.category = 'Hosteler';
            chosen.boardingType = 'hosteller';
            try {
              await dbService.update('students', chosen.id, {
                hostelBlock: wing,
                hostelRoom: room,
                hostelBed: bed,
                category: 'Hosteler',
                boardingType: 'hosteller'
              });
              UIComponents.closeModal();
              UIComponents.showToast(`Allocated ${bed} in ${room} to ${chosen.fullName}!`, 'success');
              StudentModule.render(container);
            } catch (err) {
              UIComponents.showToast(`Allocation error: ${err.message}`, 'error');
            }
          }
        });
      });
    });

    // Multi-filter in hostel roster
    const searchInp = document.getElementById('hostel-filter-input');
    const wingFilter = document.getElementById('hostel-filter-wing');
    const statusFilter = document.getElementById('hostel-filter-status');

    const filterHostelRows = () => {
      const q = (searchInp?.value || '').toLowerCase().trim();
      const wing = (wingFilter?.value || '').toLowerCase().trim();
      const st = (statusFilter?.value || '').toLowerCase().trim();

      document.querySelectorAll('.hostel-roster-row').forEach(row => {
        const name = row.dataset.name || '';
        const room = row.dataset.room || '';
        const rWing = row.dataset.wing || '';
        const rStatus = row.dataset.status || '';

        const matchQ = !q || name.includes(q) || room.includes(q) || rWing.includes(q);
        const matchWing = !wing || rWing.includes(wing);
        const matchStatus = !st || rStatus === st;

        row.style.display = matchQ && matchWing && matchStatus ? '' : 'none';
      });
    };

    searchInp?.addEventListener('input', filterHostelRows);
    wingFilter?.addEventListener('change', filterHostelRows);
    statusFilter?.addEventListener('change', filterHostelRows);

    // Allocate button: pick from unassigned students
    document.getElementById('btn-quick-allocate-bed')?.addEventListener('click', () => {
      // Prioritize hostellers who need a bed
      const pool = unallocatedHostellers.length ? unallocatedHostellers : students;
      const studentOptions = pool.map(s => {
        const isH = StudentModule.isHosteller(s);
        return `<option value="${esc(s.id)}">${esc(s.fullName)} (${esc(s.admissionNo)}) - ${esc(s.grade)} [${isH ? 'Hosteller - Pending Bed' : 'Day Scholar'}]</option>`;
      }).join('');
      const pickHtml = `
        <div style="font-family:inherit;">
          <p style="font-size:0.86rem; color:#475569; margin-bottom:14px;">Select an enrolled student to allocate a hostel room and bed:</p>
          <div style="margin-bottom:16px;">
            <label class="form-label" style="font-size:0.8rem; font-weight:700;">Select Student</label>
            <select id="pick-student-for-hostel" class="form-select" style="width:100%;">
              ${studentOptions}
            </select>
          </div>
          <button type="button" class="btn btn-primary" id="btn-proceed-hostel-alloc" style="width:100%; background:#0e623b; border-color:#0e623b; font-weight:700;">
            Proceed to Bed Assignment
          </button>
        </div>
      `;

      UIComponents.openModal({
        title: 'Select Student for Hostel Allocation',
        bodyHtml: pickHtml,
        maxWidth: '480px'
      });

      document.getElementById('btn-proceed-hostel-alloc')?.addEventListener('click', () => {
        const chosenId = document.getElementById('pick-student-for-hostel')?.value;
        const chosenStudent = students.find(s => s.id === chosenId);
        UIComponents.closeModal();
        if (chosenStudent) {
          StudentModule.openHostelBedModal(chosenStudent, container);
        }
      });
      UIComponents.refreshIcons();
    });

    // Edit bed button in roster
    document.querySelectorAll('.btn-edit-hostel-bed').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const s = students.find(x => x.id === id);
        UIComponents.closeModal();
        if (s) StudentModule.openHostelBedModal(s, container);
      });
    });

    // Vacate bed button in roster
    document.querySelectorAll('.btn-vacate-hostel-bed').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const s = students.find(x => x.id === id);
        if (s && confirm(`Vacate hostel bed for ${s.fullName} and set them as Day Scholar?`)) {
          const updates = { hostelBlock: '', hostelRoom: '', hostelBed: '', category: 'Day Scholar' };
          Object.assign(s, updates);
          try {
            await dbService.update('students', s.id, updates);
          } catch (e) {}
          try {
            let allocations = JSON.parse(localStorage.getItem('tms_hostel_allocations') || '[]');
            allocations = allocations.filter(a => a.studentId !== s.id && a.rollNo !== s.admissionNo);
            localStorage.setItem('tms_hostel_allocations', JSON.stringify(allocations));
          } catch (_) {}
          UIComponents.closeModal();
          UIComponents.showToast(`Hostel bed vacated for ${s.fullName}.`, 'info');
          StudentModule.render(container);
        }
      });
    });

    UIComponents.refreshIcons();
  }

  /**
   * Publication-grade Official Student Bio-Data & Cumulative Enrollment Dossier
   * Authentic Government / Institutional Gazette Style with Ready-to-Fill Blank Fields
   */
  static renderStudentDossierHtml(s = {}) {
    const esc = (v) => UIComponents.escapeHtml(v || '');

    // Official Fillable Blank Helper:
    // When data is populated -> prints bold official text.
    // When data is missing/empty -> prints a clean, ruled, fillable blank line for pen entry!
    const fill = (v, minWidth = '140px') => {
      const trimmed = (v !== undefined && v !== null) ? String(v).trim() : '';
      if (trimmed !== '' && trimmed !== '—' && trimmed !== '-' && trimmed.toLowerCase() !== 'unknown' && trimmed.toLowerCase() !== 'n/a') {
        return `<span style="font-weight:800; color:#0f172a; word-break:break-word;">${esc(trimmed)}</span>`;
      }
      return `<span class="tms-blank-writein" style="display:inline-block; border-bottom:1px dotted #475569; min-width:${minWidth}; height:14px; vertical-align:bottom; margin:0 2px;"></span>`;
    };

    // Segmented digit boxes for official UID, APAAR & PIN codes
    const digitBoxes = (val, length = 12, groupSize = 4) => {
      const clean = String(val || '').replace(/[^0-9A-Za-z]/g, '');
      const boxes = [];
      for (let i = 0; i < length; i++) {
        const char = clean[i] || '';
        boxes.push(`<span style="display:inline-block; width:13px; height:17px; border:1px solid #475569; text-align:center; line-height:17px; font-size:10.5px; font-weight:800; font-family:monospace; background:${char ? '#ffffff' : '#f8fafc'}; color:#0f172a; margin-right:1px;">${char ? esc(char) : '&nbsp;'}</span>`);
        if (groupSize && (i + 1) % groupSize === 0 && (i + 1) < length) {
          boxes.push(`<span style="margin:0 2px; font-weight:700; color:#64748b;">-</span>`);
        }
      }
      return `<span style="display:inline-flex; align-items:center;">${boxes.join('')}</span>`;
    };

    // Checkbox box helper: [✓] or [ ]
    const chkBox = (checked, label) => {
      return `<span style="display:inline-flex; align-items:center; gap:4px; margin-right:10px; font-size:9px; font-weight:600; color:#1e293b;">
        <span style="display:inline-block; width:11px; height:11px; border:1.5px solid #064e3b; border-radius:2px; text-align:center; line-height:9px; font-size:9px; font-weight:900; color:#064e3b; background:${checked ? '#dcfce7' : '#ffffff'};">
          ${checked ? '✓' : '&nbsp;'}
        </span>
        <span>${esc(label)}</span>
      </span>`;
    };

    let photoUrl = '';
    if (s && s.photo) {
      photoUrl = admissionService.getPublicUrl('admission-docs', s.photo) || s.photo;
    }

    const isBoarder = StudentModule.isHosteller(s);
    let ageStr = '';
    if (s && s.dob) {
      const diff = Date.now() - new Date(s.dob).getTime();
      const ageDate = new Date(diff);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (!isNaN(calculatedAge) && calculatedAge > 0 && calculatedAge < 100) {
        ageStr = `${calculatedAge} Yrs`;
      }
    }

    const gen = String(s.gender || '').toLowerCase();
    const isMale = gen === 'male' || gen === 'boy' || gen === 'm';
    const isFemale = gen === 'female' || gen === 'girl' || gen === 'f';

    const cat = String(s.category || '').toUpperCase();
    const isGeneral = cat.includes('GEN') || (!cat.includes('OBC') && !cat.includes('SC') && !cat.includes('ST') && !cat.includes('EWS') && !cat.includes('TSQ') && !cat.includes('ORPHAN'));
    const isObcA = cat.includes('OBC-A') || cat.includes('OBCA');
    const isObcB = cat.includes('OBC-B') || cat.includes('OBCB');
    const isSc = cat.includes('SC') && !cat.includes('SCHOLAR');
    const isSt = cat.includes('ST');
    const isEws = cat.includes('EWS');

    const formattedDob = s.dob ? String(s.dob).slice(0, 10).split('-').reverse().join(' / ') : '';

    return `
      <div class="tms-dossier-sheet" style="font-family:'Plus Jakarta Sans', Arial, sans-serif; background:#ffffff; color:#0f172a; border:2.5px solid #064e3b; outline:1px solid #064e3b; outline-offset:-4px; padding:18px 20px; position:relative; box-sizing:border-box; margin:0 auto 28px auto; max-width:840px; page-break-after:always; break-after:page;">
        
        <!-- Subtle Institutional Watermark -->
        <div style="position:absolute; top:42%; left:50%; transform:translate(-50%, -50%) rotate(-30deg); font-size:46px; font-weight:900; color:#064e3b; opacity:0.035; pointer-events:none; white-space:nowrap; text-transform:uppercase; letter-spacing:4px; font-family:'Outfit', serif;">
          THAIBA MODEL SCHOOL • OFFICIAL DOSSIER
        </div>

        <!-- Institutional Letterhead Header -->
        <div style="display:flex; align-items:center; gap:14px; border-bottom:2px solid #064e3b; padding-bottom:10px; margin-bottom:10px; position:relative;">
          <div style="flex-shrink:0;">
            ${TMS_LOGO.emblemSvg(56)}
          </div>
          <div style="flex:1; text-align:center; line-height:1.25;">
            <div style="font-size:8.5px; font-weight:800; letter-spacing:1px; color:#b45309; text-transform:uppercase;">
              RUN BY : THAIBA HERITAGE, KOLKATA • REGD. TRUST NO. IV 01894/2011
            </div>
            <h1 style="font-family:'Outfit', serif; font-size:22px; font-weight:900; color:#064e3b; margin:2px 0; letter-spacing:0.8px; text-transform:uppercase;">
              ${esc(TMS_CONFIG.institution.name)}
            </h1>
            <div style="font-size:9px; color:#334155; font-weight:600;">
              Baghait, Tapan, Dakshin Dinajpur, West Bengal - 733127 (Govt. Regd. Co-Educational Senior Institution)
            </div>
            <div style="font-size:8px; color:#64748b; margin-top:2px;">
              Ph: +91 8653382851, +91 8167782851 • Web: www.thaibagarden.com • Email: tms@thaibagarden.com
            </div>
          </div>
          <div style="text-align:right; flex-shrink:0; font-size:8px;">
            <div style="border:1.5px solid #064e3b; background:#f0fdf4; color:#064e3b; padding:3px 7px; border-radius:3px; font-weight:800; text-transform:uppercase; margin-bottom:3px;">
              OFFICIAL FORM
            </div>
            <div style="color:#64748b;">SL NO: <strong style="color:#0f172a;">${s.admissionNo ? esc(s.admissionNo) : '................'}</strong></div>
            <div style="color:#64748b;">DATE: <strong style="color:#0f172a;">${new Date().toLocaleDateString('en-GB')}</strong></div>
          </div>
        </div>

        <!-- Accent Trilateral Ribbon -->
        <div style="display:flex; height:3px; width:100%; margin-bottom:8px; border-radius:2px; overflow:hidden;">
          <div style="flex:4; background:#064e3b;"></div>
          <div style="flex:2; background:#b45309;"></div>
          <div style="flex:1; background:#1e3a8a;"></div>
        </div>

        <!-- Title Banner -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#064e3b; color:#ffffff; padding:5px 12px; border-radius:3px; margin-bottom:10px;">
          <div style="font-size:10.5px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase;">
            CUMULATIVE STUDENT RECORD &amp; ADMISSION BIO-DATA DOSSIER
          </div>
          <div style="font-size:8.5px; font-weight:700; color:#fde047;">
            ACADEMIC SESSION: ${esc(TMS_CONFIG.academic.currentYear || '2026 - 2027')}
          </div>
        </div>

        <!-- Hero Identity Block: Core Badges & Photo Attestation Box -->
        <div style="display:flex; gap:12px; margin-bottom:10px; align-items:stretch;">
          <!-- Core Identity Table (Left) -->
          <div style="flex:1; border:1px solid #cbd5e1; border-radius:4px; overflow:hidden;">
            <table style="width:100%; border-collapse:collapse; font-size:9.5px;">
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="width:24%; padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Admission / ID No:</td>
                  <td style="padding:4px 7px; font-weight:800; font-family:var(--font-mono); font-size:11.5px; color:#064e3b;">${fill(s.admissionNo, '120px')}</td>
                  <td style="width:22%; padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Roll Number:</td>
                  <td style="padding:4px 7px; font-weight:800; font-family:var(--font-mono); color:#1e3a8a;">${fill(s.rollNo, '80px')}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Class / Standard:</td>
                  <td style="padding:4px 7px; font-weight:800; color:#0f172a;">${fill(s.grade || s.class, '100px')}</td>
                  <td style="padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Section Assigned:</td>
                  <td style="padding:4px 7px; font-weight:800; color:#0f172a;">${fill(s.section ? 'Sec ' + s.section : '', '60px')}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Boarding Category:</td>
                  <td style="padding:4px 7px; font-weight:700;">
                    ${chkBox(!isBoarder, 'Day Scholar')}
                    ${chkBox(isBoarder, 'Hostel Resident')}
                  </td>
                  <td style="padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Enrollment Status:</td>
                  <td style="padding:4px 7px;">
                    <span style="display:inline-block; padding:1px 6px; border-radius:3px; font-size:8.5px; font-weight:800; background:#dcfce7; color:#15803d; text-transform:uppercase;">
                      ${fill(s.status || 'Active', '70px')}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Date of Admission:</td>
                  <td style="padding:4px 7px; font-weight:600;">${fill(s.admissionDate || (s.created_at ? s.created_at.slice(0, 10) : ''), '100px')}</td>
                  <td style="padding:4px 7px; background:#f8fafc; font-weight:700; color:#475569;">Fee Concession:</td>
                  <td style="padding:4px 7px; font-weight:600;">${fill(s.concession || (s.category === 'TSQ' ? 'TSQ Merit Scholarship' : ''), '90px')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Official Passport Photograph Attestation Box (Right) -->
          <div style="width:105px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1.5px solid #064e3b; border-radius:4px; background:#f8fafc; padding:3px; box-sizing:border-box;">
            <div style="width:95px; height:110px; border:1px solid #cbd5e1; border-radius:3px; overflow:hidden; background:#ffffff; display:flex; align-items:center; justify-content:center; text-align:center; position:relative;">
              ${photoUrl ? `<img src="${esc(photoUrl)}" alt="Student Photo" style="width:100%; height:100%; object-fit:cover; display:block;">` : `
                <div style="font-size:7px; color:#64748b; font-weight:700; padding:4px; line-height:1.25;">
                  AFFIX RECENT<br>PASSPORT SIZE<br>COLOUR PHOTO<br>(3.5 cm × 4.5 cm)<br><br>
                  <span style="font-size:14px; opacity:0.6;">📷</span><br><br>
                  (Self-Attested Across Photo)
                </div>
              `}
            </div>
            <div style="font-size:6.5px; font-weight:800; color:#064e3b; margin-top:2px; text-transform:uppercase; letter-spacing:0.5px;">
              VERIFIED RECORD
            </div>
          </div>
        </div>

        <!-- SECTION I: CANDIDATE PERSONAL PARTICULARS & DEMOGRAPHICS -->
        <div style="margin-bottom:8px;">
          <div style="background:#f1f5f9; border-left:4px solid #064e3b; padding:3px 8px; font-size:9px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">
            I. Candidate Personal Particulars &amp; Demographics
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #e2e8f0;">
            <tbody>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="width:22%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Full Legal Name (Block Letters):</td>
                <td colspan="3" style="padding:4px 6px; font-weight:800; font-size:10.5px; color:#0f172a;">
                  ${fill(s.fullName ? s.fullName.toUpperCase() : '', '100%')}
                </td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Date of Birth (in Figures):</td>
                <td style="width:28%; padding:4px 6px; font-weight:700;">
                  ${fill(formattedDob, '110px')} ${ageStr ? `(${ageStr})` : ''}
                </td>
                <td style="width:20%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Gender:</td>
                <td style="width:30%; padding:4px 6px;">
                  ${chkBox(isMale, 'Male')}
                  ${chkBox(isFemale, 'Female')}
                  ${chkBox(!isMale && !isFemale && s.gender, s.gender || 'Other')}
                </td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Date of Birth (in Words):</td>
                <td colspan="3" style="padding:4px 6px;">
                  ${fill(s.dobInWords, '100%')}
                </td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Social Category:</td>
                <td colspan="3" style="padding:4px 6px;">
                  ${chkBox(isGeneral, 'General')}
                  ${chkBox(isObcA, 'OBC-A')}
                  ${chkBox(isObcB, 'OBC-B')}
                  ${chkBox(isSc, 'SC')}
                  ${chkBox(isSt, 'ST')}
                  ${chkBox(isEws, 'EWS')}
                  ${chkBox(s.category === 'ORPHAN', 'Orphan / Vulnerable')}
                </td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Blood Group &amp; Mother Tongue:</td>
                <td style="padding:4px 6px;">
                  <span style="font-weight:800; color:#ef4444;">${fill(s.bloodGroup || s.blood_group, '60px')}</span>
                  &nbsp;•&nbsp; Lang: ${fill(s.motherTongue || 'Bengali', '70px')}
                </td>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Religion &amp; Nationality:</td>
                <td style="padding:4px 6px;">
                  ${fill(s.religion || 'Islam', '70px')} &nbsp;•&nbsp; ${fill(s.nationality || 'Indian', '60px')}
                </td>
              </tr>
              <tr>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Personal Identification Marks:</td>
                <td colspan="3" style="padding:4px 6px;">
                  1) ${fill(s.identificationMark1 || s.idMark1, '42%')} &nbsp;&nbsp;&nbsp; 2) ${fill(s.identificationMark2 || s.idMark2, '42%')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION II: STATUTORY GOVERNMENT IDENTIFIERS & SCHOLARSHIPS -->
        <div style="margin-bottom:8px;">
          <div style="background:#f1f5f9; border-left:4px solid #064e3b; padding:3px 8px; font-size:9px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">
            II. Statutory Government Identifiers &amp; DBT Portals
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #e2e8f0;">
            <tbody>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="width:22%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Aadhaar Card UID (12-Digit):</td>
                <td style="width:28%; padding:4px 6px;">${digitBoxes(s.aadharNo || s.aadhaar, 12, 4)}</td>
                <td style="width:20%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">APAAR / ABC ID (12-Digit):</td>
                <td style="width:30%; padding:4px 6px;">${digitBoxes(s.apaarId, 12, 4)}</td>
              </tr>
              <tr>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Banglar Shiksha Student ID:</td>
                <td style="padding:4px 6px; font-family:var(--font-mono); font-weight:700;">${fill(s.govtStudentId, '130px')}</td>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Minority / Kanyashree ID:</td>
                <td style="padding:4px 6px; font-family:var(--font-mono); font-weight:700;">${fill(s.minorityId || s.kanyashreeId, '130px')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION III: PARENTAGE & GUARDIAN PARTICULARS -->
        <div style="margin-bottom:8px;">
          <div style="background:#f1f5f9; border-left:4px solid #064e3b; padding:3px 8px; font-size:9px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">
            III. Parentage &amp; Family Credentials
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #e2e8f0;">
            <tbody>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="width:20%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Father's Full Name:</td>
                <td style="width:30%; padding:4px 6px; font-weight:700;">${fill(s.fatherName || s.parentName, '150px')}</td>
                <td style="width:20%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Occupation &amp; Qual:</td>
                <td style="width:30%; padding:4px 6px;">${fill(s.fatherOccupation, '80px')} &nbsp;•&nbsp; ${fill(s.fatherQualification, '70px')}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Mother's Full Name:</td>
                <td style="padding:4px 6px; font-weight:700;">${fill(s.motherName, '150px')}</td>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Occupation &amp; Qual:</td>
                <td style="padding:4px 6px;">${fill(s.motherOccupation || 'Homemaker', '80px')} &nbsp;•&nbsp; ${fill(s.motherQualification, '70px')}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Legal Guardian &amp; Rel:</td>
                <td style="padding:4px 6px;">${fill(s.guardianName || s.fatherName, '120px')} (${fill(s.relation || 'Father', '60px')})</td>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Annual Family Income:</td>
                <td style="padding:4px 6px; font-family:var(--font-mono);">${s.annualIncome ? '₹ ' + esc(s.annualIncome) : fill('', '100px')}</td>
              </tr>
              <tr>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Emergency Phone (Calling):</td>
                <td style="padding:4px 6px; font-weight:700; font-family:var(--font-mono); color:#15803d;">${fill(s.guardianPhone || s.fatherPhone || s.phone, '120px')}</td>
                <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">WhatsApp &amp; Email:</td>
                <td style="padding:4px 6px; font-family:var(--font-mono);">${fill(s.whatsapp || s.fatherWhatsapp, '100px')} &nbsp;•&nbsp; ${fill(s.email, '100px')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SECTION IV: ADDRESS & SECTION V: HOSTEL (SIDE BY SIDE 2-COLUMN) -->
        <div style="display:grid; grid-template-columns:1.15fr 0.85fr; gap:8px; margin-bottom:8px;">
          <!-- Permanent Postal Address -->
          <div>
            <div style="background:#f1f5f9; border-left:4px solid #064e3b; padding:3px 8px; font-size:9px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">
              IV. Permanent &amp; Postal Address
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #e2e8f0; height:calc(100% - 22px);">
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="width:30%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Village / Street:</td>
                  <td style="padding:4px 6px; font-weight:600;">${fill(s.village || s.address, '100%')}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">P.O. &amp; P.S.:</td>
                  <td style="padding:4px 6px;">PO: ${fill(s.postOffice, '70px')} &nbsp;•&nbsp; PS: ${fill(s.policeStation, '70px')}</td>
                </tr>
                <tr>
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Dist, State &amp; PIN:</td>
                  <td style="padding:4px 6px;">
                    ${fill(s.district || 'Dakshin Dinajpur', '80px')} (${fill(s.state || 'West Bengal', '70px')})<br>
                    PIN: ${digitBoxes(s.pinCode || '733127', 6, null)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Residential Hostel Allocation -->
          <div>
            <div style="background:#f1f5f9; border-left:4px solid #064e3b; padding:3px 8px; font-size:9px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">
              V. Residential Boarding / Hostel
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #e2e8f0; height:calc(100% - 22px);">
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="width:35%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Hostel Wing:</td>
                  <td style="padding:4px 6px; font-weight:700; color:#1e40af;">${isBoarder ? fill(s.hostelBlock, '100%') : 'Non-Residential (Day Scholar)'}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Room &amp; Bed:</td>
                  <td style="padding:4px 6px; font-weight:700; font-family:var(--font-mono); color:#16a34a;">
                    ${isBoarder ? `Room: ${fill(s.hostelRoom, '45px')} • Bed: ${fill(s.hostelBed, '45px')}` : 'Day Scholar (No Bed)'}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Local Caretaker:</td>
                  <td style="padding:4px 6px;">${fill(s.localGuardian || s.emergencyPhysician, '100%')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECTION VI: PREVIOUS ACADEMICS & SECTION VII: BANK DETAILS (SIDE BY SIDE 2-COLUMN) -->
        <div style="display:grid; grid-template-columns:1.05fr 0.95fr; gap:8px; margin-bottom:8px;">
          <!-- Previous Academic Qualification -->
          <div>
            <div style="background:#f1f5f9; border-left:4px solid #064e3b; padding:3px 8px; font-size:9px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">
              VI. Previous Academic History &amp; TC
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #e2e8f0; height:calc(100% - 22px);">
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="width:32%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Last School:</td>
                  <td style="padding:4px 6px; font-weight:600;">${fill(s.previousSchool, '100%')}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Class Passed:</td>
                  <td style="padding:4px 6px;">Class ${fill(s.previousClass, '40px')} &nbsp;•&nbsp; Marks: ${fill(s.previousMarks, '50px')}</td>
                </tr>
                <tr>
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">TC No. &amp; Date:</td>
                  <td style="padding:4px 6px; font-family:var(--font-mono);">TC: ${fill(s.tcNo, '60px')} &nbsp;•&nbsp; Dt: ${fill(s.tcDate, '60px')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bank Account Details (DBT / Scholarships) -->
          <div>
            <div style="background:#f1f5f9; border-left:4px solid #064e3b; padding:3px 8px; font-size:9px; font-weight:800; color:#064e3b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px;">
              VII. Bank Particulars (DBT / Scholarship)
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:9px; border:1px solid #e2e8f0; height:calc(100% - 22px);">
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="width:32%; padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">Bank &amp; Branch:</td>
                  <td style="padding:4px 6px;">${fill(s.bankName, '70px')} (${fill(s.bankBranch, '50px')})</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">A/C Number:</td>
                  <td style="padding:4px 6px; font-family:var(--font-mono); font-weight:700;">${fill(s.bankAccountNo, '100%')}</td>
                </tr>
                <tr>
                  <td style="padding:4px 6px; background:#f8fafc; font-weight:700; color:#475569;">IFS Code:</td>
                  <td style="padding:4px 6px; font-family:var(--font-mono); font-weight:700;">${fill(s.bankIfsc, '90px')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- SECTION VIII: STATUTORY UNDERTAKING BY PARENT / GUARDIAN -->
        <div style="border:1.5px solid #cbd5e1; border-radius:4px; padding:8px 10px; background:#fafafa; margin-bottom:8px;">
          <div style="font-size:8px; line-height:1.35; color:#334155; text-align:justify; margin-bottom:14px;">
            <strong>STATUTORY UNDERTAKING &amp; DECLARATION:</strong> I hereby solemnly declare that all particulars entered in this Cumulative Student Bio-Data &amp; Admission Dossier are true, authentic, and verified from statutory certificates. No facts have been concealed. The candidate and parents/guardians shall strictly abide by all academic standards, institutional discipline, code of conduct, and fee regulations formulated by Thaiba Model School.
          </div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size:8px; color:#334155;">
            <div style="text-align:center; width:160px;">
              <div style="border-bottom:1px solid #475569; height:20px; margin-bottom:3px;"></div>
              <div style="font-weight:700; text-transform:uppercase;">Signature / LTI of Father</div>
              <div style="font-size:7px; color:#64748b;">Date: ........................</div>
            </div>

            <div style="text-align:center; width:160px;">
              <div style="border-bottom:1px solid #475569; height:20px; margin-bottom:3px;"></div>
              <div style="font-weight:700; text-transform:uppercase;">Signature / LTI of Mother</div>
              <div style="font-size:7px; color:#64748b;">Date: ........................</div>
            </div>

            <div style="text-align:center; width:170px;">
              <div style="border-bottom:1px solid #475569; height:20px; margin-bottom:3px;"></div>
              <div style="font-weight:700; text-transform:uppercase;">Candidate's Signature</div>
              <div style="font-size:7px; color:#64748b;">Specimen Signature</div>
            </div>
          </div>
        </div>

        <!-- SECTION IX: FOR OFFICE USE ONLY (SCRUTINY & PRINCIPAL SANCTION) -->
        <div style="border:1.5px solid #064e3b; border-radius:4px; padding:7px 10px; background:#f0fdf4; margin-bottom:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:8px; font-weight:800; color:#064e3b; text-transform:uppercase; border-bottom:1px dashed #86efac; padding-bottom:3px;">
            <span>IX. For Office Use Only — Scrutiny &amp; Attestation Block</span>
            <span>Checklist: [ ] Birth Cert &nbsp; [ ] Aadhaar &nbsp; [ ] TC &nbsp; [ ] Marksheet &nbsp; [ ] Photos</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size:8px; color:#1e293b;">
            <div style="text-align:center; width:160px;">
              <div style="border-bottom:1px solid #475569; height:18px; margin-bottom:3px;"></div>
              <div style="font-weight:700; text-transform:uppercase;">Dealing Assistant / Clerk</div>
              <div style="font-size:7px; color:#64748b;">Documents Checked &amp; Verified</div>
            </div>

            <div style="text-align:center; width:160px;">
              <div style="border-bottom:1px solid #475569; height:18px; margin-bottom:3px;"></div>
              <div style="font-weight:700; text-transform:uppercase;">Class Teacher / Counselor</div>
              <div style="font-size:7px; color:#64748b;">Attestation &amp; Roll Allocated</div>
            </div>

            <div style="text-align:center; width:180px;">
              <div style="font-family:'Brush Script MT', cursive; font-size:14px; color:#064e3b; line-height:1; margin-bottom:2px;">Thaiba Authority</div>
              <div style="border-bottom:1.5px solid #064e3b; height:4px; margin-bottom:3px;"></div>
              <div style="font-weight:800; color:#064e3b; text-transform:uppercase;">Principal / Headmaster</div>
              <div style="font-size:7px; color:#64748b;">Official Seal &amp; Institutional Stamp</div>
            </div>
          </div>
        </div>

        <!-- Tamper-evident Security Footer -->
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:7px; color:#64748b; border-top:1px dashed #cbd5e1; padding-top:3px;">
          <div>● SECURE CUMULATIVE STUDENT DOSSIER • THAIBA MODEL SCHOOL ERP</div>
          <div>RECORD ID: <span style="font-family:var(--font-mono); color:#0f172a; font-weight:700;">TMS-DOS-${esc(s.admissionNo || s.id || 'NEW')}</span></div>
          <div>PRINTED: <strong>${new Date().toISOString().replace('T', ' ').slice(0, 19)}</strong></div>
        </div>
      </div>
    `;
  }

  static downloadStudentDossier(s) {
    if (!s) return;
    const bodyHtml = StudentModule.renderStudentDossierHtml(s);
    exportPdf(`Student-Dossier-${s.admissionNo || s.id}`, bodyHtml, {
      filename: `TMS_Student_Dossier_${s.admissionNo || s.id}_${(s.fullName || 'Student').replace(/\s+/g, '_')}`,
      title: `Student Bio-Data Dossier — ${s.fullName}`,
      showHeader: false,
      showFooter: false,
      autoPrint: true
    });
    UIComponents.showToast(`Official form generated for ${s.fullName}!`, 'success');
  }

  static bulkDownloadStudentDossiers(studentsList) {
    if (!studentsList || !studentsList.length) {
      UIComponents.showToast('Please select at least one student to download forms.', 'warning');
      return;
    }
    const bodyHtml = studentsList
      .map(s => StudentModule.renderStudentDossierHtml(s))
      .join('<div style="page-break-after:always; break-after:page; height:0; margin:0; padding:0;"></div>');

    exportPdf(`Batch-Student-Dossiers-${studentsList.length}`, bodyHtml, {
      filename: `TMS_Batch_Student_Dossiers_${studentsList.length}_Students`,
      title: `Batch Student Forms (${studentsList.length} Students)`,
      showHeader: false,
      showFooter: false,
      autoPrint: true
    });
    UIComponents.showToast(`Compiled ${studentsList.length} student forms for PDF download!`, 'success');
  }

  static openBatchDownloadModal(container, students) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const allGradeOptions = Array.from(new Set(students.map(s => s.grade || s.class).filter(Boolean))).sort();

    const bodyHtml = `
      <div style="font-family:inherit; padding:6px 0;">
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 14px; margin-bottom:16px; display:flex; align-items:center; gap:12px;">
          <div style="width:42px; height:42px; border-radius:50%; background:#dcfce7; display:flex; align-items:center; justify-content:center; color:#16a34a; font-size:1.4rem; flex-shrink:0;">
            📄
          </div>
          <div>
            <div style="font-weight:800; font-size:0.95rem; color:#166534;">Official Student Bio-Data Forms (PDF)</div>
            <div style="font-size:0.78rem; color:#15803d;">Generate standardized A4 dossiers for admissions, office archives, and inspection audits.</div>
          </div>
        </div>

        <p style="font-size:0.86rem; color:#475569; margin-bottom:14px;">Select the scope of students you want to download forms for:</p>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <!-- Option 1: All Students -->
          <button type="button" class="btn btn-primary" id="btn-batch-dl-all" style="background:#0e623b; border-color:#0e623b; padding:12px 16px; font-weight:700; display:flex; justify-content:space-between; align-items:center; border-radius:10px;">
            <div style="text-align:left;">
              <div style="font-size:0.92rem;">Download All Enrolled Students</div>
              <div style="font-size:0.75rem; color:#dcfce7; font-weight:500;">Generates a complete batch booklet of all ${students.length} student forms</div>
            </div>
            <i data-lucide="download" style="width:20px; height:20px;"></i>
          </button>

          <!-- Option 2: By Class -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px;">
            <div style="font-weight:700; font-size:0.84rem; color:#0f172a; margin-bottom:8px;">Download Forms by Class / Grade</div>
            <div style="display:flex; gap:8px;">
              <select id="batch-dl-class-select" class="form-select" style="flex:1; height:38px;">
                <option value="">Choose Class / Grade...</option>
                ${allGradeOptions.map(g => {
                  const count = students.filter(s => (s.grade || s.class) === g).length;
                  return `<option value="${esc(g)}">${esc(g)} (${count} students)</option>`;
                }).join('')}
              </select>
              <button type="button" class="btn btn-secondary" id="btn-batch-dl-by-class" style="font-weight:700; height:38px; white-space:nowrap; border-color:#cbd5e1;">
                <i data-lucide="download"></i> Download Class
              </button>
            </div>
          </div>

          <!-- Option 3: Blank Official Form (Ready to Fill by Pen) -->
          <div style="background:#fefce8; border:1px solid #fef08a; border-radius:10px; padding:12px 14px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <div style="font-weight:700; font-size:0.86rem; color:#854d0e;">Print Blank Official Form</div>
              <div style="font-size:0.75rem; color:#a16207;">Pristine blank form with write-in lines and boxes ready for manual pen entry by walk-in applicants.</div>
            </div>
            <button type="button" class="btn btn-secondary" id="btn-batch-dl-blank" style="font-weight:700; height:36px; white-space:nowrap; border-color:#fde047; color:#854d0e; background:#ffffff;">
              <i data-lucide="printer"></i> Print Blank Form
            </button>
          </div>
        </div>
      </div>
    `;

    UIComponents.openModal({
      title: 'Batch Download Student Bio-Data Forms',
      bodyHtml,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()" style="padding:8px 20px; font-weight:700;">Close</button>
      `,
      maxWidth: '560px'
    });

    document.getElementById('btn-batch-dl-all')?.addEventListener('click', () => {
      UIComponents.closeModal();
      StudentModule.bulkDownloadStudentDossiers(students);
    });

    document.getElementById('btn-batch-dl-by-class')?.addEventListener('click', () => {
      const chosenClass = document.getElementById('batch-dl-class-select')?.value;
      if (!chosenClass) {
        UIComponents.showToast('Please select a class from the dropdown.', 'warning');
        return;
      }
      const filtered = students.filter(s => (s.grade || s.class) === chosenClass);
      if (!filtered.length) {
        UIComponents.showToast(`No students enrolled in ${chosenClass}.`, 'warning');
        return;
      }
      UIComponents.closeModal();
      StudentModule.bulkDownloadStudentDossiers(filtered);
    });

    document.getElementById('btn-batch-dl-blank')?.addEventListener('click', () => {
      UIComponents.closeModal();
      StudentModule.downloadStudentDossier({});
    });
  }

  static renderIdCardMarkup(s, photoUrl, cardPrefix = 'id-card-qr') {
    const esc = (v) => UIComponents.escapeHtml(v);
    const photoHtml = photoUrl
      ? `<img src="${esc(photoUrl)}" alt="Photo" style="width:100%; height:100%; object-fit:cover; display:block;">`
      : `<div style="width:100%; height:100%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:9px; text-align:center;"><i data-lucide="user" style="width:28px;height:28px;color:#94a3b8;"></i></div>`;

    const qrContainerId = `${cardPrefix}-${String(s.id || s.admissionNo).replace(/[^a-zA-Z0-9]/g, '-')}`;

    return `
      <div class="pvc-id-card-pair" style="display:inline-flex; gap:16px; margin:10px; font-family:'Plus Jakarta Sans', sans-serif; text-align:left;">
        <!-- FRONT SIDE -->
        <div class="pvc-card-side" style="width:336px; height:212px; border-radius:12px; background:linear-gradient(135deg, #064e3b 0%, #0f172a 100%); color:#fff; position:relative; overflow:hidden; border:2px solid #16a34a; box-shadow:0 6px 20px rgba(0,0,0,0.25); display:flex; flex-direction:column; justify-content:space-between; padding:12px; box-sizing:border-box;">
          <div style="position:absolute; top:-35px; right:-35px; width:110px; height:110px; border-radius:50%; background:radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%); pointer-events:none;"></div>
          
          <!-- Header -->
          <div style="display:flex; align-items:center; gap:8px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:6px;">
            <div style="flex-shrink:0;">${TMS_LOGO.emblemSvg(32)}</div>
            <div style="flex:1; line-height:1.15;">
              <div style="font-family:'Outfit', sans-serif; font-size:11.5px; font-weight:800; letter-spacing:0.04em; color:#4ade80; text-transform:uppercase;">
                ${esc(TMS_CONFIG.institution.name)}
              </div>
              <div style="font-size:7px; color:#cbd5e1; letter-spacing:0.02em;">
                Run by : Thaiba Heritage, Kolkata
              </div>
            </div>
            <span style="font-size:7px; background:#16a34a; color:#fff; padding:2px 6px; border-radius:4px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">Student</span>
          </div>

          <!-- Body -->
          <div style="display:flex; gap:10px; align-items:center; margin:4px 0;">
            <div style="width:68px; height:82px; border:2px solid #22c55e; border-radius:6px; overflow:hidden; background:#fff; flex-shrink:0;">
              ${photoHtml}
            </div>
            <div style="flex:1; min-width:0; line-height:1.25;">
              <div style="font-size:13px; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${esc(s.fullName || 'Student Name')}
              </div>
              <div style="font-size:9.5px; color:#38bdf8; font-weight:700; margin-bottom:4px;">
                ${esc(s.grade || '')} • Sec ${esc(s.section || 'A')} • Roll #${esc(s.rollNo || '—')}
              </div>
              <div style="font-size:8px; color:#cbd5e1; background:rgba(255,255,255,0.08); padding:4px 6px; border-radius:4px;">
                <div><strong>Adm No:</strong> <span class="font-mono" style="color:#fde047; font-weight:700;">${esc(s.admissionNo || '—')}</span></div>
                <div><strong>Blood:</strong> <span style="color:#ef4444; font-weight:800;">${esc(s.bloodGroup || 'O+')}</span> &nbsp;•&nbsp; <strong>DOB:</strong> ${esc((s.dob || '').slice(0, 10))}</div>
                <div><strong>Emergency:</strong> <span class="font-mono">${esc(s.guardianPhone || '—')}</span></div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.15); padding-top:4px; font-size:7px; color:#94a3b8;">
            <div>Session 2027 - 2028 • Smart Campus Pass</div>
            <div id="${qrContainerId}" class="qr-target" data-value="TMS-VERIFY:${esc(s.admissionNo)}:${esc(s.fullName)}" style="width:28px; height:28px; background:#fff; padding:1px; border-radius:3px; display:inline-block;"></div>
          </div>
        </div>

        <!-- BACK SIDE -->
        <div class="pvc-card-side" style="width:336px; height:212px; border-radius:12px; background:#0f172a; color:#cbd5e1; position:relative; overflow:hidden; border:2px solid #334155; box-shadow:0 6px 20px rgba(0,0,0,0.25); display:flex; flex-direction:column; justify-content:space-between; padding:12px; font-size:8px; line-height:1.35; box-sizing:border-box;">
          <div style="border-bottom:1px solid #334155; padding-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#38bdf8; font-size:8.5px; text-transform:uppercase;">Institutional Smart Card</strong>
            <span style="font-size:7px; color:#64748b;">Terms of Issue</span>
          </div>

          <ul style="list-style:disc; margin:4px 0 4px 14px; padding:0; font-size:7.5px; color:#94a3b8;">
            <li>This card is institutional property and must be worn inside campus.</li>
            <li>If found, please return to THAIBA MODEL SCHOOL, Baghait, Tapan.</li>
            <li>Lost cards must be reported to the school office immediately.</li>
          </ul>

          <div style="background:rgba(255,255,255,0.04); padding:4px 6px; border-radius:4px; font-size:7.5px; color:#cbd5e1;">
            <div><strong>Parent / Guardian:</strong> ${esc(s.guardianName || '—')}</div>
            <div><strong>Residential Address:</strong> ${esc((s.address || '').slice(0, 50))}</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #334155; padding-top:4px;">
            <div style="font-size:7px; color:#64748b; line-height:1.2;">
              ${esc(TMS_CONFIG.institution.name)}<br>
              Baghait, Tapan, Dakshin Dinajpur - 733127<br>
              Helpline: +91 8653382851, +91 8167782851
            </div>
            <div style="text-align:center;">
              <div style="font-family:'Brush Script MT', cursive, sans-serif; font-size:12px; color:#22c55e; margin-bottom:1px;">Thaiba Authority</div>
              <div style="font-size:7px; font-weight:700; color:#fff; border-top:1px dashed #64748b; padding-top:1px;">Principal / Controller</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static async openStudentIdCardModal(s) {
    let photoUrl = '';
    if (s.photo) {
      photoUrl = admissionService.getPublicUrl('admission-docs', s.photo) || s.photo;
    }

    const cardMarkup = StudentModule.renderIdCardMarkup(s, photoUrl, 'single-id-qr');

    UIComponents.openModal({
      title: `Printable Smart PVC ID Card — ${s.fullName}`,
      bodyHtml: `
        <div style="text-align:center; margin-bottom:14px; font-size:0.85rem; color:var(--text-muted);">
          Official CR-80 PVC dimensions (Front &amp; Back). Includes scannable verification QR Code.
        </div>
        <div id="single-id-print-area" style="text-align:center;">
          ${cardMarkup}
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
        <button class="btn btn-primary" id="btn-print-single-card"><i data-lucide="printer"></i> Print PVC Card</button>
      `,
      maxWidth: '780px'
    });

    // Generate real QR code in target element
    setTimeout(() => {
      const qrTarget = document.querySelector('#single-id-print-area .qr-target');
      if (qrTarget && window.QRCode) {
        qrTarget.innerHTML = '';
        new window.QRCode(qrTarget, {
          text: qrTarget.dataset.value || s.admissionNo,
          width: 26,
          height: 26,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.M
        });
      }
      UIComponents.refreshIcons();
    }, 50);

    const printBtn = document.getElementById('btn-print-single-card');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const printContent = document.getElementById('single-id-print-area').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${formatPdfFilename("Student_ID_Card", `${s.admissionNo || ""}_${s.fullName}`.replace(/\s+/g, "_"))}</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
            <style>
              body { margin: 20px; background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent}
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
          </body>
          </html>
        `);
        win.document.close();
      });
    }

    UIComponents.refreshIcons();
  }

  static async openBulkIdCardModal() {
    const students = await dbService.select('students');
    const classes = TMS_CONFIG.academic.classes;

    const bodyHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div>
          <label style="font-size:0.85rem; font-weight:700; margin-right:8px;">Filter by Class:</label>
          <select class="form-select" id="bulk-id-grade-select" style="width:160px; display:inline-block;">
            <option value="all">All Classes (${students.length})</option>
            ${classes.map(c => {
              const count = students.filter(s => s.grade === c).length;
              return `<option value="${c}">${c} (${count})</option>`;
            }).join('')}
          </select>
        </div>
        <div style="font-size:0.82rem; color:var(--text-muted);">
          Generates batch PVC ID card print sheet for cutting and laminating.
        </div>
      </div>
      <div id="bulk-id-preview-container" style="max-height:60vh; overflow-y:auto; text-align:center; padding:10px; background:var(--bg-subtle); border-radius:10px; border:1px solid var(--border-color);">
        <p style="color:var(--text-muted); font-size:0.85rem;">Loading student cards…</p>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
      <button class="btn btn-primary" id="btn-print-bulk-sheet"><i data-lucide="printer"></i> Print Batch ID Sheet</button>
    `;

    UIComponents.openModal({
      title: 'Bulk PVC Student ID Card Generator',
      bodyHtml,
      footerHtml,
      maxWidth: '920px'
    });

    const container = document.getElementById('bulk-id-preview-container');
    const select = document.getElementById('bulk-id-grade-select');

    const renderBatch = (list) => {
      if (!list.length) {
        container.innerHTML = '<p style="color:var(--text-muted); padding:30px;">No students enrolled in this selection.</p>';
        return;
      }
      container.innerHTML = list.map((s, idx) => StudentModule.renderIdCardMarkup(s, null, `bulk-qr-${idx}`)).join('');

      // Generate QR codes
      setTimeout(() => {
        container.querySelectorAll('.qr-target').forEach((el) => {
          if (window.QRCode) {
            el.innerHTML = '';
            new window.QRCode(el, {
              text: el.dataset.value || 'TMS',
              width: 26,
              height: 26,
              colorDark: '#000000',
              colorLight: '#ffffff',
              correctLevel: window.QRCode.CorrectLevel.M
            });
          }
        });
        UIComponents.refreshIcons();
      }, 50);
    };

    renderBatch(students);

    if (select) {
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        const filtered = val === 'all' ? students : students.filter(s => s.grade === val);
        renderBatch(filtered);
      });
    }

    const printBulkBtn = document.getElementById('btn-print-bulk-sheet');
    if (printBulkBtn) {
      printBulkBtn.addEventListener('click', () => {
        const printContent = container.innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${formatPdfFilename("Student_ID_Cards_Batch", (select ? select.value : "All"))}</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
            <style>
              body { margin: 10px; background: #fff; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .pvc-id-card-pair { page-break-inside: avoid; margin-bottom: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div style="display:flex; flex-wrap:wrap; justify-content:center;">
              ${printContent}
            </div>
            <script>window.onload = function() { window.print(); window.close(); }<\/script>
          </body>
          </html>
        `);
        win.document.close();
      });
    }

    UIComponents.refreshIcons();
  }

  /* ------------------------------------------------------------------ */
  /* Campus Medical, Allergy & Infirmary Roster (A4 Printable)          */
  /* ------------------------------------------------------------------ */
  static openInfirmaryRosterModal(students) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const dateStr = new Date().toLocaleDateString('en-GB');
    const emblem = TMS_LOGO.emblemSvg(50);

    const bodyHtml = `
      <div id="infirmary-roster-print" style="background:#fff; color:#0f172a; padding:20px; font-family:'Plus Jakarta Sans', sans-serif;">
        <!-- Header -->
        <div style="text-align:center; border-bottom:2px solid #dc2626; padding-bottom:12px; margin-bottom:16px;">
          <div style="display:flex; justify-content:center; margin-bottom:4px;">${emblem}</div>
          <h2 style="font-size:1.3rem; font-weight:800; color:#991b1b; text-transform:uppercase; margin:0;">${esc(TMS_CONFIG.institution.name)}</h2>
          <div style="font-size:0.75rem; color:#64748b; font-weight:600;">CAMPUS HEALTH SERVICES • OFFICIAL STUDENT INFIRMARY &amp; EMERGENCY ROSTER</div>
          <div style="display:inline-block; margin-top:6px; background:#fee2e2; border:1px solid #f87171; color:#991b1b; padding:2px 10px; border-radius:4px; font-size:0.75rem; font-weight:700;">
            Academic Session ${TMS_CONFIG.academic.currentYear} • Confidential Medical Document
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:0.8rem;">
          <div>Total Pupils Enrolled: <strong>${students.length}</strong></div>
          <div>Report Generated: <strong>${dateStr}</strong></div>
        </div>

        <div class="table-responsive">
          <table class="tms-table" style="font-size:0.76rem; border:1px solid #cbd5e1; width:100%;">
            <thead>
              <tr style="background:#fef2f2; color:#991b1b;">
                <th>Adm No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Blood</th>
                <th>Allergies &amp; Alerts</th>
                <th>Chronic Conditions</th>
                <th>Emergency Physician</th>
                <th>Guardian Phone</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => {
                const hasAlert = s.allergies || s.medical_conditions;
                return `
                  <tr style="${hasAlert ? 'background:#fff5f5; font-weight:600;' : ''}">
                    <td><span class="font-mono">${esc(s.admissionNo || '—')}</span></td>
                    <td><strong>${esc(s.fullName)}</strong></td>
                    <td>${esc(s.grade || '')} - ${esc(s.section || 'A')}</td>
                    <td><span class="badge ${s.bloodGroup || s.blood_group ? 'badge-info' : 'badge-secondary'}">${esc(s.bloodGroup || s.blood_group || '—')}</span></td>
                    <td>
                      ${s.allergies ? `<span style="color:#dc2626; font-weight:700;">⚠️ ${esc(s.allergies)}</span>` : '<span style="color:#64748b;">None reported</span>'}
                    </td>
                    <td>
                      ${s.medical_conditions ? `<span style="color:#b45309; font-weight:700;">${esc(s.medical_conditions)}</span>` : '<span style="color:#64748b;">None</span>'}
                    </td>
                    <td>${esc(s.emergency_physician || 'Campus Infirmary')}</td>
                    <td><span class="font-mono">${esc(s.phone || s.guardianPhone || '—')}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:24px; font-size:0.72rem; text-align:center;">
          <div style="width:30%;">
            <div style="border-bottom:1px solid #0f172a; padding-bottom:20px; margin-bottom:4px;"></div>
            <strong>Campus Medical Officer</strong>
          </div>
          <div style="width:30%;">
            <div style="border-bottom:1px solid #0f172a; padding-bottom:20px; margin-bottom:4px;"></div>
            <strong>Physical Education In-Charge</strong>
          </div>
          <div style="width:30%;">
            <div style="border-bottom:1px solid #0f172a; padding-bottom:20px; margin-bottom:4px;"></div>
            <strong>Principal (Official Seal)</strong>
          </div>
        </div>
      </div>
    `;

    UIComponents.openModal({
      title: 'Campus Medical & Infirmary Emergency Roster',
      bodyHtml,
      footerHtml: `
        <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Close</button>
        <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer"></i> Print Medical Roster (A4)</button>
      `
    });

    UIComponents.refreshIcons();
  }

  /* ================================================================== */
  /* BULK ACTIONS FOR ALL DATA FIELDS & IMPORT TOOLS                    */
  /* ================================================================== */

  /**
   * Universal Bulk Edit: Update any selected data fields across multiple students
   */
  static openBulkEditModal(rows, container) {
    const esc = UIComponents.escapeHtml;
    const bodyHtml = `
      <div style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
        Batch update selected fields for <strong>${rows.length}</strong> student(s). Check the box next to any field you wish to update; unchecked fields will remain unchanged.
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; max-height:60vh; overflow-y:auto; padding-right:4px;">
        <!-- Class / Grade -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-grade" style="width:16px; height:16px;">
            <span>Update Class / Grade</span>
          </label>
          <select class="form-select form-select-sm" id="bulk-fld-grade" disabled style="width:100%;">
            ${TMS_CONFIG.academic.classes.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
          </select>
        </div>

        <!-- Section -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-section" style="width:16px; height:16px;">
            <span>Update Section</span>
          </label>
          <select class="form-select form-select-sm" id="bulk-fld-section" disabled style="width:100%;">
            ${TMS_CONFIG.academic.sections.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
          </select>
        </div>

        <!-- Status -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-status" style="width:16px; height:16px;">
            <span>Update Enrollment Status</span>
          </label>
          <select class="form-select form-select-sm" id="bulk-fld-status" disabled style="width:100%;">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
            <option value="Transferred">Transferred</option>
            <option value="Alumni">Alumni / Graduated</option>
          </select>
        </div>

        <!-- Blood Group -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-blood" style="width:16px; height:16px;">
            <span>Update Blood Group</span>
          </label>
          <select class="form-select form-select-sm" id="bulk-fld-blood" disabled style="width:100%;">
            <option value="">Not Recorded</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
          </select>
        </div>

        <!-- Gender -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-gender" style="width:16px; height:16px;">
            <span>Update Gender</span>
          </label>
          <select class="form-select form-select-sm" id="bulk-fld-gender" disabled style="width:100%;">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Address / Village -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-address" style="width:16px; height:16px;">
            <span>Update Residential Address / Village</span>
          </label>
          <input class="form-input form-input-sm" id="bulk-fld-address" disabled placeholder="e.g. Vill: Harirampur, PO: Malda">
        </div>

        <!-- Emergency Hospital / Physician Contact -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-emergency" style="width:16px; height:16px;">
            <span>Update Emergency Hospital / Clinic Phone</span>
          </label>
          <input class="form-input form-input-sm font-mono" id="bulk-fld-emergency" disabled placeholder="e.g. +91 98300 12345">
        </div>

        <!-- Medical Alerts / Allergies -->
        <div style="padding:10px 14px; background:var(--bg-subtle, #f8fafc); border:1px solid var(--border-color); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; font-weight:700; cursor:pointer; margin-bottom:6px;">
            <input type="checkbox" id="chk-bulk-allergies" style="width:16px; height:16px;">
            <span>Update Known Allergies / Health Alert Note</span>
          </label>
          <input class="form-input form-input-sm" id="bulk-fld-allergies" disabled placeholder="e.g. Asthma, Penicillin allergy">
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-bulk-edit"><i data-lucide="check"></i> Apply to ${rows.length} Students</button>
    `;

    UIComponents.openModal({
      title: `Bulk Edit Data Fields (${rows.length} Students Selected)`,
      bodyHtml,
      footerHtml,
      maxWidth: '680px'
    });

    // Wire up checkbox toggles
    const pairs = [
      ['chk-bulk-grade', 'bulk-fld-grade'],
      ['chk-bulk-section', 'bulk-fld-section'],
      ['chk-bulk-status', 'bulk-fld-status'],
      ['chk-bulk-blood', 'bulk-fld-blood'],
      ['chk-bulk-gender', 'bulk-fld-gender'],
      ['chk-bulk-address', 'bulk-fld-address'],
      ['chk-bulk-emergency', 'bulk-fld-emergency'],
      ['chk-bulk-allergies', 'bulk-fld-allergies']
    ];

    pairs.forEach(([chkId, fldId]) => {
      const chk = document.getElementById(chkId);
      const fld = document.getElementById(fldId);
      if (chk && fld) {
        chk.addEventListener('change', () => { fld.disabled = !chk.checked; });
      }
    });

    document.getElementById('btn-save-bulk-edit').addEventListener('click', async () => {
      const patch = {};
      if (document.getElementById('chk-bulk-grade')?.checked) patch.grade = document.getElementById('bulk-fld-grade').value;
      if (document.getElementById('chk-bulk-section')?.checked) patch.section = document.getElementById('bulk-fld-section').value;
      if (document.getElementById('chk-bulk-status')?.checked) patch.status = document.getElementById('bulk-fld-status').value;
      if (document.getElementById('chk-bulk-blood')?.checked) patch.bloodGroup = document.getElementById('bulk-fld-blood').value;
      if (document.getElementById('chk-bulk-gender')?.checked) patch.gender = document.getElementById('bulk-fld-gender').value;
      if (document.getElementById('chk-bulk-address')?.checked) patch.address = document.getElementById('bulk-fld-address').value.trim();
      if (document.getElementById('chk-bulk-emergency')?.checked) patch.emergency_hospital_phone = document.getElementById('bulk-fld-emergency').value.trim();
      if (document.getElementById('chk-bulk-allergies')?.checked) patch.allergies = document.getElementById('bulk-fld-allergies').value.trim();

      const keys = Object.keys(patch);
      if (!keys.length) {
        UIComponents.showToast('Please check at least one field to update.', 'warning');
        return;
      }

      const saveBtn = document.getElementById('btn-save-bulk-edit');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Applying updates...';

      let count = 0;
      for (const s of rows) {
        // eslint-disable-next-line no-await-in-loop
        await dbService.update('students', s.id, patch);
        count++;
      }

      await auditService.log('STUDENTS_BULK_UPDATED', 'ACADEMIC', { studentCount: count, fields: keys });
      UIComponents.closeModal();
      UIComponents.showToast(`Updated ${keys.join(', ')} for ${count} student(s)!`, 'success');
      StudentModule.render(container);
    });

    UIComponents.refreshIcons();
  }

  /**
   * Fast Class & Section reassign modal (Promotion / Section Transfer)
   */
  static openBulkClassModal(rows, container) {
    const esc = UIComponents.escapeHtml;
    const bodyHtml = `
      <div style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
        Reassign class grade and section for <strong>${rows.length}</strong> selected student(s).
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Target Class / Grade</label>
          <select class="form-select" id="bulk-reassign-grade">
            ${TMS_CONFIG.academic.classes.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Target Section</label>
          <select class="form-select" id="bulk-reassign-section">
            ${TMS_CONFIG.academic.sections.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
          </select>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-bulk-class"><i data-lucide="check"></i> Reassign ${rows.length} Students</button>
    `;

    UIComponents.openModal({
      title: `Move Class & Section (${rows.length} Students)`,
      bodyHtml,
      footerHtml
    });

    document.getElementById('btn-save-bulk-class').addEventListener('click', async () => {
      const grade = document.getElementById('bulk-reassign-grade').value;
      const section = document.getElementById('bulk-reassign-section').value;
      for (const s of rows) {
        // eslint-disable-next-line no-await-in-loop
        await dbService.update('students', s.id, { grade, section });
      }
      await auditService.log('STUDENTS_CLASS_PROMOTED', 'ACADEMIC', { studentCount: rows.length, grade, section });
      UIComponents.closeModal();
      UIComponents.showToast(`Moved ${rows.length} student(s) to ${grade} - ${section}.`, 'success');
      StudentModule.render(container);
    });
    UIComponents.refreshIcons();
  }

  /**
   * Fast Status change modal (Active, Inactive, Transferred, Alumni)
   */
  static openBulkStatusModal(rows, container) {
    const bodyHtml = `
      <div style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
        Update enrollment status for <strong>${rows.length}</strong> selected student(s).
      </div>
      <div class="form-group">
        <label class="form-label" style="font-weight:700;">New Status</label>
        <select class="form-select" id="bulk-reassign-status">
          <option value="Active">Active (Regular Student)</option>
          <option value="Inactive">Inactive (Suspended / Paused)</option>
          <option value="On Leave">On Leave</option>
          <option value="Transferred">Transferred (TC Issued)</option>
          <option value="Alumni">Alumni (Graduated / Passed Out)</option>
        </select>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-bulk-status"><i data-lucide="check"></i> Update Status</button>
    `;

    UIComponents.openModal({
      title: `Change Status (${rows.length} Students)`,
      bodyHtml,
      footerHtml
    });

    document.getElementById('btn-save-bulk-status').addEventListener('click', async () => {
      const status = document.getElementById('bulk-reassign-status').value;
      for (const s of rows) {
        // eslint-disable-next-line no-await-in-loop
        await dbService.update('students', s.id, { status });
      }
      await auditService.log('STUDENTS_STATUS_CHANGED', 'ACADEMIC', { studentCount: rows.length, status });
      UIComponents.closeModal();
      UIComponents.showToast(`Status updated to "${status}" for ${rows.length} student(s).`, 'success');
      StudentModule.render(container);
    });
    UIComponents.refreshIcons();
  }

  /**
   * Auto-Sequence Roll Numbers: Renumbers roll numbers 1, 2, 3...
   */
  static openBulkRollModal(rows, container) {
    const bodyHtml = `
      <div style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:14px;">
        Renumber roll numbers sequentially across <strong>${rows.length}</strong> selected student(s).
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Starting Roll Number</label>
          <input type="number" class="form-input font-mono" id="bulk-roll-start" value="1" min="1" style="width:100%;">
        </div>
        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Format Style</label>
          <select class="form-select" id="bulk-roll-format">
            <option value="pad">Two Digits (01, 02, 03...)</option>
            <option value="plain">Normal (1, 2, 3...)</option>
          </select>
        </div>
      </div>
      <div style="margin-top:10px;">
        <label style="display:inline-flex; align-items:center; gap:8px; font-weight:600; font-size:0.84rem; cursor:pointer;">
          <input type="checkbox" id="bulk-roll-sort-alpha" checked style="width:16px; height:16px;">
          <span>Sort students alphabetically by Full Name before numbering</span>
        </label>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-save-bulk-roll"><i data-lucide="check"></i> Renumber Roll Numbers</button>
    `;

    UIComponents.openModal({
      title: `Auto-Sequence Roll Numbers (${rows.length} Students)`,
      bodyHtml,
      footerHtml
    });

    document.getElementById('btn-save-bulk-roll').addEventListener('click', async () => {
      const startNum = parseInt(document.getElementById('bulk-roll-start').value, 10) || 1;
      const isPad = document.getElementById('bulk-roll-format').value === 'pad';
      const sortAlpha = document.getElementById('bulk-roll-sort-alpha').checked;

      let list = [...rows];
      if (sortAlpha) {
        list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      }

      for (let i = 0; i < list.length; i++) {
        const num = startNum + i;
        const rollNo = isPad ? num.toString().padStart(2, '0') : num.toString();
        // eslint-disable-next-line no-await-in-loop
        await dbService.update('students', list[i].id, { rollNo });
      }

      await auditService.log('STUDENTS_ROLL_SEQUENCED', 'ACADEMIC', { studentCount: list.length, startNum });
      UIComponents.closeModal();
      UIComponents.showToast(`Assigned roll numbers (${startNum} - ${startNum + list.length - 1}) across ${list.length} student(s).`, 'success');
      StudentModule.render(container);
    });
    UIComponents.refreshIcons();
  }

  /**
   * RFC4180-compliant CSV Parser handling quotes, commas, and line breaks
   */
  static parseCsv(text) {
    const lines = [];
    let row = [''];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        if (row.length > 1 || row[0] !== '') lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== '') lines.push(row);
    return lines;
  }

  /**
   * Get currently active or user-selected student bulk import fields
   */
  static getSelectedImportFieldKeys() {
    try {
      const stored = localStorage.getItem('tms_bulk_student_fields');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    // Default selected fields
    return STUDENT_IMPORT_FIELDS.filter(f => f.default).map(f => f.key);
  }

  /**
   * Download CSV Import Template with dynamically selected fields
   */
  static downloadImportTemplate(selectedKeys = null) {
    const allFields = this.getFieldConfigs();
    const activeFields = selectedKeys && selectedKeys.length > 0
      ? allFields.filter(f => selectedKeys.includes(f.key))
      : allFields;

    if (!activeFields.length) {
      UIComponents.showToast('Please select at least one field for the template.', 'warning');
      return;
    }

    const header = activeFields.map(f => f.label);
    const sample1 = activeFields.map(f => f.sample1 || '');
    const sample2 = activeFields.map(f => f.sample2 || '');

    downloadCsv('TMS_Students_Import_Template.csv', [header, sample1, sample2]);
    UIComponents.showToast(`Import template downloaded with ${activeFields.length} statutory columns.`, 'success');
  }

  /**
   * Bulk CSV Import Modal: Interactive field selection, dynamic template generation, parse, validate & batch-insert
   */
  static openBulkImportModal(container) {
    const esc = (v) => UIComponents.escapeHtml(v);
    const allFields = this.getFieldConfigs();
    const savedKeys = new Set(this.getSelectedImportFieldKeys());

    allFields.forEach(f => {
      if (f.required) savedKeys.add(f.key);
    });

    const bodyHtml = `
      <div style="font-family:inherit;">
        <!-- Step 1: Field Selection & Template Download Card -->
        <div class="card" style="margin-bottom:16px; border:1px solid #bfdbfe; background:#f8fafc; border-radius:10px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
            <div>
              <h4 style="font-size:0.95rem; font-weight:800; color:#1e40af; margin:0 0 4px 0; display:flex; align-items:center; gap:6px;">
                <i data-lucide="sliders" style="width:16px;height:16px;"></i> 1. Choose Data Fields for Template &amp; Bulk Upload
              </h4>
              <div style="font-size:0.78rem; color:#475569;">
                Select columns for your student spreadsheet. The template contains all 41 fields in the statutory order by default.
              </div>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-select-all-flds" style="font-size:0.75rem; padding:4px 8px;">Select All (41)</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-select-std-flds" style="font-size:0.75rem; padding:4px 8px;">Standard Fields</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-select-min-flds" style="font-size:0.75rem; padding:4px 8px;">Minimal (Core Only)</button>
            </div>
          </div>

          <!-- Checkbox Grid -->
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:8px 12px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; max-height:220px; overflow-y:auto;" id="bulk-field-checklist">
            ${allFields.map(f => {
              const isChecked = savedKeys.has(f.key);
              const isReq = f.required === true;
              return `
                <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; cursor:${isReq ? 'default' : 'pointer'}; color:${isReq ? '#0f172a' : '#334155'}; font-weight:${isReq ? '700' : '500'};">
                  <input type="checkbox" class="import-fld-chk" data-fkey="${esc(f.key)}" ${isChecked ? 'checked' : ''} ${isReq ? 'disabled' : ''} style="width:15px; height:15px;">
                  <span>${esc(f.label)} ${isReq ? '<span style="color:#ef4444; font-size:0.7rem;">(Required)</span>' : ''}</span>
                </label>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:12px; padding-top:10px; border-top:1px dashed #cbd5e1;">
            <div style="font-size:0.78rem; font-weight:600; color:#1e40af;">
              <span id="import-fields-count">${savedKeys.size}</span> fields configured for template
            </div>
            <button type="button" class="btn btn-primary btn-sm" id="btn-dl-import-template" style="background:#2563eb; border-color:#2563eb; display:inline-flex; align-items:center; gap:6px;">
              <i data-lucide="download"></i> Download CSV Template with Selected Fields
            </button>
          </div>
        </div>

        <!-- Step 2: Upload CSV File Card -->
        <div class="card" style="margin-bottom:16px; border:1px solid var(--border-color); border-radius:10px; padding:16px;">
          <h4 style="font-size:0.95rem; font-weight:800; color:#0f172a; margin:0 0 6px 0; display:flex; align-items:center; gap:6px;">
            <i data-lucide="file-up" style="width:16px;height:16px;color:#059669;"></i> 2. Upload Completed CSV Spreadsheet (.csv)
          </h4>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:10px;">
            Fill your data in the downloaded CSV template and upload it here. All 41 fields are parsed and saved automatically.
          </div>
          <input type="file" id="bulk-import-file-input" accept=".csv,text/csv" class="form-input" style="padding:10px; border-radius:8px;">
          <div id="detected-columns-strip" style="display:none; margin-top:8px; font-size:0.78rem; color:#15803d; font-weight:600; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 12px;"></div>
        </div>

        <!-- Step 3: Preview Area -->
        <div id="import-preview-area" style="display:none;">
          <div id="import-stats-bar" style="display:flex; gap:10px; margin-bottom:12px; flex-wrap:wrap;"></div>
          <div style="font-weight:700; font-size:0.85rem; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>Preview First 10 Records:</span>
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:400;">Columns automatically matched from your uploaded file</span>
          </div>
          <div class="table-responsive" style="max-height:260px; overflow-y:auto; border:1px solid var(--border-color); border-radius:8px;">
            <table class="tms-table" style="font-size:0.78rem;" id="import-preview-table">
              <thead id="import-preview-thead">
                <tr>
                  <th>Status</th>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>CLASS</th>
                  <th>GOVT ID</th>
                  <th>APAAR ID</th>
                  <th>GUARDIAN</th>
                  <th>PHONE</th>
                </tr>
              </thead>
              <tbody id="import-preview-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="document.getElementById('global-modal-close').click()">Cancel</button>
      <button class="btn btn-primary" id="btn-confirm-bulk-import" disabled style="display:inline-flex; align-items:center; gap:6px;">
        <i data-lucide="upload-cloud"></i> Import Students
      </button>
    `;

    UIComponents.openModal({
      title: 'Bulk Import Students (Configurable Template & Batch Upload)',
      bodyHtml,
      footerHtml,
      maxWidth: '880px'
    });

    const getActiveKeys = () => {
      const keys = [];
      document.querySelectorAll('.import-fld-chk').forEach(chk => {
        if (chk.checked || chk.disabled) keys.push(chk.dataset.fkey);
      });
      return keys;
    };

    const updateFieldsCounter = () => {
      const keys = getActiveKeys();
      const countEl = document.getElementById('import-fields-count');
      if (countEl) countEl.innerText = keys.length;
      try {
        localStorage.setItem('tms_bulk_student_fields', JSON.stringify(keys));
      } catch (e) {}
    };

    document.querySelectorAll('.import-fld-chk').forEach(chk => {
      chk.addEventListener('change', updateFieldsCounter);
    });

    document.getElementById('btn-select-all-flds')?.addEventListener('click', () => {
      document.querySelectorAll('.import-fld-chk').forEach(chk => chk.checked = true);
      updateFieldsCounter();
    });

    document.getElementById('btn-select-std-flds')?.addEventListener('click', () => {
      document.querySelectorAll('.import-fld-chk').forEach(chk => {
        const f = allFields.find(x => x.key === chk.dataset.fkey);
        chk.checked = f ? (f.required || f.active !== false) : true;
      });
      updateFieldsCounter();
    });

    document.getElementById('btn-select-min-flds')?.addEventListener('click', () => {
      const minKeys = ['admissionNo', 'fullName', 'grade', 'gender', 'dob', 'guardianPhone'];
      document.querySelectorAll('.import-fld-chk').forEach(chk => {
        chk.checked = minKeys.includes(chk.dataset.fkey) || chk.disabled;
      });
      updateFieldsCounter();
    });

    document.getElementById('btn-dl-import-template')?.addEventListener('click', () => {
      const selectedKeys = getActiveKeys();
      StudentModule.downloadImportTemplate(selectedKeys);
    });

    let parsedStudentsToImport = [];

    const fileInput = document.getElementById('bulk-import-file-input');
    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const text = await file.text();
      const rows = StudentModule.parseCsv(text);
      if (rows.length < 2) {
        UIComponents.showToast('CSV file is empty or missing headers.', 'warning');
        return;
      }

      const headers = rows[0].map(h => (h || '').toLowerCase().trim());
      const colMap = {};

      headers.forEach((h, colIdx) => {
        const cleanH = h.replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
        const matched = allFields.find(f => {
          const fLabel = f.label.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
          if (cleanH === fLabel) return true;
          return f.keywords && f.keywords.some(k => {
            const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
            return cleanH === cleanK || cleanH.includes(cleanK) || cleanK.includes(cleanH);
          });
        });
        if (matched && colMap[matched.key] === undefined) {
          colMap[matched.key] = colIdx;
        }
      });

      const detectedStrip = document.getElementById('detected-columns-strip');
      if (detectedStrip) {
        const detectedCount = Object.keys(colMap).length;
        const matchedNames = Object.keys(colMap).map(k => {
          const f = allFields.find(x => x.key === k);
          return f ? f.label : k;
        });
        detectedStrip.style.display = 'block';
        detectedStrip.innerHTML = `<i data-lucide="check-circle-2" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Detected ${detectedCount} columns in file: <strong>${esc(matchedNames.slice(0, 10).join(', '))}${matchedNames.length > 10 ? '...' : ''}</strong>`;
      }

      let existingStudents = [];
      try {
        existingStudents = await dbService.select('students');
      } catch (err) { existingStudents = []; }

      const existingAdmNos = new Set(existingStudents.map(s => String(s.admissionNo || '').toLowerCase().trim()));

      parsedStudentsToImport = [];
      let duplicateCount = 0;
      let missingCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r.length || (r.length === 1 && !r[0].trim())) continue;

        const rowObj = {};
        allFields.forEach(f => {
          const cIdx = colMap[f.key];
          rowObj[f.key] = cIdx !== undefined && r[cIdx] !== undefined ? r[cIdx].trim() : '';
        });

        if (!rowObj.admissionNo) {
          rowObj.admissionNo = `TMS-IMP-${Date.now().toString(36).toUpperCase()}-${i}`;
        }
        if (!rowObj.status) rowObj.status = 'Active';

        if (!rowObj.address) {
          rowObj.address = [
            rowObj.village,
            rowObj.postOffice ? `PO: ${rowObj.postOffice}` : '',
            rowObj.policeStation ? `PS: ${rowObj.policeStation}` : '',
            rowObj.district,
            rowObj.state,
            rowObj.pinCode
          ].filter(Boolean).join(', ');
        }
        if (!rowObj.guardianName) rowObj.guardianName = rowObj.fatherName || rowObj.motherName || '';
        if (!rowObj.guardianPhone) rowObj.guardianPhone = rowObj.fatherPhone || rowObj.phone || '';

        const isDuplicate = existingAdmNos.has(rowObj.admissionNo.toLowerCase());
        const isInvalid = !rowObj.fullName || !rowObj.grade;

        if (isDuplicate) duplicateCount++;
        if (isInvalid) missingCount++;

        rowObj.isDuplicate = isDuplicate;
        rowObj.isInvalid = isInvalid;
        parsedStudentsToImport.push(rowObj);
      }

      const validList = parsedStudentsToImport.filter(p => !p.isInvalid && !p.isDuplicate);
      const previewArea = document.getElementById('import-preview-area');
      const statsBar = document.getElementById('import-stats-bar');
      const tbody = document.getElementById('import-preview-tbody');
      const confirmBtn = document.getElementById('btn-confirm-bulk-import');

      if (previewArea) previewArea.style.display = 'block';
      if (statsBar) {
        statsBar.innerHTML = `
          <span class="badge badge-success" style="font-size:0.82rem; padding:4px 10px;">✓ ${validList.length} Ready to Import</span>
          ${duplicateCount ? `<span class="badge badge-warning" style="font-size:0.82rem; padding:4px 10px;">⚠ ${duplicateCount} Duplicate Admission Nos</span>` : ''}
          ${missingCount ? `<span class="badge badge-danger" style="font-size:0.82rem; padding:4px 10px;">✕ ${missingCount} Incomplete Rows (Missing Name or Class)</span>` : ''}
        `;
      }

      if (tbody) {
        tbody.innerHTML = parsedStudentsToImport.slice(0, 10).map(p => `
          <tr>
            <td>
              ${p.isInvalid ? '<span class="badge badge-danger">Missing Name</span>'
                : p.isDuplicate ? '<span class="badge badge-warning">Duplicate ID</span>'
                : '<span class="badge badge-success">Valid</span>'}
            </td>
            <td class="font-mono">${esc(p.admissionNo)}</td>
            <td style="font-weight:600;">${esc(p.fullName)}</td>
            <td>${esc(p.grade)}</td>
            <td class="font-mono">${esc(p.govtStudentId || '—')}</td>
            <td class="font-mono">${esc(p.apaarId || '—')}</td>
            <td>${esc(p.guardianName || '—')}</td>
            <td class="font-mono">${esc(p.guardianPhone || p.phone || '—')}</td>
          </tr>
        `).join('');
      }

      if (confirmBtn) {
        confirmBtn.disabled = validList.length === 0;
        confirmBtn.innerHTML = `<i data-lucide="upload-cloud"></i> Import ${validList.length} Valid Students`;
      }
      UIComponents.refreshIcons();
    });

    document.getElementById('btn-confirm-bulk-import')?.addEventListener('click', async () => {
      const validList = parsedStudentsToImport.filter(p => !p.isInvalid && !p.isDuplicate);
      if (!validList.length) return;

      const btn = document.getElementById('btn-confirm-bulk-import');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Importing batch...';

      let successCount = 0;
      for (const p of validList) {
        const { isDuplicate, isInvalid, ...record } = p;
        if (!record.section || !String(record.section).trim()) record.section = 'A';
        if (record.dob !== undefined && (record.dob === '' || !String(record.dob).trim())) record.dob = null;
        if (record.admissionDate !== undefined && (record.admissionDate === '' || !String(record.admissionDate).trim())) record.admissionDate = null;
        if (record.classJoinDate !== undefined && (record.classJoinDate === '' || !String(record.classJoinDate).trim())) record.classJoinDate = null;
        // eslint-disable-next-line no-await-in-loop
        await dbService.insert('students', record);
        successCount++;
      }

      await auditService.log('STUDENTS_BULK_IMPORTED', 'ACADEMIC', { importedCount: successCount });
      UIComponents.closeModal();
      UIComponents.showToast(`Successfully imported ${successCount} student(s) with all statutory fields!`, 'success');
      StudentModule.render(container);
    });

    UIComponents.refreshIcons();
  }

}

export default StudentModule;
