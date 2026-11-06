const fs = require('fs');
let content = fs.readFileSync('admin-module.js', 'utf8');
const search = '<div class="tms-subtab-container-wrap">\r\n        <button type="button" class="tms-subtab-nav-btn tms-subtab-nav-prev" id="admin-subtab-scroll-prev" aria-label="Scroll left" style="display:none;" title="Scroll subtabs left">\r\n          <i data-lucide="chevron-left"></i>\r\n        </button>\r\n        <div class="tms-subtab-rail" id="admin-subtab-rail"></div>\r\n        <button type="button" class="tms-subtab-nav-btn tms-subtab-nav-next" id="admin-subtab-scroll-next" aria-label="Scroll right" style="display:none;" title="Scroll right">\r\n          <i data-lucide="chevron-right"></i>\r\n        </button>\r\n      </div>';

const replace = '<div class="tms-subtab-container-wrap tms-tab-scroll-wrapper">\r\n        <button type="button" class="tms-subtab-nav-btn tms-tab-nav-btn tms-subtab-nav-prev" id="admin-subtab-scroll-prev" aria-label="Scroll left" title="Scroll subtabs left">\r\n          <i data-lucide="chevron-left"></i>\r\n        </button>\r\n        <div class="tms-subtab-rail tms-tab-scroll-rail" id="admin-subtab-rail"></div>\r\n        <button type="button" class="tms-subtab-nav-btn tms-tab-nav-btn tms-subtab-nav-next" id="admin-subtab-scroll-next" aria-label="Scroll right" title="Scroll right">\r\n          <i data-lucide="chevron-right"></i>\r\n        </button>\r\n      </div>';

if (content.includes(search)) {
  fs.writeFileSync('admin-module.js', content.replace(search, replace), 'utf8');
  console.log('[OK] Replaced admin-subtab buttons in admin-module.js');
} else {
  // Try with \n
  const normContent = content.replace(/\r\n/g, '\n');
  const normSearch = search.replace(/\r\n/g, '\n');
  const normReplace = replace.replace(/\r\n/g, '\n');
  if (normContent.includes(normSearch)) {
    const updated = normContent.replace(normSearch, normReplace);
    fs.writeFileSync('admin-module.js', content.includes('\r\n') ? updated.replace(/\n/g, '\r\n') : updated, 'utf8');
    console.log('[OK] Replaced (normalized) admin-subtab buttons in admin-module.js');
  } else {
    console.error('[FAIL] Could not match search string');
  }
}
