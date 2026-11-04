
function ensureDatePickerStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tms-datepicker-styles')) return;
  const style = document.createElement('style');
  style.id = 'tms-datepicker-styles';
  style.textContent = `
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
  document.head.appendChild(style);
}
ensureDatePickerStyles();

/**
 * THAIBA MODEL SCHOOL ERP — Universal Luxury Date Picker Engine
 * Replaces standard browser <input type="date"> elements with the custom
 * 3D-badge calendar popup featuring:
 * 1. Days view with Month & Year pill selectors, 3D emerald calendar badge with white rings & day number,
 *    SUN-SAT weekday headers, 2-digit day grid, and solid green Confirm button.
 * 2. Month view (Select Month YYYY) with circular arrow navigation and 3x4 month cards.
 * 3. Year view (YYYY - YYYY) with 12-year window navigation and 3x4 year cards.
 *
 * 100% preserves:
 * - Native input.value ISO format (YYYY-MM-DD)
 * - Standard change and input event dispatches
 * - HTML5 min, max, and required validation
 * - Dynamic form generation and modal integration
 */

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CALENDAR_ICON_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
`;

const CHEVRON_DOWN_SVG = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
`;

const ARROW_LEFT_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
`;

const ARROW_RIGHT_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E293B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
`;

function padZero(n) {
  return String(n).padStart(2, '0');
}

function parseIsoDate(val) {
  if (!val) return null;
  const parts = val.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  return null;
}

function formatIso(y, m, d) {
  return `${y}-${padZero(m + 1)}-${padZero(d)}`;
}

function formatDisplay(date) {
  if (!date) return 'Select Date';
  return `${padZero(date.getDate())} ${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

function closeAllDatePickers(exceptWrapper = null) {
  document.querySelectorAll('.tms-datepicker-wrapper.is-open').forEach((w) => {
    if (w !== exceptWrapper) {
      w.classList.remove('is-open', 'is-open-above');
      const trig = w.querySelector('.tms-datepicker-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      const pop = w.querySelector('.tms-datepicker-popup');
      if (pop) pop.style.display = 'none';
    }
  });
}

// Global outside click listener
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tms-datepicker-wrapper')) {
      closeAllDatePickers();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDatePickers();
    }
  });
}

export function enhanceDatePicker(input) {
  if (!input || input.dataset.datepickerEnhanced === 'true') return;
  if (input.classList.contains('no-custom-datepicker')) return;
  if (input.closest('.tms-datepicker-wrapper')) return;

  input.dataset.datepickerEnhanced = 'true';

  // Wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'tms-datepicker-wrapper';
  if (input.id) wrapper.dataset.forId = input.id;
  if (input.disabled) wrapper.classList.add('is-disabled');

  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  // Hide native input visually but keep accessible to form submission & validation
  input.classList.add('tms-datepicker-native-hidden');
  input.style.setProperty('position', 'absolute', 'important');
  input.style.setProperty('opacity', '0', 'important');
  input.style.setProperty('width', '1px', 'important');
  input.style.setProperty('height', '1px', 'important');
  input.style.setProperty('pointer-events', 'none', 'important');
  input.style.setProperty('margin', '-1px', 'important');
  input.style.setProperty('clip', 'rect(0, 0, 0, 0)', 'important');

  // Trigger button
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'tms-datepicker-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  if (input.disabled) trigger.disabled = true;

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'tms-datepicker-label';

  const triggerIcon = document.createElement('span');
  triggerIcon.className = 'tms-datepicker-icon';
  triggerIcon.innerHTML = CALENDAR_ICON_SVG;

  trigger.appendChild(triggerLabel);
  trigger.appendChild(triggerIcon);
  wrapper.appendChild(trigger);

  // Popup Container
  const popup = document.createElement('div');
  popup.className = 'tms-datepicker-popup';
  popup.setAttribute('role', 'dialog');
  popup.style.display = 'none';
  wrapper.appendChild(popup);

  // Internal state
  let currentView = 'days'; // 'days' | 'months' | 'years'
  let selectedDate = parseIsoDate(input.value) || new Date();
  let viewYear = selectedDate.getFullYear();
  let viewMonth = selectedDate.getMonth();
  let yearRangeStart = Math.floor(viewYear / 12) * 12;

  function updateTriggerDisplay() {
    const d = parseIsoDate(input.value);
    if (d) {
      triggerLabel.textContent = formatDisplay(d);
      triggerLabel.classList.remove('is-placeholder');
    } else {
      triggerLabel.textContent = input.placeholder || 'Select Date';
      triggerLabel.classList.add('is-placeholder');
    }
  }

  updateTriggerDisplay();

  // Render Views
  function renderPopup() {
    if (currentView === 'days') {
      renderDaysView();
    } else if (currentView === 'months') {
      renderMonthsView();
    } else if (currentView === 'years') {
      renderYearsView();
    }
  }

  /* ----------------------------------------------------
   * 1. DAYS VIEW
   * ---------------------------------------------------- */
  function renderDaysView() {
    popup.innerHTML = `
      <div class="tms-dp-days-view">
        <div class="tms-dp-header">
          <div class="tms-dp-header-left">
            <h3 class="tms-dp-title">Select Date</h3>
            <div class="tms-dp-pills">
              <button type="button" class="tms-dp-pill" id="dp-btn-month">
                <span>${MONTH_NAMES_SHORT[viewMonth]}</span>
                ${CHEVRON_DOWN_SVG}
              </button>
              <button type="button" class="tms-dp-pill" id="dp-btn-year">
                <span>${viewYear}</span>
                ${CHEVRON_DOWN_SVG}
              </button>
            </div>
          </div>
          <div class="tms-dp-header-right">
            <div class="tms-dp-badge">
              <div class="tms-dp-rings">
                <span class="tms-dp-ring"></span>
                <span class="tms-dp-ring"></span>
              </div>
              <span class="tms-dp-badge-num">${padZero(selectedDate.getDate())}</span>
            </div>
          </div>
        </div>

        <div class="tms-dp-weekdays">
          ${WEEKDAYS.map(w => `<span class="tms-dp-weekday">${w}</span>`).join('')}
        </div>

        <div class="tms-dp-grid" id="dp-days-grid"></div>

        <div class="tms-dp-footer">
          <button type="button" class="tms-dp-confirm-btn" id="dp-btn-confirm">Confirm</button>
        </div>
      </div>
    `;

    // Month & Year switch buttons
    popup.querySelector('#dp-btn-month').addEventListener('click', (e) => {
      e.stopPropagation();
      currentView = 'months';
      renderPopup();
    });

    popup.querySelector('#dp-btn-year').addEventListener('click', (e) => {
      e.stopPropagation();
      yearRangeStart = Math.floor(viewYear / 12) * 12;
      currentView = 'years';
      renderPopup();
    });

    // Populate Days Grid
    const gridEl = popup.querySelector('#dp-days-grid');
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    // 1. Prev month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const el = document.createElement('div');
      el.className = 'tms-dp-day is-other-month';
      el.textContent = padZero(dayNum);
      el.addEventListener('click', () => {
        let m = viewMonth - 1;
        let y = viewYear;
        if (m < 0) { m = 11; y -= 1; }
        viewMonth = m;
        viewYear = y;
        selectedDate = new Date(y, m, dayNum);
        renderPopup();
      });
      gridEl.appendChild(el);
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const isSelected = selectedDate.getFullYear() === viewYear &&
                         selectedDate.getMonth() === viewMonth &&
                         selectedDate.getDate() === d;

      const el = document.createElement('div');
      el.className = 'tms-dp-day' + (isSelected ? ' is-selected' : '');
      el.textContent = padZero(d);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDate = new Date(viewYear, viewMonth, d);
        // Update badge and day selection state
        popup.querySelectorAll('.tms-dp-day').forEach(b => b.classList.remove('is-selected'));
        el.classList.add('is-selected');
        const badgeNum = popup.querySelector('.tms-dp-badge-num');
        if (badgeNum) badgeNum.textContent = padZero(d);
      });

      // Double-click instantly confirms
      el.addEventListener('dblclick', () => {
        confirmSelection();
      });

      gridEl.appendChild(el);
    }

    // 3. Next month trailing days to complete rows (up to 35 or 42 cells)
    const totalCells = firstDayIndex + daysInCurrentMonth;
    const remainingCells = (totalCells <= 35 ? 35 : 42) - totalCells;
    for (let d = 1; d <= remainingCells; d++) {
      const el = document.createElement('div');
      el.className = 'tms-dp-day is-other-month';
      el.textContent = padZero(d);
      el.addEventListener('click', () => {
        let m = viewMonth + 1;
        let y = viewYear;
        if (m > 11) { m = 0; y += 1; }
        viewMonth = m;
        viewYear = y;
        selectedDate = new Date(y, m, d);
        renderPopup();
      });
      gridEl.appendChild(el);
    }

    // Confirm button
    popup.querySelector('#dp-btn-confirm').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmSelection();
    });
  }

  function confirmSelection() {
    const iso = formatIso(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    input.value = iso;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    updateTriggerDisplay();
    wrapper.classList.remove('is-open', 'is-open-above');
    trigger.setAttribute('aria-expanded', 'false');
    popup.style.display = 'none';
    trigger.focus();
    wrapper.classList.remove('is-invalid');
  }

  /* ----------------------------------------------------
   * 2. MONTHS VIEW
   * ---------------------------------------------------- */
  function renderMonthsView() {
    popup.innerHTML = `
      <div class="tms-dp-sub-view">
        <div class="tms-dp-nav-header">
          <button type="button" class="tms-dp-nav-btn" id="dp-month-prev">${ARROW_LEFT_SVG}</button>
          <h4 class="tms-dp-nav-title">Select Month (${viewYear})</h4>
          <button type="button" class="tms-dp-nav-btn" id="dp-month-next">${ARROW_RIGHT_SVG}</button>
        </div>

        <div class="tms-dp-months-grid">
          ${MONTH_NAMES_SHORT.map((m, idx) => {
            const isSelected = selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === idx;
            return `
              <button type="button" class="tms-dp-month-card ${isSelected ? 'is-selected' : ''}" data-month="${idx}">
                ${m}
              </button>
            `;
          }).join('')}
        </div>

        <div class="tms-dp-sub-footer">
          <button type="button" class="tms-dp-back-btn" id="dp-back-from-months">
            ← Back to Days
          </button>
        </div>
      </div>
    `;

    popup.querySelector('#dp-month-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      viewYear -= 1;
      renderMonthsView();
    });

    popup.querySelector('#dp-month-next').addEventListener('click', (e) => {
      e.stopPropagation();
      viewYear += 1;
      renderMonthsView();
    });

    popup.querySelectorAll('.tms-dp-month-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const m = parseInt(btn.dataset.month, 10);
        viewMonth = m;
        // Keep selected day clamped to max days in month
        const maxDays = new Date(viewYear, m + 1, 0).getDate();
        const curDay = Math.min(selectedDate.getDate(), maxDays);
        selectedDate = new Date(viewYear, m, curDay);

        currentView = 'days';
        renderPopup();
      });
    });

    popup.querySelector('#dp-back-from-months').addEventListener('click', (e) => {
      e.stopPropagation();
      currentView = 'days';
      renderPopup();
    });
  }

  /* ----------------------------------------------------
   * 3. YEARS VIEW (12-Year Window)
   * ---------------------------------------------------- */
  function renderYearsView() {
    const rangeEnd = yearRangeStart + 11;
    const years = [];
    for (let y = yearRangeStart; y <= rangeEnd; y++) {
      years.push(y);
    }

    popup.innerHTML = `
      <div class="tms-dp-sub-view">
        <div class="tms-dp-nav-header">
          <button type="button" class="tms-dp-nav-btn" id="dp-year-prev">${ARROW_LEFT_SVG}</button>
          <h4 class="tms-dp-nav-title">${yearRangeStart} – ${rangeEnd}</h4>
          <button type="button" class="tms-dp-nav-btn" id="dp-year-next">${ARROW_RIGHT_SVG}</button>
        </div>

        <div class="tms-dp-years-grid">
          ${years.map(y => {
            const isSelected = selectedDate.getFullYear() === y;
            return `
              <button type="button" class="tms-dp-year-card ${isSelected ? 'is-selected' : ''}" data-year="${y}">
                ${y}
              </button>
            `;
          }).join('')}
        </div>

        <div class="tms-dp-sub-footer">
          <button type="button" class="tms-dp-back-btn" id="dp-back-from-years">
            ← Back to Days
          </button>
        </div>
      </div>
    `;

    popup.querySelector('#dp-year-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      yearRangeStart -= 12;
      renderYearsView();
    });

    popup.querySelector('#dp-year-next').addEventListener('click', (e) => {
      e.stopPropagation();
      yearRangeStart += 12;
      renderYearsView();
    });

    popup.querySelectorAll('.tms-dp-year-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const y = parseInt(btn.dataset.year, 10);
        viewYear = y;
        const maxDays = new Date(y, viewMonth + 1, 0).getDate();
        const curDay = Math.min(selectedDate.getDate(), maxDays);
        selectedDate = new Date(y, viewMonth, curDay);

        currentView = 'days';
        renderPopup();
      });
    });

    popup.querySelector('#dp-back-from-years').addEventListener('click', (e) => {
      e.stopPropagation();
      currentView = 'days';
      renderPopup();
    });
  }

  function toggleOpen() {
    if (input.disabled) return;
    const isOpen = wrapper.classList.contains('is-open');

    if (isOpen) {
      wrapper.classList.remove('is-open', 'is-open-above');
      trigger.setAttribute('aria-expanded', 'false');
      popup.style.display = 'none';
    } else {
      closeAllDatePickers(wrapper);

      // Reset state based on current input value
      const cur = parseIsoDate(input.value);
      if (cur) {
        selectedDate = cur;
        viewYear = cur.getFullYear();
        viewMonth = cur.getMonth();
      }
      currentView = 'days';
      renderPopup();

      // Check space above vs below
      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 420 && spaceAbove > 420) {
        wrapper.classList.add('is-open-above');
      } else {
        wrapper.classList.remove('is-open-above');
      }

      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      popup.style.display = 'block';
    }
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleOpen();
  });

  // Sync when input.value is changed externally
  input.addEventListener('change', () => {
    updateTriggerDisplay();
    const d = parseIsoDate(input.value);
    if (d) {
      selectedDate = d;
      viewYear = d.getFullYear();
      viewMonth = d.getMonth();
    }
  });

  input.addEventListener('invalid', () => {
    wrapper.classList.add('is-invalid');
  });

  // Connect associated label click
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        trigger.focus();
        toggleOpen();
      });
    }
  }
}

export function enhanceAllDatePickers(root = document) {
  if (!root || !root.querySelectorAll) return;
  const dateInputs = root.querySelectorAll('input[type="date"]:not([data-datepicker-enhanced]):not(.no-custom-datepicker)');
  dateInputs.forEach(inp => enhanceDatePicker(inp));
}

// Global auto-enhancer for dynamically inserted content
let globalDateObserverStarted = false;
export function startGlobalDatePickerObserver() {
  if (globalDateObserverStarted || typeof document === 'undefined') return;
  globalDateObserverStarted = true;

  enhanceAllDatePickers(document);

  const observer = new MutationObserver((mutations) => {
    let hasAddedNodes = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        hasAddedNodes = true;
        break;
      }
    }
    if (hasAddedNodes) {
      enhanceAllDatePickers(document);
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      enhanceAllDatePickers(document);
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

// Auto-run if running in browser
if (typeof window !== 'undefined') {
  window.TMSDatePickerEnhancer = { enhanceDatePicker, enhanceAllDatePickers, startGlobalDatePickerObserver };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => startGlobalDatePickerObserver());
  } else {
    startGlobalDatePickerObserver();
  }
}
