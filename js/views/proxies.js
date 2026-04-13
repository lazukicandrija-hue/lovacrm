// ============================================
// LOVA CRM — Proxies View
// ============================================

import { store } from '../store.js';
import { formatCurrency, formatDate, statusBadge, daysUntil, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData } from '../utils.js';

export function renderProxies() {
  const content = document.getElementById('app-content');
  const proxies = store.getAll('proxies');
  const accounts = store.getAll('accounts');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-proxy">${plusIcon} Novi proxy</button>
  `;

  const activeCost = proxies.filter(p => p.status === 'Active').reduce((sum, p) => sum + (parseFloat(p.monthlyCost) || 0), 0);

  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-item">Aktivni: <span class="stat-value" style="color:var(--green);">${proxies.filter(p => p.status === 'Active').length}</span></div>
      <div class="stat-item">Ukupno: <span class="stat-value">${proxies.length}</span></div>
      <div class="stat-item">Mesečni trošak: <span class="stat-value" style="color:var(--red);">${formatCurrency(activeCost)}</span></div>
    </div>

    ${proxies.length > 0 ? `
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        ${proxies.map(proxy => {
          const linkedAccounts = accounts.filter(a => a.proxyId === proxy.id);
          const daysLeft = daysUntil(proxy.expiryDate);
          const isExpiring = daysLeft >= 0 && daysLeft <= 7;

          const typeColors = { 'Mobile': 'var(--gold)', 'Residential': 'var(--blue)', 'Datacenter': 'var(--purple)' };
          const typeColor = typeColors[proxy.type] || 'var(--text-muted)';

          return `
            <div class="card" style="position:relative;overflow:hidden;">
              <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${typeColor};"></div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                <div>
                  <div style="font-size:1.05rem;font-weight:700;color:var(--white);">${proxy.name}</div>
                  <div style="display:flex;gap:8px;margin-top:4px;">
                    <span style="font-size:0.78rem;color:${typeColor};font-weight:600;">${proxy.type}</span>
                    <span style="font-size:0.78rem;color:var(--text-dim);">📍 ${proxy.location || '—'}</span>
                  </div>
                </div>
                ${statusBadge(proxy.status)}
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
                <div>
                  <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Mesečna cena</div>
                  <div style="font-size:1.1rem;font-weight:700;color:var(--gold);">${formatCurrency(proxy.monthlyCost)}</div>
                </div>
                <div>
                  <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Ističe</div>
                  <div style="font-size:0.9rem;font-weight:600;color:${isExpiring ? 'var(--red)' : daysLeft < 0 ? 'var(--red)' : 'var(--text)'};">
                    ${formatDate(proxy.expiryDate)}
                    ${isExpiring ? ` (${daysLeft}d!)` : daysLeft < 0 ? ' (istekao)' : ''}
                  </div>
                </div>
              </div>

              <div style="margin-bottom:14px;">
                <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Povezani nalozi (${linkedAccounts.length})</div>
                ${linkedAccounts.length > 0 ? `
                  <div style="display:flex;flex-wrap:wrap;gap:4px;">
                    ${linkedAccounts.map(a => `<span style="font-size:0.78rem;padding:3px 8px;background:var(--bg-surface-3);border-radius:4px;color:var(--text);">${a.username}</span>`).join('')}
                  </div>
                ` : '<span style="font-size:0.8rem;color:var(--text-dim);">Nema povezanih naloga</span>'}
              </div>

              <div style="display:flex;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--border);">
                <div class="table-actions">
                  <button title="Izmeni" data-edit="${proxy.id}">${editIcon}</button>
                  <button class="delete" title="Obriši" data-delete="${proxy.id}">${deleteIcon}</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        <h3>Nema proksija</h3>
        <p>Dodajte prvi proxy server</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-proxy')?.addEventListener('click', () => openProxyForm());

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openProxyForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovaj proxy?')) {
        store.delete('proxies', btn.dataset.delete);
        showToast('Proxy obrisan', 'success');
        renderProxies();
      }
    });
  });
}

function openProxyForm(editId = null) {
  const proxy = editId ? store.getById('proxies', editId) : null;

  const body = `
    <form id="proxy-form" class="form-grid">
      <div class="form-group full-width">
        <label>Naziv / IP</label>
        <input type="text" name="name" value="${proxy?.name || ''}" required placeholder="npr. 4G Mobile US #1">
      </div>
      <div class="form-group">
        <label>Tip</label>
        <select name="type">
          <option value="Mobile" ${proxy?.type === 'Mobile' ? 'selected' : ''}>Mobile</option>
          <option value="Residential" ${proxy?.type === 'Residential' ? 'selected' : ''}>Residential</option>
          <option value="Datacenter" ${proxy?.type === 'Datacenter' ? 'selected' : ''}>Datacenter</option>
        </select>
      </div>
      <div class="form-group">
        <label>Lokacija (država)</label>
        <input type="text" name="location" value="${proxy?.location || ''}" placeholder="npr. SAD">
      </div>
      <div class="form-group">
        <label>Mesečna cena ($)</label>
        <input type="number" name="monthlyCost" value="${proxy?.monthlyCost || ''}" step="0.01" min="0">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Active" ${proxy?.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Expired" ${proxy?.status === 'Expired' ? 'selected' : ''}>Expired</option>
        </select>
      </div>
      <div class="form-group">
        <label>Datum isteka</label>
        <input type="date" name="expiryDate" value="${proxy?.expiryDate || ''}">
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-proxy">Sačuvaj</button>
  `;

  openModal(proxy ? 'Izmeni proxy' : 'Novi proxy', body, footer);

  document.getElementById('btn-save-proxy').addEventListener('click', () => {
    const data = getFormData('proxy-form');
    if (!data.name) { showToast('Unesite naziv!', 'error'); return; }
    data.monthlyCost = parseFloat(data.monthlyCost) || 0;

    if (editId) {
      store.update('proxies', editId, data);
      showToast('Proxy ažuriran!', 'success');
    } else {
      store.create('proxies', data);
      showToast('Proxy dodat!', 'success');
    }
    closeModal();
    renderProxies();
  });
}
