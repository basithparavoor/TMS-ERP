const fs = require('fs');
const path = require('path');

// 1. UPDATE calendar-module.js
let calCode = fs.readFileSync('calendar-module.js', 'utf8');

// Replace the old ad-hoc header with UIComponents.renderPageHeader and modern layout wrappers
const oldTemplateStart = 'container.innerHTML = `';
const oldTemplateEnd = 'this._bindEvents();';

const startIdx = calCode.indexOf(oldTemplateStart);
const endIdx = calCode.indexOf(oldTemplateEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate template boundaries in calendar-module.js');
  process.exit(1);
}

const newTemplate = `container.innerHTML = \`
      <div class="tms-content-wrapper" style="padding-bottom: 2.5rem;">
        
        <!-- INSTITUTIONAL EXECUTIVE PAGE HEADER -->
        \${UIComponents.renderPageHeader({
          title: 'Academic Calendar',
          subtitle: 'Institutional schedule, working days, official holidays & hostel leaves',
          icon: 'calendar',
          badge: 'Academic Operations',
          breadcrumbs: [
            { label: 'Campus Core' },
            { label: 'Academics & Operations' },
            { label: 'Academic Calendar', active: true }
          ],
          actions: \`
            <button type="button" class="btn btn-secondary btn-sm" id="btn-open-working-schedule" title="Configure weekly active working days">
              <i data-lucide="settings-2"></i> Working Days
            </button>
            <button type="button" class="btn \${this._rangeMode ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-toggle-range-mode" title="Toggle range selection to click start and end dates">
              <i data-lucide="arrow-left-right"></i> Range Mode \${this._rangeMode ? '(ON)' : ''}
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-ics" title="Export .ics calendar to add to Google/iPhone Calendar">
              <i data-lucide="download"></i> Sync (.ics)
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-print-academic-cal" title="Print official A4 academic calendar">
              <i data-lucide="printer"></i> Print A4
            </button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-add-cal-holiday">
              <i data-lucide="plus"></i> Add Event
            </button>
          \`
        })}

        <!-- UNIFIED WORKSPACE LAYOUT -->
        <div class="cal-workspace-layout">
          
          <!-- TOP EXECUTIVE ROW: Today's Snapshot + Monthly Breakdown -->
          <div class="cal-top-grid">
            
            <!-- 1. TODAY'S SNAPSHOT CARD (GREEN EMERALD HERO CARD) -->
            <div class="cal-today-card">
              <div class="cal-today-header">
                <span class="cal-today-schedule-title">
                  <span class="m-hero-live-indicator"></span> TODAY'S INSTITUTIONAL SCHEDULE
                </span>
                <span class="cal-today-badge">
                  \${todayInfo.isActive ? 'Active Session' : 'Campus Recess'}
                </span>
              </div>
              <div class="cal-today-body">
                <span class="cal-today-num">
                  \${todayInfo.dayNumber}
                </span>
                <div class="cal-today-text">
                  <div class="cal-today-dayname">
                    \${todayInfo.dayName}, \${todayInfo.monthName} \${todayInfo.year}
                  </div>
                  <div class="cal-today-status">
                    \${todayInfo.statusHtml}
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. MONTHLY BREAKDOWN METRICS CARD -->
            <div class="cal-overview-card">
              <div class="cal-overview-header">
                <h4 class="cal-overview-title">
                  <i data-lucide="bar-chart-3" style="width: 17px; height: 17px; color: #2563EB;"></i>
                  \${monthName} \${year} Overview
                </h4>
                <span class="badge badge-secondary" style="font-size: 0.74rem; font-weight: 700;">
                  \${metrics.totalDays} Total Days
                </span>
              </div>

              <!-- 4 Metrics Chips -->
              <div class="cal-metrics-grid">
                <div class="cal-metric-chip metric-total">
                  <span class="cal-metric-label">Total Days</span>
                  <div class="cal-metric-val">\${metrics.totalDays}</div>
                </div>
                <div class="cal-metric-chip metric-working">
                  <span class="cal-metric-label">Working Days</span>
                  <div class="cal-metric-val text-emerald">\${metrics.workingDays}</div>
                </div>
                <div class="cal-metric-chip metric-holiday">
                  <span class="cal-metric-label">Official Holidays</span>
                  <div class="cal-metric-val text-amber">\${metrics.holidays}</div>
                </div>
                <div class="cal-metric-chip metric-weekend">
                  <span class="cal-metric-label">Weekend Offs</span>
                  <div class="cal-metric-val text-slate">\${metrics.weekendOffs}</div>
                </div>
              </div>

              <!-- Segmented Progress Bar -->
              <div class="cal-progress-track">
                <div style="background: #10B981; width: \${metrics.workingPercent}%;" title="Working Days: \${metrics.workingPercent}%"></div>
                <div style="background: #F59E0B; width: \${metrics.holidayPercent}%;" title="Holidays: \${metrics.holidayPercent}%"></div>
                <div style="background: #EF4444; width: \${metrics.leavePercent}%;" title="Breaks & Leaves: \${metrics.leavePercent}%"></div>
              </div>
              <div class="cal-progress-labels">
                <span>⚡ \${metrics.workingPercent}% Working Days</span>
                <span>🌴 \${metrics.holidayPercent}% Holidays &amp; Recesses</span>
                <span>🏖️ \${metrics.weekendPercent}% Weekend Offs</span>
              </div>
            </div>

          </div>

          <!-- Category Filter Pills Bar -->
          <div class="cal-filters-row">
            \${EVENT_CATEGORIES.map(cat => \`
              <button type="button" class="btn \${this._selectedCategory === cat.id ? 'btn-primary active' : 'btn-secondary'} btn-sm btn-filter-cat" data-cat="\${cat.id}" style="font-size: 0.75rem; padding: 5px 12px; white-space: nowrap; border-radius: 9999px;">
                <i data-lucide="\${cat.icon || 'tag'}" style="width: 13px; height: 13px;"></i>
                \${cat.name}
              </button>
            \`).join('')}
          </div>

          <!-- MAIN SECTION: CALENDAR GRID + AGENDA (SIDE-BY-SIDE ON DESKTOP) -->
          <div class="cal-main-grid">

            <!-- COMPONENT A: FLUENT MONTH CALENDAR CARD (TPSH STYLE) -->
            <div class="cal-fluent-grid-card">
              
              <!-- Card Top Header -->
              <div class="cal-fluent-top-header">
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                  <div class="cal-fluent-icon-badge">
                    <i data-lucide="calendar-check-2" style="width: 18px; height: 18px;"></i>
                  </div>
                  <div>
                    <h3 class="cal-fluent-title">
                      Event Calendar
                    </h3>
                    <p class="cal-fluent-desc">
                      Institutional working days, light yellow holidays, red hostel leaves &amp; exam windows
                    </p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <select id="cal-jump-month" class="form-select form-select-sm" style="font-size: 0.76rem; padding: 3px 8px; height: 32px; border-radius: 8px;">
                    \${MONTH_NAMES.map((m, idx) => \`
                      <option value="\${idx + 1}" \${idx + 1 === month ? 'selected' : ''}>\${m}</option>
                    \`).join('')}
                  </select>
                  <select id="cal-jump-year" class="form-select form-select-sm" style="font-size: 0.76rem; padding: 3px 8px; height: 32px; border-radius: 8px;">
                    \${[year - 1, year, year + 1, year + 2].map(y => \`
                      <option value="\${y}" \${y === year ? 'selected' : ''}>\${y}</option>
                    \`).join('')}
                  </select>
                </div>
              </div>

              <!-- Month & Year Navigation Bar -->
              <div class="cal-month-nav-bar">
                <button type="button" class="cal-nav-btn" id="cal-btn-prev-month" title="Previous Month">
                  <i data-lucide="chevron-left" style="width: 16px; height: 16px;"></i>
                </button>
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                  <span class="cal-month-nav-title">
                    \${monthName} \${year}
                  </span>
                  <button type="button" class="cal-today-pill" id="cal-btn-today" title="Jump to Today">
                    Today
                  </button>
                </div>
                <button type="button" class="cal-nav-btn" id="cal-btn-next-month" title="Next Month">
                  <i data-lucide="chevron-right" style="width: 16px; height: 16px;"></i>
                </button>
              </div>

              <!-- 7-Day Weekday Header (MO, TU, WE, TH, FR, SA, SU) -->
              <div class="cal-weekday-header">
                \${['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(d => \`
                  <div><span>\${d}</span></div>
                \`).join('')}
              </div>

              <!-- Fluent Month Grid with Continuous Pill Tracks -->
              <div class="cal-month-grid">
                \${this._renderMonthGridCells(year, month)}
              </div>

              <!-- Card Footer: Status Summary & Interactive Legend -->
              <div class="cal-fluent-footer">
                <div id="cal-range-display-text" style="font-size: 0.8rem; font-weight: 600; color: #1F2937;">
                  \${this._getSelectionStatusText(year, month)}
                </div>

                <!-- Legend Indicators -->
                <div class="cal-legend-row">
                  <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #B45309; font-weight: 700;">
                    <span style="width: 9px; height: 9px; border-radius: 50%; background: #F59E0B;"></span>
                    Holiday (Yellow)
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #DC2626; font-weight: 700;">
                    <span style="width: 9px; height: 9px; border-radius: 50%; background: #EF4444;"></span>
                    Hostel / Break (Red)
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #7E22CE; font-weight: 700;">
                    <span style="width: 9px; height: 9px; border-radius: 50%; background: #9333EA;"></span>
                    Exam (Purple)
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #047857; font-weight: 700;">
                    <span style="width: 9px; height: 9px; border-radius: 50%; background: #10B981;"></span>
                    Working Day (Green)
                  </span>
                </div>
              </div>

              <!-- If Range Selected: Floating Range Action Bar -->
              \${this._rangeStart ? \`
                <div style="padding: 0.6rem 1.15rem; background: #EFF6FF; border-top: 1.5px solid #BFDBFE; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                  <div style="font-size: 0.82rem; font-weight: 700; color: #1E40AF;">
                    Range Selected: <span class="font-mono">\${this._rangeStart}</span> to <span class="font-mono">\${this._rangeEnd || this._rangeStart}</span>
                  </div>
                  <div style="display: flex; gap: 0.4rem;">
                    <button type="button" class="btn btn-primary btn-xs" id="btn-action-add-holiday-range" style="font-size: 0.76rem; padding: 3px 10px;">
                      + Add Event for Range
                    </button>
                    <button type="button" class="btn btn-secondary btn-xs" id="btn-action-clear-range" style="font-size: 0.76rem; padding: 3px 8px;">
                      Clear Selection
                    </button>
                  </div>
                </div>
              \` : ''}

            </div>

            <!-- COMPONENT B: SCHEDULED HOLIDAYS, EVENTS & BREAKS AGENDA -->
            <div class="cal-agenda-card-box">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
                <h4 style="font-weight: 800; font-size: 0.95rem; color: #0F172A; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                  <span>🌴</span>
                  <span>Scheduled Holidays &amp; Events</span>
                  <span class="badge" style="background: #FEF3C7; color: #92400E; font-size: 0.72rem; font-weight: 800; padding: 2px 7px;">
                    \${consolidatedEvents.length}
                  </span>
                </h4>
                <button type="button" class="btn btn-ghost btn-sm" id="btn-add-cal-holiday-inline" style="color: #059669; font-weight: 700; font-size: 0.78rem; padding: 2px 8px;">
                  <i data-lucide="plus"></i> Add Event
                </button>
              </div>

              <!-- Natural list: multi-day items grouped into a single card -->
              <div style="display: flex; flex-direction: column; gap: 0.55rem; max-height: 520px; overflow-y: auto; padding-right: 2px;">
                \${consolidatedEvents.length > 0 ? consolidatedEvents.map(item => {
                  const catObj = EVENT_CATEGORIES.find(c => c.id === item.type) || EVENT_CATEGORIES[1];
                  const isMulti = item.startDate !== item.endDate;
                  const daysCount = item.allDates ? item.allDates.length : 1;
                  const dateDisplay = isMulti ? \`\${item.startDate} — \${item.endDate}\` : item.startDate;

                  return \`
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 0.85rem; border-radius: 12px; border: 1.5px solid \${catObj.trackColor || '#E2E8F0'}; background: \${catObj.trackColor ? catObj.trackColor + '40' : '#FFFFFF'}; transition: transform 0.15s ease;">
                      <div style="min-width: 0; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                          <span style="width: 8px; height: 8px; border-radius: 50%; background: \${catObj.color}; flex-shrink: 0;"></span>
                          <span style="font-weight: 800; font-size: 0.88rem; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            \${esc(item.name)}
                          </span>
                          <span class="badge" style="background: \${catObj.trackColor || '#F1F5F9'}; color: \${catObj.color}; border: 1px solid \${catObj.color}40; font-size: 0.68rem; font-weight: 700; padding: 1px 6px;">
                            \${esc(catObj.name)}
                          </span>
                          \${isMulti ? \`<span class="badge" style="background: #FFFFFF; color: #475569; border: 1px solid #CBD5E1; font-size: 0.68rem; font-weight: 700;">(\${daysCount} Days)</span>\` : ''}
                        </div>
                        <div style="font-size: 0.75rem; color: #64748B; margin-top: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                          <span class="font-mono">\${dateDisplay}</span>
                          \${!item.is_all_day && item.start_time && item.end_time ? \`
                            <span>• <i data-lucide="clock" style="width: 12px; height: 12px; display: inline;"></i> \${item.start_time} - \${item.end_time}</span>
                          \` : '• Full Day'}
                          \${item.description ? \`<span>• <em>\${esc(item.description)}</em></span>\` : ''}
                        </div>
                      </div>

                      <div style="display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">
                        <button type="button" class="btn btn-secondary btn-xs btn-edit-cal-event" data-event-id="\${esc(item.id)}" data-event-name="\${esc(item.name)}" data-event-type="\${esc(item.type)}" data-start-date="\${esc(item.startDate)}" data-end-date="\${esc(item.endDate)}" data-start-time="\${esc(item.start_time || '')}" data-end-time="\${esc(item.end_time || '')}" data-is-all-day="\${item.is_all_day !== false ? 'true' : 'false'}" data-range-id="\${esc(item.range_id || '')}" data-all-dates="\${esc((item.allDates || []).join(','))}" title="Edit event" style="padding: 3px 8px; font-size: 0.74rem;">
                          <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> Edit
                        </button>
                        <button type="button" class="btn btn-secondary btn-xs btn-del-event" data-event-id="\${esc(item.id)}" data-range-id="\${esc(item.range_id || '')}" data-all-dates="\${esc((item.allDates || []).join(','))}" title="Delete event" style="color: #EF4444; padding: 3px 6px; font-size: 0.74rem;">
                          <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
                        </button>
                      </div>
                    </div>
                  \`;
                }).join('') : \`
                  <div style="text-align: center; padding: 2rem 1rem; color: #94A3B8; font-size: 0.85rem; border: 1.5px dashed #E2E8F0; border-radius: 12px;">
                    <i data-lucide="calendar" style="width: 32px; height: 32px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <div>No institutional holidays or events scheduled for this period.</div>
                    <div style="margin-top: 0.5rem;">
                      <button type="button" class="btn btn-secondary btn-xs" id="btn-add-first-event" style="font-weight: 700;">+ Add an Event</button>
                    </div>
                  </div>
                \`}
              </div>
            </div>

          </div>

        </div>

      </div>
    \`;

    `;

calCode = calCode.slice(0, startIdx) + newTemplate + calCode.slice(endIdx);
fs.writeFileSync('calendar-module.js', calCode);
console.log('Updated calendar-module.js successfully!');
