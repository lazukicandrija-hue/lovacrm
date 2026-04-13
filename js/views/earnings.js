// ============================================
// LOVA CRM — Earnings View
// ============================================

import { store } from '../store.js';
import { formatCurrency, formatDate, statusBadge, searchIcon, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

let filterCampaign = '';
let filterStatus = '';
let filterMember = '';

export function renderEarnings() {
  const content = document.getElementById('app-content');
  const earnings = store.getAll('earnings');
  const campaigns = store.getAll('campaigns');
  const team = store.getAll('team');
  const posts = store.getAll('posts');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-earning">${plusIcon} Nova zarada</button>
  `;

  let filtered = earnings;
  if (filterCampaign) filtered = filtered.filter(e => e.campaignId === filterCampaign);
  if (filterStatus) filtered = filtered.filter(e => e.status === filterStatus);
  if (filterMember) filtered = filtered.filter(e => e.teamMemberId === filterMember);

  const totalGross = earnings.reduce((sum, e) => sum + (parseFloat(e.grossAmount) || 0), 0);
  const totalAgency = earnings.reduce((sum, e) => sum + (parseFloat(e.netAgency) || 0), 0);
  const totalMembers = earnings.reduce((sum, e) => sum + (parseFloat(e.netMember) || 0), 0);
  const pendingAmount = earnings.filter(e => e.status === 'Pending').reduce((sum, e) => sum + (parseFloat(e.grossAmount) || 0), 0);
  const paidAmount = earnings.filter(e => e.status === 'Paid').reduce((sum, e) => sum + (parseFloat(e.grossAmount) || 0), 0);

  content.innerHTML = `
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));margin-bottom:24px;">
      <div class="kpi-card">
        <div class="kpi-label">Bruto ukupno</div>
        <div class="kpi-value gold">${formatCurrency(totalGross)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Neto agencija</div>
        <div class="kpi-value">${formatCurrency(totalAgency)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Isplaćeno članovima</div>
        <div class="kpi-value">${formatCurrency(totalMembers)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Na čekanju</div>
        <div class="kpi-value" style="color:var(--orange);">${formatCurrency(pendingAmount)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Isplaćeno</div>
        <div class="kpi-value" style="color:var(--green);">${formatCurrency(paidAmount)}</div>
      </div>
    </div>

    <div class="filters-bar">
      <select class="filter-select" id="filter-earn-campaign">
        <option value="">Sve kampanje</option>
        ${campaigns.map(c => `<option value="${c.id}" ${filterCampaign === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="filter-earn-member">
        <option value="">Svi članovi</option>
        ${team.map(m => `<option value="${m.id}" ${filterMember === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="filter-earn-status">
        <option value="">Svi statusi</option>
        <option value="Pending" ${filterStatus === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="Paid" ${filterStatus === 'Paid' ? 'selected' : ''}>Paid</option>
        <option value="Withdrawn" ${filterStatus === 'Withdrawn' ? 'selected' : ''}>Withdrawn</option>
      </select>
    </div>

    ${filtered.length > 0 ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Kampanja</th>
              <th>Član tima</th>
              <th>Bruto</th>
              <th>%</th>
              <th>Neto agencija</th>
              <th>Neto član</th>
              <th>Status</th>
              <th>Datum isplate</th>
              <th>Metod</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(e => {
              const campaign = store.getById('campaigns', e.campaignId);
              const member = store.getById('team', e.teamMemberId);
              const post = store.getById('posts', e.postId);
              return `
                <tr>
                  <td>
                    <div style="font-weight:500;">${campaign ? campaign.name : '—'}</div>
                    ${post ? `<div style="font-size:0.75rem;color:var(--text-dim);">Post: ${post.link ? '🔗' : ''} ${post.views ? post.views.toLocaleString() + ' views' : ''}</div>` : ''}
                  </td>
                  <td style="font-weight:500;">${member ? member.name : '—'}</td>
                  <td style="font-weight:600;color:var(--white);">${formatCurrency(e.grossAmount)}</td>
                  <td>${e.percentage}%</td>
                  <td>${formatCurrency(e.netAgency)}</td>
                  <td style="color:var(--gold);">${formatCurrency(e.netMember)}</td>
                  <td>${statusBadge(e.status)}</td>
                  <td>${formatDate(e.paymentDate)}</td>
                  <td style="font-size:0.82rem;">${e.paymentMethod || '—'}</td>
                  <td>
                    <div class="table-actions">
                      <button title="Izmeni" data-edit="${e.id}">${editIcon}</button>
                      <button class="delete" title="Obriši" data-delete="${e.id}">${deleteIcon}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <h3>Nema zapisa o zaradi</h3>
        <p>Evidentirajte prvu zaradu</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-earning')?.addEventListener('click', () => openEarningForm());
  document.getElementById('filter-earn-campaign')?.addEventListener('change', (e) => { filterCampaign = e.target.value; renderEarnings(); });
  document.getElementById('filter-earn-member')?.addEventListener('change', (e) => { filterMember = e.target.value; renderEarnings(); });
  document.getElementById('filter-earn-status')?.addEventListener('change', (e) => { filterStatus = e.target.value; renderEarnings(); });

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openEarningForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovaj zapis?')) {
        store.delete('earnings', btn.dataset.delete);
        showToast('Zapis obrisan', 'success');
        renderEarnings();
      }
    });
  });
}

function openEarningForm(editId = null) {
  const earning = editId ? store.getById('earnings', editId) : null;
  const campaigns = store.getAll('campaigns');
  const posts = store.getAll('posts');
  const team = store.getAll('team');

  const body = `
    <form id="earning-form" class="form-grid">
      <div class="form-group">
        <label>Kampanja</label>
        <select name="campaignId">
          <option value="">— Izaberi —</option>
          ${campaigns.map(c => `<option value="${c.id}" ${earning?.campaignId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Post</label>
        <select name="postId">
          <option value="">— Izaberi —</option>
          ${posts.map(p => {
            const clip = store.getById('clips', p.clipId);
            const acc = store.getById('accounts', p.accountId);
            return `<option value="${p.id}" ${earning?.postId === p.id ? 'selected' : ''}>${clip ? clip.name : 'Post'} - ${acc ? acc.username : ''}</option>`;
          }).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Član tima</label>
        <select name="teamMemberId">
          <option value="">— Izaberi —</option>
          ${team.map(m => `<option value="${m.id}" ${earning?.teamMemberId === m.id ? 'selected' : ''}>${m.name} (${m.percentage}%)</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Bruto iznos ($)</label>
        <input type="number" name="grossAmount" value="${earning?.grossAmount || ''}" step="0.01" min="0" id="earn-gross">
      </div>
      <div class="form-group">
        <label>Procenat za člana (%)</label>
        <input type="number" name="percentage" value="${earning?.percentage || ''}" min="0" max="100" id="earn-pct">
      </div>
      <div class="form-group">
        <label>Neto agencija ($)</label>
        <input type="number" name="netAgency" value="${earning?.netAgency || ''}" step="0.01" id="earn-net-agency" readonly style="opacity:0.7;">
      </div>
      <div class="form-group">
        <label>Neto član ($)</label>
        <input type="number" name="netMember" value="${earning?.netMember || ''}" step="0.01" id="earn-net-member" readonly style="opacity:0.7;">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Pending" ${earning?.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Paid" ${earning?.status === 'Paid' ? 'selected' : ''}>Paid</option>
          <option value="Withdrawn" ${earning?.status === 'Withdrawn' ? 'selected' : ''}>Withdrawn</option>
        </select>
      </div>
      <div class="form-group">
        <label>Datum isplate</label>
        <input type="date" name="paymentDate" value="${earning?.paymentDate || ''}">
      </div>
      <div class="form-group">
        <label>Metod isplate</label>
        <select name="paymentMethod">
          <option value="" ${!earning?.paymentMethod ? 'selected' : ''}>—</option>
          <option value="Crypto" ${earning?.paymentMethod === 'Crypto' ? 'selected' : ''}>Crypto</option>
          <option value="PayPal" ${earning?.paymentMethod === 'PayPal' ? 'selected' : ''}>PayPal</option>
          <option value="Banka" ${earning?.paymentMethod === 'Banka' ? 'selected' : ''}>Banka</option>
          <option value="Gotovina" ${earning?.paymentMethod === 'Gotovina' ? 'selected' : ''}>Gotovina</option>
        </select>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-earning">Sačuvaj</button>
  `;

  openModal(earning ? 'Izmeni zaradu' : 'Nova zarada', body, footer);

  // Auto-calc
  function recalc() {
    const gross = parseFloat(document.getElementById('earn-gross').value) || 0;
    const pct = parseFloat(document.getElementById('earn-pct').value) || 0;
    document.getElementById('earn-net-member').value = (gross * pct / 100).toFixed(2);
    document.getElementById('earn-net-agency').value = (gross - gross * pct / 100).toFixed(2);
  }

  document.getElementById('earn-gross').addEventListener('input', recalc);
  document.getElementById('earn-pct').addEventListener('input', recalc);

  // Auto-fill percentage from team member
  document.querySelector('#earning-form select[name="teamMemberId"]').addEventListener('change', (e) => {
    const member = store.getById('team', e.target.value);
    if (member) {
      document.getElementById('earn-pct').value = member.percentage;
      recalc();
    }
  });

  document.getElementById('btn-save-earning').addEventListener('click', () => {
    const data = getFormData('earning-form');
    data.grossAmount = parseFloat(data.grossAmount) || 0;
    data.percentage = parseInt(data.percentage) || 0;
    data.netAgency = parseFloat(data.netAgency) || 0;
    data.netMember = parseFloat(data.netMember) || 0;

    if (editId) {
      store.update('earnings', editId, data);
      showToast('Zarada ažurirana!', 'success');
    } else {
      store.create('earnings', data);
      showToast('Zarada evidentirana!', 'success');
    }
    closeModal();
    renderEarnings();
  });
}
