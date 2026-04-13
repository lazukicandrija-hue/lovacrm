// ============================================
// LOVA CRM — Accounts View
// ============================================

import { store } from '../store.js';
import { formatDate, formatDateTime, formatNumber, statusBadge, platformLabel, searchIcon, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

let filterPlatform = '';
let filterStatus = '';
let searchQuery = '';

export function renderAccounts() {
  const content = document.getElementById('app-content');
  const accounts = store.getAll('accounts');
  const proxies = store.getAll('proxies');
  const team = store.getAll('team');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-account">${plusIcon} Novi nalog</button>
  `;

  let filtered = accounts;
  if (filterPlatform) filtered = filtered.filter(a => a.platform === filterPlatform);
  if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus);
  if (searchQuery) filtered = filtered.filter(a => a.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const active = accounts.filter(a => a.status === 'Active').length;
  const warming = accounts.filter(a => a.status === 'Warming Up').length;
  const banned = accounts.filter(a => a.status === 'Banned').length;

  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-item">Aktivni: <span class="stat-value" style="color:var(--green);">${active}</span></div>
      <div class="stat-item">Warming: <span class="stat-value" style="color:var(--orange);">${warming}</span></div>
      <div class="stat-item">Banovani: <span class="stat-value" style="color:var(--red);">${banned}</span></div>
      <div class="stat-item">Ukupno: <span class="stat-value">${accounts.length}</span></div>
    </div>

    <div class="filters-bar">
      <div class="search-input">
        ${searchIcon}
        <input type="text" id="search-accounts" placeholder="Pretraži naloge..." value="${searchQuery}">
      </div>
      <select class="filter-select" id="filter-acc-platform">
        <option value="">Sve platforme</option>
        <option value="TikTok" ${filterPlatform === 'TikTok' ? 'selected' : ''}>TikTok</option>
        <option value="YouTube" ${filterPlatform === 'YouTube' ? 'selected' : ''}>YouTube</option>
        <option value="Instagram" ${filterPlatform === 'Instagram' ? 'selected' : ''}>Instagram</option>
      </select>
      <select class="filter-select" id="filter-acc-status">
        <option value="">Svi statusi</option>
        <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
        <option value="Warming Up" ${filterStatus === 'Warming Up' ? 'selected' : ''}>Warming Up</option>
        <option value="Banned" ${filterStatus === 'Banned' ? 'selected' : ''}>Banned</option>
        <option value="Paused" ${filterStatus === 'Paused' ? 'selected' : ''}>Paused</option>
      </select>
    </div>

    ${filtered.length > 0 ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nalog</th>
              <th>Platforma</th>
              <th>Status</th>
              <th>Proxy</th>
              <th>Postovi</th>
              <th>Avg Views</th>
              <th>Followeri</th>
              <th>Limit</th>
              <th>Poslednji post</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(a => {
              const proxy = store.getById('proxies', a.proxyId);
              return `
                <tr>
                  <td>
                    <div style="font-weight:600;">${a.username}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);">${a.email || ''}</div>
                  </td>
                  <td>${platformLabel(a.platform)}</td>
                  <td>${statusBadge(a.status)}</td>
                  <td style="font-size:0.82rem;">${proxy ? proxy.name : '—'}</td>
                  <td>${a.totalPosts || 0}</td>
                  <td>${formatNumber(a.avgViews)}</td>
                  <td>${formatNumber(a.followers)}</td>
                  <td>${a.dailyLimit || 0}/dan</td>
                  <td style="font-size:0.82rem;">${formatDateTime(a.lastPost)}</td>
                  <td>
                    <div class="table-actions">
                      <button title="Izmeni" data-edit="${a.id}">${editIcon}</button>
                      <button class="delete" title="Obriši" data-delete="${a.id}">${deleteIcon}</button>
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        <h3>Nema naloga</h3>
        <p>Dodajte prvi social media nalog</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-account')?.addEventListener('click', () => openAccountForm());
  document.getElementById('search-accounts')?.addEventListener('input', debounce((e) => { searchQuery = e.target.value; renderAccounts(); }));
  document.getElementById('filter-acc-platform')?.addEventListener('change', (e) => { filterPlatform = e.target.value; renderAccounts(); });
  document.getElementById('filter-acc-status')?.addEventListener('change', (e) => { filterStatus = e.target.value; renderAccounts(); });

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openAccountForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovaj nalog?')) {
        store.delete('accounts', btn.dataset.delete);
        showToast('Nalog obrisan', 'success');
        renderAccounts();
      }
    });
  });
}

function openAccountForm(editId = null) {
  const acc = editId ? store.getById('accounts', editId) : null;
  const proxies = store.getAll('proxies');
  const team = store.getAll('team');

  const body = `
    <form id="account-form" class="form-grid">
      <div class="form-group">
        <label>Username</label>
        <input type="text" name="username" value="${acc?.username || ''}" required placeholder="@username">
      </div>
      <div class="form-group">
        <label>Platforma</label>
        <select name="platform">
          <option value="TikTok" ${acc?.platform === 'TikTok' ? 'selected' : ''}>TikTok</option>
          <option value="YouTube" ${acc?.platform === 'YouTube' ? 'selected' : ''}>YouTube</option>
          <option value="Instagram" ${acc?.platform === 'Instagram' ? 'selected' : ''}>Instagram</option>
        </select>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" name="email" value="${acc?.email || ''}">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Active" ${acc?.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Warming Up" ${acc?.status === 'Warming Up' ? 'selected' : ''}>Warming Up</option>
          <option value="Banned" ${acc?.status === 'Banned' ? 'selected' : ''}>Banned</option>
          <option value="Paused" ${acc?.status === 'Paused' ? 'selected' : ''}>Paused</option>
        </select>
      </div>
      <div class="form-group">
        <label>Proxy</label>
        <select name="proxyId">
          <option value="">— Bez proxy-ja —</option>
          ${proxies.map(p => `<option value="${p.id}" ${acc?.proxyId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Član tima</label>
        <select name="teamMemberId">
          <option value="">— Izaberi —</option>
          ${team.map(m => `<option value="${m.id}" ${acc?.teamMemberId === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Datum kreiranja naloga</label>
        <input type="date" name="dateCreated" value="${acc?.dateCreated || ''}">
      </div>
      <div class="form-group">
        <label>Dnevni limit postova</label>
        <input type="number" name="dailyLimit" value="${acc?.dailyLimit || 2}" min="0">
      </div>
      <div class="form-group">
        <label>Ukupno postova</label>
        <input type="number" name="totalPosts" value="${acc?.totalPosts || 0}" min="0">
      </div>
      <div class="form-group">
        <label>Prosečni views</label>
        <input type="number" name="avgViews" value="${acc?.avgViews || 0}" min="0">
      </div>
      <div class="form-group">
        <label>Followeri</label>
        <input type="number" name="followers" value="${acc?.followers || 0}" min="0">
      </div>
      <div class="form-group full-width">
        <label>Napomene</label>
        <textarea name="notes" rows="2">${acc?.notes || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-account">Sačuvaj</button>
  `;

  openModal(acc ? 'Izmeni nalog' : 'Novi nalog', body, footer);

  document.getElementById('btn-save-account').addEventListener('click', () => {
    const data = getFormData('account-form');
    if (!data.username) { showToast('Unesite username!', 'error'); return; }
    data.dailyLimit = parseInt(data.dailyLimit) || 0;
    data.totalPosts = parseInt(data.totalPosts) || 0;
    data.avgViews = parseInt(data.avgViews) || 0;
    data.followers = parseInt(data.followers) || 0;

    if (editId) {
      store.update('accounts', editId, data);
      showToast('Nalog ažuriran!', 'success');
    } else {
      store.create('accounts', data);
      showToast('Nalog kreiran!', 'success');
    }
    closeModal();
    renderAccounts();
  });
}
