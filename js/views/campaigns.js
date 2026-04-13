// ============================================
// LOVA CRM — Campaigns View
// ============================================

import { store } from '../store.js';
import { formatCurrency, formatDate, statusBadge, searchIcon, plusIcon, editIcon, deleteIcon, externalIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

let filterStatus = '';
let searchQuery = '';

export function renderCampaigns() {
  const content = document.getElementById('app-content');
  const campaigns = store.getAll('campaigns');
  const posts = store.getAll('posts');
  const clips = store.getAll('clips');

  // Add button in header
  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-campaign">${plusIcon} Nova kampanja</button>
  `;

  // Filter
  let filtered = campaigns;
  if (filterStatus) filtered = filtered.filter(c => c.status === filterStatus);
  if (searchQuery) filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  content.innerHTML = `
    <div class="filters-bar">
      <div class="search-input">
        ${searchIcon}
        <input type="text" id="search-campaigns" placeholder="Pretraži kampanje..." value="${searchQuery}">
      </div>
      <select class="filter-select" id="filter-status">
        <option value="">Svi statusi</option>
        <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
        <option value="Paused" ${filterStatus === 'Paused' ? 'selected' : ''}>Paused</option>
        <option value="Completed" ${filterStatus === 'Completed' ? 'selected' : ''}>Completed</option>
        <option value="Expired" ${filterStatus === 'Expired' ? 'selected' : ''}>Expired</option>
      </select>
    </div>

    ${filtered.length > 0 ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Kampanja</th>
              <th>Status</th>
              <th>Budget</th>
              <th>CPM</th>
              <th>Klipovi</th>
              <th>Zarada</th>
              <th>Datum</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(c => {
              const campClips = clips.filter(cl => cl.campaignId === c.id);
              const approvedClips = campClips.filter(cl => cl.status === 'Approved').length;
              const campPosts = posts.filter(p => {
                const clip = store.getById('clips', p.clipId);
                return clip && clip.campaignId === c.id;
              });
              const campEarnings = campPosts.reduce((sum, p) => sum + (parseFloat(p.earnings) || 0), 0);
              return `
                <tr>
                  <td>
                    <div style="font-weight:600;">${c.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);">${c.platform}${c.link ? ` <a href="${c.link}" target="_blank">${externalIcon}</a>` : ''}</div>
                  </td>
                  <td>${statusBadge(c.status)}</td>
                  <td>${formatCurrency(c.budget)}</td>
                  <td>${formatCurrency(c.cpmRate)}/1K</td>
                  <td>
                    <span style="font-weight:500;">${campClips.length}</span>
                    <span style="color:var(--text-dim);font-size:0.8rem;"> (${approvedClips} ✓)</span>
                  </td>
                  <td style="font-weight:600;color:var(--gold);">${formatCurrency(campEarnings)}</td>
                  <td style="font-size:0.8rem;">${formatDate(c.startDate)} — ${formatDate(c.endDate)}</td>
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        <h3>Nema kampanja</h3>
        <p>Dodajte prvu kampanju klikom na "Nova kampanja"</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-campaign')?.addEventListener('click', () => openCampaignForm());
  document.getElementById('search-campaigns')?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value;
    renderCampaigns();
  }));
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderCampaigns();
  });

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openCampaignForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const confirmed = await showConfirm('Da li ste sigurni da želite da obrišete ovu kampanju?');
      if (confirmed) {
        store.delete('campaigns', btn.dataset.delete);
        showToast('Kampanja obrisana', 'success');
        renderCampaigns();
      }
    });
  });
}

function openCampaignForm(editId = null) {
  const campaign = editId ? store.getById('campaigns', editId) : null;
  const title = campaign ? 'Izmeni kampanju' : 'Nova kampanja';

  const body = `
    <form id="campaign-form" class="form-grid">
      <div class="form-group full-width">
        <label>Naziv kampanje</label>
        <input type="text" name="name" value="${campaign?.name || ''}" required>
      </div>
      <div class="form-group">
        <label>Platforma</label>
        <select name="platform">
          <option value="Whop" ${campaign?.platform === 'Whop' ? 'selected' : ''}>Whop</option>
        </select>
      </div>
      <div class="form-group">
        <label>Link ka kampanji</label>
        <input type="url" name="link" value="${campaign?.link || ''}" placeholder="https://whop.com/...">
      </div>
      <div class="form-group">
        <label>Budget ($)</label>
        <input type="number" name="budget" value="${campaign?.budget || ''}" step="0.01" min="0">
      </div>
      <div class="form-group">
        <label>CPM Rate ($/1K views)</label>
        <input type="number" name="cpmRate" value="${campaign?.cpmRate || ''}" step="0.01" min="0">
      </div>
      <div class="form-group">
        <label>Min rezolucija</label>
        <select name="minResolution">
          <option value="4K" ${campaign?.minResolution === '4K' ? 'selected' : ''}>4K</option>
          <option value="2K" ${campaign?.minResolution === '2K' ? 'selected' : ''}>2K</option>
          <option value="1080p" ${campaign?.minResolution === '1080p' ? 'selected' : ''}>1080p</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select name="status">
          <option value="Active" ${campaign?.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Paused" ${campaign?.status === 'Paused' ? 'selected' : ''}>Paused</option>
          <option value="Completed" ${campaign?.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Expired" ${campaign?.status === 'Expired' ? 'selected' : ''}>Expired</option>
        </select>
      </div>
      <div class="form-group">
        <label>Min trajanje klipa (sek)</label>
        <input type="number" name="minDuration" value="${campaign?.minDuration || ''}" min="1">
      </div>
      <div class="form-group">
        <label>Max trajanje klipa (sek)</label>
        <input type="number" name="maxDuration" value="${campaign?.maxDuration || ''}" min="1">
      </div>
      <div class="form-group">
        <label>Datum početka</label>
        <input type="date" name="startDate" value="${campaign?.startDate || ''}">
      </div>
      <div class="form-group">
        <label>Datum kraja</label>
        <input type="date" name="endDate" value="${campaign?.endDate || ''}">
      </div>
      <div class="form-group">
        <label>&nbsp;</label>
        <div class="checkbox-group">
          <input type="checkbox" name="watermark" id="cb-watermark" ${campaign?.watermark ? 'checked' : ''}>
          <label for="cb-watermark" style="text-transform:none;font-size:0.875rem;">Potreban watermark</label>
        </div>
      </div>
      <div class="form-group full-width">
        <label>Napomene</label>
        <textarea name="notes" rows="3">${campaign?.notes || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-campaign">Sačuvaj</button>
  `;

  openModal(title, body, footer);

  document.getElementById('btn-save-campaign').addEventListener('click', () => {
    const data = getFormData('campaign-form');
    if (!data.name) {
      showToast('Unesite naziv kampanje!', 'error');
      return;
    }
    data.budget = parseFloat(data.budget) || 0;
    data.cpmRate = parseFloat(data.cpmRate) || 0;
    data.minDuration = parseInt(data.minDuration) || 0;
    data.maxDuration = parseInt(data.maxDuration) || 0;

    if (editId) {
      store.update('campaigns', editId, data);
      showToast('Kampanja ažurirana!', 'success');
    } else {
      store.create('campaigns', data);
      showToast('Kampanja kreirana!', 'success');
    }
    closeModal();
    renderCampaigns();
  });
}
