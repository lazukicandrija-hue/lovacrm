// ============================================
// LOVA CRM — Main Application & Router
// ============================================

import { store } from './store.js';
import { closeModal, showToast } from './utils.js';
import { renderDashboard } from './views/dashboard.js';
import { renderCampaigns } from './views/campaigns.js';
import { renderSourceVideos } from './views/sourceVideos.js';
import { renderClips } from './views/clips.js';
import { renderAccounts } from './views/accounts.js';
import { renderPosts } from './views/posts.js';
import { renderTeam } from './views/team.js';
import { renderEarnings } from './views/earnings.js';
import { renderProxies } from './views/proxies.js';

// Route map
const routes = {
  'dashboard':    { render: renderDashboard,    title: 'Kontrolna tabla',  subtitle: 'Pregled ključnih metrika' },
  'kampanje':     { render: renderCampaigns,    title: 'Kampanje',         subtitle: 'Upravljanje Content Rewards kampanjama' },
  'source-videi': { render: renderSourceVideos,  title: 'Source videi',     subtitle: 'Izvorni video materijali' },
  'klipovi':      { render: renderClips,        title: 'Klipovi',          subtitle: 'Kreiranje i praćenje klipova' },
  'nalozi':       { render: renderAccounts,     title: 'Nalozi',           subtitle: 'Social media nalozi za postovanje' },
  'postovi':      { render: renderPosts,        title: 'Postovi',          subtitle: 'Objavljeni klipovi na platformama' },
  'tim':          { render: renderTeam,         title: 'Tim',              subtitle: 'Članovi tima i raspodela zarade' },
  'zarada':       { render: renderEarnings,     title: 'Zarada',           subtitle: 'Praćenje prihoda i isplata' },
  'proksiji':     { render: renderProxies,      title: 'Proksiji',         subtitle: 'Proxy serveri za naloge' },
};

function router() {
  const hash = window.location.hash.slice(2) || 'dashboard';
  const route = routes[hash];

  if (!route) {
    window.location.hash = '#/dashboard';
    return;
  }

  // Update page header
  document.getElementById('page-title').textContent = route.title;
  document.getElementById('page-subtitle').textContent = route.subtitle;

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(item => {
    const isActive = item.dataset.route === hash;
    item.classList.toggle('active', isActive);
    if (isActive && item.dataset.color) {
      item.style.setProperty('--nav-color', item.dataset.color);
    }
  });

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');

  // Render view
  const content = document.getElementById('app-content');
  content.style.opacity = '0';
  content.style.transform = 'translateY(8px)';

  setTimeout(() => {
    route.render();
    content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
  }, 50);
}

function initApp() {
  // Seed demo data if empty
  store.seedIfEmpty();

  // Modal close handlers
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Mobile sidebar toggle
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
  });

  document.getElementById('sidebar-overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  });

  // Export data
  document.getElementById('btn-export').addEventListener('click', () => {
    const json = store.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lova-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Podaci uspešno izvezeni!', 'success');
  });

  // Import data
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        store.importAll(evt.target.result);
        showToast('Podaci uspešno uvezeni!', 'success');
        router(); // Re-render current view
      } catch (err) {
        showToast('Greška pri uvozu podataka!', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.getElementById('confirm-overlay').classList.remove('active');
    }
  });

  // Set nav colors from data attributes
  document.querySelectorAll('.nav-item[data-color]').forEach(item => {
    item.style.setProperty('--nav-color', item.dataset.color);
  });

  // Initial route
  router();
}

// Listen for hash changes
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', initApp);
