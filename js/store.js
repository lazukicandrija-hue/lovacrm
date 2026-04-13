// ============================================
// LOVA CRM — Data Store (localStorage)
// ============================================

const STORE_KEYS = {
  campaigns:    'lova_campaigns',
  sourceVideos: 'lova_source_videos',
  clips:        'lova_clips',
  accounts:     'lova_accounts',
  posts:        'lova_posts',
  team:         'lova_team',
  earnings:     'lova_earnings',
  proxies:      'lova_proxies',
  emails:       'lova_emails',
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

class Store {
  getAll(entity) {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEYS[entity]) || '[]');
    } catch {
      return [];
    }
  }

  getById(entity, id) {
    return this.getAll(entity).find(item => item.id === id) || null;
  }

  create(entity, data) {
    const items = this.getAll(entity);
    const newItem = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(STORE_KEYS[entity], JSON.stringify(items));
    return newItem;
  }

  update(entity, id, data) {
    const items = this.getAll(entity);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORE_KEYS[entity], JSON.stringify(items));
    return items[index];
  }

  delete(entity, id) {
    let items = this.getAll(entity);
    items = items.filter(item => item.id !== id);
    localStorage.setItem(STORE_KEYS[entity], JSON.stringify(items));
  }

  count(entity, filterFn) {
    const items = this.getAll(entity);
    return filterFn ? items.filter(filterFn).length : items.length;
  }

  exportAll() {
    const data = {};
    Object.keys(STORE_KEYS).forEach(key => {
      data[key] = this.getAll(key);
    });
    return JSON.stringify(data, null, 2);
  }

  importAll(jsonString) {
    const data = JSON.parse(jsonString);
    Object.keys(data).forEach(key => {
      if (STORE_KEYS[key]) {
        localStorage.setItem(STORE_KEYS[key], JSON.stringify(data[key]));
      }
    });
  }

  clearAll() {
    Object.values(STORE_KEYS).forEach(key => localStorage.removeItem(key));
  }

  isSeeded() {
    return localStorage.getItem('lova_seeded') === 'true';
  }

  seedIfEmpty() {
    if (this.isSeeded()) return;
    this.seedDemoData();
    localStorage.setItem('lova_seeded', 'true');
  }

  seedDemoData() {
    // --- Team Members ---
    const team = [
      { id: 'team_1', name: 'Andrija Lazukić', role: 'CEO', percentage: 50, contact: '@andrija_lova', status: 'Active', createdAt: '2025-01-15T10:00:00Z' },
      { id: 'team_2', name: 'Marko Nikolić', role: 'Editor', percentage: 30, contact: '@marko_edits', status: 'Active', createdAt: '2025-02-01T10:00:00Z' },
      { id: 'team_3', name: 'Ana Petrović', role: 'Poster', percentage: 20, contact: '@ana_posts', status: 'Active', createdAt: '2025-02-10T10:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.team, JSON.stringify(team));

    // --- Proxies ---
    const proxies = [
      { id: 'proxy_1', name: '4G Mobile US #1', type: 'Mobile', location: 'SAD', monthlyCost: 30, status: 'Active', expiryDate: '2025-06-15', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'proxy_2', name: 'Resi UK #1', type: 'Residential', location: 'UK', monthlyCost: 15, status: 'Active', expiryDate: '2025-07-01', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'proxy_3', name: 'DC Germany #1', type: 'Datacenter', location: 'Nemačka', monthlyCost: 5, status: 'Expired', expiryDate: '2025-04-01', createdAt: '2025-01-01T10:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.proxies, JSON.stringify(proxies));

    // --- Campaigns ---
    const campaigns = [
      {
        id: 'camp_1', name: 'Higgsfield - See Dance', platform: 'Whop',
        link: 'https://whop.com/higgsfield-see-dance', budget: 5000, cpmRate: 2,
        minResolution: '4K', minDuration: 15, maxDuration: 60, watermark: true,
        watermarkFile: '', status: 'Active', startDate: '2025-03-01', endDate: '2025-06-01',
        notes: 'Plesni klipovi, AI generisani. Visok CPM.', createdAt: '2025-03-01T10:00:00Z'
      },
      {
        id: 'camp_2', name: 'CapCut Templates Pro', platform: 'Whop',
        link: 'https://whop.com/capcut-templates', budget: 3000, cpmRate: 1.5,
        minResolution: '2K', minDuration: 10, maxDuration: 45, watermark: false,
        watermarkFile: '', status: 'Active', startDate: '2025-03-15', endDate: '2025-05-15',
        notes: 'CapCut before/after tranzicije.', createdAt: '2025-03-15T10:00:00Z'
      },
      {
        id: 'camp_3', name: 'Artlist Music Promo', platform: 'Whop',
        link: 'https://whop.com/artlist-music', budget: 2000, cpmRate: 1.8,
        minResolution: '2K', minDuration: 20, maxDuration: 90, watermark: true,
        watermarkFile: '', status: 'Completed', startDate: '2025-01-01', endDate: '2025-03-01',
        notes: 'Završena kampanja. Dobra zarada.', createdAt: '2025-01-01T10:00:00Z'
      },
    ];
    localStorage.setItem(STORE_KEYS.campaigns, JSON.stringify(campaigns));

    // --- Source Videos ---
    const sourceVideos = [
      { id: 'sv_1', name: 'Dance Compilation #1', driveLink: 'https://drive.google.com/dance1', downloadLink: '', duration: '03:45', resolution: '4K', fileSize: 850, description: 'Profesionalni plesači, urbani pejzaž, AI efekti', campaignId: 'camp_1', status: 'Available', createdAt: '2025-03-05T10:00:00Z' },
      { id: 'sv_2', name: 'Dance Compilation #2', driveLink: 'https://drive.google.com/dance2', downloadLink: '', duration: '05:12', resolution: '4K', fileSize: 1200, description: 'Solo plesačica, studio snimak sa svetlosnim efektima', campaignId: 'camp_1', status: 'Available', createdAt: '2025-03-08T10:00:00Z' },
      { id: 'sv_3', name: 'CapCut Tutorial Raw', driveLink: 'https://drive.google.com/capcut1', downloadLink: '', duration: '08:30', resolution: '2K', fileSize: 2100, description: 'Screen recording CapCut editovanja sa narativom', campaignId: 'camp_2', status: 'Available', createdAt: '2025-03-18T10:00:00Z' },
      { id: 'sv_4', name: 'Before/After Transitions', driveLink: 'https://drive.google.com/capcut2', downloadLink: '', duration: '04:00', resolution: '4K', fileSize: 980, description: 'Razne before/after tranzicije za CapCut template', campaignId: 'camp_2', status: 'Used', createdAt: '2025-03-20T10:00:00Z' },
      { id: 'sv_5', name: 'Artlist Showcase Reel', driveLink: 'https://drive.google.com/artlist1', downloadLink: '', duration: '06:15', resolution: '4K', fileSize: 1500, description: 'Cinematic B-roll sa Artlist muzikom u pozadini', campaignId: 'camp_3', status: 'Archived', createdAt: '2025-01-05T10:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.sourceVideos, JSON.stringify(sourceVideos));

    // --- Accounts ---
    const accounts = [
      { id: 'acc_1', username: '@viralclips_01', platform: 'TikTok', email: 'viral01@mail.com', status: 'Active', proxyId: 'proxy_1', dateCreated: '2025-02-01', totalPosts: 45, avgViews: 12500, followers: 3200, dailyLimit: 3, lastPost: '2025-04-13T08:00:00Z', notes: 'Glavni nalog za TikTok', teamMemberId: 'team_3', createdAt: '2025-02-01T10:00:00Z' },
      { id: 'acc_2', username: '@viralclips_02', platform: 'TikTok', email: 'viral02@mail.com', status: 'Active', proxyId: 'proxy_1', dateCreated: '2025-02-15', totalPosts: 32, avgViews: 8900, followers: 1800, dailyLimit: 2, lastPost: '2025-04-12T14:00:00Z', notes: '', teamMemberId: 'team_3', createdAt: '2025-02-15T10:00:00Z' },
      { id: 'acc_3', username: '@shortsviral_01', platform: 'YouTube', email: 'shorts01@mail.com', status: 'Active', proxyId: 'proxy_2', dateCreated: '2025-01-20', totalPosts: 28, avgViews: 25000, followers: 5400, dailyLimit: 2, lastPost: '2025-04-13T10:00:00Z', notes: 'YT Shorts nalog', teamMemberId: 'team_3', createdAt: '2025-01-20T10:00:00Z' },
      { id: 'acc_4', username: '@reelsfire', platform: 'Instagram', email: 'reelsfire@mail.com', status: 'Warming Up', proxyId: 'proxy_2', dateCreated: '2025-04-01', totalPosts: 5, avgViews: 500, followers: 120, dailyLimit: 1, lastPost: '2025-04-11T09:00:00Z', notes: 'Nov nalog, warming up faza', teamMemberId: 'team_3', createdAt: '2025-04-01T10:00:00Z' },
      { id: 'acc_5', username: '@dancevibes_tt', platform: 'TikTok', email: 'dancevibes@mail.com', status: 'Active', proxyId: 'proxy_1', dateCreated: '2025-03-01', totalPosts: 22, avgViews: 15600, followers: 4100, dailyLimit: 3, lastPost: '2025-04-13T12:00:00Z', notes: '', teamMemberId: 'team_3', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'acc_6', username: '@clipmaster_yt', platform: 'YouTube', email: 'clipmaster@mail.com', status: 'Banned', proxyId: 'proxy_3', dateCreated: '2025-01-10', totalPosts: 15, avgViews: 3200, followers: 800, dailyLimit: 0, lastPost: '2025-03-15T10:00:00Z', notes: 'Banovan zbog community guidelines', teamMemberId: 'team_3', createdAt: '2025-01-10T10:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.accounts, JSON.stringify(accounts));

    // --- Clips ---
    const clips = [
      { id: 'clip_1', name: 'Dance Viral Cut #1', sourceVideoId: 'sv_1', campaignId: 'camp_1', duration: 28, resolution: '4K', hasWatermark: true, hasCaptions: true, status: 'Approved', driveLink: 'https://drive.google.com/clip1', createdBy: 'team_2', captionsBy: 'team_2', notes: 'Best performer', createdAt: '2025-03-10T10:00:00Z' },
      { id: 'clip_2', name: 'Dance Viral Cut #2', sourceVideoId: 'sv_1', campaignId: 'camp_1', duration: 35, resolution: '4K', hasWatermark: true, hasCaptions: true, status: 'Approved', driveLink: 'https://drive.google.com/clip2', createdBy: 'team_2', captionsBy: 'team_2', notes: '', createdAt: '2025-03-11T10:00:00Z' },
      { id: 'clip_3', name: 'Dance Studio Cut', sourceVideoId: 'sv_2', campaignId: 'camp_1', duration: 42, resolution: '4K', hasWatermark: true, hasCaptions: false, status: 'Ready', driveLink: 'https://drive.google.com/clip3', createdBy: 'team_2', captionsBy: '', notes: 'Treba dodati captions', createdAt: '2025-03-12T10:00:00Z' },
      { id: 'clip_4', name: 'CapCut Before/After #1', sourceVideoId: 'sv_4', campaignId: 'camp_2', duration: 22, resolution: '2K', hasWatermark: false, hasCaptions: true, status: 'Posted', driveLink: 'https://drive.google.com/clip4', createdBy: 'team_2', captionsBy: 'team_2', notes: '', createdAt: '2025-03-22T10:00:00Z' },
      { id: 'clip_5', name: 'CapCut Magic Edit', sourceVideoId: 'sv_3', campaignId: 'camp_2', duration: 30, resolution: '2K', hasWatermark: false, hasCaptions: true, status: 'Submitted', driveLink: 'https://drive.google.com/clip5', createdBy: 'team_2', captionsBy: 'team_1', notes: '', createdAt: '2025-03-25T10:00:00Z' },
      { id: 'clip_6', name: 'Draft Test Clip', sourceVideoId: 'sv_1', campaignId: 'camp_1', duration: 18, resolution: '4K', hasWatermark: false, hasCaptions: false, status: 'Draft', driveLink: '', createdBy: 'team_2', captionsBy: '', notes: 'Treba watermark i captions', createdAt: '2025-04-12T10:00:00Z' },
      { id: 'clip_7', name: 'Artlist Cinematic #1', sourceVideoId: 'sv_5', campaignId: 'camp_3', duration: 45, resolution: '4K', hasWatermark: true, hasCaptions: true, status: 'Approved', driveLink: 'https://drive.google.com/clip7', createdBy: 'team_2', captionsBy: 'team_2', notes: '', createdAt: '2025-01-15T10:00:00Z' },
      { id: 'clip_8', name: 'Rejected Dance Clip', sourceVideoId: 'sv_2', campaignId: 'camp_1', duration: 12, resolution: '2K', hasWatermark: false, hasCaptions: false, status: 'Rejected', driveLink: 'https://drive.google.com/clip8', createdBy: 'team_2', captionsBy: '', notes: 'Rezolucija ne zadovoljava minimum (treba 4K)', createdAt: '2025-03-14T10:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.clips, JSON.stringify(clips));

    // --- Posts ---
    const posts = [
      { id: 'post_1', clipId: 'clip_1', accountId: 'acc_1', platform: 'TikTok', postDate: '2025-03-15T14:00:00Z', link: 'https://tiktok.com/@viralclips_01/video/1', views: 125000, likes: 8500, comments: 320, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-03-16', whopStatus: 'Approved', earnings: 250, createdAt: '2025-03-15T14:00:00Z' },
      { id: 'post_2', clipId: 'clip_1', accountId: 'acc_3', platform: 'YouTube', postDate: '2025-03-16T10:00:00Z', link: 'https://youtube.com/shorts/abc', views: 85000, likes: 4200, comments: 180, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-03-17', whopStatus: 'Approved', earnings: 170, createdAt: '2025-03-16T10:00:00Z' },
      { id: 'post_3', clipId: 'clip_2', accountId: 'acc_5', platform: 'TikTok', postDate: '2025-03-18T16:00:00Z', link: 'https://tiktok.com/@dancevibes_tt/video/2', views: 340000, likes: 22000, comments: 890, status: 'Viral', whopSubmitted: true, whopSubmitDate: '2025-03-19', whopStatus: 'Approved', earnings: 680, createdAt: '2025-03-18T16:00:00Z' },
      { id: 'post_4', clipId: 'clip_2', accountId: 'acc_1', platform: 'TikTok', postDate: '2025-03-20T12:00:00Z', link: 'https://tiktok.com/@viralclips_01/video/3', views: 56000, likes: 3800, comments: 145, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-03-21', whopStatus: 'Approved', earnings: 112, createdAt: '2025-03-20T12:00:00Z' },
      { id: 'post_5', clipId: 'clip_4', accountId: 'acc_2', platform: 'TikTok', postDate: '2025-03-25T09:00:00Z', link: 'https://tiktok.com/@viralclips_02/video/4', views: 42000, likes: 2800, comments: 95, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-03-26', whopStatus: 'Pending', earnings: 63, createdAt: '2025-03-25T09:00:00Z' },
      { id: 'post_6', clipId: 'clip_5', accountId: 'acc_3', platform: 'YouTube', postDate: '2025-03-28T11:00:00Z', link: 'https://youtube.com/shorts/def', views: 98000, likes: 5100, comments: 210, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-03-29', whopStatus: 'Approved', earnings: 147, createdAt: '2025-03-28T11:00:00Z' },
      { id: 'post_7', clipId: 'clip_7', accountId: 'acc_1', platform: 'TikTok', postDate: '2025-02-10T15:00:00Z', link: 'https://tiktok.com/@viralclips_01/video/5', views: 210000, likes: 14000, comments: 560, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-02-11', whopStatus: 'Approved', earnings: 378, createdAt: '2025-02-10T15:00:00Z' },
      { id: 'post_8', clipId: 'clip_7', accountId: 'acc_3', platform: 'YouTube', postDate: '2025-02-12T10:00:00Z', link: 'https://youtube.com/shorts/ghi', views: 175000, likes: 9800, comments: 420, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-02-13', whopStatus: 'Approved', earnings: 315, createdAt: '2025-02-12T10:00:00Z' },
      { id: 'post_9', clipId: 'clip_4', accountId: 'acc_4', platform: 'Instagram', postDate: '2025-04-10T08:00:00Z', link: 'https://instagram.com/reelsfire/reel/1', views: 1200, likes: 65, comments: 8, status: 'Posted', whopSubmitted: false, whopSubmitDate: '', whopStatus: '', earnings: 0, createdAt: '2025-04-10T08:00:00Z' },
      { id: 'post_10', clipId: 'clip_1', accountId: 'acc_2', platform: 'TikTok', postDate: '2025-04-12T20:00:00Z', link: 'https://tiktok.com/@viralclips_02/video/6', views: 28000, likes: 1800, comments: 72, status: 'Posted', whopSubmitted: true, whopSubmitDate: '2025-04-13', whopStatus: 'Pending', earnings: 56, createdAt: '2025-04-12T20:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.posts, JSON.stringify(posts));

    // --- Earnings ---
    const earnings = [
      { id: 'earn_1', campaignId: 'camp_1', postId: 'post_1', teamMemberId: 'team_1', grossAmount: 250, percentage: 50, netAgency: 125, netMember: 125, status: 'Paid', paymentDate: '2025-04-01', paymentMethod: 'Crypto', createdAt: '2025-03-20T10:00:00Z' },
      { id: 'earn_2', campaignId: 'camp_1', postId: 'post_2', teamMemberId: 'team_2', grossAmount: 170, percentage: 30, netAgency: 119, netMember: 51, status: 'Paid', paymentDate: '2025-04-01', paymentMethod: 'Crypto', createdAt: '2025-03-20T10:00:00Z' },
      { id: 'earn_3', campaignId: 'camp_1', postId: 'post_3', teamMemberId: 'team_3', grossAmount: 680, percentage: 20, netAgency: 544, netMember: 136, status: 'Paid', paymentDate: '2025-04-01', paymentMethod: 'PayPal', createdAt: '2025-03-25T10:00:00Z' },
      { id: 'earn_4', campaignId: 'camp_1', postId: 'post_4', teamMemberId: 'team_1', grossAmount: 112, percentage: 50, netAgency: 56, netMember: 56, status: 'Pending', paymentDate: '', paymentMethod: '', createdAt: '2025-03-25T10:00:00Z' },
      { id: 'earn_5', campaignId: 'camp_2', postId: 'post_5', teamMemberId: 'team_2', grossAmount: 63, percentage: 30, netAgency: 44.1, netMember: 18.9, status: 'Pending', paymentDate: '', paymentMethod: '', createdAt: '2025-03-30T10:00:00Z' },
      { id: 'earn_6', campaignId: 'camp_2', postId: 'post_6', teamMemberId: 'team_1', grossAmount: 147, percentage: 50, netAgency: 73.5, netMember: 73.5, status: 'Pending', paymentDate: '', paymentMethod: '', createdAt: '2025-04-02T10:00:00Z' },
      { id: 'earn_7', campaignId: 'camp_3', postId: 'post_7', teamMemberId: 'team_1', grossAmount: 378, percentage: 50, netAgency: 189, netMember: 189, status: 'Paid', paymentDate: '2025-03-15', paymentMethod: 'Crypto', createdAt: '2025-02-15T10:00:00Z' },
      { id: 'earn_8', campaignId: 'camp_3', postId: 'post_8', teamMemberId: 'team_2', grossAmount: 315, percentage: 30, netAgency: 220.5, netMember: 94.5, status: 'Paid', paymentDate: '2025-03-15', paymentMethod: 'PayPal', createdAt: '2025-02-18T10:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.earnings, JSON.stringify(earnings));

    // --- Emails ---
    const emails = [
      { id: 'email_1', email: 'viral01@gmail.com', password: 'V!ral2025#Secure', recoveryEmail: 'backup01@outlook.com', phone: '+381 64 123 4567', provider: 'Gmail', status: 'Active', notes: 'Glavni mail za TikTok naloge', createdAt: '2025-02-01T10:00:00Z' },
      { id: 'email_2', email: 'viral02@gmail.com', password: 'Cl1pp3r$2025!', recoveryEmail: 'backup01@outlook.com', phone: '+381 64 123 4567', provider: 'Gmail', status: 'Active', notes: 'Drugi TikTok nalog', createdAt: '2025-02-15T10:00:00Z' },
      { id: 'email_3', email: 'shorts01@outlook.com', password: 'Sh0rts_V1ral@25', recoveryEmail: 'viral01@gmail.com', phone: '+381 65 987 6543', provider: 'Outlook', status: 'Active', notes: 'YouTube Shorts nalog', createdAt: '2025-01-20T10:00:00Z' },
      { id: 'email_4', email: 'reelsfire@gmail.com', password: 'R33ls_F1r3!2025', recoveryEmail: '', phone: '+381 66 555 1234', provider: 'Gmail', status: 'Active', notes: 'Instagram Reels - warming up', createdAt: '2025-04-01T10:00:00Z' },
      { id: 'email_5', email: 'dancevibes@yahoo.com', password: 'D4nc3V1bes#!', recoveryEmail: 'viral01@gmail.com', phone: '', provider: 'Yahoo', status: 'Active', notes: '', createdAt: '2025-03-01T10:00:00Z' },
      { id: 'email_6', email: 'clipmaster@gmail.com', password: 'Cl1pM4st3r_OLD', recoveryEmail: '', phone: '+381 64 123 4567', provider: 'Gmail', status: 'Banned', notes: 'Banovan nalog - ne koristiti', createdAt: '2025-01-10T10:00:00Z' },
    ];
    localStorage.setItem(STORE_KEYS.emails, JSON.stringify(emails));
  }
}

export const store = new Store();
