// ============================================
// LOVA CRM — Source Videos View
// ============================================

import { store } from '../store.js';
import { formatDate, statusBadge, searchIcon, plusIcon, editIcon, deleteIcon, externalIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce, truncate } from '../utils.js';

let filterCampaign = '';
let filterStatus = '';
let searchQuery = '';

export function renderSourceVideos() {
  const content = document.getElementById('app-content');
  const videos = store.getAll('sourceVideos');
  const campaigns = store.getAll('campaigns');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-sv">${plusIcon} Novi video</button>
  `;

  let filtered = videos;
  if (filterCampaign) filtered = filtered.filter(v => v.campaignId === filterCampaign);
  if (filterStatus) filtered = filtered.filter(v => v.status === filterStatus);
  if (searchQuery) filtered = filtered.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  content.innerHTML = `
    <div class="filters-bar">
      <div class="search-input">
        ${searchIcon}
        <input type="text" id="search-sv" placeholder="Pretraži videe..." value="${searchQuery}">
      </div>
      <select class="filter-select" id="filter-sv-campaign">
        <option value="">Sve kampanje</option>
        ${campaigns.map(c => `<option value="${c.id}" ${filterCampaign === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="filter-sv-status">
        <option value="">Svi statusi</option>
        <option value="Available" ${filterStatus === 'Available' ? 'selected' : ''}>Available</option>
        <option value="Used" ${filterStatus === 'Used' ? 'selected' : ''}>Used</option>
        <option value="Archived" ${filterStatus === 'Archived' ? 'selected' : ''}>Archived</option>
      </select>
    </div>

    ${filtered.length > 0 ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Kampanja</th>
              <th>Trajanje</th>
              <th>Rezolucija</th>
              <th>Veličina</th>
              <th>Status</th>
              <th>Datum</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(v => {
              const campaign = store.getById('campaigns', v.campaignId);
              return `
                <tr>
                  <td>
                    <div style="font-weight:500;">${v.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);">${truncate(v.description, 50)}</div>
                  </td>
                  <td>${campaign ? campaign.name : '—'}</td>
                  <td>${v.duration || '—'}</td>
                  <td>${v.resolution || '—'}</td>
                  <td>${v.fileSize ? v.fileSize + ' MB' : '—'}</td>
                  <td>${statusBadge(v.status)}</td>
                  <td>${formatDate(v.createdAt)}</td>
                  <td>
                    <div class="table-actions">
                      ${v.driveLink ? `<a href="${v.driveLink}" target="_blank" class="btn-icon" style="width:30px;height:30px;font-size:0" title="Google Drive">${externalIcon}</a>` : ''}
                      <button title="Izmeni" data-edit="${v.id}">${editIcon}</button>
                      <button class="delete" title="Obriši" data-delete="${v.id}">${deleteIcon}</button>
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/></svg>
        <h3>Nema source videa</h3>
        <p>Dodajte prvi izvorni video</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-sv')?.addEventListener('click', () => openSVForm());
  document.getElementById('search-sv')?.addEventListener('input', debounce((e) => { searchQuery = e.target.value; renderSourceVideos(); }));
  document.getElementById('filter-sv-campaign')?.addEventListener('change', (e) => { filterCampaign = e.target.value; renderSourceVideos(); });
  document.getElementById('filter-sv-status')?.addEventListener('change', (e) => { filterStatus = e.target.value; renderSourceVideos(); });

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openSVForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovaj source video?')) {
        store.delete('sourceVideos', btn.dataset.delete);
        showToast('Video obrisan', 'success');
        renderSourceVideos();
      }
    });
  });
}

function openSVForm(editId = null) {
  const sv = editId ? store.getById('sourceVideos', editId) : null;
  const campaigns = store.getAll('campaigns');

  const body = `
    <form id="sv-form" class="form-grid">
      <div class="form-group full-width">
        <label>Naziv videa</label>
        <input type="text" name="name" value="${sv?.name || ''}" required>
      </div>
      <div class="form-group">
        <label>Kampanja</label>
        <select name="campaignId">
          <option value="">— Izaberi —</option>
          ${campaigns.map(c => `<option value="${c.id}" ${sv?.campaignId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Available" ${sv?.status === 'Available' ? 'selected' : ''}>Available</option>
          <option value="Used" ${sv?.status === 'Used' ? 'selected' : ''}>Used</option>
          <option value="Archived" ${sv?.status === 'Archived' ? 'selected' : ''}>Archived</option>
        </select>
      </div>
      <div class="form-group full-width">
        <label>Google Drive link</label>
        <input type="url" name="driveLink" value="${sv?.driveLink || ''}" placeholder="https://drive.google.com/...">
      </div>
      <div class="form-group full-width">
        <label>Direktan link za download</label>
        <input type="url" name="downloadLink" value="${sv?.downloadLink || ''}" placeholder="https://...">
      </div>
      <div class="form-group">
        <label>Trajanje (npr. 03:45)</label>
        <input type="text" name="duration" value="${sv?.duration || ''}" placeholder="mm:ss">
      </div>
      <div class="form-group">
        <label>Rezolucija</label>
        <select name="resolution">
          <option value="4K" ${sv?.resolution === '4K' ? 'selected' : ''}>4K</option>
          <option value="2K" ${sv?.resolution === '2K' ? 'selected' : ''}>2K</option>
          <option value="1080p" ${sv?.resolution === '1080p' ? 'selected' : ''}>1080p</option>
          <option value="720p" ${sv?.resolution === '720p' ? 'selected' : ''}>720p</option>
        </select>
      </div>
      <div class="form-group">
        <label>Veličina fajla (MB)</label>
        <input type="number" name="fileSize" value="${sv?.fileSize || ''}" min="0">
      </div>
      <div class="form-group full-width">
        <label>Opis sadržaja</label>
        <textarea name="description" rows="3">${sv?.description || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-sv">Sačuvaj</button>
  `;

  openModal(sv ? 'Izmeni video' : 'Novi source video', body, footer);

  document.getElementById('btn-save-sv').addEventListener('click', () => {
    const data = getFormData('sv-form');
    if (!data.name) { showToast('Unesite naziv!', 'error'); return; }
    data.fileSize = parseInt(data.fileSize) || 0;

    if (editId) {
      store.update('sourceVideos', editId, data);
      showToast('Video ažuriran!', 'success');
    } else {
      store.create('sourceVideos', data);
      showToast('Video dodat!', 'success');
    }
    closeModal();
    renderSourceVideos();
  });
}
