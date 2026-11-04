const fs = require('fs');

// 1. Prepare CSS strings
const dropdownCss = `
/* TMS Custom Dropdown Engine Styles */
.tms-custom-select-native-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.tms-custom-select-wrapper {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.tms-custom-select-trigger {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 18px !important;
  background: #FFFFFF !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 9999px !important;
  color: #0F172A !important;
  font-family: inherit !important;
  font-size: 0.92rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  outline: none !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  box-sizing: border-box !important;
  text-align: left !important;
}

.tms-custom-select-trigger:hover {
  border-color: #10B981 !important;
  background: #FAFAFA !important;
}

.tms-custom-select-wrapper.is-open .tms-custom-select-trigger {
  border-color: #10B981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
}

.tms-custom-select-label {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  flex: 1 !important;
}

.tms-custom-select-label.is-placeholder {
  color: #94A3B8 !important;
  font-weight: 500 !important;
}

.tms-custom-select-arrow {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-left: 8px !important;
  transition: transform 0.2s ease !important;
  flex-shrink: 0 !important;
}

.tms-custom-select-wrapper.is-open .tms-custom-select-arrow {
  transform: rotate(180deg) !important;
}

.tms-custom-select-menu {
  display: none !important;
  position: absolute !important;
  top: calc(100% + 6px) !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 10050 !important;
  background: #FFFFFF !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 18px !important;
  padding: 8px !important;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06) !important;
  max-height: 280px !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
}

.tms-custom-select-wrapper.is-open .tms-custom-select-menu {
  display: block !important;
  animation: tmsSelectMenuFade 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.tms-custom-select-wrapper.is-open-above .tms-custom-select-menu {
  top: auto !important;
  bottom: calc(100% + 6px) !important;
}

@keyframes tmsSelectMenuFade {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.tms-custom-select-option {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 14px !important;
  border-radius: 12px !important;
  color: #1E293B !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.12s ease !important;
  margin-bottom: 2px !important;
  user-select: none !important;
}

.tms-custom-select-option:hover {
  background: #F1F5F9 !important;
  color: #0F172A !important;
}

.tms-custom-select-option.is-selected {
  background: #E8F5E9 !important;
  color: #15803D !important;
  font-weight: 700 !important;
}

.tms-custom-select-check {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #15803D !important;
  margin-left: 8px !important;
}
`;

const datepickerCss = `
/* TMS Custom Datepicker Engine Styles */
.tms-datepicker-native-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.tms-datepicker-wrapper {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.tms-datepicker-trigger {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 18px !important;
  background: #FFFFFF !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 9999px !important;
  color: #0F172A !important;
  font-family: inherit !important;
  font-size: 0.92rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  outline: none !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  box-sizing: border-box !important;
  text-align: left !important;
}

.tms-datepicker-trigger:hover {
  border-color: #10B981 !important;
  background: #FAFAFA !important;
}

.tms-datepicker-wrapper.is-open .tms-datepicker-trigger {
  border-color: #10B981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
}

.tms-datepicker-label {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  flex: 1 !important;
}

.tms-datepicker-label.is-placeholder {
  color: #94A3B8 !important;
  font-weight: 500 !important;
}

.tms-datepicker-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-left: 8px !important;
  flex-shrink: 0 !important;
  color: #10B981 !important;
}

.tms-datepicker-popup {
  display: none !important;
  position: absolute !important;
  top: calc(100% + 8px) !important;
  left: 0 !important;
  z-index: 10050 !important;
  background: #FFFFFF !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 24px !important;
  padding: 20px !important;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14), 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  width: 320px !important;
  box-sizing: border-box !important;
}

.tms-datepicker-wrapper.is-open .tms-datepicker-popup {
  display: block !important;
  animation: tmsDpPopupFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.tms-datepicker-wrapper.is-open-above .tms-datepicker-popup {
  top: auto !important;
  bottom: calc(100% + 8px) !important;
}

@keyframes tmsDpPopupFade {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.tms-datepicker-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 16px !important;
}

.tms-datepicker-badge-3d {
  width: 52px !important;
  height: 52px !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, #10B981, #047857) !important;
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.35) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #FFFFFF !important;
  font-size: 1.4rem !important;
  font-weight: 800 !important;
  position: relative !important;
  flex-shrink: 0 !important;
}

.tms-datepicker-badge-3d::before {
  content: "" !important;
  position: absolute !important;
  top: 4px !important;
  left: 12px !important;
  width: 6px !important;
  height: 6px !important;
  border-radius: 50% !important;
  background: #FFFFFF !important;
  box-shadow: 22px 0 0 #FFFFFF !important;
}

.tms-dp-nav-pill {
  padding: 5px 12px !important;
  background: #F1F5F9 !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 9999px !important;
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  color: #1E293B !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  transition: all 0.15s ease !important;
}

.tms-dp-nav-pill:hover {
  background: #E2E8F0 !important;
  color: #0F172A !important;
}

.tms-dp-weekdays {
  display: grid !important;
  grid-template-columns: repeat(7, 1fr) !important;
  gap: 2px !important;
  text-align: center !important;
  font-size: 0.68rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.05em !important;
  color: #475569 !important;
  margin-bottom: 8px !important;
}

.tms-dp-days-grid {
  display: grid !important;
  grid-template-columns: repeat(7, 1fr) !important;
  gap: 4px !important;
  margin-bottom: 16px !important;
}

.tms-dp-day-cell {
  aspect-ratio: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 10px !important;
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  color: #1E293B !important;
  cursor: pointer !important;
  transition: all 0.12s ease !important;
  user-select: none !important;
}

.tms-dp-day-cell:hover:not(.is-empty):not(.is-other-month) {
  background: #F1F5F9 !important;
}

.tms-dp-day-cell.is-other-month {
  color: #CBD5E1 !important;
}

.tms-dp-day-cell.is-selected {
  background: #0E623B !important;
  color: #FFFFFF !important;
  font-weight: 800 !important;
  box-shadow: 0 4px 10px rgba(14, 98, 59, 0.35) !important;
  border-radius: 12px !important;
}

.tms-dp-confirm-btn {
  width: 100% !important;
  padding: 10px !important;
  background: #0E623B !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 14px !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  box-shadow: 0 4px 12px rgba(14, 98, 59, 0.25) !important;
}

.tms-dp-confirm-btn:hover {
  background: #0B4E2F !important;
}
`;

const breadcrumbCss = `
/* TMS Breadcrumbs Horizontal Single-Line Styling */
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
}
`;

// Append to app.css
fs.appendFileSync('app.css', '\r\n' + breadcrumbCss + '\r\n' + dropdownCss + '\r\n' + datepickerCss, 'utf8');
console.log('Appended all Breadcrumbs, Dropdown and Datepicker styles to app.css');

// 2. Make dropdown-enhancer.js self-inject styles in the browser
let ddJs = fs.readFileSync('dropdown-enhancer.js', 'utf8');
const injectDdStyleSnippet = `
function ensureDropdownStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tms-custom-select-styles')) return;
  const style = document.createElement('style');
  style.id = 'tms-custom-select-styles';
  style.textContent = \`${dropdownCss.replace(/`/g, '\\`')}\`;
  document.head.appendChild(style);
}
ensureDropdownStyles();
`;

if (!ddJs.includes('ensureDropdownStyles()')) {
  ddJs = injectDdStyleSnippet + '\r\n' + ddJs;
  fs.writeFileSync('dropdown-enhancer.js', ddJs, 'utf8');
  console.log('Updated dropdown-enhancer.js with self-injected stylesheet');
}

// 3. Make datepicker-enhancer.js self-inject styles in the browser
let dpJs = fs.readFileSync('datepicker-enhancer.js', 'utf8');
const injectDpStyleSnippet = `
function ensureDatePickerStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tms-datepicker-styles')) return;
  const style = document.createElement('style');
  style.id = 'tms-datepicker-styles';
  style.textContent = \`${datepickerCss.replace(/`/g, '\\`')}\`;
  document.head.appendChild(style);
}
ensureDatePickerStyles();
`;

if (!dpJs.includes('ensureDatePickerStyles()')) {
  dpJs = injectDpStyleSnippet + '\r\n' + dpJs;
  fs.writeFileSync('datepicker-enhancer.js', dpJs, 'utf8');
  console.log('Updated datepicker-enhancer.js with self-injected stylesheet');
}
