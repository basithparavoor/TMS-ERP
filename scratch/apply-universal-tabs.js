const fs = require('fs');

function replaceExact(filepath, search, replace) {
  let content = fs.readFileSync(filepath, 'utf8');
  const crlf = content.includes('\r\n');
  const normContent = content.replace(/\r\n/g, '\n');
  const normSearch = search.replace(/\r\n/g, '\n');
  const normReplace = replace.replace(/\r\n/g, '\n');

  if (!normContent.includes(normSearch)) {
    console.error(`[FAIL] Could not find target in ${filepath}`);
    return false;
  }

  const updated = normContent.replace(normSearch, normReplace);
  fs.writeFileSync(filepath, crlf ? updated.replace(/\n/g, '\r\n') : updated, 'utf8');
  console.log(`[OK] Replaced in ${filepath}`);
  return true;
}

// 1. In ui-components.js: make initTabRails bullet-proof and call it properly
const uiFile = 'ui-components.js';
let ui = fs.readFileSync(uiFile, 'utf8');

// Ensure initTabRails handles creating chevron icons immediately with lucide
const updatedInitTabRails = `  /**
   * Universal Tab Rail Enhancer
   * Equips every tab bar and sub-tab rail with circular < and > buttons,
   * smooth mouse-wheel horizontal scrolling, and auto-centering on click.
   */
  static initTabRails(root = document) {
    if (!root) return;
    const rails = root.querySelectorAll('.tms-segmented-tabs, .tms-subtab-rail, .user-sub-tabs-bar, [data-tms-scroll-rail]');
    rails.forEach((rail) => {
      let wrapper = rail.closest('.tms-tab-scroll-wrapper, .tms-subtab-container-wrap, .tms-tab-rail-wrapper');
      
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'tms-tab-scroll-wrapper';
        rail.parentNode.insertBefore(wrapper, rail);
        wrapper.appendChild(rail);
      } else {
        wrapper.classList.add('tms-tab-scroll-wrapper');
      }

      let prevBtn = wrapper.querySelector('.tms-tab-nav-prev, .tms-subtab-nav-prev');
      let nextBtn = wrapper.querySelector('.tms-tab-nav-next, .tms-subtab-nav-next');
      let createdIcons = false;

      if (!prevBtn) {
        prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'tms-tab-nav-btn tms-tab-nav-prev';
        prevBtn.setAttribute('aria-label', 'Scroll left');
        prevBtn.setAttribute('title', 'Scroll tabs left');
        prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
        wrapper.insertBefore(prevBtn, rail);
        createdIcons = true;
      }

      if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'tms-tab-nav-btn tms-tab-nav-next';
        nextBtn.setAttribute('aria-label', 'Scroll right');
        nextBtn.setAttribute('title', 'Scroll tabs right');
        nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
        wrapper.appendChild(nextBtn);
        createdIcons = true;
      }

      if (createdIcons && window.lucide && typeof window.lucide.createIcons === 'function') {
        try { window.lucide.createIcons({ root: wrapper }); } catch (e) {}
      }

      const updateNavButtons = () => {
        const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
        if (maxScroll <= 4) {
          prevBtn.style.opacity = '0.35';
          prevBtn.style.pointerEvents = 'none';
          nextBtn.style.opacity = '0.35';
          nextBtn.style.pointerEvents = 'none';
          return;
        }
        const canLeft = rail.scrollLeft > 6;
        const canRight = rail.scrollLeft < maxScroll - 6;
        prevBtn.style.pointerEvents = canLeft ? 'auto' : 'none';
        prevBtn.style.opacity = canLeft ? '1' : '0.35';
        nextBtn.style.pointerEvents = canRight ? 'auto' : 'none';
        nextBtn.style.opacity = canRight ? '1' : '0.35';
      };

      if (!rail._tmsTabBound) {
        rail._tmsTabBound = true;
        rail.addEventListener('scroll', updateNavButtons, { passive: true });
        window.addEventListener('resize', updateNavButtons, { passive: true });

        rail.addEventListener('wheel', (e) => {
          if (e.deltaY !== 0 && rail.scrollWidth > rail.clientWidth) {
            e.preventDefault();
            rail.scrollLeft += (e.deltaY * 0.9);
            updateNavButtons();
          }
        }, { passive: false });

        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          rail.scrollBy({ left: -260, behavior: 'smooth' });
          setTimeout(updateNavButtons, 300);
        });

        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          rail.scrollBy({ left: 260, behavior: 'smooth' });
          setTimeout(updateNavButtons, 300);
        });

        rail.addEventListener('click', (e) => {
          const pill = e.target.closest('.tms-tab-pill, .tms-subtab-pill, .staff-tab, .acad-tab, .hostel-sub-pill, .ops-tab, button');
          if (pill && rail.contains(pill)) {
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            setTimeout(updateNavButtons, 250);
          }
        });
      }

      setTimeout(updateNavButtons, 60);
      setTimeout(updateNavButtons, 250);
    });
  }`;

// Replace the initTabRails method in ui-components.js
const regexInit = /\/\*\*[\s\S]*?Universal Tab Rail Enhancer[\s\S]*?static initTabRails\([^\)]*\)\s*\{[\s\S]*?\n  \}/;
if (regexInit.test(ui)) {
  ui = ui.replace(regexInit, updatedInitTabRails);
  fs.writeFileSync(uiFile, ui, 'utf8');
  console.log('[OK] Updated UIComponents.initTabRails in ui-components.js');
}

// 2. In academic-module.js: Update academic segmented navigation tabs
const oldAcadTabs = `      <!-- Academic Segmented Navigation Tabs -->
      <div class="tms-tab-rail-wrapper">
        <div class="tms-segmented-tabs">`;

const newAcadTabs = `      <!-- Academic Segmented Navigation Tabs -->
      <div class="tms-tab-scroll-wrapper">
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll tabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-segmented-tabs tms-tab-scroll-rail">`;

replaceExact('academic-module.js', oldAcadTabs, newAcadTabs);

const oldAcadTabsClose = `          <button class="tms-tab-pill \${this._currentTab === 'syllabus' ? 'active' : ''} acad-tab" data-tab="syllabus">
            <i data-lucide="line-chart"></i>
            <span>Syllabus Tracker</span>
          </button>
        </div>
      </div>`;

const newAcadTabsClose = `          <button class="tms-tab-pill \${this._currentTab === 'syllabus' ? 'active' : ''} acad-tab" data-tab="syllabus">
            <i data-lucide="line-chart"></i>
            <span>Syllabus Tracker</span>
          </button>
        </div>
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll tabs right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>`;

replaceExact('academic-module.js', oldAcadTabsClose, newAcadTabsClose);

// 3. In examination-module.js: Update exam segmented navigation tabs
const oldExamTabs = `      <!-- Tabs Navigation -->
      <div class="tms-tab-rail-wrapper">
        <div class="tms-segmented-tabs">`;

const newExamTabs = `      <!-- Tabs Navigation -->
      <div class="tms-tab-scroll-wrapper">
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll tabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-segmented-tabs tms-tab-scroll-rail">`;

replaceExact('examination-module.js', oldExamTabs, newExamTabs);

const oldExamTabsClose = `          <button class="tms-tab-pill \${this._examViewTab === 'admit' ? 'active' : ''}" id="tab-exam-admit">
            <i data-lucide="ticket"></i>
            <span>Admit Cards &amp; Seating Arranger</span>
            <span class="tab-badge" style="background: rgba(16, 185, 129, 0.15); color: #059669;">\${filteredStudents.length}</span>
          </button>
        </div>
      </div>`;

const newExamTabsClose = `          <button class="tms-tab-pill \${this._examViewTab === 'admit' ? 'active' : ''}" id="tab-exam-admit">
            <i data-lucide="ticket"></i>
            <span>Admit Cards &amp; Seating Arranger</span>
            <span class="tab-badge" style="background: rgba(16, 185, 129, 0.15); color: #059669;">\${filteredStudents.length}</span>
          </button>
        </div>
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll tabs right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>`;

replaceExact('examination-module.js', oldExamTabsClose, newExamTabsClose);

// 4. In timetable-module.js: Update timetable navigation tabs
const oldTT = `      <!-- Module View Tabs -->
      <div class="tms-tab-rail-wrapper">
        <div class="tms-segmented-tabs">
          <button class="tms-tab-pill \${this._activeView === 'matrix' ? 'active' : ''}" id="tab-tt-matrix">
            <i data-lucide="grid"></i>
            <span>Class Timetable Matrix</span>
          </button>
          <button class="tms-tab-pill \${this._activeView === 'substitution' ? 'active' : ''}" id="tab-tt-sub">
            <i data-lucide="refresh-cw" style="color: #6366f1;"></i>
            <span>Proxy &amp; Substitution Engine</span>
          </button>
        </div>
      </div>`;

const newTT = `      <!-- Module View Tabs -->
      <div class="tms-tab-scroll-wrapper">
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll tabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-segmented-tabs tms-tab-scroll-rail">
          <button class="tms-tab-pill \${this._activeView === 'matrix' ? 'active' : ''}" id="tab-tt-matrix">
            <i data-lucide="grid"></i>
            <span>Class Timetable Matrix</span>
          </button>
          <button class="tms-tab-pill \${this._activeView === 'substitution' ? 'active' : ''}" id="tab-tt-sub">
            <i data-lucide="refresh-cw" style="color: #6366f1;"></i>
            <span>Proxy &amp; Substitution Engine</span>
          </button>
        </div>
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll tabs right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>`;

replaceExact('timetable-module.js', oldTT, newTT);

// 5. In admin-module.js: Update users-primary-tabs and admin-subtab-scroll buttons
const oldAdminUsersRail = `        <!-- Primary Segmented Tabs Rail for Users Module -->
        <div class="tms-tab-rail-wrapper">
          <div class="tms-segmented-tabs" id="users-primary-tabs">`;

const newAdminUsersRail = `        <!-- Primary Segmented Tabs Rail for Users Module -->
        <div class="tms-tab-scroll-wrapper">
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll tabs left">
            <i data-lucide="chevron-left"></i>
          </button>
          <div class="tms-segmented-tabs tms-tab-scroll-rail" id="users-primary-tabs">`;

replaceExact('admin-module.js', oldAdminUsersRail, newAdminUsersRail);

const oldAdminUsersRailClose = `            <button class="tms-tab-pill \${targetTab === 'audit' ? 'active' : ''}" data-tab="audit">
              <i data-lucide="shield-alert"></i>
              <span>Security Audit Logs</span>
            </button>
          </div>
        </div>`;

const newAdminUsersRailClose = `            <button class="tms-tab-pill \${targetTab === 'audit' ? 'active' : ''}" data-tab="audit">
              <i data-lucide="shield-alert"></i>
              <span>Security Audit Logs</span>
            </button>
          </div>
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll tabs right">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>`;

replaceExact('admin-module.js', oldAdminUsersRailClose, newAdminUsersRailClose);

// Also remove style="display:none;" on admin-subtab-scroll-prev/next in admin-module.js so buttons are always neatly framed
const oldAdminSubtabBtns = `      <!-- Subtab Segmented Navigation with Horizontal Controls -->
      <div class="tms-subtab-container-wrap">
        <button type="button" class="tms-subtab-nav-btn tms-subtab-nav-prev" id="admin-subtab-scroll-prev" aria-label="Scroll left" style="display:none;" title="Scroll subtabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-subtab-rail" id="admin-subtab-rail"></div>
        <button type="button" class="tms-subtab-nav-btn tms-subtab-nav-next" id="admin-subtab-scroll-next" aria-label="Scroll right" style="display:none;" title="Scroll right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>`;

const newAdminSubtabBtns = `      <!-- Subtab Segmented Navigation with Horizontal Controls -->
      <div class="tms-subtab-container-wrap tms-tab-scroll-wrapper">
        <button type="button" class="tms-subtab-nav-btn tms-tab-nav-btn tms-subtab-nav-prev" id="admin-subtab-scroll-prev" aria-label="Scroll left" title="Scroll subtabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-subtab-rail tms-tab-scroll-rail" id="admin-subtab-rail"></div>
        <button type="button" class="tms-subtab-nav-btn tms-tab-nav-btn tms-subtab-nav-next" id="admin-subtab-scroll-next" aria-label="Scroll right" title="Scroll right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>`;

replaceExact('admin-module.js', oldAdminSubtabBtns, newAdminSubtabBtns);

// Also update updateSubtabScrollState in admin-module.js
const oldSubStateFn = `    const updateSubtabScrollState = () => {
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
    };`;

const newSubStateFn = `    const updateSubtabScrollState = () => {
      if (!subRail) return;
      const prevBtn = document.getElementById('admin-subtab-scroll-prev');
      const nextBtn = document.getElementById('admin-subtab-scroll-next');
      const maxScroll = Math.max(0, subRail.scrollWidth - subRail.clientWidth);
      const canScrollLeft = subRail.scrollLeft > 6;
      const canScrollRight = subRail.scrollLeft < maxScroll - 6;

      if (prevBtn) {
        prevBtn.style.display = 'inline-flex';
        prevBtn.style.opacity = canScrollLeft ? '1' : '0.35';
        prevBtn.style.pointerEvents = canScrollLeft ? 'auto' : 'none';
      }
      if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        nextBtn.style.opacity = canScrollRight ? '1' : '0.35';
        nextBtn.style.pointerEvents = canScrollRight ? 'auto' : 'none';
      }
    };`;

replaceExact('admin-module.js', oldSubStateFn, newSubStateFn);

console.log('Finished apply-universal-tabs.js');
