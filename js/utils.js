// ============================================
// LOVA CRM — Utility Functions
// ============================================

/**
 * Format date to DD.MM.YYYY
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format datetime to DD.MM.YYYY HH:mm
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${mins}`;
}

/**
 * Format currency in USD
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  return '$' + parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format large numbers
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '0';
  num = parseInt(num);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

/**
 * Debounce function
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), ms);
  };
}

/**
 * Render a status badge
 */
export function statusBadge(status) {
  if (!status) return '';
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  const map = {
    'active': 'active', 'paused': 'paused', 'completed': 'completed',
    'expired': 'expired', 'available': 'active', 'used': 'completed',
    'archived': 'archived', 'draft': 'draft', 'ready': 'ready',
    'posted': 'posted', 'submitted': 'submitted', 'approved': 'approved',
    'rejected': 'rejected', 'warming-up': 'warming', 'banned': 'banned',
    'inactive': 'inactive', 'removed': 'removed', 'viral': 'viral',
    'pending': 'pending', 'paid': 'paid', 'withdrawn': 'withdrawn',
    'unread': 'expired', 'read': 'draft', 'sent': 'submitted', 'replied': 'approved',
  };
  const badgeCls = map[cls] || 'draft';
  return `<span class="badge badge-${badgeCls}">${status}</span>`;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
}

/**
 * Check if a date is within the last N days
 */
export function isWithinDays(dateStr, days) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

/**
 * Check if date is within current week
 */
export function isThisWeek(dateStr) {
  return isWithinDays(dateStr, 7);
}

/**
 * Check if date is within current month
 */
export function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/**
 * Days until a date (negative = past)
 */
export function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Open modal
 */
export function openModal(title, bodyHtml, footerHtml = '') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-footer').innerHTML = footerHtml;
  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Show confirm dialog
 */
export function showConfirm(message) {
  return new Promise((resolve) => {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-overlay').classList.add('active');

    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    function cleanup() {
      document.getElementById('confirm-overlay').classList.remove('active');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
    }

    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

/**
 * Search icon SVG
 */
export const searchIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

/**
 * Plus icon SVG
 */
export const plusIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

/**
 * Edit icon SVG
 */
export const editIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

/**
 * Delete icon SVG
 */
export const deleteIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

/**
 * External link icon SVG
 */
export const externalIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

/**
 * Today's date as YYYY-MM-DD
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get form data from a form element
 */
export function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  const fd = new FormData(form);
  const data = {};
  for (const [key, value] of fd.entries()) {
    data[key] = value;
  }
  // Handle checkboxes
  form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    data[cb.name] = cb.checked;
  });
  return data;
}

/**
 * Platform styling
 */
export function platformLabel(platform) {
  const map = {
    'TikTok': '<span class="platform-icon platform-tiktok">⚡ TikTok</span>',
    'YouTube': '<span class="platform-icon platform-youtube">▶ YouTube</span>',
    'Instagram': '<span class="platform-icon platform-instagram">📷 Instagram</span>',
  };
  return map[platform] || platform;
}

/**
 * Truncate text
 */
export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}
