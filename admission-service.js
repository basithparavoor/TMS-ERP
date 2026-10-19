/**
 * THAIBA MODEL SCHOOL — Admission Service
 * Drives the customizable admission form, fee selection, UPI payment reference,
 * the application lifecycle (submit -> verify -> approve/reject), parent
 * credential generation and payment ledger.
 */

import { TMS_CONFIG } from './config.js';
import { dbService } from './supabase-client.js';

const STATUS = TMS_CONFIG.admissionStatuses;

/* ------------------------------------------------------------------ */
/* Defaults (used to seed the builder / fall back when no config yet) */
/* ------------------------------------------------------------------ */

export const DEFAULT_FIELDS = [
  { key: 'candidateName', label: "Candidate's Name", type: 'text', section: 'Candidate Details', required: true, order: 1, placeholder: 'Full name as per birth certificate' },
  { key: 'dob', label: 'Date of Birth', type: 'date', section: 'Candidate Details', required: true, order: 2 },
  { key: 'gender', label: 'Gender', type: 'select', section: 'Candidate Details', required: true, order: 3, options: ['Male', 'Female', 'Other'] },
  { key: 'bloodGroup', label: 'Blood Group', type: 'select', section: 'Candidate Details', required: false, order: 4, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
  { key: 'applyingClass', label: 'Applying for Class', type: 'select', section: 'Candidate Details', required: true, order: 5, options: ['Nursery', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'] },
  { key: 'religion', label: 'Religion', type: 'text', section: 'Candidate Details', required: false, order: 6 },
  { key: 'aadhaar', label: 'Aadhaar / ID Number', type: 'text', section: 'Candidate Details', required: false, order: 7 },
  { key: 'identificationMarks', label: 'Identification Marks', type: 'text', section: 'Candidate Details', required: false, order: 8 },

  { key: 'fatherName', label: "Father's Name", type: 'text', section: 'Guardian Details', required: true, order: 9 },
  { key: 'fatherOccupation', label: "Father's Occupation", type: 'text', section: 'Guardian Details', required: false, order: 10 },
  { key: 'fatherQualification', label: "Father's Qualification", type: 'text', section: 'Guardian Details', required: false, order: 11 },
  { key: 'fatherIncome', label: 'Annual Family Income', type: 'number', section: 'Guardian Details', required: false, order: 12 },
  { key: 'motherName', label: "Mother's Name", type: 'text', section: 'Guardian Details', required: true, order: 13 },
  { key: 'motherOccupation', label: "Mother's Occupation", type: 'text', section: 'Guardian Details', required: false, order: 14 },
  { key: 'motherQualification', label: "Mother's Qualification", type: 'text', section: 'Guardian Details', required: false, order: 15 },

  { key: 'phone', label: 'Mobile Number', type: 'tel', section: 'Contact & Address', required: true, order: 16, placeholder: '+91 XXXXX XXXXX' },
  { key: 'email', label: 'E-mail', type: 'email', section: 'Contact & Address', required: false, order: 17 },
  { key: 'village', label: 'Village / Street', type: 'text', section: 'Contact & Address', required: true, order: 18 },
  { key: 'po', label: 'Post Office', type: 'text', section: 'Contact & Address', required: false, order: 19 },
  { key: 'ps', label: 'Police Station', type: 'text', section: 'Contact & Address', required: false, order: 20 },
  { key: 'district', label: 'District', type: 'text', section: 'Contact & Address', required: false, order: 21 },
  { key: 'pin', label: 'PIN Code', type: 'text', section: 'Contact & Address', required: true, order: 22 },

  { key: 'previousSchool', label: 'Previous School Name', type: 'text', section: 'Previous School', required: false, order: 23 },
  { key: 'lastClass', label: 'Last Class Passed', type: 'text', section: 'Previous School', required: false, order: 24 },
  { key: 'lastMarks', label: 'Last Percentage / Marks', type: 'number', section: 'Previous School', required: false, order: 25 },
  { key: 'referenceSource', label: 'How did you hear about us?', type: 'select', section: 'Previous School', required: false, order: 26, options: ['Newspaper', 'Social Media', 'Friend / Relative', 'Local Notice', 'Other'] },

  { key: 'photo', label: 'Student Photograph', type: 'file', section: 'Photo & Documents', required: false, order: 27, helpText: 'Recent passport-size photograph (JPG or PNG, up to 2 MB)' },
  { key: 'aadhaarDoc', label: 'Aadhaar / ID Proof', type: 'file', section: 'Photo & Documents', required: false, order: 28, helpText: 'Image or PDF' },
  { key: 'birthCertificate', label: 'Birth Certificate', type: 'file', section: 'Photo & Documents', required: false, order: 29, helpText: 'Image or PDF' },
  { key: 'marksheet', label: 'Previous Marksheet / Transfer Certificate', type: 'file', section: 'Photo & Documents', required: false, order: 30, helpText: 'Image or PDF' }
];

export const DEFAULT_FEES = [
  { name: 'Registration Fee', amount: 200, mandatory: true, description: 'Non-refundable registration charge.' },
  { name: 'Admission Fee (one time)', amount: 2500, mandatory: true, description: 'One-time admission charge.' },
  { name: 'Tuition Fee (1st month)', amount: 1200, mandatory: false, description: 'First monthly tuition.' },
  { name: 'Library Fee', amount: 0, mandatory: false, description: 'Optional annual library membership.' },
  { name: 'Transport Fee (optional)', amount: 0, mandatory: false, description: 'Choose based on your route.' }
];

const FIELD_TYPES = ['text', 'textarea', 'number', 'date', 'tel', 'email', 'select', 'checkbox', 'file'];

/* ------------------------------------------------------------------ */

function ephemeralClient() {
  const cfg = TMS_CONFIG.supabase || {};
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  return window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

function randomDigits(len) {
  let out = '';
  for (let i = 0; i < len; i += 1) out += Math.floor(Math.random() * 10);
  return out;
}

function randomToken(len) {
  return Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(0, len).padEnd(len, '0');
}

class AdmissionService {
  /* ---------------- Settings ---------------- */

  async loadSettings() {
    const rows = await dbService.select('admission_settings');
    return rows.find((r) => r.id === 'default') || {
      id: 'default',
      session: '',
      formFee: 0,
      paymentRequired: false,
      upiId: '',
      upiPayeeName: TMS_CONFIG.institution.name,
      paymentInstructions: '',
      instructions: [],
      successMessage: ''
    };
  }

  async saveSettings(settings) {
    return dbService.upsert('admission_settings', { ...settings, id: 'default' });
  }

  /* ---------------- Form fields ---------------- */

  async listFields() {
    const rows = await dbService.select('admission_form_fields');
    const active = rows
      .filter((f) => f.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (active.length) return active;
    return DEFAULT_FIELDS.map((f, i) => ({
      id: `fld-${f.key}`,
      fieldKey: f.key,
      label: f.label,
      fieldType: f.type,
      section: f.section,
      required: f.required,
      options: f.options || [],
      placeholder: f.placeholder || '',
      helpText: '',
      isActive: true,
      displayOrder: f.order || i + 1
    }));
  }

  async listAllFields() {
    const rows = await dbService.select('admission_form_fields');
    return rows.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async saveField(field) {
    const key = (field.fieldKey || field.key || '').trim().replace(/[^A-Za-z0-9_]/g, '');
    if (!key) throw new Error('A field key is required.');
    const type = FIELD_TYPES.includes(field.fieldType || field.type) ? (field.fieldType || field.type) : 'text';
    const record = {
      id: field.id || `fld-${key}-${randomToken(4)}`,
      fieldKey: key,
      label: field.label || key,
      fieldType: type,
      section: field.section || 'General',
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      options: Array.isArray(field.options) ? field.options : [],
      required: !!field.required,
      isActive: field.isActive !== false,
      displayOrder: Number(field.displayOrder || 0)
    };
    return dbService.upsert('admission_form_fields', record);
  }

  async removeField(id) {
    return dbService.delete('admission_form_fields', id);
  }

  async seedDefaultFields() {
    const existing = await this.listAllFields();
    if (existing.length) return existing.length;
    let order = 1;
    for (const f of DEFAULT_FIELDS) {
      // eslint-disable-next-line no-await-in-loop
      await this.saveField({ ...f, fieldKey: f.key, fieldType: f.type, displayOrder: order });
      order += 1;
    }
    return DEFAULT_FIELDS.length;
  }

  /* ---------------- Fees ---------------- */

  async listFees() {
    const rows = await dbService.select('admission_fees');
    const active = rows
      .filter((f) => f.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (active.length) return active;
    return DEFAULT_FEES.map((f, i) => ({
      id: `fee-${i + 1}`,
      name: f.name,
      amount: f.amount,
      description: f.description,
      mandatory: f.mandatory,
      isActive: true,
      displayOrder: i + 1
    }));
  }

  async listAllFees() {
    const rows = await dbService.select('admission_fees');
    return rows.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async saveFee(fee) {
    const record = {
      id: fee.id || `fee-${randomToken(6)}`,
      name: fee.name || 'Fee Item',
      amount: Number(fee.amount || 0),
      schedule: fee.schedule || '',
      description: fee.description || '',
      mandatory: !!fee.mandatory,
      isActive: fee.isActive !== false,
      displayOrder: Number(fee.displayOrder || 0)
    };
    return dbService.upsert('admission_fees', record);
  }

  async removeFee(id) {
    return dbService.delete('admission_fees', id);
  }

  async seedDefaultFees() {
    const existing = await this.listAllFees();
    if (existing.length) return existing.length;
    let order = 1;
    for (const f of DEFAULT_FEES) {
      // eslint-disable-next-line no-await-in-loop
      await this.saveFee({ ...f, displayOrder: order });
      order += 1;
    }
    return DEFAULT_FEES.length;
  }

  /* ---------------- Files & storage ---------------- */

  generateFormNo() {
    return `TMS/${new Date().getFullYear()}/ADM-${randomDigits(6)}`;
  }

  sanitizeFileName(name) {
    return String(name || 'file').replace(/[^A-Za-z0-9._-]/g, '_').slice(-80);
  }

  async uploadFile(bucket, path, file) {
    const client = dbService.getClient();
    if (!client) return { error: 'Storage unavailable' };
    try {
      const { data, error } = await client.storage
        .from(bucket)
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (error) return { error: error.message };
      return { path: data ? data.path : path };
    } catch (e) {
      return { error: e.message };
    }
  }

  async getSignedUrl(bucket, path, expiresIn = 3600) {
    const client = dbService.getClient();
    if (!client || !path) return null;
    try {
      const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
      if (error) return null;
      return data ? data.signedUrl : null;
    } catch (e) {
      return null;
    }
  }

  getPublicUrl(bucket, path) {
    const client = dbService.getClient();
    if (!client || !path) return null;
    try {
      return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    } catch (e) {
      return null;
    }
  }

  /* ---------------- Credentials ---------------- */

  buildCredentials(formNo) {
    const digits = String(formNo).replace(/[^0-9]/g, '').slice(-6) || randomDigits(6);
    const username = `par${digits}${randomToken(2)}`;
    return {
      username,
      email: `${username}@${TMS_CONFIG.parentEmailDomain}`,
      password: `Tms@${randomToken(4)}${randomDigits(2)}`
    };
  }

  async createParentAccount(email, password, fullName) {
    const client = ephemeralClient();
    if (!client) return { error: 'supabase-unavailable' };
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || email.split('@')[0] } }
      });
      if (error) return { error: error.message };
      return { userId: data && data.user ? data.user.id : null };
    } catch (e) {
      return { error: e.message };
    }
  }

  /* ---------------- Applications ---------------- */

  async listApplications() {
    const rows = await dbService.select('admissions_applications');
    return rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async listApplicationsForParent(userId, email) {
    const rows = await dbService.select('admissions_applications');
    return rows.filter(
      (a) => a.parentUserId === userId || (email && (a.parentEmail || '').toLowerCase() === email)
    );
  }

  async getStats() {
    const apps = await this.listApplications();
    const byStatus = (s) => apps.filter((a) => a.status === s).length;
    return {
      total: apps.length,
      submitted: byStatus(STATUS.SUBMITTED) + byStatus(STATUS.UNDER_VERIFICATION),
      approved: byStatus(STATUS.APPROVED),
      rejected: byStatus(STATUS.REJECTED),
      collected: apps.reduce(
        (sum, a) => sum + (a.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0),
        0
      )
    };
  }

  /**
   * Submit a new application from the public/office form.
   */
  async submitApplication({ values, selectedFeeIds = [], paymentMode = '', paymentRef = '', submittedBy = null, formNo = null }) {
    const [settings, feeList] = await Promise.all([this.loadSettings(), this.listFees()]);

    const chosenIds = new Set(selectedFeeIds);
    feeList.forEach((f) => {
      if (f.mandatory) chosenIds.add(f.id);
    });
    const chosen = feeList.filter((f) => chosenIds.has(f.id));
    const feeItems = chosen.map((f) => ({ id: f.id, name: f.name, amount: Number(f.amount || 0) }));
    const feeTotal = feeItems.reduce((s, f) => s + f.amount, 0);

    const appNo = formNo || this.generateFormNo();
    const credentials = this.buildCredentials(appNo);
    const guardianName =
      values.fatherName || values.guardianName || values.motherName || 'Parent / Guardian';

    // Create the parent login (best effort — the application is still saved if this fails).
    const account = await this.createParentAccount(credentials.email, credentials.password, guardianName);

    let paymentStatus = 'Not Required';
    if (feeTotal > 0) paymentStatus = paymentRef ? 'Paid' : 'Pending';

    const application = {
      appId: appNo,
      studentName: values.candidateName || values.studentName || 'Applicant',
      dob: values.dob || null,
      gender: values.gender || null,
      grade: values.applyingClass || values.grade || null,
      guardianName,
      phone: values.phone || values.mobile || null,
      email: values.email || null,
      address: [values.village, values.po, values.ps, values.district, values.pin]
        .filter(Boolean)
        .join(', '),
      status: STATUS.SUBMITTED,
      payload: values,
      feeItems,
      feeTotal,
      paymentStatus,
      paymentMode: feeTotal > 0 ? paymentMode || 'UPI' : '',
      paymentRef: paymentRef || '',
      payments: [],
      submittedBy: submittedBy ? submittedBy.id : null,
      submittedByName: submittedBy ? submittedBy.name : 'Self / Public',
      parentUserId: account.userId || null,
      parentUsername: credentials.username,
      parentEmail: credentials.email,
      remarks: ''
    };

    const saved = await dbService.insert('admissions_applications', application);

    const credentialRow = await dbService.insert('parent_credentials', {
      id: `cred-${credentials.username}`,
      applicationId: saved.id,
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      userId: account.userId || null,
      studentId: null,
      status: 'Active'
    });

    return {
      application: saved,
      credentials,
      credentialRow,
      accountError: account.error || null,
      paymentRequired: !!settings.paymentRequired || feeItems.some((f) => f.amount > 0)
    };
  }

  async verifyApplication(id, { status, remarks = '' }) {
    return dbService.update('admissions_applications', id, {
      status,
      remarks,
      verifiedAt: new Date().toISOString()
    });
  }

  async approveApplication(id, remarks = '') {
    return this.verifyApplication(id, { status: STATUS.APPROVED, remarks });
  }

  async rejectApplication(id, remarks = '') {
    return this.verifyApplication(id, { status: STATUS.REJECTED, remarks });
  }

  /* ---------------- Payments ---------------- */

  async recordPayment(application, { amount, mode, reference, note = '' }) {
    const payments = Array.isArray(application.payments) ? application.payments.slice() : [];
    payments.push({
      amount: Number(amount || 0),
      mode: mode || 'Cash',
      reference: reference || '',
      note,
      date: new Date().toISOString()
    });
    const paidTotal = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const feeTotal = Number(application.feeTotal || 0);

    return dbService.update('admissions_applications', application.id, {
      payments,
      paymentStatus: paidTotal >= feeTotal && feeTotal > 0 ? 'Paid' : application.paymentStatus
    });
  }

  /* ---------------- Credentials (admin) ---------------- */

  async getCredentials(applicationId) {
    const rows = await dbService.select('parent_credentials');
    return rows.find((r) => r.applicationId === applicationId) || null;
  }

  async updateCredentials(row, { username, password }) {
    const updates = { username: username || row.username, password: password || row.password };
    if (username) updates.email = `${username}@${TMS_CONFIG.parentEmailDomain}`;
    return dbService.update('parent_credentials', row.id, updates);
  }

  async resendCredentials(application) {
    const row = await this.getCredentials(application.id);
    if (!row) return null;
    if (application.parentUserId) {
      const { notificationService } = await import('./notification-service.js');
      await notificationService.create({
        title: 'Admission Portal Access',
        message: `Your admission portal access for application ${application.appId} — Username: ${row.username}, Password: ${row.password}. Please keep it safe.`,
        audience: 'user',
        recipientId: application.parentUserId,
        priority: 'High'
      });
    }
    return row;
  }
}

export const admissionService = new AdmissionService();
export default admissionService;
