/**
 * THAIBA MODEL SCHOOL — ERP Master Configuration
 * Single-Institution Architecture
 */

export const TMS_CONFIG = {
  institution: {
    name: "THAIBA MODEL SCHOOL",
    tagline: "Center of Excellence & Moral Grooming",
    code: "TMS-KNR",
    affiliation: "CBSE / State Affiliated (Reg: TMS-884920)",
    founded: "2008",
    logoText: "THAIBA",
    logoBadge: "TMS",
    address: {
      campus: "Thaiba Knowledge City, Green Valley Road",
      city: "Kozhikode",
      state: "Kerala",
      pincode: "673001",
      country: "India"
    },
    contact: {
      phone: "+91 495 288 3400",
      mobile: "+91 984 700 1234",
      email: "info@thaibaschool.edu.in",
      admissionsEmail: "admissions@thaibaschool.edu.in",
      website: "https://thaibaschool.edu.in"
    },
    gpsGeofence: {
      latitude: 11.2588,
      longitude: 75.7804,
      radiusMeters: 250, // 250m school boundary
      pollIntervalMs: 5 * 60 * 1000, // 5 minutes
      exitGracePeriodMs: 3 * 60 * 1000 // 3 minutes
    }
  },

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
    currentYear: "2024-2025",
    activeTerms: ["Term 1", "Midterm", "Term 2", "Annual Examination"],
    classes: [
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
      "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
      "Grade 11 (Science)", "Grade 11 (Commerce)", "Grade 11 (Humanities)",
      "Grade 12 (Science)", "Grade 12 (Commerce)", "Grade 12 (Humanities)"
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

  finance: {
    currencySymbol: "₹",
    currencyCode: "INR",
    paymentModes: ["Cash Counter", "UPI QR", "Net Banking / NEFT", "Credit / Debit Card", "Cheque / DD"]
  },

  version: "3.2.0-Production",
  systemStatus: "Operational"
};

export default TMS_CONFIG;
