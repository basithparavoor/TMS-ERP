const fs = require('fs');

let code = fs.readFileSync('academic-module.js', 'utf8');

// Add import
if (!code.includes('ClassroomModal')) {
  code = `import { ClassroomModal } from './classroom-modal.js';\r\n` + code;
}

// Replace openAddClassModal
const oldClassStart = '  static openAddClassModal(initialData = null) {';
const oldClassEnd = '  static openEditClassModal(classId) {';
const cStart = code.indexOf(oldClassStart);
const cEnd = code.indexOf(oldClassEnd);

if (cStart !== -1 && cEnd !== -1) {
  const newClassCode = `  static openAddClassModal(initialData = null) {
    ClassroomModal.open({
      classroom: initialData,
      onSave: async (recordData) => {
        const classRecord = {
          id: initialData?.id || recordData.id,
          grade: recordData.name,
          name: recordData.name,
          section: recordData.section,
          roomNo: recordData.room,
          capacity: recordData.capacity,
          teacher: recordData.teacher,
          days: recordData.days,
          startTime: recordData.startTime,
          endTime: recordData.endTime,
          gender: recordData.gender,
          status: recordData.status
        };
        try {
          await dbService.upsert('academic_classes', classRecord);
          await auditService.log(initialData ? 'CLASS_UPDATED' : 'CLASS_CREATED', 'ACADEMIC', classRecord);
        } catch (err) {
          console.warn('Academic class save fallback:', err);
        }
        if (this._container) await this.render(this._container);
      }
    });
  }

`;
  code = code.slice(0, cStart) + newClassCode + code.slice(cEnd);
  console.log('Updated openAddClassModal');
}

// Replace openAddPeriodModal
const oldPeriodStart = '  static openAddPeriodModal(initialData = null) {';
const oldPeriodEnd = '  static openEditPeriodModal(periodId) {';
const pStart = code.indexOf(oldPeriodStart);
const pEnd = code.indexOf(oldPeriodEnd);

if (pStart !== -1 && pEnd !== -1) {
  const newPeriodCode = `  static openAddPeriodModal(initialData = null) {
    ClassroomModal.open({
      classroom: initialData ? {
        ...initialData,
        name: initialData.name,
        startTime: initialData.startTime,
        endTime: initialData.endTime
      } : null,
      onSave: async (recordData) => {
        const periodRecord = {
          id: initialData?.id || recordData.id,
          name: recordData.name,
          section: recordData.section,
          startTime: recordData.startTime,
          endTime: recordData.endTime,
          teacher: recordData.teacher,
          days: recordData.days,
          roomNo: recordData.room,
          capacity: recordData.capacity,
          status: 'Active'
        };
        try {
          await dbService.upsert('bell_schedule', periodRecord);
          await auditService.log(initialData ? 'PERIOD_UPDATED' : 'PERIOD_CREATED', 'ACADEMIC', periodRecord);
        } catch (err) {
          console.warn('Period save fallback:', err);
        }
        if (this._container) await this.render(this._container);
      }
    });
  }

`;
  code = code.slice(0, pStart) + newPeriodCode + code.slice(pEnd);
  console.log('Updated openAddPeriodModal');
}

fs.writeFileSync('academic-module.js', code, 'utf8');
console.log('Saved academic-module.js');
