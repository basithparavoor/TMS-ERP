const fs = require('fs');

const css = `
/* ==========================================================================
   INSTITUTIONAL WEBSITE CMS - LIGHT THEME & BUTTON ENHANCEMENTS
   ========================================================================== */
.tms-cms-card {
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  background: #ffffff !important;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05) !important;
  overflow: hidden !important;
}

.tms-cms-header {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
  border-bottom: 1.5px solid #e2e8f0 !important;
  padding: 20px 26px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-wrap: wrap !important;
  gap: 16px !important;
}

.tms-cms-icon-box {
  width: 48px !important;
  height: 48px !important;
  border-radius: 13px !important;
  background: #ecfdf5 !important;
  border: 1.5px solid #a7f3d0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #059669 !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15) !important;
  flex-shrink: 0 !important;
}

.tms-cms-title {
  font-family: var(--font-display, inherit) !important;
  font-size: 1.25rem !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  margin: 0 !important;
  line-height: 1.25 !important;
  letter-spacing: -0.01em !important;
}

.tms-cms-subtitle {
  font-size: 0.84rem !important;
  color: #64748b !important;
  margin: 4px 0 0 !important;
  font-weight: 500 !important;
  line-height: 1.4 !important;
}

/* Button: Preview Live Website */
.tms-btn-cms-preview {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  padding: 8px 16px !important;
  font-size: 0.84rem !important;
  font-weight: 700 !important;
  color: #334155 !important;
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  border-radius: 10px !important;
  text-decoration: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
  user-select: none !important;
}

.tms-btn-cms-preview:hover {
  background: #f8fafc !important;
  border-color: #94a3b8 !important;
  color: #0f172a !important;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-1px) !important;
}

.tms-btn-cms-preview:active {
  transform: translateY(0) scale(0.98) !important;
}

/* Button: Save & Publish Website */
.tms-btn-cms-publish {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 8px 20px !important;
  font-size: 0.85rem !important;
  font-weight: 800 !important;
  color: #ffffff !important;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  border: 1px solid #047857 !important;
  border-radius: 10px !important;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
  user-select: none !important;
}

.tms-btn-cms-publish:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4) !important;
  transform: translateY(-1px) !important;
}

.tms-btn-cms-publish:active {
  transform: translateY(0) scale(0.98) !important;
}

/* Button: Reset Defaults */
.tms-btn-cms-reset {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 8px 14px !important;
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  color: #e11d48 !important;
  background: #fff1f2 !important;
  border: 1px solid #fecdd3 !important;
  border-radius: 10px !important;
  box-shadow: 0 1px 2px rgba(225, 29, 72, 0.05) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
  user-select: none !important;
}

.tms-btn-cms-reset:hover {
  background: #ffe4e6 !important;
  border-color: #fda4af !important;
  color: #be123c !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 8px rgba(225, 29, 72, 0.12) !important;
}

.tms-btn-cms-reset:active {
  transform: translateY(0) scale(0.98) !important;
}

/* Hostel Setup Sub-Pills */
.hostel-sub-pill {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #64748b !important;
  font-weight: 600 !important;
  border-radius: 9999px !important;
  padding: 7px 16px !important;
  transition: all 0.2s ease !important;
}

.hostel-sub-pill:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border-color: #cbd5e1 !important;
}

.hostel-sub-pill.active {
  background: #ffffff !important;
  color: #059669 !important;
  border-color: #86efac !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15) !important;
  font-weight: 700 !important;
}
`;

fs.appendFileSync('app.css', '\r\n' + css, 'utf8');
console.log('Appended CMS light theme CSS to app.css');
