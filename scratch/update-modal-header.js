const fs = require('fs');

// 1. Update ui-components.js
let uiCode = fs.readFileSync('ui-components.js', 'utf8');

uiCode = uiCode.replace(
  `<div class="card-header" style="margin-bottom: 16px;">
            <h3 class="card-title" id="global-modal-title"></h3>
            <button class="icon-btn" id="global-modal-close"><i data-lucide="x"></i></button>
          </div>`,
  `<div class="card-header modal-header-row" style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap; gap: 12px;">
            <h3 class="card-title" id="global-modal-title" style="margin: 0; display: flex; align-items: center; gap: 10px;"></h3>
            <button class="icon-btn" id="global-modal-close" title="Close" style="flex-shrink: 0;"><i data-lucide="x"></i></button>
          </div>`
);

uiCode = uiCode.replace(
  "document.getElementById('global-modal-title').innerText = title;",
  `const titleEl = document.getElementById('global-modal-title');
    if (titleEl) {
      if (typeof title === 'string' && title.includes('<') && title.includes('>')) {
        titleEl.innerHTML = title;
      } else {
        titleEl.textContent = title || '';
      }
    }`
);

fs.writeFileSync('ui-components.js', uiCode);
console.log('Successfully updated ui-components.js openModal handler!');

// 2. Update app.js
let appCode = fs.readFileSync('app.js', 'utf8');

// Update line 921 to use clean markup that aligns with the icon
appCode = appCode.replace(
  `title: '<div style="display:flex;align-items:center;gap:10px;"><i data-lucide="user-cog" style="color:#16a34a;width:22px;height:22px;"></i><span>Institutional User Profile</span></div>',`,
  `title: '<div style="display:flex;align-items:center;gap:10px;"><i data-lucide="user-cog" style="color:#16a34a;width:22px;height:22px;"></i><span>Institutional User Profile</span></div>',`
);

fs.writeFileSync('app.js', appCode);

// 3. Add modal header styles to app.css
let css = fs.readFileSync('app.css', 'utf8');
if (!css.includes('.modal-window .modal-header-row')) {
  css += `
/* Modal Window Header Alignment */
.modal-window .card-header,
.modal-window .modal-header-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-wrap: nowrap !important;
  gap: 12px !important;
  margin-bottom: 16px !important;
  padding-bottom: 12px !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

#global-modal-title {
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  line-height: 1.3 !important;
}
`;
  fs.writeFileSync('app.css', css);
  console.log('Appended modal-window header CSS to app.css');
}
