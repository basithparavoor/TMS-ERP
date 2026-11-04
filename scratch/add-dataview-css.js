const fs = require('fs');

const cssToAppend = `
/* ==========================================================================
   TMS ERP - LUXURY DATA VIEW & TABLE STYLING (Image 1, 2, 3 Reference)
   ========================================================================== */

/* Modern Table Checkbox */
.tms-table-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #16A34A;
  border-radius: 6px;
  border: 1.5px solid #CBD5E1;
  transition: all 0.15s ease;
  vertical-align: middle;
}
.tms-table-checkbox:hover {
  border-color: #16A34A;
}

/* Student Circular Avatar */
.tms-student-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #F1F5F9;
  border: 2px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.tms-student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ID Number Rounded Pill */
.tms-id-badge {
  display: inline-flex;
  align-items: center;
  background: #F1F5F9;
  color: #334155;
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
  border: 1px solid #E2E8F0;
}

/* Category Pill Badge */
.tms-category-badge {
  display: inline-flex;
  align-items: center;
  background: #F1F5F9;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid #E2E8F0;
}

/* Status Pill */
.tms-status-pill {
  display: inline-flex;
  align-items: center;
  background: #ECFDF5;
  color: #15803D;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 9999px;
  text-transform: lowercase;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

/* Table Row Action Buttons (Rounded Square 3-button set) */
.tms-table-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1.5px solid #E2E8F0;
  background: #FFFFFF;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}
.tms-table-action-btn:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
  color: #0F172A;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}
.tms-table-action-btn.btn-del-student:hover {
  background: #FEF2F2;
  border-color: #FCA5A5;
  color: #DC2626 !important;
}

/* Table Row Hover State */
#students-table tbody tr:hover {
  background: #F8FAFC !important;
}
`;

fs.appendFileSync('app.css', '\r\n' + cssToAppend, 'utf8');
console.log('Appended luxury dataview CSS to app.css');
