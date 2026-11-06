const fs = require('fs');

const tabScrollCss = `
/* ==========================================================================
   UNIVERSAL TAB & SUBTAB HORIZONTAL SCROLL CONTROLS (< > BUTTONS)
   ========================================================================== */
.tms-tab-scroll-wrapper,
.tms-tab-rail-wrapper,
.tms-subtab-container-wrap {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin-bottom: 16px !important;
  box-sizing: border-box !important;
}

.tms-tab-nav-btn,
.tms-subtab-nav-btn {
  width: 32px !important;
  min-width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #334155 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  z-index: 5 !important;
  user-select: none !important;
  padding: 0 !important;
}

.tms-tab-nav-btn:hover,
.tms-subtab-nav-btn:hover {
  background: #f8fafc !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
  transform: scale(1.08) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
}

.tms-tab-nav-btn:active,
.tms-subtab-nav-btn:active {
  transform: scale(0.95) !important;
}

.tms-tab-nav-btn:disabled,
.tms-subtab-nav-btn:disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
}

.tms-tab-nav-btn i,
.tms-tab-nav-btn svg,
.tms-subtab-nav-btn i,
.tms-subtab-nav-btn svg {
  width: 15px !important;
  height: 15px !important;
  stroke-width: 2.5 !important;
}

/* Inner Scrollable Rails */
.tms-tab-scroll-rail,
.tms-segmented-tabs,
.tms-subtab-rail {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  scroll-behavior: smooth !important;
  -webkit-overflow-scrolling: touch !important;
  padding: 4px 4px 6px 4px !important;
  flex: 1 !important;
  min-width: 0 !important;
  white-space: nowrap !important;
  scrollbar-width: thin !important;
  scrollbar-color: #cbd5e1 transparent !important;
}

.tms-segmented-tabs::-webkit-scrollbar,
.tms-tab-scroll-rail::-webkit-scrollbar,
.tms-subtab-rail::-webkit-scrollbar {
  height: 5px !important;
  display: block !important;
}

.tms-segmented-tabs::-webkit-scrollbar-track,
.tms-tab-scroll-rail::-webkit-scrollbar-track,
.tms-subtab-rail::-webkit-scrollbar-track {
  background: transparent !important;
}

.tms-segmented-tabs::-webkit-scrollbar-thumb,
.tms-tab-scroll-rail::-webkit-scrollbar-thumb,
.tms-subtab-rail::-webkit-scrollbar-thumb {
  background: #cbd5e1 !important;
  border-radius: 9999px !important;
  transition: background 0.2s ease !important;
}

.tms-segmented-tabs::-webkit-scrollbar-thumb:hover,
.tms-subtab-rail::-webkit-scrollbar-thumb:hover {
  background: #94a3b8 !important;
}
`;

fs.appendFileSync('app.css', '\r\n' + tabScrollCss, 'utf8');
console.log('Appended universal tab scroll CSS to app.css');
