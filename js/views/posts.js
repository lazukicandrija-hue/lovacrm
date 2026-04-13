// ============================================
// LOVA CRM — Posts View
// ============================================

import { store } from '../store.js';
import { formatDate, formatDateTime, formatNumber, formatCurrency, statusBadge, platformLabel, searchIcon, plusIcon, editIcon, deleteIcon, externalIcon, openModal, closeModal, showToast, showConfirm, getFormData, debounce } from '../utils.js';

let filterAccount = '';
let filterWhopStatus = '';
let searchQuery = '';

export function renderPosts() {
  const content = document.getElementById('app-content');
  const posts = store.getAll('posts');
  const clips = store.getAll('clips');
  const accounts = store.getAll('accounts');

  document.getElementById('page-actions').innerHTML = `
    <button class="btn btn-primary" id="btn-add-post">${plusIcon} Novi post</button>
  `;

  let filtered = posts;
  if (filterAccount) filtered = filtered.filter(p => p.accountId === filterAccount);
  if (filterWhopStatus) filtered = filtered.filter(p => p.whopStatus === filterWhopStatus);
  if (searchQuery) {
    filtered = filtered.filter(p => {
      const clip = store.getById('clips', p.clipId);
      const acc = store.getById('accounts', p.accountId);
      return (clip && clip.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
             (acc && acc.username.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

  const totalViews = posts.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);
  const totalEarnings = posts.reduce((sum, p) => sum + (parseFloat(p.earnings) || 0), 0);
  const approvedCount = posts.filter(p => p.whopStatus === 'Approved').length;

  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-item">Ukupni pregledi: <span class="stat-value">${formatNumber(totalViews)}</span></div>
      <div class="stat-item">Ukupna zarada: <span class="stat-value" style="color:var(--gold);">${formatCurrency(totalEarnings)}</span></div>
      <div class="stat-item">Odobreno na Whop: <span class="stat-value" style="color:var(--green);">${approvedCount}</span></div>
      <div class="stat-item">Ukupno postova: <span class="stat-value">${posts.length}</span></div>
    </div>

    <div class="filters-bar">
      <div class="search-input">
        ${searchIcon}
        <input type="text" id="search-posts" placeholder="Pretraži postove..." value="${searchQuery}">
      </div>
      <select class="filter-select" id="filter-post-account">
        <option value="">Svi nalozi</option>
        ${accounts.map(a => `<option value="${a.id}" ${filterAccount === a.id ? 'selected' : ''}>${a.username} (${a.platform})</option>`).join('')}
      </select>
      <select class="filter-select" id="filter-post-whop">
        <option value="">Whop status</option>
        <option value="Pending" ${filterWhopStatus === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="Approved" ${filterWhopStatus === 'Approved' ? 'selected' : ''}>Approved</option>
        <option value="Rejected" ${filterWhopStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
      </select>
    </div>

    ${filtered.length > 0 ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Klip</th>
              <th>Nalog</th>
              <th>Platforma</th>
              <th>Pregledi</th>
              <th>Lajkovi</th>
              <th>Kom.</th>
              <th>Status</th>
              <th>Whop</th>
              <th>Zarada</th>
              <th>Datum</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => {
              const clip = store.getById('clips', p.clipId);
              const account = store.getById('accounts', p.accountId);
              return `
                <tr>
                  <td style="font-weight:500;">${clip ? clip.name : '—'}</td>
                  <td>
                    <div style="font-weight:500;">${account ? account.username : '—'}</div>
                  </td>
                  <td>${platformLabel(p.platform)}</td>
                  <td style="font-weight:600;">${formatNumber(p.views)}</td>
                  <td>${formatNumber(p.likes)}</td>
                  <td>${formatNumber(p.comments)}</td>
                  <td>${statusBadge(p.status)}</td>
                  <td>
                    ${p.whopSubmitted ? statusBadge(p.whopStatus || 'Pending') : '<span style="color:var(--text-dim);font-size:0.8rem;">—</span>'}
                  </td>
                  <td style="font-weight:600;color:var(--gold);">${p.earnings ? formatCurrency(p.earnings) : '—'}</td>
                  <td style="font-size:0.82rem;">${formatDateTime(p.postDate)}</td>
                  <td>
                    <div class="table-actions">
                      ${p.link ? `<a href="${p.link}" target="_blank" class="btn-icon" style="width:30px;height:30px;font-size:0" title="Otvori post">${externalIcon}</a>` : ''}
                      <button title="Izmeni" data-edit="${p.id}">${editIcon}</button>
                      <button class="delete" title="Obriši" data-delete="${p.id}">${deleteIcon}</button>
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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <h3>Nema postova</h3>
        <p>Objavite prvi klip na nekom nalogu</p>
      </div>
    `}
  `;

  // Events
  document.getElementById('btn-add-post')?.addEventListener('click', () => openPostForm());
  document.getElementById('search-posts')?.addEventListener('input', debounce((e) => { searchQuery = e.target.value; renderPosts(); }));
  document.getElementById('filter-post-account')?.addEventListener('change', (e) => { filterAccount = e.target.value; renderPosts(); });
  document.getElementById('filter-post-whop')?.addEventListener('change', (e) => { filterWhopStatus = e.target.value; renderPosts(); });

  content.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openPostForm(btn.dataset.edit));
  });
  content.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (await showConfirm('Obrisati ovaj post?')) {
        store.delete('posts', btn.dataset.delete);
        showToast('Post obrisan', 'success');
        renderPosts();
      }
    });
  });
}

function openPostForm(editId = null) {
  const post = editId ? store.getById('posts', editId) : null;
  const clips = store.getAll('clips');
  const accounts = store.getAll('accounts');

  const body = `
    <form id="post-form" class="form-grid">
      <div class="form-group">
        <label>Klip</label>
        <select name="clipId" required>
          <option value="">— Izaberi klip —</option>
          ${clips.map(c => `<option value="${c.id}" ${post?.clipId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Nalog</label>
        <select name="accountId" required>
          <option value="">— Izaberi nalog —</option>
          ${accounts.map(a => `<option value="${a.id}" ${post?.accountId === a.id ? 'selected' : ''}>${a.username} (${a.platform})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Platforma</label>
        <select name="platform">
          <option value="TikTok" ${post?.platform === 'TikTok' ? 'selected' : ''}>TikTok</option>
          <option value="YouTube" ${post?.platform === 'YouTube' ? 'selected' : ''}>YouTube</option>
          <option value="Instagram" ${post?.platform === 'Instagram' ? 'selected' : ''}>Instagram</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status posta</label>
        <select name="status">
          <option value="Posted" ${post?.status === 'Posted' ? 'selected' : ''}>Posted</option>
          <option value="Removed" ${post?.status === 'Removed' ? 'selected' : ''}>Removed</option>
          <option value="Viral" ${post?.status === 'Viral' ? 'selected' : ''}>Viral</option>
        </select>
      </div>
      <div class="form-group">
        <label>Datum postovanja</label>
        <input type="datetime-local" name="postDate" value="${post?.postDate ? post.postDate.slice(0, 16) : ''}">
      </div>
      <div class="form-group">
        <label>Link ka postu</label>
        <input type="url" name="link" value="${post?.link || ''}" placeholder="https://...">
      </div>
      <div class="form-group">
        <label>Pregledi (views)</label>
        <input type="number" name="views" value="${post?.views || 0}" min="0">
      </div>
      <div class="form-group">
        <label>Lajkovi</label>
        <input type="number" name="likes" value="${post?.likes || 0}" min="0">
      </div>
      <div class="form-group">
        <label>Komentari</label>
        <input type="number" name="comments" value="${post?.comments || 0}" min="0">
      </div>
      <div class="form-group">
        <label>Zarada ($)</label>
        <input type="number" name="earnings" value="${post?.earnings || 0}" step="0.01" min="0">
      </div>
      <div class="form-group">
        <label>&nbsp;</label>
        <div class="checkbox-group">
          <input type="checkbox" name="whopSubmitted" id="cb-whop" ${post?.whopSubmitted ? 'checked' : ''}>
          <label for="cb-whop" style="text-transform:none;font-size:0.875rem;">Submitovano na Whop</label>
        </div>
      </div>
      <div class="form-group">
        <label>Whop status</label>
        <select name="whopStatus">
          <option value="" ${!post?.whopStatus ? 'selected' : ''}>—</option>
          <option value="Pending" ${post?.whopStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Approved" ${post?.whopStatus === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Rejected" ${post?.whopStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </div>
      <div class="form-group">
        <label>Datum Whop submisije</label>
        <input type="date" name="whopSubmitDate" value="${post?.whopSubmitDate || ''}">
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('active');document.body.style.overflow='';">Otkaži</button>
    <button class="btn btn-primary" id="btn-save-post">Sačuvaj</button>
  `;

  openModal(post ? 'Izmeni post' : 'Novi post', body, footer);

  document.getElementById('btn-save-post').addEventListener('click', () => {
    const data = getFormData('post-form');
    if (!data.clipId || !data.accountId) { showToast('Izaberite klip i nalog!', 'error'); return; }
    data.views = parseInt(data.views) || 0;
    data.likes = parseInt(data.likes) || 0;
    data.comments = parseInt(data.comments) || 0;
    data.earnings = parseFloat(data.earnings) || 0;
    if (data.postDate) data.postDate = new Date(data.postDate).toISOString();

    if (editId) {
      store.update('posts', editId, data);
      showToast('Post ažuriran!', 'success');
    } else {
      store.create('posts', data);
      showToast('Post dodat!', 'success');
    }
    closeModal();
    renderPosts();
  });
}
