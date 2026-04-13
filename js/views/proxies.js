// ============================================
// LOVA CRM — Proxies View
// ============================================

import { store } from '../store.js';
import { formatCurrency, formatDate, statusBadge, daysUntil, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

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
                  <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
                    <span style="font-size:0.78rem;color:${typeColor};font-weight:600;">${proxy.type}</span>
                    <span style="font-size:0.78rem;color:var(--text-dim);">📍 ${proxy.location || '—'}${proxy.usState ? ', ' + proxy.usState : ''}</span>
                  </div>
                </div>
                ${statusBadge(proxy.status)}
              </div>

              ${proxy.proxyAddress ? `
                <div style="margin-bottom:12px;padding:8px 12px;background:var(--bg-surface-3);border-radius:6px;font-family:monospace;font-size:0.82rem;color:var(--text-muted);word-break:break-all;">${proxy.proxyAddress}</div>
              ` : ''}

              ${(proxy.proxyUser || proxy.proxyPass) ? `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                  <div>
                    <div style="font-size:0.68rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Username</div>
                    <div style="font-size:0.85rem;color:var(--text);font-family:monospace;">${proxy.proxyUser || '—'}</div>
                  </div>
                  <div>
                    <div style="font-size:0.68rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Password</div>
                    <div style="display:flex;align-items:center;gap:6px;">
                      <span class="proxy-pass-text" data-pass="${proxy.proxyPass || ''}" style="font-size:0.85rem;color:var(--text-muted);font-family:monospace;">••••••••</span>
                      <button class="btn-icon toggle-proxy-pass" title="Prikaži" style="padding:2px;opacity:0.5;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button class="btn-icon copy-proxy-pass" data-copy="${proxy.proxyPass || ''}" title="Kopiraj" style="padding:2px;opacity:0.5;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ` : ''}

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

  // Toggle proxy password
  content.querySelectorAll('.toggle-proxy-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const span = btn.closest('div').querySelector('.proxy-pass-text');
      span.textContent = span.textContent === '••••••••' ? span.dataset.pass : '••••••••';
    });
  });

  // Copy proxy password
  content.querySelectorAll('.copy-proxy-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => showToast('Šifra kopirana!', 'success'));
    });
  });
}

function openProxyForm(editId = null) {
  const proxy = editId ? store.getById('proxies', editId) : null;

  const usStates = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

  const body = `
    <form id="proxy-form" class="form-grid">
      <div class="form-group full-width">
        <label>Naziv / IP</label>
        <input type="text" name="name" value="${proxy?.name || ''}" required placeholder="npr. 4G Mobile US #1">
      </div>
      <div class="form-group full-width">
        <label>Proxy adresa (host:port)</label>
        <input type="text" name="proxyAddress" value="${proxy?.proxyAddress || ''}" placeholder="npr. us.proxy.com:8080">
      </div>
      <div class="form-group">
        <label>Proxy Username</label>
        <input type="text" name="proxyUser" value="${proxy?.proxyUser || ''}" placeholder="username">
      </div>
      <div class="form-group">
        <label>Proxy Password</label>
        <input type="text" name="proxyPass" value="${proxy?.proxyPass || ''}" placeholder="password">
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
        <input type="text" name="location" value="${proxy?.location || 'SAD'}" placeholder="npr. SAD">
      </div>
      <div class="form-group">
        <label>US State</label>
        <select name="usState">
          <option value="">— Izaberi state —</option>
          ${usStates.map(s => `<option value="${s}" ${proxy?.usState === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
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
