/* ============================================
   AINCRAD.DEV — V0.0.7
   ============================================ */

(() => {
  'use strict';

  const CONFIG = {
    startDate: new Date(Date.now() - 6 * 86400000),
    version: 'v0.0.7',
    discordServerId: '1511728016940863568', // Server ID for widget API
    discordInvite: 'RpWcRSUhUe',
    // sao_trailer.html must be in the same folder as index.html
    trailerSrc: 'trailer.html',
  };

  // ============ LINK START ============
  const linkStart = document.getElementById('linkStart');
  const linkFill = document.getElementById('linkFill');
  const linkText = document.getElementById('linkText');

  const linkMessages = [
    'LINK START',
    'CONNECTING',
    'AUTHENTICATING',
    'ESTABLISHING LINK',
    'COMPLETED'
  ];

  let linkProgress = 0;
  let msgIndex = 0;

  const linkInterval = setInterval(() => {
    linkProgress += Math.random() * 8 + 4;
    if (linkProgress >= 100) {
      linkProgress = 100;
      clearInterval(linkInterval);
      linkText.textContent = 'COMPLETED';
      setTimeout(() => linkStart.classList.add('hide'), 700);
    } else {
      const nextMsgIdx = Math.floor((linkProgress / 100) * linkMessages.length);
      if (nextMsgIdx !== msgIndex && nextMsgIdx < linkMessages.length) {
        msgIndex = nextMsgIdx;
        linkText.style.opacity = '0';
        setTimeout(() => {
          linkText.textContent = linkMessages[msgIndex];
          linkText.style.opacity = '1';
        }, 150);
      }
    }
    linkFill.style.width = linkProgress + '%';
  }, 120);

  // ============ LOGIN ============
  const login = document.getElementById('login');
  const site = document.getElementById('site');
  const loginForm = document.getElementById('loginForm');
  const nameInput = document.getElementById('nameInput');
  const guestBtn = document.getElementById('guestBtn');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const navUserName = document.getElementById('navUserName');
  const logoutBtn = document.getElementById('logoutBtn');

  const enterSite = (name) => {
    if (name) {
      localStorage.setItem('aincrad_player', name);
      userNameDisplay.textContent = name.toUpperCase();
      navUserName.textContent = name;
    }
    login.classList.add('hide');
    setTimeout(() => {
      login.style.display = 'none';
      site.hidden = false;
    }, 500);
  };

  const logout = () => {
    if (confirm('Logout from Aincrad?')) {
      localStorage.removeItem('aincrad_player');
      location.reload();
    }
  };

  const savedName = localStorage.getItem('aincrad_player');
  if (savedName) enterSite(savedName);

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (name) enterSite(name);
  });
  guestBtn?.addEventListener('click', () => enterSite('Player'));
  logoutBtn?.addEventListener('click', logout);

  // ============ CLOCK + DATE + YEAR ============
  const pad = n => String(n).padStart(2, '0');
  const clockText = document.getElementById('clockText');
  const clockMid = document.getElementById('clockMid');
  const dateText = document.getElementById('dateText');
  const yearText = document.getElementById('yearText');
  const todayDate = document.getElementById('todayDate');
  const daysEl = document.getElementById('days');

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const updateClock = () => {
    const now = new Date();
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (clockText) clockText.textContent = time;
    if (clockMid) clockMid.textContent = time;
    if (dateText) dateText.textContent = `${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;
    if (yearText) yearText.textContent = now.getFullYear();
    if (todayDate) todayDate.textContent = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const diffMs = now - CONFIG.startDate;
    const days = Math.max(1, Math.floor(diffMs / 86400000) + 1);
    if (daysEl) daysEl.textContent = days;
  };
  updateClock();
  setInterval(updateClock, 1000);

  // ============ DISCORD MEMBER COUNT (Invite API — no setup needed) ============
  const setDiscordCount = (count) => {
    ['discordCount', 'discordCount2', 'discordCount3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    });
  };

  const fetchDiscordCount = async () => {
    try {
      // The invite API returns approximate_member_count with no auth or widget setup needed
      const res = await fetch(
        `https://discord.com/api/invites/${CONFIG.discordInvite}?with_counts=true`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const count = data.approximate_member_count;
      if (typeof count === 'number') {
        setDiscordCount(count);
      } else {
        throw new Error('No member count in response');
      }
    } catch (err) {
      console.warn('[Aincrad] Discord invite fetch failed:', err.message);
      setDiscordCount('35+'); // static fallback
    }
  };

  fetchDiscordCount();

  // ============ TRAILER MODAL ============
  const trailerOverlay = document.getElementById('trailerOverlay');
  const trailerFrame = document.getElementById('trailerFrame');
  const trailerClose = document.getElementById('trailerClose');
  const watchTrailerBtn = document.getElementById('watchTrailerBtn');
  const trailerPlayBtn2 = document.getElementById('trailerPlayBtn2');
  const trailerThumb = document.getElementById('trailerThumb');

  const openTrailer = () => {
    trailerFrame.src = CONFIG.trailerSrc;
    trailerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeTrailer = () => {
    trailerOverlay.classList.remove('open');
    // Stop the iframe by clearing src
    setTimeout(() => { trailerFrame.src = ''; }, 300);
    document.body.style.overflow = '';
  };

  watchTrailerBtn?.addEventListener('click', openTrailer);
  trailerPlayBtn2?.addEventListener('click', openTrailer);
  trailerThumb?.addEventListener('click', openTrailer);
  trailerClose?.addEventListener('click', closeTrailer);

  // Close on overlay background click
  trailerOverlay?.addEventListener('click', (e) => {
    if (e.target === trailerOverlay) closeTrailer();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && trailerOverlay.classList.contains('open')) {
      closeTrailer();
    }
  });

  // Listen for close message from the iframe (sao_trailer.html sends this)
  window.addEventListener('message', (e) => {
    if (e.data?.action === 'closeTrailer') closeTrailer();
  });

  // ============ AVATAR FALLBACKS ============
  // onerror inline HTML replacement is unreliable — handle it in JS instead
  document.querySelectorAll('.avatar-img').forEach(img => {
    const initials = img.alt ? img.alt.slice(0, 2).toUpperCase() : '??';
    img.addEventListener('error', () => {
      const div = document.createElement('div');
      div.className = 'avatar av-fallback';
      div.textContent = initials;
      img.replaceWith(div);
    });
    // If image is already broken (cached 404), fire manually
    if (img.complete && !img.naturalWidth) {
      img.dispatchEvent(new Event('error'));
    }
  });

  // ============ MOBILE MENU ============
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    menuBtn.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.classList.remove('open');
    });
  });

})();