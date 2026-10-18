/**
 * THAIBA MODEL SCHOOL — Supabase Client & Resilient Data Layer
 */

import { TMS_CONFIG } from './config.js';

class SupabaseDataService {
  constructor() {
    this.url = TMS_CONFIG.supabase.url;
    this.key = TMS_CONFIG.supabase.anonKey;
    this.client = null;
    this.isOnline = navigator.onLine;
    this.initClient();
    this.initNetworkListeners();
    this.initDefaultSeedData();
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
        console.log('✅ TMS ERP: Supabase Client Initialized successfully.');
      } else {
        console.warn('⚠️ Supabase JS library not loaded yet; using resilient local storage engine.');
      }
    } catch (err) {
      console.error('TMS Supabase Init Error:', err);
    }
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 TMS ERP: Network is Online.');
      this.syncPendingAuditLogs();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.warn('📴 TMS ERP: Operating in Offline Mode.');
    });
  }

  getClient() {
    if (!this.client && window.supabase) {
      this.initClient();
    }
    return this.client;
  }

  // --- Local Fallback Engine (Guarantees 100% instant operational UI) ---

  getLocal(collection) {
    try {
      const raw = localStorage.getItem(`tms_${collection}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`Error reading ${collection}:`, e);
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
    // Try Supabase if available and online
    if (this.client && this.isOnline) {
      try {
        const { data, error } = await this.client.from(collection).select('*');
        if (!error && data && data.length > 0) {
          this.setLocal(collection, data);
          return filterFn ? data.filter(filterFn) : data;
        }
      } catch (err) {
        // Fallback to local
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

    // Update local immediately for snappy responsiveness
    const items = this.getLocal(collection);
    items.unshift(enriched);
    this.setLocal(collection, items);

    // Sync to Supabase in background
    if (this.client && this.isOnline) {
      try {
        await this.client.from(collection).insert([enriched]);
      } catch (e) {
        console.warn(`Supabase insert failed for ${collection}, persisted locally.`);
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
          console.warn(`Supabase update failed for ${collection}`);
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
        console.warn(`Supabase delete failed for ${collection}`);
      }
    }
    return true;
  }

  async syncPendingAuditLogs() {
    const pending = this.getLocal('audit_logs_pending');
    if (pending.length && this.client) {
      try {
        await this.client.from('audit_logs').insert(pending);
        localStorage.removeItem('tms_audit_logs_pending');
        console.log('✅ TMS Audit Logs Synced to Supabase.');
      } catch (e) {
        console.warn('Sync pending failed, will retry later.');
      }
    }
  }

  initDefaultSeedData() {
    // If not seeded yet, seed comprehensive initial data for THAIBA MODEL SCHOOL
    if (!localStorage.getItem('tms_seeded_v3')) {
      const initialStudents = [
        {
          id: 'TMS-STU-1001',
          admissionNo: 'TMS/2024/001',
          rollNo: '01',
          fullName: 'Mohammed Rayan K',
          gender: 'Male',
          dob: '2010-04-12',
          grade: 'Grade 9',
          section: 'A',
          guardianName: 'Abdul Kareem',
          guardianPhone: '+91 98471 22334',
          bloodGroup: 'O+',
          status: 'Active',
          address: 'Thaiba Villa, Calicut',
          leaveStatus: null
        },
        {
          id: 'TMS-STU-1002',
          admissionNo: 'TMS/2024/002',
          rollNo: '02',
          fullName: 'Fathima Nuha',
          gender: 'Female',
          dob: '2010-08-25',
          grade: 'Grade 9',
          section: 'A',
          guardianName: 'Usman Haji',
          guardianPhone: '+91 98472 55667',
          bloodGroup: 'B+',
          status: 'Active',
          address: 'Al-Huda Manzil, Beypore',
          leaveStatus: 'approved' // Gold badge test case
        },
        {
          id: 'TMS-STU-1003',
          admissionNo: 'TMS/2024/003',
          rollNo: '03',
          fullName: 'Zayan Ahmed',
          gender: 'Male',
          dob: '2010-11-03',
          grade: 'Grade 9',
          section: 'A',
          guardianName: 'Naseer Ahmed',
          guardianPhone: '+91 94470 11223',
          bloodGroup: 'A+',
          status: 'Active',
          address: 'Peace Nest, Mavoor Rd',
          leaveStatus: null
        },
        {
          id: 'TMS-STU-1004',
          admissionNo: 'TMS/2024/004',
          rollNo: '04',
          fullName: 'Amina Zehra',
          gender: 'Female',
          dob: '2010-01-19',
          grade: 'Grade 9',
          section: 'A',
          guardianName: 'Dr. Tariq Jamil',
          guardianPhone: '+91 98473 99887',
          bloodGroup: 'AB+',
          status: 'Active',
          address: 'Orchid Heights, Eranhipalam',
          leaveStatus: null
        },
        {
          id: 'TMS-STU-1005',
          admissionNo: 'TMS/2024/005',
          rollNo: '01',
          fullName: 'Bilal Mustafa',
          gender: 'Male',
          dob: '2008-05-15',
          grade: 'Grade 11 (Science)',
          section: 'A',
          guardianName: 'Mustafa Kamal',
          guardianPhone: '+91 99461 44556',
          bloodGroup: 'O+',
          status: 'Active',
          address: 'Rose Garden, Feroke',
          leaveStatus: null
        }
      ];

      const initialStaff = [
        {
          id: 'TMS-EMP-201',
          empId: 'TMS-FAC-01',
          name: 'Prof. Rashid Rahman',
          email: 'rashid.rahman@thaibaschool.edu.in',
          role: 'teacher',
          department: 'Mathematics & Science',
          designation: 'Senior Faculty & Class Teacher (Grade 9A)',
          phone: '+91 98470 44321',
          joiningDate: '2018-06-01',
          status: 'Active',
          basicPay: 48000,
          hra: 12000,
          allowances: 6000,
          assignedClass: 'Grade 9',
          assignedSection: 'A',
          assignedSubject: 'Mathematics'
        },
        {
          id: 'TMS-EMP-202',
          empId: 'TMS-ADM-01',
          name: 'Dr. Zubair Al-Qasimi',
          email: 'principal@thaibaschool.edu.in',
          role: 'principal',
          department: 'Executive Leadership',
          designation: 'Principal & Academic Director',
          phone: '+91 98470 11111',
          joiningDate: '2012-04-10',
          status: 'Active',
          basicPay: 85000,
          hra: 20000,
          allowances: 15000
        },
        {
          id: 'TMS-EMP-203',
          empId: 'TMS-FIN-01',
          name: 'Mr. Sameer Babu',
          email: 'accounts@thaibaschool.edu.in',
          role: 'finance',
          department: 'Finance & Accounts',
          designation: 'Chief Bursar & Finance Manager',
          phone: '+91 98470 22222',
          joiningDate: '2015-08-15',
          status: 'Active',
          basicPay: 52000,
          hra: 13000,
          allowances: 7000
        }
      ];

      const initialInvoices = [
        {
          id: 'INV-2024-001',
          invoiceNo: 'TMS/INV/24/091',
          studentId: 'TMS-STU-1001',
          studentName: 'Mohammed Rayan K',
          grade: 'Grade 9',
          term: 'Term 1 (2024-25)',
          amount: 24500,
          paid: 24500,
          balance: 0,
          status: 'Paid',
          dueDate: '2024-07-10',
          paidDate: '2024-07-05',
          paymentMode: 'UPI QR'
        },
        {
          id: 'INV-2024-002',
          invoiceNo: 'TMS/INV/24/092',
          studentId: 'TMS-STU-1002',
          studentName: 'Fathima Nuha',
          grade: 'Grade 9',
          term: 'Term 1 (2024-25)',
          amount: 24500,
          paid: 15000,
          balance: 9500,
          status: 'Partial',
          dueDate: '2024-07-10',
          paidDate: '2024-07-08',
          paymentMode: 'Cash Counter'
        },
        {
          id: 'INV-2024-003',
          invoiceNo: 'TMS/INV/24/093',
          studentId: 'TMS-STU-1003',
          studentName: 'Zayan Ahmed',
          grade: 'Grade 9',
          term: 'Term 1 (2024-25)',
          amount: 24500,
          paid: 0,
          balance: 24500,
          status: 'Unpaid',
          dueDate: '2024-07-10',
          paidDate: null,
          paymentMode: null
        }
      ];

      const initialNotices = [
        {
          id: 'NOT-001',
          title: 'Annual Sports Meet & Athletic Championship 2024',
          category: 'Event',
          target: 'All School',
          date: '2024-10-25',
          priority: 'High',
          content: 'The 16th Annual Sports Meet of Thaiba Model School will take place at the Main Stadium. Registrations for track and field are open.',
          publishedBy: 'Dr. Zubair Al-Qasimi'
        },
        {
          id: 'NOT-002',
          title: 'Term 1 Marksheets Publication & Parent-Teacher Conference',
          category: 'Academic',
          target: 'Parents',
          date: '2024-10-20',
          priority: 'Urgent',
          content: 'Parent-Teacher meeting is scheduled for Saturday, 9:00 AM to 1:00 PM. Access digital marksheet via the Parent Portal.',
          publishedBy: 'Academic Coordinator'
        }
      ];

      const initialFacilities = [
        { id: 'FAC-B1', building: 'Ibn Sina Academic Block', floor: 'Ground Floor', name: 'Science Laboratory 1', capacity: 45, status: 'Active' },
        { id: 'FAC-B2', building: 'Ibn Sina Academic Block', floor: '1st Floor', name: 'Classroom 9-A', capacity: 35, status: 'Active' },
        { id: 'FAC-B3', building: 'Al-Farabi Tech Wing', floor: '2nd Floor', name: 'Computer & AI Lab', capacity: 50, status: 'Active' },
        { id: 'FAC-B4', building: 'Main Administrative Complex', floor: 'Ground Floor', name: 'Central Thaiba Library', capacity: 120, status: 'Active' }
      ];

      this.setLocal('students', initialStudents);
      this.setLocal('staff', initialStaff);
      this.setLocal('invoices', initialInvoices);
      this.setLocal('notices', initialNotices);
      this.setLocal('facilities', initialFacilities);
      this.setLocal('audit_logs', []);
      this.setLocal('attendance_register', []);
      this.setLocal('staff_tasks', [
        { id: 'TSK-1', title: 'Prepare Math Mid-term question paper', status: 'In Progress', priority: 'High', dueDate: '2024-10-24' },
        { id: 'TSK-2', title: 'Submit Grade 9 Lab attendance logs', status: 'Completed', priority: 'Medium', dueDate: '2024-10-18' },
        { id: 'TSK-3', title: 'Update Islamic Studies & Moral Science syllabus tracker', status: 'To Do', priority: 'Low', dueDate: '2024-10-28' }
      ]);
      localStorage.setItem('tms_seeded_v3', 'true');
      console.log('🌱 TMS ERP: Default database initialized for THAIBA MODEL SCHOOL.');
    }
  }
}

export const dbService = new SupabaseDataService();
export default dbService;
