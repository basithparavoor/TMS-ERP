const fs = require('fs');

let code = fs.readFileSync('ui-components.js', 'utf8');
const p1 = code.indexOf('static renderPageHeader');
const p2 = code.indexOf('static renderToolbar');

const replacement = `static renderPageHeader({ title, subtitle = '', breadcrumbs = [], actionsHtml = '', actions = '', badge = '', icon = '' }) {
    const esc = this.escapeHtml;

    // Auto-detect module icon if not explicitly provided
    let headerIcon = icon;
    if (!headerIcon && title) {
      const t = title.toLowerCase();
      if (t.includes('workspace') || t.includes('my work')) headerIcon = 'briefcase';
      else if (t.includes('student')) headerIcon = 'graduation-cap';
      else if (t.includes('attendance') || t.includes('radar')) headerIcon = 'user-check';
      else if (t.includes('admission')) headerIcon = 'clipboard-pen';
      else if (t.includes('academic') || t.includes('curriculum')) headerIcon = 'book-open';
      else if (t.includes('timetable') || t.includes('schedule')) headerIcon = 'calendar';
      else if (t.includes('finance') || t.includes('fee')) headerIcon = 'credit-card';
      else if (t.includes('exam')) headerIcon = 'award';
      else if (t.includes('homework')) headerIcon = 'notebook-pen';
      else if (t.includes('staff') || t.includes('faculty') || t.includes('payroll')) headerIcon = 'users';
      else if (t.includes('id card') || t.includes('badge')) headerIcon = 'contact-2';
      else if (t.includes('certificate')) headerIcon = 'file-badge';
      else if (t.includes('report') || t.includes('analytics')) headerIcon = 'bar-chart-3';
      else if (t.includes('admin') || t.includes('security')) headerIcon = 'shield-check';
      else if (t.includes('institution') || t.includes('school')) headerIcon = 'school';
      else if (t.includes('communication') || t.includes('message')) headerIcon = 'message-square';
      else if (t.includes('operation')) headerIcon = 'truck';
      else if (t.includes('overview') || t.includes('dashboard')) headerIcon = 'layout-dashboard';
    }

    // Clean empty dashes or placeholder parentheses in subtitle
    const cleanSubtitle = subtitle ? subtitle.replace(/\\s*\\(\\s*[—\\-–\\s]+\\s*\\)/g, '').trim() : '';
    const finalActions = actionsHtml || actions || '';

    const breadcrumbsHtml = breadcrumbs.length ? \`
      <nav class="tms-breadcrumbs" aria-label="Breadcrumb">
        <ol class="tms-breadcrumbs-list">
          <li>
            <a href="#/dashboard" class="tms-breadcrumb-link">
              <span class="tms-breadcrumb-icon"><i data-lucide="home"></i></span>
              <span>TMS ERP</span>
            </a>
          </li>
          \${breadcrumbs.map((b, idx) => \`
            <li class="tms-breadcrumb-item">
              <span class="tms-breadcrumb-sep"><i data-lucide="chevron-right"></i></span>
              \${b.href && idx < breadcrumbs.length - 1 
                ? \`<a href="\${esc(b.href)}" class="tms-breadcrumb-link">\${esc(b.label)}</a>\` 
                : \`<span class="tms-breadcrumb-current">\${esc(b.label)}</span>\`
              }
            </li>
          \`).join('')}
        </ol>
      </nav>
    \` : '';

    return \`
      <div class="tms-page-header">
        <div class="tms-page-header-row">
          <div class="tms-page-header-content">
            \${breadcrumbsHtml}
            <div class="tms-page-title-row">
              \${headerIcon ? \`
                <div class="tms-page-header-icon">
                  <i data-lucide="\${esc(headerIcon)}"></i>
                </div>
              \` : ''}
              <div class="tms-page-title-text-wrap">
                <div class="tms-page-title-wrap">
                  <h1 class="tms-page-title">\${esc(title)}</h1>
                  \${badge ? \`<span class="badge badge-success tms-page-badge">\${badge}</span>\` : ''}
                </div>
                \${cleanSubtitle ? \`<p class="tms-page-subtitle">\${esc(cleanSubtitle)}</p>\` : ''}
              </div>
            </div>
          </div>
          \${finalActions ? \`<div class="tms-page-actions">\${finalActions}</div>\` : ''}
        </div>
      </div>
    \`;
  }

  /**
   * Render standardized filter toolbar with search, filters and export actions.
   */
  `;

code = code.slice(0, p1) + replacement + code.slice(p2);
fs.writeFileSync('ui-components.js', code, 'utf8');
console.log('ui-components.js successfully updated!');
