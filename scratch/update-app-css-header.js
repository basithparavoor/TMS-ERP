const fs = require('fs');

let css = fs.readFileSync('app.css', 'utf8');

const target = `/* TMS Breadcrumbs Horizontal Single-Line Styling */
.tms-breadcrumbs {
  margin-bottom: 8px !important;
  display: block !important;
}
.tms-breadcrumbs-list {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 6px !important;
  list-style: none !important;
  list-style-type: none !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 0.82rem !important;
  color: #64748B !important;
  flex-wrap: wrap !important;
}
.tms-breadcrumbs-list li,
.tms-breadcrumbs-list .tms-breadcrumb-item {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  list-style: none !important;
  list-style-type: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
.tms-breadcrumbs-list li::marker,
.tms-breadcrumbs-list .tms-breadcrumb-item::marker {
  display: none !important;
  content: "" !important;
}
.tms-breadcrumb-link {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  color: #64748B !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  transition: color 0.15s ease !important;
}
.tms-breadcrumb-link:hover {
  color: #16A34A !important;
}
.tms-breadcrumb-current {
  font-weight: 700 !important;
  color: #0F172A !important;
}`;

const replacement = `/* TMS Universal Luxury Page Header Card Layout */
.tms-page-header {
  background: #FFFFFF !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 20px !important;
  padding: 22px 26px !important;
  margin-bottom: 24px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 18px rgba(15, 23, 42, 0.03) !important;
  position: relative !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  transition: all 0.2s ease !important;
}

.tms-page-header::before {
  content: "" !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  bottom: 0 !important;
  width: 5px !important;
  background: linear-gradient(180deg, #10B981 0%, #059669 45%, #0E623B 100%) !important;
  border-top-left-radius: 20px !important;
  border-bottom-left-radius: 20px !important;
}

.tms-page-header-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-wrap: wrap !important;
  gap: 18px !important;
  width: 100% !important;
}

.tms-page-header-content {
  flex: 1 1 320px !important;
  min-width: 0 !important;
}

/* Breadcrumbs Pill Trail */
.tms-breadcrumbs {
  margin-bottom: 14px !important;
  display: inline-flex !important;
}

.tms-breadcrumbs-list {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 6px !important;
  list-style: none !important;
  list-style-type: none !important;
  padding: 4px 14px !important;
  margin: 0 !important;
  background: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 9999px !important;
  flex-wrap: wrap !important;
}

.tms-breadcrumbs-list li,
.tms-breadcrumbs-list .tms-breadcrumb-item {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
  list-style-type: none !important;
}

.tms-breadcrumbs-list li::marker,
.tms-breadcrumbs-list .tms-breadcrumb-item::marker {
  display: none !important;
  content: "" !important;
}

.tms-breadcrumb-link {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  color: #64748B !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  transition: all 0.15s ease !important;
}

.tms-breadcrumb-link:hover {
  color: #16A34A !important;
}

.tms-breadcrumb-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #16A34A !important;
}

.tms-breadcrumb-icon svg,
.tms-breadcrumb-icon i {
  width: 13px !important;
  height: 13px !important;
}

.tms-breadcrumb-sep {
  display: inline-flex !important;
  align-items: center !important;
  color: #94A3B8 !important;
  opacity: 0.7 !important;
}

.tms-breadcrumb-sep svg,
.tms-breadcrumb-sep i {
  width: 12px !important;
  height: 12px !important;
}

.tms-breadcrumb-current {
  font-weight: 700 !important;
  font-size: 0.8rem !important;
  background: #E8F5E9 !important;
  color: #15803D !important;
  padding: 2px 10px !important;
  border-radius: 9999px !important;
}

/* Page Title & Subtitle */
.tms-page-title-row {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
}

.tms-page-header-icon {
  width: 50px !important;
  height: 50px !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, #10B981, #059669 45%, #0E623B) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #FFFFFF !important;
  flex-shrink: 0 !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.28) !important;
}

.tms-page-header-icon svg,
.tms-page-header-icon i {
  width: 24px !important;
  height: 24px !important;
}

.tms-page-title-text-wrap {
  flex: 1 !important;
  min-width: 0 !important;
}

.tms-page-title-wrap {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex-wrap: wrap !important;
}

.tms-page-title {
  font-size: 1.7rem !important;
  font-weight: 800 !important;
  color: #0F172A !important;
  letter-spacing: -0.028em !important;
  line-height: 1.2 !important;
  margin: 0 !important;
}

.tms-page-badge {
  font-size: 0.76rem !important;
  font-weight: 700 !important;
  padding: 4px 12px !important;
  border-radius: 9999px !important;
}

.tms-page-subtitle {
  font-size: 0.9rem !important;
  color: #64748B !important;
  font-weight: 500 !important;
  margin: 5px 0 0 0 !important;
  line-height: 1.4 !important;
}

/* Page Header Actions */
.tms-page-actions {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex-wrap: wrap !important;
}

@media (max-width: 768px) {
  .tms-page-header {
    padding: 16px 18px !important;
    margin-bottom: 18px !important;
    border-radius: 16px !important;
  }
  .tms-page-title {
    font-size: 1.35rem !important;
  }
  .tms-page-header-icon {
    width: 42px !important;
    height: 42px !important;
    border-radius: 12px !important;
  }
  .tms-page-header-icon svg,
  .tms-page-header-icon i {
    width: 20px !important;
    height: 20px !important;
  }
  .tms-page-actions {
    width: 100% !important;
  }
}`;

if (css.includes('.tms-breadcrumbs {')) {
  const startIdx = css.indexOf('/* TMS Breadcrumbs Horizontal Single-Line Styling */');
  const endIdx = css.indexOf('/* TMS Custom Dropdown Engine Styles */');
  if (startIdx !== -1 && endIdx !== -1) {
    css = css.slice(0, startIdx) + replacement + '\n\n' + css.slice(endIdx);
    fs.writeFileSync('app.css', css, 'utf8');
    console.log('Successfully updated app.css with Luxury Page Header Layout!');
  } else {
    console.error('Boundaries not found in app.css');
  }
} else {
  console.error('.tms-breadcrumbs not found');
}
