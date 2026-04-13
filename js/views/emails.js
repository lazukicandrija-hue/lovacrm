// ============================================
// LOVA CRM — Emails View (Account Storage)
// ============================================

import { store } from '../store.js';
import { formatDate, statusBadge, searchIcon, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

let filterStatus = '';
let searchQuery = '';

export function renderEmails() {
  const content = document.getElementById('app-content');
  const emails = store.getAll('emails');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-email">${plusIcon} Novi email nalog</button>
  `;

  let filtered = emails;
  if (filterStatus) filtered = filtered.filter(e => e.status === filterStatus);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(e =>
      (e.email || '').toLowerCase().includes(q) ||
      (e.provider || '').toLowerCase().includes(q) ||
      (e.recoveryEmail || '').toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q)
    );
  }

  const total = emails.length;
  const active = emails.filter(e => e.status === 'Active').length;
  const inactive = emails.filter(e => e.status !== 'Active').length;

  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-item">Ukupno: <span class="stat-value">${total}</span></div>
      <div class="stat-item">Aktivni: <span class="stat-value" style="color:var(--green);">${active}</span></div>
      <div class="stat-item">Neaktivni: <span class="stat-value" style="color:var(--red);">${inactive}</span></div>
    </div>

    <div class="filters-bar">
      <div class="search-input">
        ${searchIcon}
        <input type="text" id="search-emails" placeholder="Pretraži emailove..." value="${searchQuery}">
      </div>
      <select class="filter-select" id="filter-email-status">
        <option value="">Svi statusi</option>
        <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
        <option value="Inactive" ${filterStatus === 'Inactive' ? 'selected' : ''}>Inactive</option>
        <option value="Banned" ${filterStatus === 'Banned' ? 'selected' : ''}>Banned</option>
      </select>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>EMAIL</th>
            <th>ŠIFRA</th>
            <th>RECOVERY EMAIL</th>
            <th>TELEFON</th>
            <th>PROVAJDER</th>
            <th>STATUS</th>
            <th>KORISTI SE ZA</th>
            <th>AKCIJE</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length > 0 ? filtered.map(e => {
            // Find accounts using this email
            const accounts = store.getAll('accounts').filter(a => a.email === e.email);
            const usedFor = accounts.map(a => a.username).join(', ') || '—';

            return `
              <tr>
                <td>
                  <div style="font-weight:600;color:var(--white);">${e.email}</div>
                </td>
                <td>
                  <div class="password-cell" style="display:flex;align-items:center;gap:8px;">
                    <span class="password-text" data-pass="${e.password}" style="font-family:monospace;color:var(--text-muted);letter-spacing:1px;">••••••••</span>
                    <button class="btn-icon toggle-pass" title="Prikaži/sakrij" style="padding:2px;opacity:0.6;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-icon copy-pass" data-copy="${e.password}" title="Kopiraj" style="padding:2px;opacity:0.6;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                </td>
                <td style="color:var(--text-muted);">${e.recoveryEmail || '—'}</td>
                <td style="color:var(--text-muted);">${e.phone || '—'}</td>
                <td>${e.provider || '—'}</td>
                <td>${statusBadge(e.status)}</td>
                <td style="color:var(--text-dim);font-size:0.82rem;">${usedFor}</td>
                <td>
                  <div class="table-actions">
                    <button title="Izmeni" data-edit="${e.id}">${editIcon}</button>
                    <button class="delete" title="Obriši" data-delete="${e.id}">${deleteIcon}</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('') : `
            <tr><td colspan="8" class="empty-state" style="text-align:center;padding:60px 20px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <h3 style="margin-top:12px;">Nema email naloga</h3>
              <p style="color:var(--text-dim);">Dodajte prvi email nalog</p>
            </td></tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  // Events
  document.getElementById('btn-add-email')?.addEventListener('click', () => openEmailForm());
  document.getElementById('search-emails')?.addEventListener('input', debounce((e) => { searchQuery = e.target.value; renderEmails(); }));
  document.getElementById('filter-email-status')?.addEventListener('change', (e) => { filterStatus = e.target.value; renderEmails(); });

  // Toggle password visibility
  content.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const cell = btn.closest('.password-cell');
      const span = cell.querySelector('.password-text');
      const isHidden = span.textContent === '••••••••';
      span.textContent = isHidden ? span.dataset.pass : '••••••••';
    });
  });

  // Copy password
  content.querySelectorAll('.copy-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => {
        showToast('Šifra kopirana!', 'success');
      }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = btn.dataset.copy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Šifra kopirana!', 'success');
      });
    });
  });

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openEmailForm(btn.dataset.edit));
  });

  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovaj email nalog?')) {
        store.delete('emails', btn.dataset.delete);
        showToast('Email nalog obrisan', 'success');
        renderEmails();
      }
    });
  });
}

function openEmailForm(editId = null) {
  const email = editId ? store.getById('emails', editId) : null;

  const body = `
    <form id="email-form" class="form-grid">
      <div class="form-group">
        <label>Email adresa</label>
        <input type="email" name="email" value="${email?.email || ''}" required placeholder="email@primer.com">
      </div>
      <div class="form-group">
        <label>Šifra (Password)</label>
        <input type="text" name="password" value="${email?.password || ''}" required placeholder="Unesite šifru">
      </div>
      <div class="form-group">
        <label>Recovery Email</label>
        <input type="email" name="recoveryEmail" value="${email?.recoveryEmail || ''}" placeholder="recovery@primer.com">
      </div>
      <div class="form-group">
        <label>Broj telefona</label>
        <input type="text" name="phone" value="${email?.phone || ''}" placeholder="+381 6X XXX XXXX">
      </div>
      <div class="form-group">
        <label>Provajder</label>
        <select name="provider">
          <option value="Gmail" ${email?.provider === 'Gmail' ? 'selected' : ''}>Gmail</option>
          <option value="Outlook" ${email?.provider === 'Outlook' ? 'selected' : ''}>Outlook</option>
          <option value="Yahoo" ${email?.provider === 'Yahoo' ? 'selected' : ''}>Yahoo</option>
          <option value="ProtonMail" ${email?.provider === 'ProtonMail' ? 'selected' : ''}>ProtonMail</option>
          <option value="iCloud" ${email?.provider === 'iCloud' ? 'selected' : ''}>iCloud</option>
          <option value="Drugo" ${email?.provider === 'Drugo' ? 'selected' : ''}>Drugo</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Active" ${email?.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${email?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          <option value="Banned" ${email?.status === 'Banned' ? 'selected' : ''}>Banned</option>
        </select>
      </div>
      <div class="form-group full-width">
        <label>Napomene</label>
        <textarea name="notes" rows="3" placeholder="Dodatne informacije...">${email?.notes || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-email">Sačuvaj</button>
  `;

  openModal(email ? 'Izmeni email nalog' : 'Novi email nalog', body, footer);

  document.getElementById('btn-save-email').addEventListener('click', () => {
    const data = getFormData('email-form');
    if (!data.email) { showToast('Unesite email adresu!', 'error'); return; }
    if (!data.password) { showToast('Unesite šifru!', 'error'); return; }

    if (editId) {
      store.update('emails', editId, data);
      showToast('Email nalog ažuriran!', 'success');
    } else {
      store.create('emails', data);
      showToast('Email nalog sačuvan!', 'success');
    }
    closeModal();
    renderEmails();
  });
}
