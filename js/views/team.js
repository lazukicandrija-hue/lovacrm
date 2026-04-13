// ============================================
// LOVA CRM — Team View
// ============================================

import { store } from '../store.js';
import { formatCurrency, statusBadge, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData } from '../utils.js';

export function renderTeam() {
  const content = document.getElementById('app-content');
  const team = store.getAll('team');
  const accounts = store.getAll('accounts');
  const earnings = store.getAll('earnings');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-member">${plusIcon} Novi član</button>
  `;

  content.innerHTML = `
    ${team.length > 0 ? `
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        ${team.map(member => {
          const memberAccounts = accounts.filter(a => a.teamMemberId === member.id);
          const activeAccounts = memberAccounts.filter(a => a.status === 'Active');
          const memberEarnings = earnings.filter(e => e.teamMemberId === member.id);
          const totalEarned = memberEarnings.reduce((sum, e) => sum + (parseFloat(e.netMember) || 0), 0);
          const paidEarned = memberEarnings.filter(e => e.status === 'Paid').reduce((sum, e) => sum + (parseFloat(e.netMember) || 0), 0);
          const pendingEarned = memberEarnings.filter(e => e.status === 'Pending').reduce((sum, e) => sum + (parseFloat(e.netMember) || 0), 0);

          const roleColors = { 'CEO': 'var(--gold)', 'Editor': 'var(--blue)', 'Poster': 'var(--green)', 'Clipper': 'var(--purple)' };
          const roleColor = roleColors[member.role] || 'var(--text-muted)';

          return `
            <div class="card" style="position:relative;overflow:hidden;">
              <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${roleColor};"></div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                  <div style="font-size:1.15rem;font-weight:700;color:var(--white);">${member.name}</div>
                  <div style="font-size:0.82rem;color:${roleColor};font-weight:600;margin-top:2px;">${member.role} · ${member.percentage}%</div>
                </div>
                <div style="display:flex;gap:4px;">
                  ${statusBadge(member.status)}
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                <div>
                  <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Ukupna zarada</div>
                  <div style="font-size:1.1rem;font-weight:700;color:var(--gold);">${formatCurrency(totalEarned)}</div>
                </div>
                <div>
                  <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Na čekanju</div>
                  <div style="font-size:1.1rem;font-weight:600;color:var(--orange);">${formatCurrency(pendingEarned)}</div>
                </div>
              </div>

              <div style="margin-bottom:16px;">
                <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Aktivni nalozi (${activeAccounts.length})</div>
                ${activeAccounts.length > 0 ? `
                  <div style="display:flex;flex-wrap:wrap;gap:4px;">
                    ${activeAccounts.map(a => `<span style="font-size:0.78rem;padding:3px 8px;background:var(--bg-surface-3);border-radius:4px;color:var(--text);">${a.username}</span>`).join('')}
                  </div>
                ` : '<span style="font-size:0.8rem;color:var(--text-dim);">Nema aktivnih naloga</span>'}
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border);">
                <div style="font-size:0.82rem;color:var(--text-dim);">
                  ${member.contact ? '📱 ' + member.contact : ''}
                </div>
                <div class="table-actions">
                  <button title="Izmeni" data-edit="${member.id}">${editIcon}</button>
                  <button class="delete" title="Obriši" data-delete="${member.id}">${deleteIcon}</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <h3>Nema članova tima</h3>
        <p>Dodajte prvog člana tima</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-member')?.addEventListener('click', () => openTeamForm());

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openTeamForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovog člana tima?')) {
        store.delete('team', btn.dataset.delete);
        showToast('Član obrisan', 'success');
        renderTeam();
      }
    });
  });
}

function openTeamForm(editId = null) {
  const member = editId ? store.getById('team', editId) : null;

  const body = `
    <form id="team-form" class="form-grid">
      <div class="form-group full-width">
        <label>Ime i prezime</label>
        <input type="text" name="name" value="${member?.name || ''}" required>
      </div>
      <div class="form-group">
        <label>Uloga</label>
        <select name="role">
          <option value="CEO" ${member?.role === 'CEO' ? 'selected' : ''}>CEO</option>
          <option value="Editor" ${member?.role === 'Editor' ? 'selected' : ''}>Editor</option>
          <option value="Poster" ${member?.role === 'Poster' ? 'selected' : ''}>Poster</option>
          <option value="Clipper" ${member?.role === 'Clipper' ? 'selected' : ''}>Clipper</option>
        </select>
      </div>
      <div class="form-group">
        <label>Procenat zarade (%)</label>
        <input type="number" name="percentage" value="${member?.percentage || 0}" min="0" max="100">
      </div>
      <div class="form-group">
        <label>Telegram kontakt</label>
        <input type="text" name="contact" value="${member?.contact || ''}" placeholder="@username">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Active" ${member?.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${member?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-member">Sačuvaj</button>
  `;

  openModal(member ? 'Izmeni člana' : 'Novi član tima', body, footer);

  document.getElementById('btn-save-member').addEventListener('click', () => {
    const data = getFormData('team-form');
    if (!data.name) { showToast('Unesite ime!', 'error'); return; }
    data.percentage = parseInt(data.percentage) || 0;

    if (editId) {
      store.update('team', editId, data);
      showToast('Član ažuriran!', 'success');
    } else {
      store.create('team', data);
      showToast('Član dodat!', 'success');
    }
    closeModal();
    renderTeam();
  });
}
