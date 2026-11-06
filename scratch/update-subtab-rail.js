const fs = require('fs');

// 1. Update app.css
const cssToAppend = `
/* ==========================================================================
   SUBTAB RAIL WITH SCROLL CONTROLS & VISIBLE SCROLLBAR
   ========================================================================== */
.tms-subtab-container-wrap {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  margin-bottom: 16px !important;
}

.tms-subtab-nav-btn {
  width: 32px !important;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  z-index: 5 !important;
}

.tms-subtab-nav-btn:hover {
  background: #f8fafc !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
  transform: scale(1.08) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}

.tms-subtab-nav-btn:active {
  transform: scale(0.95) !important;
}

.tms-subtab-nav-btn i,
.tms-subtab-nav-btn svg {
  width: 16px !important;
  height: 16px !important;
}

.tms-subtab-rail {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  scroll-behavior: smooth !important;
  -webkit-overflow-scrolling: touch !important;
  padding: 4px 4px 10px 4px !important;
  margin-bottom: 0 !important;
  border-bottom: 1.5px solid #e2e8f0 !important;
  width: 100% !important;
  scrollbar-width: thin !important;
  scrollbar-color: #cbd5e1 transparent !important;
}

.tms-subtab-rail::-webkit-scrollbar {
  height: 6px !important;
  display: block !important;
}

.tms-subtab-rail::-webkit-scrollbar-track {
  background: #f1f5f9 !important;
  border-radius: 9999px !important;
}

.tms-subtab-rail::-webkit-scrollbar-thumb {
  background: #cbd5e1 !important;
  border-radius: 9999px !important;
  transition: background 0.2s ease !important;
}

.tms-subtab-rail::-webkit-scrollbar-thumb:hover {
  background: #94a3b8 !important;
}
`;

fs.appendFileSync('app.css', '\r\n' + cssToAppend, 'utf8');
console.log('Updated app.css with subtab scroll classes');

// 2. Update admin-module.js
let adminCode = fs.readFileSync('admin-module.js', 'utf8');

// Replace subtab rail HTML container
const oldRailHtml = '      <!-- Secondary Subtabs Rail -->\r\n      <div class="tms-subtab-rail" id="admin-subtab-rail"></div>';
const oldRailHtmlLF = '      <!-- Secondary Subtabs Rail -->\n      <div class="tms-subtab-rail" id="admin-subtab-rail"></div>';

const newRailHtml = `      <!-- Secondary Subtabs Rail with Navigation Controls -->
      <div class="tms-subtab-container-wrap">
        <button type="button" class="tms-subtab-nav-btn tms-subtab-nav-prev" id="admin-subtab-scroll-prev" aria-label="Scroll left" style="display:none;" title="Scroll subtabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-subtab-rail" id="admin-subtab-rail"></div>
        <button type="button" class="tms-subtab-nav-btn tms-subtab-nav-next" id="admin-subtab-scroll-next" aria-label="Scroll right" style="display:none;" title="Scroll subtabs right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>`;

function normalize(s) { return s.replace(/\r\n/g, '\n'); }

let normAdmin = normalize(adminCode);
if (normAdmin.includes(normalize(oldRailHtml))) {
  normAdmin = normAdmin.replace(normalize(oldRailHtml), normalize(newRailHtml));
  console.log('Replaced admin-subtab-rail container HTML');
} else {
  console.error('Could not find oldRailHtml in admin-module.js');
}

// Replace switchGroup event binding and scrolling
const oldSwitchGroupPart = `    subRail.querySelectorAll('.tms-subtab-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        subRail.querySelectorAll('.tms-subtab-pill').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderTab(e.currentTarget.dataset.tab);
      });
    });

    UIComponents.refreshIcons();
    this.renderTab(activeSubKey);
  }`;

const newSwitchGroupPart = `    subRail.querySelectorAll('.tms-subtab-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        subRail.querySelectorAll('.tms-subtab-pill').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        this.renderTab(e.currentTarget.dataset.tab);
        setTimeout(updateSubtabScrollState, 200);
      });
    });

    // Setup horizontal scroll controls and wheel scrolling
    const updateSubtabScrollState = () => {
      if (!subRail) return;
      const prevBtn = document.getElementById('admin-subtab-scroll-prev');
      const nextBtn = document.getElementById('admin-subtab-scroll-next');
      const hasOverflow = subRail.scrollWidth > subRail.clientWidth + 6;
      if (!hasOverflow) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        return;
      }
      if (prevBtn) prevBtn.style.display = subRail.scrollLeft > 10 ? 'inline-flex' : 'none';
      if (nextBtn) nextBtn.style.display = (subRail.scrollLeft + subRail.clientWidth) < (subRail.scrollWidth - 10) ? 'inline-flex' : 'none';
    };

    if (!subRail._scrollInitialized) {
      subRail._scrollInitialized = true;
      subRail.addEventListener('scroll', updateSubtabScrollState, { passive: true });
      window.addEventListener('resize', updateSubtabScrollState, { passive: true });

      subRail.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && subRail.scrollWidth > subRail.clientWidth) {
          e.preventDefault();
          subRail.scrollLeft += e.deltaY;
          updateSubtabScrollState();
        }
      }, { passive: false });

      const prevBtn = document.getElementById('admin-subtab-scroll-prev');
      const nextBtn = document.getElementById('admin-subtab-scroll-next');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          subRail.scrollBy({ left: -260, behavior: 'smooth' });
          setTimeout(updateSubtabScrollState, 300);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          subRail.scrollBy({ left: 260, behavior: 'smooth' });
          setTimeout(updateSubtabScrollState, 300);
        });
      }
    }

    UIComponents.refreshIcons();
    this.renderTab(activeSubKey);

    const activePill = subRail.querySelector(\`.tms-subtab-pill[data-tab="\${activeSubKey}"]\`);
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setTimeout(updateSubtabScrollState, 150);
  }`;

if (normAdmin.includes(normalize(oldSwitchGroupPart))) {
  normAdmin = normAdmin.replace(normalize(oldSwitchGroupPart), normalize(newSwitchGroupPart));
  console.log('Replaced switchGroup in admin-module.js');
} else {
  console.error('Could not find oldSwitchGroupPart in admin-module.js');
}

const finalAdminCode = adminCode.includes('\r\n') ? normAdmin.replace(/\n/g, '\r\n') : normAdmin;
fs.writeFileSync('admin-module.js', finalAdminCode, 'utf8');
console.log('Updated admin-module.js cleanly!');
