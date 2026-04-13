// ============================================
// LOVA CRM — Dashboard View
// ============================================

import { store } from '../store.js';
import { formatCurrency, formatNumber, formatDate, formatDateTime, isToday, isThisWeek, isThisMonth, daysUntil, statusBadge, platformLabel } from '../utils.js';

export function renderDashboard() {
  const content = document.getElementById('app-content');
  document.getElementById('page-actions').innerHTML = '';

  const campaigns = store.getAll('campaigns');
  const clips = store.getAll('clips');
  const accounts = store.getAll('accounts');
  const posts = store.getAll('posts');
  const earnings = store.getAll('earnings');
  const team = store.getAll('team');

  // KPI calculations
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const totalEarnings = earnings.reduce((sum, e) => sum + (parseFloat(e.grossAmount) || 0), 0);
  const monthEarnings = earnings.filter(e => isThisMonth(e.createdAt)).reduce((sum, e) => sum + (parseFloat(e.grossAmount) || 0), 0);

  const activeAccounts = accounts.filter(a => a.status === 'Active');
  const tiktokAccounts = activeAccounts.filter(a => a.platform === 'TikTok').length;
  const ytAccounts = activeAccounts.filter(a => a.platform === 'YouTube').length;
  const igAccounts = activeAccounts.filter(a => a.platform === 'Instagram').length;

  const weekClips = clips.filter(c => isThisWeek(c.createdAt)).length;
  const todayPosts = posts.filter(p => isToday(p.postDate)).length;

  // Top 5 posts by views
  const topPosts = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // Accounts that haven't posted today
  const noPostToday = activeAccounts.filter(acc => {
    const accountPosts = posts.filter(p => p.accountId === acc.id);
    return !accountPosts.some(p => isToday(p.postDate));
  });

  // Campaigns expiring within 7 days
  const expiringCampaigns = campaigns.filter(c => {
    if (c.status !== 'Active') return false;
    const days = daysUntil(c.endDate);
    return days >= 0 && days <= 7;
  });

  // Pending earnings
  const pendingEarnings = earnings.filter(e => e.status === 'Pending').reduce((sum, e) => sum + (parseFloat(e.grossAmount) || 0), 0);

  content.innerHTML = `
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Ukupna zarada</div>
        <div class="kpi-value gold">${formatCurrency(totalEarnings)}</div>
        <div class="kpi-sub">Od svih kampanja</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Zarada ovaj mesec</div>
        <div class="kpi-value">${formatCurrency(monthEarnings)}</div>
        <div class="kpi-sub">Na čekanju: ${formatCurrency(pendingEarnings)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Aktivne kampanje</div>
        <div class="kpi-value">${activeCampaigns}</div>
        <div class="kpi-sub">Od ukupno ${campaigns.length}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Aktivni nalozi</div>
        <div class="kpi-value">${activeAccounts.length}</div>
        <div class="kpi-sub">
          <span class="platform-tiktok">TT: ${tiktokAccounts}</span> · 
          <span class="platform-youtube">YT: ${ytAccounts}</span> · 
          <span class="platform-instagram">IG: ${igAccounts}</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Klipovi ove nedelje</div>
        <div class="kpi-value">${weekClips}</div>
        <div class="kpi-sub">Ukupno: ${clips.length}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Postovi danas</div>
        <div class="kpi-value">${todayPosts}</div>
        <div class="kpi-sub">Ukupno: ${posts.length}</div>
      </div>
    </div>

    <!-- Data Grid -->
    <div class="data-grid">
      <!-- Top 5 Posts -->
      <div class="data-section">
        <div class="data-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Top 5 postova po pregledu
        </div>
        ${topPosts.length > 0 ? `
          <table class="mini-table">
            <tbody>
              ${topPosts.map((post, i) => {
                const clip = store.getById('clips', post.clipId);
                const account = store.getById('accounts', post.accountId);
                return `
                  <tr>
                    <td class="rank">#${i + 1}</td>
                    <td>
                      <div style="font-weight:500;">${clip ? clip.name : '—'}</div>
                      <div style="font-size:0.75rem;color:var(--text-dim)">${account ? account.username : '—'} · ${post.platform}</div>
                    </td>
                    <td class="views">${formatNumber(post.views)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : '<p style="color:var(--text-dim);font-size:0.85rem;">Nema postova</p>'}
      </div>

      <!-- Warnings -->
      <div class="data-section">
        <div class="data-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Upozorenja
        </div>

        ${noPostToday.length > 0 ? `
          <div style="margin-bottom:16px;">
            <div style="font-size:0.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Nalozi bez posta danas</div>
            <ul class="warning-list">
              ${noPostToday.map(acc => `
                <li class="warning-item">
                  <span class="warning-dot red"></span>
                  <span style="font-weight:500;">${acc.username}</span>
                  <span style="color:var(--text-dim);font-size:0.8rem;">${acc.platform}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : '<p style="color:var(--green);font-size:0.85rem;margin-bottom:16px;">✓ Svi aktivni nalozi su postovali danas!</p>'}

        ${expiringCampaigns.length > 0 ? `
          <div>
            <div style="font-size:0.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Kampanje koje uskoro ističu</div>
            <ul class="warning-list">
              ${expiringCampaigns.map(c => {
                const days = daysUntil(c.endDate);
                return `
                  <li class="warning-item">
                    <span class="warning-dot ${days <= 3 ? 'red' : 'orange'}"></span>
                    <span style="font-weight:500;">${c.name}</span>
                    <span style="color:var(--text-dim);font-size:0.8rem;">još ${days} dana</span>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        ` : ''}

        ${noPostToday.length === 0 && expiringCampaigns.length === 0 ? `
          <p style="color:var(--green);font-size:0.85rem;">✓ Sve je u redu!</p>
        ` : ''}
      </div>

      <!-- Campaign Stats -->
      <div class="data-section">
        <div class="data-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Status kampanja
        </div>
        <table class="mini-table">
          <tbody>
            ${campaigns.map(c => {
              const campPosts = posts.filter(p => {
                const clip = store.getById('clips', p.clipId);
                return clip && clip.campaignId === c.id;
              });
              const campEarnings = campPosts.reduce((sum, p) => sum + (parseFloat(p.earnings) || 0), 0);
              const campViews = campPosts.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);
              return `
                <tr>
                  <td>
                    <div style="font-weight:500;">${c.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);">${formatNumber(campViews)} pregleda · ${campPosts.length} postova</div>
                  </td>
                  <td style="text-align:right;">
                    ${statusBadge(c.status)}
                    <div style="font-size:0.8rem;font-weight:600;color:var(--gold);margin-top:4px;">${formatCurrency(campEarnings)}</div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Team Overview -->
      <div class="data-section">
        <div class="data-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Pregled tima
        </div>
        <table class="mini-table">
          <tbody>
            ${team.filter(m => m.status === 'Active').map(member => {
              const memberEarnings = earnings
                .filter(e => e.teamMemberId === member.id)
                .reduce((sum, e) => sum + (parseFloat(e.netMember) || 0), 0);
              const memberAccounts = accounts.filter(a => a.teamMemberId === member.id && a.status === 'Active').length;
              return `
                <tr>
                  <td>
                    <div style="font-weight:500;">${member.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);">${member.role} · ${member.percentage}% · ${memberAccounts} naloga</div>
                  </td>
                  <td style="text-align:right;font-weight:600;color:var(--gold);">${formatCurrency(memberEarnings)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
