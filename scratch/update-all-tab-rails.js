const fs = require('fs');

function normalize(s) { return s.replace(/\r\n/g, '\n'); }

function replaceInFile(filename, oldSnippet, newSnippet) {
  let content = fs.readFileSync(filename, 'utf8');
  let normContent = normalize(content);
  let normOld = normalize(oldSnippet);
  let normNew = normalize(newSnippet);

  if (normContent.includes(normOld)) {
    normContent = normContent.replace(normOld, normNew);
    const finalContent = content.includes('\r\n') ? normContent.replace(/\n/g, '\r\n') : normContent;
    fs.writeFileSync(filename, finalContent, 'utf8');
    console.log(`[SUCCESS] Updated ${filename}`);
    return true;
  } else {
    console.error(`[FAIL] Could not match target in ${filename}`);
    return false;
  }
}

// 1. Update ui-components.js
let uiCode = fs.readFileSync('ui-components.js', 'utf8');
if (!uiCode.includes('static initTabRails')) {
  const targetRefresh = `  static refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      if (this._iconRaf) cancelAnimationFrame(this._iconRaf);
      this._iconRaf = requestAnimationFrame(() => {
        try { window.lucide.createIcons(); } catch (e) { /* ignore */ }
      });
    }
  }`;

  const replacementRefresh = `  /**
   * Universal Tab Rail Enhancer
   * Equips every tab bar and sub-tab rail with circular < and > buttons,
   * smooth mouse-wheel horizontal scrolling, and auto-centering on click.
   */
  static initTabRails(root = document) {
    if (!root) return;
    const rails = root.querySelectorAll('.tms-segmented-tabs, .tms-subtab-rail, [data-tms-scroll-rail]');
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

      if (!prevBtn) {
        prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'tms-tab-nav-btn tms-tab-nav-prev';
        prevBtn.setAttribute('aria-label', 'Scroll left');
        prevBtn.setAttribute('title', 'Scroll tabs left');
        prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
        wrapper.insertBefore(prevBtn, rail);
      }

      if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'tms-tab-nav-btn tms-tab-nav-next';
        nextBtn.setAttribute('aria-label', 'Scroll right');
        nextBtn.setAttribute('title', 'Scroll tabs right');
        nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
        wrapper.appendChild(nextBtn);
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
        prevBtn.style.pointerEvents = rail.scrollLeft > 6 ? 'auto' : 'none';
        prevBtn.style.opacity = rail.scrollLeft > 6 ? '1' : '0.35';
        nextBtn.style.pointerEvents = (rail.scrollLeft < maxScroll - 6) ? 'auto' : 'none';
        nextBtn.style.opacity = (rail.scrollLeft < maxScroll - 6) ? '1' : '0.35';
      };

      if (!rail._tmsTabBound) {
        rail._tmsTabBound = true;
        rail.addEventListener('scroll', updateNavButtons, { passive: true });
        window.addEventListener('resize', updateNavButtons, { passive: true });

        rail.addEventListener('wheel', (e) => {
          if (e.deltaY !== 0 && rail.scrollWidth > rail.clientWidth) {
            e.preventDefault();
            rail.scrollLeft += e.deltaY;
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

      setTimeout(updateNavButtons, 80);
    });
  }

  static refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      if (this._iconRaf) cancelAnimationFrame(this._iconRaf);
      this._iconRaf = requestAnimationFrame(() => {
        try { 
          window.lucide.createIcons(); 
          this.initTabRails();
        } catch (e) { /* ignore */ }
      });
    }
  }`;

  replaceInFile('ui-components.js', targetRefresh, replacementRefresh);
}

// 2. Update admin-module.js: admin-primary-tabs
const oldAdminPrimary = `      <div class="tms-tab-rail-wrapper">
        <div class="tms-segmented-tabs" id="admin-primary-tabs">`;

const newAdminPrimary = `      <div class="tms-tab-scroll-wrapper">
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" id="admin-primary-scroll-prev" aria-label="Scroll left" title="Scroll tabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-segmented-tabs tms-tab-scroll-rail" id="admin-primary-tabs">`;

replaceInFile('admin-module.js', oldAdminPrimary, newAdminPrimary);

// And close wrapper for admin-primary-tabs
const oldAdminPrimaryClose = `        </div>
      </div>

      <!-- Secondary Subtabs Rail with Navigation Controls -->`;

const newAdminPrimaryClose = `        </div>
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" id="admin-primary-scroll-next" aria-label="Scroll right" title="Scroll tabs right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>

      <!-- Secondary Subtabs Rail with Navigation Controls -->`;

replaceInFile('admin-module.js', oldAdminPrimaryClose, newAdminPrimaryClose);

// 3. Update admin-module.js: users-primary-tabs
const oldUsersTabs = `      <div class="tms-tab-rail-wrapper">
        <div class="tms-segmented-tabs" id="users-primary-tabs">`;

const newUsersTabs = `      <div class="tms-tab-scroll-wrapper">
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" id="users-tabs-scroll-prev" aria-label="Scroll left" title="Scroll tabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-segmented-tabs tms-tab-scroll-rail" id="users-primary-tabs">`;

replaceInFile('admin-module.js', oldUsersTabs, newUsersTabs);

const oldUsersTabsClose = `          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="users-tab-content"></div>`;

const newUsersTabsClose = `          </button>
        </div>
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" id="users-tabs-scroll-next" aria-label="Scroll right" title="Scroll tabs right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="users-tab-content"></div>`;

replaceInFile('admin-module.js', oldUsersTabsClose, newUsersTabsClose);

// 4. Update academic-module.js
const oldAcadTabs = `        <div class="tms-tab-rail-wrapper">
          <div class="tms-segmented-tabs">`;

const newAcadTabs = `        <div class="tms-tab-scroll-wrapper">
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll tabs left">
            <i data-lucide="chevron-left"></i>
          </button>
          <div class="tms-segmented-tabs tms-tab-scroll-rail">`;

replaceInFile('academic-module.js', oldAcadTabs, newAcadTabs);

const oldAcadTabsClose = `            <button class="tms-tab-pill \${this._currentTab === 'syllabus' ? 'active' : ''} acad-tab" data-tab="syllabus">
              <i data-lucide="book-marked"></i>
              <span>Curriculum &amp; Syllabus</span>
            </button>
          </div>
        </div>`;

const newAcadTabsClose = `            <button class="tms-tab-pill \${this._currentTab === 'syllabus' ? 'active' : ''} acad-tab" data-tab="syllabus">
              <i data-lucide="book-marked"></i>
              <span>Curriculum &amp; Syllabus</span>
            </button>
          </div>
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll tabs right">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>`;

replaceInFile('academic-module.js', oldAcadTabsClose, newAcadTabsClose);

// 5. Update my-work-module.js
const oldMyWorkTabs = `        <div class="tms-tab-rail-wrapper">
          <div class="tms-segmented-tabs" id="mywork-tab-pills">`;

const newMyWorkTabs = `        <div class="tms-tab-scroll-wrapper">
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" id="mywork-tabs-scroll-prev" aria-label="Scroll left" title="Scroll tabs left">
            <i data-lucide="chevron-left"></i>
          </button>
          <div class="tms-segmented-tabs tms-tab-scroll-rail" id="mywork-tab-pills">`;

replaceInFile('my-work-module.js', oldMyWorkTabs, newMyWorkTabs);

const oldMyWorkTabsClose = `            <button class="tms-tab-pill staff-tab" data-tab="payslips">
              <i data-lucide="receipt"></i>
              <span>Salary &amp; CTC</span>
            </button>
          </div>
        </div>`;

const newMyWorkTabsClose = `            <button class="tms-tab-pill staff-tab" data-tab="payslips">
              <i data-lucide="receipt"></i>
              <span>Salary &amp; CTC</span>
            </button>
          </div>
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" id="mywork-tabs-scroll-next" aria-label="Scroll right" title="Scroll tabs right">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>`;

replaceInFile('my-work-module.js', oldMyWorkTabsClose, newMyWorkTabsClose);

// 6. Update examination-module.js
const oldExamTabs = `        <div class="tms-tab-rail-wrapper">
          <div class="tms-segmented-tabs">`;

const newExamTabs = `        <div class="tms-tab-scroll-wrapper">
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" id="exam-tabs-scroll-prev" aria-label="Scroll left" title="Scroll tabs left">
            <i data-lucide="chevron-left"></i>
          </button>
          <div class="tms-segmented-tabs tms-tab-scroll-rail">`;

replaceInFile('examination-module.js', oldExamTabs, newExamTabs);

const oldExamTabsClose = `            <button class="tms-tab-pill \${this._examViewTab === 'admit' ? 'active' : ''}" id="tab-exam-admit">
              <i data-lucide="ticket"></i>
              <span>Admit Cards &amp; Seating Arranger</span>
              <span class="tab-badge">0</span>
            </button>
          </div>
        </div>`;

const newExamTabsClose = `            <button class="tms-tab-pill \${this._examViewTab === 'admit' ? 'active' : ''}" id="tab-exam-admit">
              <i data-lucide="ticket"></i>
              <span>Admit Cards &amp; Seating Arranger</span>
              <span class="tab-badge">0</span>
            </button>
          </div>
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" id="exam-tabs-scroll-next" aria-label="Scroll right" title="Scroll tabs right">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>`;

replaceInFile('examination-module.js', oldExamTabsClose, newExamTabsClose);

// 7. Update operations-module.js
const oldOpsTabs = `        <div class="tms-tab-rail-wrapper">
          <div class="tms-segmented-tabs">`;

const newOpsTabs = `        <div class="tms-tab-scroll-wrapper">
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll tabs left">
            <i data-lucide="chevron-left"></i>
          </button>
          <div class="tms-segmented-tabs tms-tab-scroll-rail">`;

replaceInFile('operations-module.js', oldOpsTabs, newOpsTabs);

const oldOpsTabsClose = `            <button class="tms-tab-pill ops-tab" data-tab="inventory">
              <i data-lucide="archive"></i>
              <span>Inventory</span>
            </button>
          </div>
        </div>`;

const newOpsTabsClose = `            <button class="tms-tab-pill ops-tab" data-tab="inventory">
              <i data-lucide="archive"></i>
              <span>Inventory</span>
            </button>
          </div>
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll tabs right">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>`;

replaceInFile('operations-module.js', oldOpsTabsClose, newOpsTabsClose);

// 8. Update timetable-module.js
const oldTTTabs = `        <div class="tms-tab-rail-wrapper">
          <div class="tms-segmented-tabs">`;

const newTTTabs = `        <div class="tms-tab-scroll-wrapper">
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll tabs left">
            <i data-lucide="chevron-left"></i>
          </button>
          <div class="tms-segmented-tabs tms-tab-scroll-rail">`;

replaceInFile('timetable-module.js', oldTTTabs, newTTTabs);

const oldTTTabsClose = `            <button class="tms-tab-pill \${this._activeView === 'substitution' ? 'active' : ''}" id="tab-tt-sub">
              <i data-lucide="user-check"></i>
              <span>Teacher Substitution Radar</span>
            </button>
          </div>
        </div>`;

const newTTTabsClose = `            <button class="tms-tab-pill \${this._activeView === 'substitution' ? 'active' : ''}" id="tab-tt-sub">
              <i data-lucide="user-check"></i>
              <span>Teacher Substitution Radar</span>
            </button>
          </div>
          <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll tabs right">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>`;

replaceInFile('timetable-module.js', oldTTTabsClose, newTTTabsClose);

// 9. Update admin-website-cms.js (Hostel internal sub-tabs)
let cmsCode = fs.readFileSync('admin-website-cms.js', 'utf8');
const oldHostelTabsPattern = `      <!-- HOSTEL INTERNAL MANAGEMENT TABS -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
        <button class="tms-tab-pill active hostel-sub-pill" data-target="hostel-sec-overview"><i data-lucide="sliders"></i> <span>Overview &amp; Capacity</span></button>
        <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-wings"><i data-lucide="building"></i> <span>Dormitories &amp; Wings (\${wings.length})</span></button>
        <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-features"><i data-lucide="sparkles"></i> <span>Amenities &amp; Care (\${features.length})</span></button>
        <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-routine"><i data-lucide="clock"></i> <span>Daily Routine (\${routine.length})</span></button>
        <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-mess"><i data-lucide="utensils"></i> <span>Mess &amp; Weekly Menu</span></button>
        <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-wardens"><i data-lucide="phone-call"></i> <span>Wardens &amp; Rules</span></button>
        <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-roster"><i data-lucide="users"></i> <span>Student Roster (\${allocations.length})</span></button>
      </div>`;

const newHostelTabsPattern = `      <!-- HOSTEL INTERNAL MANAGEMENT TABS WITH SCROLL CONTROLS -->
      <div class="tms-tab-scroll-wrapper" style="margin-bottom: 20px;">
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-prev" aria-label="Scroll left" title="Scroll subtabs left">
          <i data-lucide="chevron-left"></i>
        </button>
        <div class="tms-subtab-rail" id="hostel-subtabs-rail">
          <button class="tms-tab-pill active hostel-sub-pill" data-target="hostel-sec-overview"><i data-lucide="sliders"></i> <span>Overview &amp; Capacity</span></button>
          <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-wings"><i data-lucide="building"></i> <span>Dormitories &amp; Wings (\${wings.length})</span></button>
          <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-features"><i data-lucide="sparkles"></i> <span>Amenities &amp; Care (\${features.length})</span></button>
          <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-routine"><i data-lucide="clock"></i> <span>Daily Routine (\${routine.length})</span></button>
          <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-mess"><i data-lucide="utensils"></i> <span>Mess &amp; Weekly Menu</span></button>
          <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-wardens"><i data-lucide="phone-call"></i> <span>Wardens &amp; Rules</span></button>
          <button class="tms-tab-pill hostel-sub-pill" data-target="hostel-sec-roster"><i data-lucide="users"></i> <span>Student Roster (\${allocations.length})</span></button>
        </div>
        <button type="button" class="tms-tab-nav-btn tms-tab-nav-next" aria-label="Scroll right" title="Scroll subtabs right">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>`;

replaceInFile('admin-website-cms.js', oldHostelTabsPattern, newHostelTabsPattern);

console.log('Finished updating tab rails across all modules.');
