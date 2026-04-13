// ============================================
// LOVA CRM — Emails View
// ============================================

import { store } from '../store.js';
import { formatDateTime, statusBadge, searchIcon, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

let filterType = '';
let filterStatus = '';
let searchQuery = '';

export function renderEmails() {
  const content = document.getElementById('app-content');
  const emails = store.getAll('emails');
  const campaigns = store.getAll('campaigns');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-email">${plusIcon} Novi email</button>
  `;

  let filtered = emails;
  if (filterType) filtered = filtered.filter(e => e.type === filterType);
  if (filterStatus) filtered = filtered.filter(e => e.status === filterStatus);
  if (searchQuery) {
    filtered = filtered.filter(e =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));

  const unread = emails.filter(e => e.status === 'Unread').length;
  const sent = emails.filter(e => e.type === 'Outreach' || e.type === 'Support' || e.type === 'Payment').length;
  const inbound = emails.filter(e => e.type === 'Inbound').length;
  const replied = emails.filter(e => e.status === 'Replied').length;

  const typeColors = { 'Outreach': '#69F0AE', 'Inbound': '#448AFF', 'Support': '#FFD740', 'Payment': '#FF9100' };

  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-item">Nepročitano: <span class="stat-value" style="color:var(--red);">${unread}</span></div>
      <div class="stat-item">Poslato: <span class="stat-value" style="color:var(--green);">${sent}</span></div>
      <div class="stat-item">Primljeno: <span class="stat-value" style="color:var(--blue);">${inbound}</span></div>
      <div class="stat-item">Odgovoreno: <span class="stat-value" style="color:var(--gold);">${replied}</span></div>
      <div class="stat-item">Ukupno: <span class="stat-value">${emails.length}</span></div>
    </div>

    <div class="filters-bar">
      <div class="search-input">
        ${searchIcon}
        <input type="text" id="search-emails" placeholder="Pretraži emailove..." value="${searchQuery}">
      </div>
      <select class="filter-select" id="filter-email-type">
        <option value="">Svi tipovi</option>
        <option value="Outreach" ${filterType === 'Outreach' ? 'selected' : ''}>Outreach</option>
        <option value="Inbound" ${filterType === 'Inbound' ? 'selected' : ''}>Inbound</option>
        <option value="Support" ${filterType === 'Support' ? 'selected' : ''}>Support</option>
        <option value="Payment" ${filterType === 'Payment' ? 'selected' : ''}>Payment</option>
      </select>
      <select class="filter-select" id="filter-email-status">
        <option value="">Svi statusi</option>
        <option value="Unread" ${filterStatus === 'Unread' ? 'selected' : ''}>Nepročitano</option>
        <option value="Read" ${filterStatus === 'Read' ? 'selected' : ''}>Pročitano</option>
        <option value="Sent" ${filterStatus === 'Sent' ? 'selected' : ''}>Poslato</option>
        <option value="Replied" ${filterStatus === 'Replied' ? 'selected' : ''}>Odgovoreno</option>
        <option value="Draft" ${filterStatus === 'Draft' ? 'selected' : ''}>Draft</option>
      </select>
    </div>

    ${filtered.length > 0 ? `
      <div class="email-list">
        ${filtered.map(e => {
          const campaign = store.getById('campaigns', e.campaignId);
          const typeColor = typeColors[e.type] || 'var(--text-muted)';
          const isUnread = e.status === 'Unread';

          return `
            <div class="card email-card" style="position:relative;overflow:hidden;cursor:pointer;${isUnread ? 'border-left:3px solid var(--red);' : ''}" data-view="${e.id}">
              <div style="position:absolute;top:0;left:${isUnread ? '3px' : '0'};right:0;height:2px;background:${typeColor};opacity:0.5;"></div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                    ${isUnread ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--red);flex-shrink:0;"></span>' : ''}
                    <span style="font-size:0.75rem;font-weight:600;color:${typeColor};text-transform:uppercase;letter-spacing:0.5px;">${e.type}</span>
                    ${campaign ? `<span style="font-size:0.75rem;color:var(--text-dim);">· ${campaign.name}</span>` : ''}
                  </div>
                  <div style="font-size:1.02rem;font-weight:${isUnread ? '700' : '500'};color:var(--white);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.subject}</div>
                  <div style="display:flex;gap:16px;font-size:0.82rem;color:var(--text-dim);">
                    <span>Od: <span style="color:var(--text-muted);">${e.from}</span></span>
                    <span>Za: <span style="color:var(--text-muted);">${e.to}</span></span>
                  </div>
                  ${e.body ? `<div style="margin-top:8px;font-size:0.85rem;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:600px;">${e.body}</div>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
                  <div style="font-size:0.8rem;color:var(--text-dim);">${formatDateTime(e.sentDate)}</div>
                  ${statusBadge(e.status)}
                  <div class="table-actions" style="margin-top:4px;">
                    <button title="Izmeni" data-edit="${e.id}" onclick="event.stopPropagation();">${editIcon}</button>
                    <button class="delete" title="Obriši" data-delete="${e.id}" onclick="event.stopPropagation();">${deleteIcon}</button>
                  </div>
                </div>
              </div>
              ${e.reply ? `
                <div style="margin-top:12px;padding:10px 14px;background:var(--bg-surface-3);border-radius:8px;border-left:3px solid ${typeColor};">
                  <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Odgovor</div>
                  <div style="font-size:0.88rem;color:var(--text);">${e.reply}</div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <h3>Nema emailova</h3>
        <p>Pošaljite ili evidentirajte prvi email</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-email')?.addEventListener('click', () => openEmailForm());
  document.getElementById('search-emails')?.addEventListener('input', debounce((e) => { searchQuery = e.target.value; renderEmails(); }));
  document.getElementById('filter-email-type')?.addEventListener('change', (e) => { filterType = e.target.value; renderEmails(); });
  document.getElementById('filter-email-status')?.addEventListener('change', (e) => { filterStatus = e.target.value; renderEmails(); });

  content.querySelectorAll('[data-view]').forEach(card => {
    card.addEventListener('click', () => viewEmail(card.dataset.view));
  });
  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', (ev) => { ev.stopPropagation(); openEmailForm(btn.dataset.edit); });
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      if (await showConfirm('Obrisati ovaj email?')) {
        store.delete('emails', btn.dataset.delete);
        showToast('Email obrisan', 'success');
        renderEmails();
      }
    });
  });
}

function viewEmail(id) {
  const email = store.getById('emails', id);
  if (!email) return;

  // Mark as read
  if (email.status === 'Unread') {
    store.update('emails', id, { status: 'Read' });
  }

  const campaign = store.getById('campaigns', email.campaignId);
  const typeColors = { 'Outreach': '#69F0AE', 'Inbound': '#448AFF', 'Support': '#FFD740', 'Payment': '#FF9100' };
  const typeColor = typeColors[email.type] || 'var(--text-muted)';

  const body = `
    <div style="padding:8px 0;">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;">
        <span style="font-size:0.78rem;font-weight:600;color:${typeColor};text-transform:uppercase;padding:4px 10px;border-radius:12px;background:rgba(255,255,255,0.05);">${email.type}</span>
        ${statusBadge(email.status)}
        ${campaign ? `<span style="font-size:0.82rem;color:var(--text-dim);">Kampanja: ${campaign.name}</span>` : ''}
      </div>

      <h3 style="font-size:1.2rem;color:var(--white);margin-bottom:16px;">${email.subject}</h3>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        <div>
          <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Od</div>
          <div style="font-size:0.92rem;color:var(--text);">${email.from}</div>
        </div>
        <div>
          <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Za</div>
          <div style="font-size:0.92rem;color:var(--text);">${email.to}</div>
        </div>
        <div>
          <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Datum</div>
          <div style="font-size:0.92rem;color:var(--text);">${formatDateTime(email.sentDate)}</div>
        </div>
      </div>

      <div style="background:var(--bg-surface-3);padding:16px;border-radius:10px;margin-bottom:16px;">
        <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Poruka</div>
        <div style="font-size:0.92rem;color:var(--text);line-height:1.7;white-space:pre-wrap;">${email.body || '—'}</div>
      </div>

      ${email.reply ? `
        <div style="background:var(--bg-surface-3);padding:16px;border-radius:10px;border-left:3px solid ${typeColor};">
          <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Odgovor</div>
          <div style="font-size:0.92rem;color:var(--text);line-height:1.7;white-space:pre-wrap;">${email.reply}</div>
        </div>
      ` : ''}
    </div>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Zatvori</button>
    <button class="btn btn-primary" id="btn-edit-from-view">Izmeni</button>
  `;

  openModal(email.subject, body, footer);

  document.getElementById('btn-edit-from-view').addEventListener('click', () => {
    closeModal();
    setTimeout(() => openEmailForm(id), 200);
  });

  renderEmails();
}

function openEmailForm(editId = null) {
  const email = editId ? store.getById('emails', editId) : null;
  const campaigns = store.getAll('campaigns');

  const body = `
    <form id="email-form" class="form-grid">
      <div class="form-group full-width">
        <label>Naslov (Subject)</label>
        <input type="text" name="subject" value="${email?.subject || ''}" required placeholder="Unesite naslov emaila...">
      </div>
      <div class="form-group">
        <label>Od (From)</label>
        <input type="email" name="from" value="${email?.from || 'andrija@lova.agency'}" required>
      </div>
      <div class="form-group">
        <label>Za (To)</label>
        <input type="email" name="to" value="${email?.to || ''}" required placeholder="email@primer.com">
      </div>
      <div class="form-group">
        <label>Tip</label>
        <select name="type">
          <option value="Outreach" ${email?.type === 'Outreach' ? 'selected' : ''}>Outreach</option>
          <option value="Inbound" ${email?.type === 'Inbound' ? 'selected' : ''}>Inbound</option>
          <option value="Support" ${email?.type === 'Support' ? 'selected' : ''}>Support</option>
          <option value="Payment" ${email?.type === 'Payment' ? 'selected' : ''}>Payment</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Draft" ${email?.status === 'Draft' ? 'selected' : ''}>Draft</option>
          <option value="Sent" ${email?.status === 'Sent' ? 'selected' : ''}>Sent</option>
          <option value="Unread" ${email?.status === 'Unread' ? 'selected' : ''}>Nepročitano</option>
          <option value="Read" ${email?.status === 'Read' ? 'selected' : ''}>Pročitano</option>
          <option value="Replied" ${email?.status === 'Replied' ? 'selected' : ''}>Odgovoreno</option>
        </select>
      </div>
      <div class="form-group">
        <label>Kampanja</label>
        <select name="campaignId">
          <option value="">— Bez kampanje —</option>
          ${campaigns.map(c => `<option value="${c.id}" ${email?.campaignId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Datum slanja</label>
        <input type="datetime-local" name="sentDate" value="${email?.sentDate ? email.sentDate.slice(0, 16) : ''}">
      </div>
      <div class="form-group full-width">
        <label>Poruka</label>
        <textarea name="body" rows="4" placeholder="Tekst emaila...">${email?.body || ''}</textarea>
      </div>
      <div class="form-group full-width">
        <label>Odgovor (ako postoji)</label>
        <textarea name="reply" rows="3" placeholder="Primljeni odgovor...">${email?.reply || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-email">Sačuvaj</button>
  `;

  openModal(email ? 'Izmeni email' : 'Novi email', body, footer);

  document.getElementById('btn-save-email').addEventListener('click', () => {
    const data = getFormData('email-form');
    if (!data.subject) { showToast('Unesite naslov!', 'error'); return; }
    if (!data.to) { showToast('Unesite primaoca!', 'error'); return; }
    if (data.sentDate) data.sentDate = new Date(data.sentDate).toISOString();

    if (editId) {
      store.update('emails', editId, data);
      showToast('Email ažuriran!', 'success');
    } else {
      store.create('emails', data);
      showToast('Email sačuvan!', 'success');
    }
    closeModal();
    renderEmails();
  });
}
