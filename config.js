/**
 * THAIBA MODEL SCHOOL — ERP Master Configuration
 * Single-Institution Architecture
 */

export const TMS_CONFIG = {
  institution: {
    name: "THAIBA MODEL SCHOOL",
    tagline: "Run by : Thaiba Heritage, Kolkata",
    code: "TMS-TAPAN",
    trust: "Thaiba Heritage, Kolkata",
    regNo: "IV 01894/2011",
    founded: "2011",
    logoText: "THAIBA",
    logoBadge: "TMS",
    address: {
      campus: "Baghait, Tapan",
      district: "Dakshin Dinajpur",
      state: "West Bengal",
      country: "India",
      locality: "Thaiba Garden, Tapan"
    },
    contact: {
      phone1: "+91 8653382851",
      phone2: "+91 8167782851",
      email: "tms@thaibagarden.com",
      website: "https://www.thaibagarden.com"
    },
    gpsGeofence: {
      latitude: 25.2891,
      longitude: 88.5832,
      radiusMeters: 300,
      pollIntervalMs: 5 * 60 * 1000,
      exitGracePeriodMs: 3 * 60 * 1000
    }
  },

  // Highest-level Super Administrator Email
  superAdminEmail: "cmbasith786@gmail.com",

  supabase: {
    url: "https://rzcihdpzqrnzcaupjfla.supabase.co",
    anonKey: "sb_publishable_mrf3jq8AO1YrmA-1rBdqrw_gQnPtTGR",
    storageBuckets: {
      documents: "tms-documents",
      avatars: "tms-avatars",
      receipts: "tms-receipts",
      assignments: "tms-assignments"
    }
  },

  roles: {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    PRINCIPAL: "principal",
    COORDINATOR: "coordinator",
    TEACHER: "teacher",
    FINANCE: "finance",
    HR: "hr",
    LIBRARIAN: "librarian",
    OPERATIONS: "operations",
    STUDENT: "student",
    PARENT: "parent"
  },

  scopes: {
    SCHOOL_WIDE: "school_wide",
    ASSIGNED_CLASS: "assigned_class",
    ASSIGNED_SUBJECT: "assigned_subject",
    OWN_RECORDS: "own_records",
    LINKED_WARDS: "linked_wards",
    DEPARTMENT_SCOPE: "department_scope",
    FINANCE_SCOPE: "finance_scope",
    OPERATIONS_SCOPE: "operations_scope"
  },

  academic: {
    currentYear: "2025-2026",
    classes: [
      "Nursery", "LKG", "UKG",
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
      "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
      "Grade 11 (Science)", "Grade 11 (Commerce)", "Grade 11 (Arts)",
      "Grade 12 (Science)", "Grade 12 (Commerce)", "Grade 12 (Arts)"
    ],
    sections: ["A", "B", "C"],
    gradingTiers: [
      { grade: "A+", min: 90, max: 100, gpa: 10.0, remark: "Outstanding" },
      { grade: "A", min: 80, max: 89, gpa: 9.0, remark: "Excellent" },
      { grade: "B+", min: 70, max: 79, gpa: 8.0, remark: "Very Good" },
      { grade: "B", min: 60, max: 69, gpa: 7.0, remark: "Good" },
      { grade: "C+", min: 50, max: 59, gpa: 6.0, remark: "Satisfactory" },
      { grade: "C", min: 40, max: 49, gpa: 5.0, remark: "Pass" },
      { grade: "D", min: 33, max: 39, gpa: 4.0, remark: "Marginal" },
      { grade: "F", min: 0, max: 32, gpa: 0.0, remark: "Needs Remedial Support" }
    ]
  },

  // Default Editable Admission Form & Fee Configuration
  admissionFormDefaults: {
    session: "2025 - 2026",
    formFee: 300,
    testCentre: "Campus Main Auditorium, Baghait, Tapan",
    instructions: [
      "Fill the form in capital letters using a black or blue ballpoint pen.",
      "Attach two passport-size color photographs and photocopy of Aadhaar card.",
      "Submit photocopy of Birth Certificate and Previous School Marksheet / Transfer Certificate.",
      "Retain the lower Admit Card slip for entrance screening and admission interview.",
      "Admission confirmation is subject to seat vacancy and document verification."
    ],
    feeStructure: [
      { id: "fee_adm", name: "One-Time Admission & Registration Fee", amount: 4500, type: "One-Time", mandatory: true },
      { id: "fee_tui", name: "Quarterly Tuition & Academic Instruction", amount: 3600, type: "Quarterly", mandatory: true },
      { id: "fee_dev", name: "Campus Infrastructure & Development Fund", amount: 2000, type: "Annual", mandatory: true },
      { id: "fee_lab", name: "Computer, Science Lab & Smart Classroom", amount: 1500, type: "Annual", mandatory: true },
      { id: "fee_kit", name: "Student Diary, ID Card & Educational Kit", amount: 800, type: "Annual", mandatory: true }
    ],
    customFields: [
      { key: "aadhaar", label: "Aadhaar Card Number", enabled: true, required: true },
      { key: "religion", label: "Religion", enabled: true, required: false },
      { key: "monthlyIncome", label: "Guardian Monthly Income", enabled: true, required: false },
      { key: "identificationMarks", label: "Identification Marks", enabled: true, required: false },
      { key: "previousSchool", label: "Previous School & Last Class", enabled: true, required: true },
      { key: "references", label: "Admission Reference Source", enabled: true, required: false }
    ]
  },

  finance: {
    currencySymbol: "₹",
    currencyCode: "INR",
    paymentModes: ["Cash Counter", "UPI QR", "Net Banking / NEFT", "Credit / Debit Card", "Cheque / DD"]
  },

  version: "4.0.0-Strict",
  systemStatus: "Operational"
};

export default TMS_CONFIG;
