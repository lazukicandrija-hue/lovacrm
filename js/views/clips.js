// ============================================
// LOVA CRM — Clips View
// ============================================

import { store } from '../store.js';
import { formatDate, statusBadge, searchIcon, plusIcon, editIcon, deleteIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

let filterCampaign = '';
let filterStatus = '';
let searchQuery = '';

export function renderClips() {
  const content = document.getElementById('app-content');
  const clips = store.getAll('clips');
  const campaigns = store.getAll('campaigns');
  const team = store.getAll('team');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-clip">${plusIcon} Novi klip</button>
  `;

  let filtered = clips;
  if (filterCampaign) filtered = filtered.filter(c => c.campaignId === filterCampaign);
  if (filterStatus) filtered = filtered.filter(c => c.status === filterStatus);
  if (searchQuery) filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Stats
  const totalClips = clips.length;
  const draftClips = clips.filter(c => c.status === 'Draft').length;
  const approvedClips = clips.filter(c => c.status === 'Approved').length;

  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-item">Ukupno: <span class="stat-value">${totalClips}</span></div>
      <div class="stat-item">Draft: <span class="stat-value">${draftClips}</span></div>
      <div class="stat-item">Odobreno: <span class="stat-value" style="color:var(--green);">${approvedClips}</span></div>
    </div>

    <div class="filters-bar">
      <div class="search-input">
        ${searchIcon}
        <input type="text" id="search-clips" placeholder="Pretraži klipove..." value="${searchQuery}">
      </div>
      <select class="filter-select" id="filter-clip-campaign">
        <option value="">Sve kampanje</option>
        ${campaigns.map(c => `<option value="${c.id}" ${filterCampaign === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <select class="filter-select" id="filter-clip-status">
        <option value="">Svi statusi</option>
        <option value="Draft" ${filterStatus === 'Draft' ? 'selected' : ''}>Draft</option>
        <option value="Ready" ${filterStatus === 'Ready' ? 'selected' : ''}>Ready</option>
        <option value="Posted" ${filterStatus === 'Posted' ? 'selected' : ''}>Posted</option>
        <option value="Submitted" ${filterStatus === 'Submitted' ? 'selected' : ''}>Submitted</option>
        <option value="Approved" ${filterStatus === 'Approved' ? 'selected' : ''}>Approved</option>
        <option value="Rejected" ${filterStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
      </select>
    </div>

    ${filtered.length > 0 ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Klip</th>
              <th>Kampanja</th>
              <th>Trajanje</th>
              <th>Rez.</th>
              <th>WM</th>
              <th>Cap</th>
              <th>Status</th>
              <th>Autor</th>
              <th>Datum</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(c => {
              const campaign = store.getById('campaigns', c.campaignId);
              const sv = store.getById('sourceVideos', c.sourceVideoId);
              const author = store.getById('team', c.createdBy);
              return `
                <tr>
                  <td>
                    <div style="font-weight:500;">${c.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);">${sv ? 'Iz: ' + sv.name : ''}</div>
                  </td>
                  <td style="font-size:0.82rem;">${campaign ? campaign.name : '—'}</td>
                  <td>${c.duration ? c.duration + 's' : '—'}</td>
                  <td>${c.resolution || '—'}</td>
                  <td>${c.hasWatermark ? '✓' : '✗'}</td>
                  <td>${c.hasCaptions ? '✓' : '✗'}</td>
                  <td>${statusBadge(c.status)}</td>
                  <td style="font-size:0.82rem;">${author ? author.name.split(' ')[0] : '—'}</td>
                  <td>${formatDate(c.createdAt)}</td>
                  <td>
                    <div class="table-actions">
                      <button title="Izmeni" data-edit="${c.id}">${editIcon}</button>
                      <button class="delete" title="Obriši" data-delete="${c.id}">${deleteIcon}</button>
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/></svg>
        <h3>Nema klipova</h3>
        <p>Napravite prvi klip iz source videa</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-clip')?.addEventListener('click', () => openClipForm());
  document.getElementById('search-clips')?.addEventListener('input', debounce((e) => { searchQuery = e.target.value; renderClips(); }));
  document.getElementById('filter-clip-campaign')?.addEventListener('change', (e) => { filterCampaign = e.target.value; renderClips(); });
  document.getElementById('filter-clip-status')?.addEventListener('change', (e) => { filterStatus = e.target.value; renderClips(); });

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openClipForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovaj klip?')) {
        store.delete('clips', btn.dataset.delete);
        showToast('Klip obrisan', 'success');
        renderClips();
      }
    });
  });
}

function openClipForm(editId = null) {
  const clip = editId ? store.getById('clips', editId) : null;
  const campaigns = store.getAll('campaigns');
  const sourceVideos = store.getAll('sourceVideos');
  const team = store.getAll('team');

  const body = `
    <form id="clip-form" class="form-grid">
      <div class="form-group full-width">
        <label>Naziv klipa</label>
        <input type="text" name="name" value="${clip?.name || ''}" required>
      </div>
      <div class="form-group">
        <label>Source video</label>
        <select name="sourceVideoId">
          <option value="">— Izaberi —</option>
          ${sourceVideos.map(sv => `<option value="${sv.id}" ${clip?.sourceVideoId === sv.id ? 'selected' : ''}>${sv.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Kampanja</label>
        <select name="campaignId">
          <option value="">— Izaberi —</option>
          ${campaigns.map(c => `<option value="${c.id}" ${clip?.campaignId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Trajanje (sekunde)</label>
        <input type="number" name="duration" value="${clip?.duration || ''}" min="1">
      </div>
      <div class="form-group">
        <label>Rezolucija</label>
        <select name="resolution">
          <option value="4K" ${clip?.resolution === '4K' ? 'selected' : ''}>4K</option>
          <option value="2K" ${clip?.resolution === '2K' ? 'selected' : ''}>2K</option>
          <option value="1080p" ${clip?.resolution === '1080p' ? 'selected' : ''}>1080p</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          ${['Draft','Ready','Posted','Submitted','Approved','Rejected'].map(s => `<option value="${s}" ${clip?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Kreirao</label>
        <select name="createdBy">
          <option value="">— Izaberi —</option>
          ${team.map(m => `<option value="${m.id}" ${clip?.createdBy === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Captions dodao</label>
        <select name="captionsBy">
          <option value="">— Nema —</option>
          ${team.map(m => `<option value="${m.id}" ${clip?.captionsBy === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>&nbsp;</label>
        <div class="checkbox-group">
          <input type="checkbox" name="hasWatermark" id="cb-wm" ${clip?.hasWatermark ? 'checked' : ''}>
          <label for="cb-wm" style="text-transform:none;font-size:0.875rem;">Ima watermark</label>
        </div>
      </div>
      <div class="form-group">
        <label>&nbsp;</label>
        <div class="checkbox-group">
          <input type="checkbox" name="hasCaptions" id="cb-cap" ${clip?.hasCaptions ? 'checked' : ''}>
          <label for="cb-cap" style="text-transform:none;font-size:0.875rem;">Ima captions</label>
        </div>
      </div>
      <div class="form-group full-width">
        <label>Google Drive link</label>
        <input type="url" name="driveLink" value="${clip?.driveLink || ''}" placeholder="https://drive.google.com/...">
      </div>
      <div class="form-group full-width">
        <label>Napomene</label>
        <textarea name="notes" rows="2">${clip?.notes || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-clip">Sačuvaj</button>
  `;

  openModal(clip ? 'Izmeni klip' : 'Novi klip', body, footer);

  document.getElementById('btn-save-clip').addEventListener('click', () => {
    const data = getFormData('clip-form');
    if (!data.name) { showToast('Unesite naziv!', 'error'); return; }
    data.duration = parseInt(data.duration) || 0;

    if (editId) {
      store.update('clips', editId, data);
      showToast('Klip ažuriran!', 'success');
    } else {
      store.create('clips', data);
      showToast('Klip kreiran!', 'success');
    }
    closeModal();
    renderClips();
  });
}
