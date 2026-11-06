
function ensureDropdownStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('tms-custom-select-styles')) return;
  const style = document.createElement('style');
  style.id = 'tms-custom-select-styles';
  style.textContent = `
/* TMS Custom Dropdown Engine Styles */
.tms-custom-select-native-hidden {
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

.tms-custom-select-wrapper {
  position: relative !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.tms-custom-select-wrapper.is-open {
  z-index: 10050 !important;
  position: relative !important;
}

.tms-has-open-select,
.card:has(.tms-custom-select-wrapper.is-open),
.form-group:has(.tms-custom-select-wrapper.is-open),
[class*="card"]:has(.tms-custom-select-wrapper.is-open),
.modal-content:has(.tms-custom-select-wrapper.is-open),
.modal-body:has(.tms-custom-select-wrapper.is-open) {
  z-index: 9999 !important;
  position: relative !important;
}

.tms-custom-select-trigger {
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

.tms-custom-select-trigger:hover {
  border-color: #10B981 !important;
  background: #FAFAFA !important;
}

.tms-custom-select-wrapper.is-open .tms-custom-select-trigger {
  border-color: #10B981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
}

.tms-custom-select-label {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  flex: 1 !important;
}

.tms-custom-select-label.is-placeholder {
  color: #94A3B8 !important;
  font-weight: 500 !important;
}

.tms-custom-select-arrow {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-left: 8px !important;
  transition: transform 0.2s ease !important;
  flex-shrink: 0 !important;
}

.tms-custom-select-wrapper.is-open .tms-custom-select-arrow {
  transform: rotate(180deg) !important;
}

.tms-custom-select-menu {
  display: none !important;
  position: absolute !important;
  top: calc(100% + 6px) !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 10050 !important;
  background: #FFFFFF !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 18px !important;
  padding: 8px !important;
  box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  max-height: 280px !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
}

.tms-custom-select-wrapper.is-open .tms-custom-select-menu {
  display: block !important;
  animation: tmsSelectMenuFade 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.tms-custom-select-wrapper.is-open-above .tms-custom-select-menu {
  top: auto !important;
  bottom: calc(100% + 6px) !important;
}

@keyframes tmsSelectMenuFade {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.tms-custom-select-option {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 14px !important;
  border-radius: 12px !important;
  color: #1E293B !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.12s ease !important;
  margin-bottom: 2px !important;
  user-select: none !important;
}

.tms-custom-select-option:hover {
  background: #F1F5F9 !important;
  color: #0F172A !important;
}

.tms-custom-select-option.is-selected {
  background: #E8F5E9 !important;
  color: #15803D !important;
  font-weight: 700 !important;
}

.tms-custom-select-check {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #15803D !important;
  margin-left: 8px !important;
}`;
  document.head.appendChild(style);
}
ensureDropdownStyles();

/**
 * THAIBA MODEL SCHOOL ERP — Universal Custom Dropdown Engine
 * Replaces standard browser <select> dropdowns with modern pill-shaped triggers,
 * floating rounded menu cards, green checkmarks on selected options, and smooth animations.
 *
 * Fully preserves:
 * - Native form submissions and FormData(form)
 * - Standard select.value getter / setter
 * - change and input event dispatches
 * - HTML5 validation (required, validity checks)
 * - Dynamic option updates via DOM MutationObserver
 */

const CHECKMARK_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
`;

const CHEVRON_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
`;

function closeWrapper(w) {
  w.classList.remove('is-open', 'is-open-above');
  w.style.removeProperty('z-index');
  const trig = w.querySelector('.tms-custom-select-trigger');
  if (trig) trig.setAttribute('aria-expanded', 'false');
  const m = w.querySelector('.tms-custom-select-menu');
  if (m) m.style.display = 'none';

  if (w.__elevatedAncestors) {
    w.__elevatedAncestors.forEach(({ el, prevZ }) => {
      if (prevZ) {
        el.style.zIndex = prevZ;
      } else {
        el.style.removeProperty('z-index');
      }
      el.classList.remove('tms-has-open-select');
    });
    w.__elevatedAncestors = null;
  }
}

function closeAllCustomSelects(exceptWrapper = null) {
  document.querySelectorAll('.tms-custom-select-wrapper.is-open').forEach((w) => {
    if (w !== exceptWrapper) {
      closeWrapper(w);
    }
  });
}

// Global click outside listener to close open dropdowns
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tms-custom-select-wrapper')) {
      closeAllCustomSelects();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllCustomSelects();
    }
  });
}

export function enhanceSelect(select) {
  if (!select || select.dataset.customSelectEnhanced === 'true') return;
  if (select.classList.contains('no-custom-select')) return;
  if (select.closest('.tms-custom-select-wrapper')) return;

  // Mark as enhanced to prevent duplicate wrapping
  select.dataset.customSelectEnhanced = 'true';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'tms-custom-select-wrapper';
  if (select.id) wrapper.dataset.forId = select.id;
  if (select.disabled) wrapper.classList.add('is-disabled');

  // Insert wrapper before select, then move select inside wrapper
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);

  // Add hidden class to native select AND inline style to guarantee it is NEVER visible
  select.classList.add('tms-custom-select-native-hidden');
  select.style.setProperty('position', 'absolute', 'important');
  select.style.setProperty('opacity', '0', 'important');
  select.style.setProperty('width', '1px', 'important');
  select.style.setProperty('height', '1px', 'important');
  select.style.setProperty('pointer-events', 'none', 'important');
  select.style.setProperty('margin', '-1px', 'important');
  select.style.setProperty('clip', 'rect(0, 0, 0, 0)', 'important');

  // Create Trigger
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'tms-custom-select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (select.disabled) trigger.disabled = true;

  const labelSpan = document.createElement('span');
  labelSpan.className = 'tms-custom-select-label';

  const arrowSpan = document.createElement('span');
  arrowSpan.className = 'tms-custom-select-arrow';
  arrowSpan.innerHTML = CHEVRON_SVG;

  trigger.appendChild(labelSpan);
  trigger.appendChild(arrowSpan);
  wrapper.appendChild(trigger);

  // Create Dropdown Menu
  const menu = document.createElement('div');
  menu.className = 'tms-custom-select-menu';
  menu.setAttribute('role', 'listbox');
  menu.style.display = 'none';
  wrapper.appendChild(menu);

  // Rebuild Menu Options from Native Select
  function rebuildOptions() {
    menu.innerHTML = '';
    const options = Array.from(select.options);
    let selectedOption = options.find((o) => o.selected) || options[0];

    // If no option has selected attribute, use current value
    if (select.value) {
      const match = options.find((o) => o.value === select.value);
      if (match) selectedOption = match;
    }

    if (selectedOption) {
      labelSpan.textContent = selectedOption.text || '— Select —';
      if (!selectedOption.value) {
        labelSpan.classList.add('is-placeholder');
      } else {
        labelSpan.classList.remove('is-placeholder');
      }
    } else {
      labelSpan.textContent = '— Select —';
      labelSpan.classList.add('is-placeholder');
    }

    options.forEach((opt, idx) => {
      const isSelected = selectedOption && opt.value === selectedOption.value;
      const optEl = document.createElement('div');
      optEl.className = 'tms-custom-select-option' + (isSelected ? ' is-selected' : '');
      optEl.setAttribute('role', 'option');
      optEl.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      optEl.dataset.value = opt.value;
      optEl.dataset.index = idx;
      if (opt.disabled) optEl.classList.add('is-disabled');

      const textSpan = document.createElement('span');
      textSpan.textContent = opt.text;
      optEl.appendChild(textSpan);

      if (isSelected) {
        const checkSpan = document.createElement('span');
        checkSpan.className = 'tms-custom-select-check';
        checkSpan.innerHTML = CHECKMARK_SVG;
        optEl.appendChild(checkSpan);
      }

      optEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (opt.disabled) return;

        select.value = opt.value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));

        closeWrapper(wrapper);
        trigger.focus();
        wrapper.classList.remove('is-invalid');
      });

      menu.appendChild(optEl);
    });
  }

  rebuildOptions();

  // Position and open/close toggle
  function toggleOpen() {
    if (select.disabled) return;
    const isOpen = wrapper.classList.contains('is-open');

    if (isOpen) {
      closeWrapper(wrapper);
    } else {
      closeAllCustomSelects(wrapper);

      // Elevate wrapper and all positioned ancestors so the menu sits above subsequent DOM siblings
      wrapper.classList.add('is-open');
      wrapper.style.setProperty('z-index', '10050', 'important');

      let ancestor = wrapper.parentElement;
      const elevatedAncestors = [];
      while (ancestor && ancestor !== document.body) {
        const comp = window.getComputedStyle(ancestor);
        if (comp.position === 'relative' || comp.position === 'absolute' || comp.position === 'sticky' || comp.transform !== 'none' || ancestor.classList.contains('card')) {
          elevatedAncestors.push({ el: ancestor, prevZ: ancestor.style.zIndex });
          ancestor.style.setProperty('z-index', '9999', 'important');
          ancestor.classList.add('tms-has-open-select');
        }
        ancestor = ancestor.parentElement;
      }
      wrapper.__elevatedAncestors = elevatedAncestors;

      // Check space above vs below
      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 280 && spaceAbove > 280) {
        wrapper.classList.add('is-open-above');
      } else {
        wrapper.classList.remove('is-open-above');
      }

      trigger.setAttribute('aria-expanded', 'true');
      menu.style.display = 'block';

      // Scroll selected item into view
      const selectedItem = menu.querySelector('.tms-custom-select-option.is-selected');
      if (selectedItem) {
        setTimeout(() => {
          selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 50);
      }
    }
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleOpen();
  });

  // Keyboard navigation
  trigger.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleOpen();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!wrapper.classList.contains('is-open')) {
        toggleOpen();
        return;
      }
      const items = Array.from(menu.querySelectorAll('.tms-custom-select-option:not(.is-disabled)'));
      const activeIdx = items.findIndex((it) => it.classList.contains('is-selected') || it.classList.contains('is-highlighted'));
      let nextIdx = 0;
      if (e.key === 'ArrowDown') {
        nextIdx = activeIdx < items.length - 1 ? activeIdx + 1 : 0;
      } else {
        nextIdx = activeIdx > 0 ? activeIdx - 1 : items.length - 1;
      }
      items.forEach((it) => it.classList.remove('is-highlighted'));
      items[nextIdx].classList.add('is-highlighted');
      items[nextIdx].scrollIntoView({ block: 'nearest' });
    }
  });

  // Sync when native select value changes externally
  select.addEventListener('change', () => {
    rebuildOptions();
  });

  // Sync on form validation invalid
  select.addEventListener('invalid', () => {
    wrapper.classList.add('is-invalid');
  });

  // Watch for dynamic changes in <option> tags
  const obs = new MutationObserver(() => {
    rebuildOptions();
  });
  obs.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected', 'disabled'] });

  // Connect associated <label> click to trigger
  if (select.id) {
    const label = document.querySelector(`label[for="${select.id}"]`);
    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        trigger.focus();
        toggleOpen();
      });
    }
  }
}

export function enhanceAllSelects(root = document) {
  if (!root || !root.querySelectorAll) return;
  const selects = root.querySelectorAll('select:not([data-custom-select-enhanced]):not(.no-custom-select)');
  selects.forEach((sel) => enhanceSelect(sel));
}

// Global auto-enhancer for dynamically inserted content
let globalObserverStarted = false;
export function startGlobalSelectObserver() {
  if (globalObserverStarted || typeof document === 'undefined') return;
  globalObserverStarted = true;

  enhanceAllSelects(document);

  const observer = new MutationObserver((mutations) => {
    let hasAddedNodes = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        hasAddedNodes = true;
        break;
      }
    }
    if (hasAddedNodes) {
      enhanceAllSelects(document);
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      enhanceAllSelects(document);
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

// Auto-run if running in a browser
if (typeof window !== 'undefined') {
  window.TMSDropdownEnhancer = { enhanceSelect, enhanceAllSelects, startGlobalSelectObserver };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => startGlobalSelectObserver());
  } else {
    startGlobalSelectObserver();
  }
}
