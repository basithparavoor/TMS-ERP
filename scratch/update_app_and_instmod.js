const fs = require('fs');

// 1. Update app.js
let appJs = fs.readFileSync('app.js', 'utf8');

if (!appJs.includes("import { institutionService } from './institution-service.js';")) {
  appJs = appJs.replace(
    "import { brandingService } from './branding-service.js';",
    "import { brandingService } from './branding-service.js';\nimport { institutionService } from './institution-service.js';"
  );
}

if (!appJs.includes("institutionService.refresh();")) {
  appJs = appJs.replace(
    "brandingService.refresh();",
    "brandingService.refresh();\n    institutionService.refresh();"
  );
}

const brandBoxBinding = `    const brandBox = document.getElementById('sidebar-brand-box');
    if (brandBox) {
      brandBox.style.cursor = 'pointer';
      brandBox.title = 'View Official Institution Profile & Campus Status';
      brandBox.addEventListener('click', () => {
        UIComponents.openModal({
          title: 'Institutional Accreditation & Campus Status',
          bodyHtml: \`<div style="display:flex; justify-content:center; padding:8px 0;">\${institutionService.renderStatusCardHtml()}</div>\`,
          footerHtml: '<button class="btn btn-secondary" id="btn-close-inst-modal" style="border-radius:8px;">Close</button>',
          maxWidth: '680px'
        });
        document.getElementById('btn-close-inst-modal')?.addEventListener('click', () => UIComponents.closeModal());
      });
    }`;

if (!appJs.includes("sidebar-brand-box") || !appJs.includes("View Official Institution Profile")) {
  appJs = appJs.replace(
    "this.bindShellEvents();",
    "this.bindShellEvents();\n" + brandBoxBinding
  );
}

fs.writeFileSync('app.js', appJs, 'utf8');
console.log('app.js updated with institutionService integration!');

// 2. Update institution-module.js
let instMod = fs.readFileSync('institution-module.js', 'utf8');

if (!instMod.includes("import { institutionService } from './institution-service.js';")) {
  instMod = instMod.replace(
    "import { UIComponents } from './ui-components.js';",
    "import { UIComponents } from './ui-components.js';\nimport { institutionService } from './institution-service.js';"
  );
}

const targetKpiGridEnd = `        \${UIComponents.renderKpiCard({ title: 'Total Seating Capacity', value: \`\${totalSeating.toLocaleString()}\`, icon: 'users', color: 'rose' })}
      </div>`;

const statusCardShowcase = `        \${UIComponents.renderKpiCard({ title: 'Total Seating Capacity', value: \`\${totalSeating.toLocaleString()}\`, icon: 'users', color: 'rose' })}
      </div>

      <!-- Official Institution Profile & Campus Status Card -->
      <div style="margin-bottom: 24px; display: flex; justify-content: flex-start;">
        \${institutionService.renderStatusCardHtml()}
      </div>`;

if (instMod.includes(targetKpiGridEnd) && !instMod.includes("renderStatusCardHtml()")) {
  instMod = instMod.replace(targetKpiGridEnd, statusCardShowcase);
}

fs.writeFileSync('institution-module.js', instMod, 'utf8');
console.log('institution-module.js updated with status card!');
