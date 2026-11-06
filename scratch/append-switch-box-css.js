const fs = require('fs');

const switchBoxCss = `
.tms-hostel-switch-box {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 14px !important;
  background: #ffffff !important;
  padding: 10px 18px !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03) !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
`;

fs.appendFileSync('app.css', '\r\n' + switchBoxCss, 'utf8');
console.log('Appended tms-hostel-switch-box to app.css');
