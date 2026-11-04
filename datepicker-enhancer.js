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
