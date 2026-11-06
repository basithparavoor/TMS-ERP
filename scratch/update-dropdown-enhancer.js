const fs = require('fs');

let code = fs.readFileSync('dropdown-enhancer.js', 'utf8');

// 1. Update ensureDropdownStyles CSS string
const oldCssStart = '/* TMS Custom Dropdown Engine Styles */';
const oldCssEnd = '`;\n  document.head.appendChild(style);';

const cssStartIdx = code.indexOf(oldCssStart);
const cssEndIdx = code.indexOf(oldCssEnd);

if (cssStartIdx === -1 || cssEndIdx === -1) {
  console.error('Could not find CSS boundaries in dropdown-enhancer.js');
  process.exit(1);
}

const updatedCss = `/* TMS Custom Dropdown Engine Styles */
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

code = code.slice(0, cssStartIdx) + updatedCss + code.slice(cssEndIdx);

// 2. Update closeAllCustomSelects and closeWrapper
const oldCloseFunc = `function closeAllCustomSelects(exceptWrapper = null) {
  document.querySelectorAll('.tms-custom-select-wrapper.is-open').forEach((w) => {
    if (w !== exceptWrapper) {
      w.classList.remove('is-open', 'is-open-above');
      const trig = w.querySelector('.tms-custom-select-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      const m = w.querySelector('.tms-custom-select-menu');
      if (m) m.style.display = 'none';
    }
  });
}`;

const newCloseFunc = `function closeWrapper(w) {
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
}`;

code = code.replace(oldCloseFunc, newCloseFunc);

// 3. Update toggleOpen to elevate ancestors when opening
const oldToggleOpen = `    if (isOpen) {
      wrapper.classList.remove('is-open', 'is-open-above');
      trigger.setAttribute('aria-expanded', 'false');
      menu.style.display = 'none';
    } else {
      closeAllCustomSelects(wrapper);

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

      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      menu.style.display = 'block';`;

const newToggleOpen = `    if (isOpen) {
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
      menu.style.display = 'block';`;

code = code.replace(oldToggleOpen, newToggleOpen);

// Also update option click handler where close happens
const oldOptClose = `        wrapper.classList.remove('is-open', 'is-open-above');
        trigger.setAttribute('aria-expanded', 'false');
        menu.style.display = 'none';`;

const newOptClose = `        closeWrapper(wrapper);`;

code = code.replace(oldOptClose, newOptClose);

fs.writeFileSync('dropdown-enhancer.js', code);
console.log('Successfully updated dropdown-enhancer.js with universal stacking context elevation!');
