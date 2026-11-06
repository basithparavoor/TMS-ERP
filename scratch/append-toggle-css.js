const fs = require('fs');

const toggleCss = `
/* ==========================================================================
   GLOBAL TOGGLE SWITCH COMPONENT
   ========================================================================== */
.switch {
  position: relative !important;
  display: inline-block !important;
  width: 50px !important;
  height: 28px !important;
  flex-shrink: 0 !important;
  margin: 0 !important;
}

.switch input {
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  position: absolute !important;
}

.slider {
  position: absolute !important;
  cursor: pointer !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: #cbd5e1 !important;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
  border-radius: 28px !important;
}

.slider:before {
  position: absolute !important;
  content: "" !important;
  height: 20px !important;
  width: 20px !important;
  left: 4px !important;
  bottom: 4px !important;
  background-color: #ffffff !important;
  border-radius: 50% !important;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18) !important;
}

.switch input:checked + .slider {
  background-color: #16a34a !important;
}

.switch input:checked + .slider:before {
  transform: translateX(22px) !important;
}
`;

fs.appendFileSync('app.css', '\r\n' + toggleCss, 'utf8');
console.log('Appended toggle switch CSS to app.css');
