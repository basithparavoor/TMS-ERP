const fs = require('fs');

const attendanceCss = `
/* ==========================================================================
   TMS ERP — ATTENDANCE & TEACHING TIMETABLE SUITE (TPSH Match)
   Includes Class/Period Days Picker, Timetable Cards, QR, NFC & Face Radar
   ========================================================================== */

/* 7-Days Round Circle Day Selector (Screenshot Match) */
.cls-days-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
}
.cls-day-round-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid #CBD5E1;
  background: #FFFFFF;
  color: #64748B;
  font-weight: 700;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}
.cls-day-round-btn:hover {
  border-color: #10B981;
  color: #059669;
  background: #F0FDF4;
  transform: translateY(-1px);
}
.cls-day-round-btn.active {
  background: #0E623B !important;
  border-color: #0E623B !important;
  color: #FFFFFF !important;
  box-shadow: 0 3px 8px rgba(14, 98, 59, 0.35);
  transform: scale(1.06);
}
@media (max-width: 480px) {
  .cls-days-picker-row {
    gap: 0.25rem;
    padding: 0.35rem;
  }
  .cls-day-round-btn {
    width: 32px;
    height: 32px;
    font-size: 0.78rem;
  }
}

/* Timetable Cards Grid & Cards */
.timetable-cards-grid,
.att-timetable-cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}
@media (max-width: 768px) {
  .timetable-cards-grid,
  .att-timetable-cards-list {
    grid-template-columns: 1fr;
  }
}

.teacher-upcoming-card {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 18px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  user-select: none;
  position: relative;
  overflow: hidden;
}
.teacher-upcoming-card:hover {
  transform: translateY(-3px);
  border-color: #CBD5E1;
  box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.08);
}
.teacher-upcoming-card.is-live {
  background: #F0FDF4;
  border-color: #6EE7B7;
  border-left: 5px solid #059669;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
}
.teacher-upcoming-card.is-soon {
  background: #FFFDF5;
  border-color: #FCD34D;
  border-left: 5px solid #F59E0B;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
}

/* Live Pulsating Indicator Dot */
.live-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-green 1.8s infinite;
  vertical-align: middle;
}
@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Timetable Schedule Tabs (Today / Weekly / Live) */
.att-timetable-tabs {
  display: flex;
  gap: 0.5rem;
  background: #F1F5F9;
  padding: 0.35rem;
  border-radius: 14px;
  margin-bottom: 1.25rem;
  overflow-x: auto;
}
.att-timetable-tab-btn {
  flex: 1;
  min-width: fit-content;
  padding: 0.6rem 1rem;
  font-size: 0.84rem;
  font-weight: 700;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748B;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.att-timetable-tab-btn:hover {
  color: #0F172A;
}
.att-timetable-tab-btn.is-active {
  background: #FFFFFF;
  color: #0F172A;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Biometric Radar Hub & Scanner Viewfinders */
.att-mode-hub-bar {
  display: flex;
  gap: 8px;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 6px;
  margin-bottom: 20px;
  overflow-x: auto;
  box-shadow: var(--shadow-xs);
}
.att-mode-btn {
  flex: 1;
  min-width: 140px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  background: transparent;
  color: #475569;
  font-weight: 700;
  font-size: 0.86rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.att-mode-btn:hover {
  background: #F8FAFC;
  color: #0F172A;
}
.att-mode-btn.active {
  background: #ECFDF5;
  color: #065F46;
  border-color: #6EE7B7;
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.15);
}

/* AI Face Recognition Reticle HUD */
.face-reticle-box {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto 16px;
  border-radius: 20px;
  overflow: hidden;
  background: #0F172A;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.face-hud-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #10B981;
  border-style: solid;
  pointer-events: none;
}
.face-hud-corner.tl { top: 16px; left: 16px; border-width: 3px 0 0 3px; border-top-left-radius: 6px; }
.face-hud-corner.tr { top: 16px; right: 16px; border-width: 3px 3px 0 0; border-top-right-radius: 6px; }
.face-hud-corner.bl { bottom: 16px; left: 16px; border-width: 0 0 3px 3px; border-bottom-left-radius: 6px; }
.face-hud-corner.br { bottom: 16px; right: 16px; border-width: 0 3px 3px 0; border-bottom-right-radius: 6px; }

.face-scanning-line {
  position: absolute;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10B981, #4ADE80, transparent);
  box-shadow: 0 0 10px #10B981;
  animation: face-scan 2.2s ease-in-out infinite alternate;
}
@keyframes face-scan {
  0% { top: 25px; }
  100% { top: 255px; }
}

/* NFC Radar Rings */
.nfc-radar-hub {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nfc-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(16, 185, 129, 0.35);
  animation: nfc-wave 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}
.nfc-ring:nth-child(1) { width: 80px; height: 80px; animation-delay: 0s; }
.nfc-ring:nth-child(2) { width: 130px; height: 130px; animation-delay: 0.6s; }
.nfc-ring:nth-child(3) { width: 180px; height: 180px; animation-delay: 1.2s; }
@keyframes nfc-wave {
  0% { transform: scale(0.6); opacity: 0.9; border-color: #10B981; }
  100% { transform: scale(1.2); opacity: 0; border-color: rgba(16, 185, 129, 0); }
}

/* Fast 1-Click Roll Call Status Pill Buttons */
.att-status-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #CBD5E1;
  background: #FFFFFF;
  font-weight: 800;
  font-size: 0.82rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}
.att-status-btn.btn-p.active { background: #16A34A; border-color: #16A34A; color: #FFFFFF; }
.att-status-btn.btn-a.active { background: #EF4444; border-color: #EF4444; color: #FFFFFF; }
.att-status-btn.btn-l.active { background: #F59E0B; border-color: #F59E0B; color: #FFFFFF; }
.att-status-btn.btn-e.active { background: #3B82F6; border-color: #3B82F6; color: #FFFFFF; }
`;

fs.appendFileSync('app.css', '\r\n' + attendanceCss, 'utf8');
console.log('Appended attendance and classroom modal CSS to app.css');
