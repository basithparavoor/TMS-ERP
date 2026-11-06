const fs = require('fs');

const calendarCss = `
/* ==========================================================================
   ACADEMIC CALENDAR EXECUTIVE WORKSPACE STYLES (TPSH FLUENT LAYOUT)
   ========================================================================== */

.cal-workspace-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

/* 1. TOP EXECUTIVE GRID (TODAY'S SCHEDULE + MONTH OVERVIEW) */
.cal-top-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 992px) {
  .cal-top-grid {
    grid-template-columns: 360px 1fr;
  }
}

/* Today's Snapshot Emerald Hero Card */
.cal-today-card {
  background: linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%);
  border-radius: 18px;
  padding: 1.25rem 1.4rem;
  color: #FFFFFF;
  box-shadow: 0 10px 25px -5px rgba(6, 78, 59, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cal-today-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.45rem;
}

.cal-today-schedule-title {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #A7F3D0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cal-today-badge {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #FFFFFF;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.cal-today-body {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  margin-top: 0.25rem;
}

.cal-today-num {
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.cal-today-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cal-today-dayname {
  font-weight: 800;
  font-size: 1.05rem;
  line-height: 1.2;
  color: #FFFFFF;
}

.cal-today-status {
  font-size: 0.82rem;
  color: #D1FAE5;
  font-weight: 600;
  margin-top: 2px;
}

/* Monthly Overview Breakdown Card */
.cal-overview-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color, #E2E8F0);
  border-radius: 18px;
  padding: 1.15rem 1.35rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cal-overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cal-overview-title {
  font-weight: 800;
  font-size: 0.95rem;
  color: #0F172A;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cal-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
  margin-bottom: 0.85rem;
}

@media (min-width: 640px) {
  .cal-metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.cal-metric-chip {
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cal-metric-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

.metric-total {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
}

.metric-working {
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
}

.metric-holiday {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
}

.metric-weekend {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
}

.cal-metric-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748B;
  letter-spacing: 0.03em;
}

.cal-metric-val {
  font-weight: 800;
  font-size: 1.3rem;
  color: #0F172A;
  line-height: 1;
}

.cal-metric-val.text-emerald {
  color: #059669;
}

.cal-metric-val.text-amber {
  color: #D97706;
}

.cal-metric-val.text-slate {
  color: #475569;
}

.cal-progress-track {
  height: 8px;
  border-radius: 9999px;
  background: #F1F5F9;
  display: flex;
  overflow: hidden;
  margin-bottom: 0.45rem;
}

.cal-progress-track > div {
  height: 100%;
  transition: width 0.3s ease;
}

.cal-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #64748B;
  font-weight: 700;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Category Filter Pills */
.cal-filters-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.cal-filters-row::-webkit-scrollbar {
  display: none;
}

.btn-filter-cat.active {
  background: #16A34A !important;
  border-color: #16A34A !important;
  color: #FFFFFF !important;
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.25) !important;
}

/* MAIN STAGE (CALENDAR + AGENDA SIDE-BY-SIDE) */
.cal-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  align-items: start;
}

@media (min-width: 1080px) {
  .cal-main-grid {
    grid-template-columns: 1.35fr 1fr;
  }
}

/* Fluent Month Calendar Grid Card */
.cal-fluent-grid-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color, #E2E8F0);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
  width: 100%;
}

.cal-fluent-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1.15rem 0.65rem;
  border-bottom: 1px solid #F3F4F6;
  flex-wrap: wrap;
}

.cal-fluent-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #334155;
  flex-shrink: 0;
}

.cal-fluent-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
  line-height: 1.2;
}

.cal-fluent-desc {
  font-size: 0.74rem;
  color: #64748B;
  margin: 2px 0 0 0;
}

.cal-month-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F8FAFC;
  border-top: 1px solid #F1F5F9;
  border-bottom: 1px solid #F1F5F9;
  padding: 0.45rem 0.85rem;
}

.cal-nav-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.cal-nav-btn:hover {
  background: #F1F5F9;
  border-color: #CBD5E1;
  color: #111827;
  transform: scale(1.05);
}

.cal-month-nav-title {
  font-weight: 800;
  font-size: 0.92rem;
  color: #1F2937;
  letter-spacing: -0.01em;
}

.cal-today-pill {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #2563EB;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cal-today-pill:hover {
  background: #DBEAFE;
}

/* 7-Column Weekday Header */
.cal-weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  background: #F8FAFC;
  padding: 0.65rem 0.4rem;
  border-bottom: 1px solid #F1F5F9;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748B;
  letter-spacing: 0.04em;
}

.cal-weekday-header > div:last-child {
  color: #059669;
}

/* 7-Column Month Grid */
.cal-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: 100%;
  padding: 0.5rem 0.4rem 0.75rem;
  gap: 2px;
  row-gap: 5px;
  box-sizing: border-box;
}

.cal-day-box,
.cal-inst-day-cell {
  height: 38px;
  min-height: 38px;
  padding: 0;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent;
  border: none !important;
  margin: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cal-pad-cell {
  height: 38px;
  min-height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none !important;
  color: #CBD5E1;
  font-weight: 500;
  font-size: 0.82rem;
}

.cal-cell-track {
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.cal-day-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.82rem;
  color: #1F2937;
  position: relative;
  z-index: 2;
  transition: all 0.15s ease;
}

.cal-day-box:hover .cal-day-circle,
.cal-inst-day-cell:hover .cal-day-circle {
  background-color: #F1F5F9;
  transform: scale(1.08);
}

.cal-day-circle.is-today {
  border: 2px solid #059669 !important;
  color: #059669 !important;
  font-weight: 800 !important;
}

/* Continuous Holiday Tracks (Amber Yellow) */
.cal-inst-day-cell.is-holiday-start .cal-cell-track:after {
  content: "";
  position: absolute;
  left: 50%;
  right: 0;
  top: 0;
  bottom: 0;
  background: #FEF3C7;
  z-index: 1;
}

.cal-inst-day-cell.is-holiday-start .cal-cell-track {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.cal-inst-day-cell.is-holiday-start .cal-day-circle {
  background: #F59E0B !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-holiday-middle .cal-cell-track {
  background: #FEF3C7;
  border-radius: 0;
}

.cal-inst-day-cell.is-holiday-middle .cal-day-circle {
  color: #B45309 !important;
  font-weight: 700 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  z-index: 2;
}

.cal-inst-day-cell.is-holiday-end .cal-cell-track:before {
  content: "";
  position: absolute;
  left: 0;
  right: 50%;
  top: 0;
  bottom: 0;
  background: #FEF3C7;
  z-index: 1;
}

.cal-inst-day-cell.is-holiday-end .cal-cell-track {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

.cal-inst-day-cell.is-holiday-end .cal-day-circle {
  background: #F59E0B !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-holiday-single .cal-cell-track {
  border-radius: 9999px;
}

.cal-inst-day-cell.is-holiday-single .cal-day-circle {
  background: #FEF3C7 !important;
  color: #B45309 !important;
  font-weight: 700 !important;
  border: 1.5px solid #FDE68A;
}

/* Continuous Hostel / Leave Tracks (Rose Red) */
.cal-inst-day-cell.is-hostel-leave-start .cal-cell-track:after {
  content: "";
  position: absolute;
  left: 50%;
  right: 0;
  top: 0;
  bottom: 0;
  background: #FEE2E2;
  z-index: 1;
}

.cal-inst-day-cell.is-hostel-leave-start .cal-cell-track {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.cal-inst-day-cell.is-hostel-leave-start .cal-day-circle {
  background: #EF4444 !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-hostel-leave-middle .cal-cell-track {
  background: #FEE2E2;
  border-radius: 0;
}

.cal-inst-day-cell.is-hostel-leave-middle .cal-day-circle {
  color: #DC2626 !important;
  font-weight: 700 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  z-index: 2;
}

.cal-inst-day-cell.is-hostel-leave-end .cal-cell-track:before {
  content: "";
  position: absolute;
  left: 0;
  right: 50%;
  top: 0;
  bottom: 0;
  background: #FEE2E2;
  z-index: 1;
}

.cal-inst-day-cell.is-hostel-leave-end .cal-cell-track {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

.cal-inst-day-cell.is-hostel-leave-end .cal-day-circle {
  background: #EF4444 !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-hostel-leave-single .cal-cell-track {
  border-radius: 9999px;
}

.cal-inst-day-cell.is-hostel-leave-single .cal-day-circle {
  background: #FEE2E2 !important;
  color: #DC2626 !important;
  font-weight: 700 !important;
  border: 1.5px solid #FECACA;
}

/* Continuous Exam Tracks (Purple) */
.cal-inst-day-cell.is-exam-start .cal-cell-track:after {
  content: "";
  position: absolute;
  left: 50%;
  right: 0;
  top: 0;
  bottom: 0;
  background: #F3E8FF;
  z-index: 1;
}

.cal-inst-day-cell.is-exam-start .cal-cell-track {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.cal-inst-day-cell.is-exam-start .cal-day-circle {
  background: #9333EA !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(147, 51, 234, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-exam-middle .cal-cell-track {
  background: #F3E8FF;
  border-radius: 0;
}

.cal-inst-day-cell.is-exam-middle .cal-day-circle {
  color: #7E22CE !important;
  font-weight: 700 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  z-index: 2;
}

.cal-inst-day-cell.is-exam-end .cal-cell-track:before {
  content: "";
  position: absolute;
  left: 0;
  right: 50%;
  top: 0;
  bottom: 0;
  background: #F3E8FF;
  z-index: 1;
}

.cal-inst-day-cell.is-exam-end .cal-cell-track {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

.cal-inst-day-cell.is-exam-end .cal-day-circle {
  background: #9333EA !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(147, 51, 234, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-exam-single .cal-cell-track {
  border-radius: 9999px;
}

.cal-inst-day-cell.is-exam-single .cal-day-circle {
  background: #F3E8FF !important;
  color: #7E22CE !important;
  font-weight: 700 !important;
  border: 1.5px solid #E9D5FF;
}

/* Continuous Special Work Tracks (Teal) */
.cal-inst-day-cell.is-special-work-start .cal-cell-track:after {
  content: "";
  position: absolute;
  left: 50%;
  right: 0;
  top: 0;
  bottom: 0;
  background: #CCFBF1;
  z-index: 1;
}

.cal-inst-day-cell.is-special-work-start .cal-cell-track {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.cal-inst-day-cell.is-special-work-start .cal-day-circle {
  background: #0D9488 !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-special-work-middle .cal-cell-track {
  background: #CCFBF1;
  border-radius: 0;
}

.cal-inst-day-cell.is-special-work-middle .cal-day-circle {
  color: #0F766E !important;
  font-weight: 700 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  z-index: 2;
}

.cal-inst-day-cell.is-special-work-end .cal-cell-track:before {
  content: "";
  position: absolute;
  left: 0;
  right: 50%;
  top: 0;
  bottom: 0;
  background: #CCFBF1;
  z-index: 1;
}

.cal-inst-day-cell.is-special-work-end .cal-cell-track {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

.cal-inst-day-cell.is-special-work-end .cal-day-circle {
  background: #0D9488 !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.35);
  z-index: 2;
}

.cal-inst-day-cell.is-special-work-single .cal-cell-track {
  border-radius: 9999px;
}

.cal-inst-day-cell.is-special-work-single .cal-day-circle {
  background: #CCFBF1 !important;
  color: #0F766E !important;
  font-weight: 700 !important;
  border: 1.5px solid #99F6E4;
}

/* Continuous Range Selection Tracks (Blue) */
.cal-inst-day-cell.is-range-start .cal-cell-track:after {
  content: "";
  position: absolute;
  left: 50%;
  right: 0;
  top: 0;
  bottom: 0;
  background: #EFF6FF;
  z-index: 1;
}

.cal-inst-day-cell.is-range-start .cal-cell-track {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.cal-inst-day-cell.is-range-start .cal-day-circle {
  background: #2563EB !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
  z-index: 2;
}

.cal-inst-day-cell.is-range-middle .cal-cell-track {
  background: #EFF6FF;
  border-radius: 0;
}

.cal-inst-day-cell.is-range-middle .cal-day-circle {
  color: #2563EB !important;
  font-weight: 700 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  z-index: 2;
}

.cal-inst-day-cell.is-range-end .cal-cell-track:before {
  content: "";
  position: absolute;
  left: 0;
  right: 50%;
  top: 0;
  bottom: 0;
  background: #EFF6FF;
  z-index: 1;
}

.cal-inst-day-cell.is-range-end .cal-cell-track {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

.cal-inst-day-cell.is-range-end .cal-day-circle {
  background: #2563EB !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
  z-index: 2;
}

.cal-inst-day-cell.is-range-single .cal-cell-track {
  border-radius: 9999px;
}

.cal-inst-day-cell.is-range-single .cal-day-circle {
  background: #2563EB !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
}

/* Grid Row Wrapping Rules (7n & 7n+1) */
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-holiday-middle .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-hostel-leave-middle .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-exam-middle .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-range-middle .cal-cell-track {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-holiday-middle .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-hostel-leave-middle .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-exam-middle .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-range-middle .cal-cell-track {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-holiday-start .cal-cell-track:after,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-hostel-leave-start .cal-cell-track:after,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-exam-start .cal-cell-track:after,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-range-start .cal-cell-track:after {
  display: none;
}

.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-holiday-start .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-hostel-leave-start .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-exam-start .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n).is-range-start .cal-cell-track {
  border-radius: 9999px;
}

.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-holiday-end .cal-cell-track:before,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-hostel-leave-end .cal-cell-track:before,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-exam-end .cal-cell-track:before,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-range-end .cal-cell-track:before {
  display: none;
}

.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-holiday-end .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-hostel-leave-end .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-exam-end .cal-cell-track,
.cal-month-grid > .cal-inst-day-cell:nth-child(7n+1).is-range-end .cal-cell-track {
  border-radius: 9999px;
}

/* Month boundary rules */
.cal-inst-day-cell.is-month-last.is-holiday-middle .cal-cell-track,
.cal-inst-day-cell.is-month-last.is-hostel-leave-middle .cal-cell-track,
.cal-inst-day-cell.is-month-last.is-exam-middle .cal-cell-track,
.cal-inst-day-cell.is-month-last.is-range-middle .cal-cell-track {
  border-top-right-radius: 9999px !important;
  border-bottom-right-radius: 9999px !important;
}

.cal-inst-day-cell.is-month-last.is-holiday-start .cal-cell-track:after,
.cal-inst-day-cell.is-month-last.is-hostel-leave-start .cal-cell-track:after,
.cal-inst-day-cell.is-month-last.is-exam-start .cal-cell-track:after,
.cal-inst-day-cell.is-month-last.is-range-start .cal-cell-track:after {
  display: none !important;
}

.cal-inst-day-cell.is-month-last.is-holiday-start .cal-cell-track,
.cal-inst-day-cell.is-month-last.is-hostel-leave-start .cal-cell-track,
.cal-inst-day-cell.is-month-last.is-exam-start .cal-cell-track,
.cal-inst-day-cell.is-month-last.is-range-start .cal-cell-track {
  border-radius: 9999px !important;
}

.cal-inst-day-cell.is-month-first.is-holiday-middle .cal-cell-track,
.cal-inst-day-cell.is-month-first.is-hostel-leave-middle .cal-cell-track,
.cal-inst-day-cell.is-month-first.is-exam-middle .cal-cell-track,
.cal-inst-day-cell.is-month-first.is-range-middle .cal-cell-track {
  border-top-left-radius: 9999px !important;
  border-bottom-left-radius: 9999px !important;
}

.cal-inst-day-cell.is-month-first.is-holiday-end .cal-cell-track:before,
.cal-inst-day-cell.is-month-first.is-hostel-leave-end .cal-cell-track:before,
.cal-inst-day-cell.is-month-first.is-exam-end .cal-cell-track:before,
.cal-inst-day-cell.is-month-first.is-range-end .cal-cell-track:before {
  display: none !important;
}

.cal-inst-day-cell.is-month-first.is-holiday-end .cal-cell-track,
.cal-inst-day-cell.is-month-first.is-hostel-leave-end .cal-cell-track,
.cal-inst-day-cell.is-month-first.is-exam-end .cal-cell-track,
.cal-inst-day-cell.is-month-first.is-range-end .cal-cell-track {
  border-radius: 9999px !important;
}

/* Fluent Card Footer & Legend */
.cal-fluent-footer {
  padding: 0.75rem 1.15rem;
  background: #FFFFFF;
  border-top: 1px solid #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.cal-legend-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.72rem;
  font-weight: 700;
  flex-wrap: wrap;
}

/* Agenda Card Box */
.cal-agenda-card-box {
  background: #FFFFFF;
  border: 1px solid var(--border-color, #E2E8F0);
  border-radius: 18px;
  padding: 1.15rem 1.25rem;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06);
  width: 100%;
}
`;

let currentCss = fs.readFileSync('app.css', 'utf8');

// If already present, don't duplicate
if (currentCss.includes('ACADEMIC CALENDAR EXECUTIVE WORKSPACE STYLES')) {
  console.log('Calendar styles already present in app.css, updating them...');
  const startIdx = currentCss.indexOf('/* ==========================================================================\n   ACADEMIC CALENDAR EXECUTIVE WORKSPACE STYLES');
  if (startIdx !== -1) {
    currentCss = currentCss.slice(0, startIdx);
  }
}

currentCss += '\n' + calendarCss;
fs.writeFileSync('app.css', currentCss);
console.log('Successfully appended academic calendar styles to app.css!');
