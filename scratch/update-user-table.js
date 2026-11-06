const fs = require('fs');

let code = fs.readFileSync('admin-module.js', 'utf8');

// 1. Add _renderUserAvatar method right before renderUsersTab
const renderUsersTabStart = 'static async renderUsersTab(tabContent) {';

const avatarMethod = `
  /**
   * High-res institutional avatar renderer with fallback to two-letter gradient badge
   */
  static _renderUserAvatar(p, size = 34) {
    const esc = (v) => UIComponents.escapeHtml(v || '');
    const currentUser = authService.getCurrentUser();
    const isCurrent = p.email && currentUser?.email && p.email.toLowerCase() === currentUser.email.toLowerCase();
    const avatarUrl = p.avatar || p.avatar_url || (isCurrent ? (currentUser?.avatar || currentUser?.avatar_url) : '') || '';
    const nameStr = p.name || p.email || 'User';
    const initials = nameStr.split(' ').filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'U';

    if (avatarUrl) {
      return \`
        <div style="width:\${size}px; height:\${size}px; border-radius:50%; position:relative; flex-shrink:0;">
          <img src="\${esc(avatarUrl)}" alt="\${esc(nameStr)}" style="width:\${size}px; height:\${size}px; border-radius:50%; object-fit:cover; border:1.5px solid var(--border-color, #E2E8F0); background:#F1F5F9; display:block;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
          <div style="display:none; width:\${size}px; height:\${size}px; border-radius:50%; background: linear-gradient(135deg, #10B981 0%, #047857 100%); color:#FFFFFF; align-items:center; justify-content:center; font-weight:800; font-size:\${Math.round(size * 0.42)}px; letter-spacing:0.02em; border:1.5px solid #A7F3D0; box-shadow:0 2px 6px rgba(16, 185, 129, 0.2);">
            \${esc(initials)}
          </div>
        </div>
      \`;
    }

    return \`
      <div style="width:\${size}px; height:\${size}px; border-radius:50%; background: linear-gradient(135deg, #10B981 0%, #047857 100%); color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:\${Math.round(size * 0.42)}px; letter-spacing:0.02em; border:1.5px solid #A7F3D0; box-shadow:0 2px 6px rgba(16, 185, 129, 0.2); flex-shrink:0;">
        \${esc(initials)}
      </div>
    \`;
  }
`;

code = code.replace(renderUsersTabStart, avatarMethod + '\n  ' + renderUsersTabStart);

// 2. Enrich profiles with currentUser metadata in renderUsersTab
const profileFetchSnippet = `profiles = await dbService.select('profiles');
    } catch (e) {
      profiles = [];
    }`;

const profileEnrichSnippet = `profiles = await dbService.select('profiles');
    } catch (e) {
      profiles = [];
    }

    // Enrich profiles with active session data (avatar, department)
    for (const p of profiles) {
      if (p.email && currentUser?.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) {
        p.avatar = p.avatar || currentUser?.avatar || currentUser?.avatar_url;
        p.department = p.department || currentUser?.department;
        p.title = p.title || currentUser?.title;
      }
    }`;

code = code.replace(profileFetchSnippet, profileEnrichSnippet);

// 3. Update pending desktop table avatar
code = code.replace(
  '<img src="${esc(p.avatar || \'\')}" alt="" style="width:30px;height:30px;border-radius:50%;object-fit:cover;background:#f1f5f9;">',
  '${this._renderUserAvatar(p, 32)}'
);

// 4. Update pending mobile cards avatar
code = code.replace(
  '<img src="${esc(p.avatar || \'\')}" alt="" style="width:40px;height:40px;border-radius:10px;object-fit:cover;background:#f1f5f9;">',
  '${this._renderUserAvatar(p, 40)}'
);

// 5. Update active desktop table row
const oldActiveRow = `                  <tr data-id="\${esc(p.id)}">
                    <td style="font-weight:600;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <img src="\${esc(p.avatar || '')}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--border-color);background:#f1f5f9;">
                        <div>
                          <div style="display:flex; align-items:center; gap:5px;">
                            <span>\${esc(p.name || '—')}</span>
                            \${isTargetSuper ? '<span class="badge" style="background:#0F172A; color:#FFFFFF; font-size:0.6rem; padding:2px 5px; font-weight:700;">SUPER ADMIN</span>' : ''}
                          </div>
                          <div class="font-mono" style="font-size:0.75rem; color:var(--text-muted);">\${esc(p.email || '—')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" style="background:\${theme.badgeBg}; color:\${theme.badgeColor}; border:1px solid \${theme.border}; font-weight:700; font-size:0.72rem;">
                        \${esc(ROLE_LABELS[p.role] || p.role || 'Staff').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      \${hasCustom ? \`
                        <span class="badge" style="background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; font-weight:700; font-size:0.65rem;" title="Individual window permissions active">
                          CUSTOM PERMS
                        </span>
                      \` : \`
                        <span style="font-size:0.75rem; color:var(--text-muted);">(Role Default)</span>
                      \`}
                    </td>
                    <td style="font-size:0.78rem;">
                      \${login && login.username ? \`
                        <div style="display:flex; flex-direction:column; gap:3px;">
                          <div style="display:flex; align-items:center; gap:5px;">
                            <span class="font-mono" style="font-weight:700;">\${esc(login.username)}</span>
                            <button class="btn btn-secondary btn-sm btn-reveal-pass" data-user="\${esc(p.id)}" title="Show password" style="padding:1px 5px;"><i data-lucide="eye" style="width:11px;height:11px;"></i></button>
                            <span class="user-pass font-mono" data-user="\${esc(p.id)}" style="display:none; color:#b45309; font-weight:700;">\${esc(login.password || '—')}</span>
                          </div>
                          <div style="display:flex; gap:4px; align-items:center; margin-top:2px;">
                            <button class="btn btn-secondary btn-sm btn-copy-user-cred" data-user="\${esc(p.id)}" title="Copy login" style="padding:1px 6px; font-size:0.7rem; color:#0284c7; border-color:#bae6fd;">
                              <i data-lucide="share-2" style="width:10px;height:10px;"></i> Copy
                            </button>
                            \${p.phone ? \`
                              <button class="btn btn-secondary btn-sm btn-wa-user-cred" data-user="\${esc(p.id)}" title="WhatsApp" style="padding:1px 6px; font-size:0.7rem; color:#16a34a; border-color:#bbf7d0;">
                                <i data-lucide="send" style="width:10px;height:10px;"></i> WA
                              </button>
                            \` : ''}
                          </div>
                        </div>
                      \` : '<span style="color:var(--text-muted);">—</span>'}
                    </td>
                    <td style="font-size:0.78rem;">\${esc([p.assignedClass, p.assignedSection].filter(Boolean).join(' / ') || '—')}</td>`;

const newActiveRow = `                  <tr data-id="\${esc(p.id)}">
                    <td style="font-weight:600;">
                      <div style="display:flex; align-items:center; gap:10px;">
                        \${this._renderUserAvatar(p, 34)}
                        <div>
                          <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:0.88rem; font-weight:700; color:#0F172A;">\${esc(p.name || '—')}</span>
                            \${isTargetSuper ? '<span class="badge" style="background:#0F172A; color:#FFFFFF; font-size:0.6rem; padding:2px 6px; font-weight:800; border-radius:9999px;">SUPER ADMIN</span>' : ''}
                          </div>
                          <div class="font-mono" style="font-size:0.75rem; color:var(--text-muted); margin-top:1px;">\${esc(p.email || '—')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" style="background:\${theme.badgeBg}; color:\${theme.badgeColor}; border:1px solid \${theme.border}; font-weight:700; font-size:0.72rem;">
                        \${esc(ROLE_LABELS[p.role] || p.role || 'Staff').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      \${hasCustom ? \`
                        <span class="badge" style="background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; font-weight:700; font-size:0.68rem;" title="Individual window permissions active">
                          CUSTOM PERMS
                        </span>
                      \` : \`
                        <span class="badge" style="background:#F1F5F9; color:#475569; border:1px solid #E2E8F0; font-weight:700; font-size:0.7rem;">
                          <i data-lucide="shield" style="width:10px; height:10px; color:#059669;"></i> Role Default \${isTargetSuper ? '(Full Access)' : ''}
                        </span>
                      \`}
                    </td>
                    <td style="font-size:0.78rem;">
                      \${login && login.username ? \`
                        <div style="display:flex; flex-direction:column; gap:3px;">
                          <div style="display:flex; align-items:center; gap:5px;">
                            <span class="font-mono" style="font-weight:700;">\${esc(login.username)}</span>
                            <button class="btn btn-secondary btn-sm btn-reveal-pass" data-user="\${esc(p.id)}" title="Show password" style="padding:1px 5px;"><i data-lucide="eye" style="width:11px;height:11px;"></i></button>
                            <span class="user-pass font-mono" data-user="\${esc(p.id)}" style="display:none; color:#b45309; font-weight:700;">\${esc(login.password || '—')}</span>
                          </div>
                          <div style="display:flex; gap:4px; align-items:center; margin-top:2px;">
                            <button class="btn btn-secondary btn-sm btn-copy-user-cred" data-user="\${esc(p.id)}" title="Copy login" style="padding:1px 6px; font-size:0.7rem; color:#0284c7; border-color:#bae6fd;">
                              <i data-lucide="share-2" style="width:10px;height:10px;"></i> Copy
                            </button>
                            \${p.phone ? \`
                              <button class="btn btn-secondary btn-sm btn-wa-user-cred" data-user="\${esc(p.id)}" title="WhatsApp" style="padding:1px 6px; font-size:0.7rem; color:#16a34a; border-color:#bbf7d0;">
                                <i data-lucide="send" style="width:10px;height:10px;"></i> WA
                              </button>
                            \` : ''}
                          </div>
                        </div>
                      \` : isTargetSuper ? \`
                        <div style="display:flex; flex-direction:column; gap:2px;">
                          <span class="badge" style="background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; font-size:0.72rem; font-weight:700;">
                            <i data-lucide="shield-check" style="width:11px; height:11px;"></i> Super Admin Root
                          </span>
                          <span class="font-mono" style="font-size:0.72rem; color:#64748B;">\${esc(p.email)}</span>
                        </div>
                      \` : p.email ? \`
                        <div style="display:flex; flex-direction:column; gap:2px;">
                          <span class="badge" style="background:#F8FAFC; color:#475569; border:1px solid #E2E8F0; font-size:0.7rem; font-weight:700;">
                            <i data-lucide="mail" style="width:10px; height:10px;"></i> Direct Email Auth
                          </span>
                          <span class="font-mono" style="font-size:0.72rem; color:#64748B;">\${esc(p.email)}</span>
                        </div>
                      \` : '<span style="color:var(--text-muted);">—</span>'}
                    </td>
                    <td style="font-size:0.78rem;">
                      <span style="display:inline-flex; align-items:center; gap:5px; font-weight:600; color:#334155;">
                        <i data-lucide="\${p.assignedClass ? 'graduation-cap' : 'building-2'}" style="width:13px; height:13px; color:#16a34a;"></i>
                        \${esc([p.assignedClass, p.assignedSection].filter(Boolean).join(' / ') || p.department || p.title || (isTargetSuper ? 'Executive Governance & Leadership' : 'Campus Operations'))}
                      </span>
                    </td>`;

code = code.replace(oldActiveRow, newActiveRow);

// 6. Update mobile active cards
code = code.replace(
  '<img src="${esc(p.avatar || \'\')}" alt="" style="width:40px;height:40px;border-radius:10px;object-fit:cover;background:#f1f5f9;">',
  '${this._renderUserAvatar(p, 42)}'
);

// 7. Update role modal header
code = code.replace(
  '<img src="${esc(p.avatar || \'\')}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;background:#f1f5f9;">',
  '${this._renderUserAvatar(p, 36)}'
);

fs.writeFileSync('admin-module.js', code);
console.log('Successfully updated admin-module.js user accounts table!');
