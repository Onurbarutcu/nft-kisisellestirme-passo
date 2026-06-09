// PASSO · Hatıra Bilet — interactions

// Header shadow + back-to-top visibility on scroll
const header = document.querySelector('.site-header');
const backToTop = document.getElementById('backToTop');

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 20);
  backToTop.classList.toggle('show', y > 600);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Back to top
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Events coverflow carousel =====
const events = [
  { img: 'assets/img/event-drakula.jpg', title: 'Drakula', date: '20 Şubat Cumartesi – 21:00' },
  { img: 'assets/img/event-anyma.jpg',   title: 'ANYMA PRESENTS ÆDEN', date: '20 Şubat Cumartesi – 21:00' },
  { img: 'assets/img/event-tan.jpg',     title: 'Tan Taşçı', date: '20 Şubat Cumartesi – 21:00' },
];
const track = document.getElementById('eventsTrack');
const progress = document.getElementById('eventsProgress');

if (track) {
  // render every slide + a progress segment per slide
  track.innerHTML = events.map((e, i) => `
    <div class="event-card" data-index="${i}">
      <div class="event-poster"><img src="${e.img}" alt="${e.title}" /></div>
      <div class="event-meta"><h3>${e.title}</h3><div class="date">${e.date}</div></div>
    </div>`).join('');
  progress.innerHTML = events.map((_, i) =>
    `<span class="seg" data-index="${i}"></span>`).join('');

  const cards = [...track.querySelectorAll('.event-card')];
  const segs = [...progress.querySelectorAll('.seg')];

  // mark the card nearest the track centre as active
  function updateActive() {
    const r = track.getBoundingClientRect();
    const center = r.left + r.width / 2;
    let best = 0, bestDist = Infinity;
    cards.forEach((c, i) => {
      const cr = c.getBoundingClientRect();
      const d = Math.abs(cr.left + cr.width / 2 - center);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    cards.forEach((c, i) => c.classList.toggle('active', i === best));
    segs.forEach((s, i) => s.classList.toggle('active', i === best));
  }

  let raf;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActive);
  }, { passive: true });

  // click a card to bring it to the centre (suppressed right after a drag)
  let dragged = false;
  cards.forEach((c) => c.addEventListener('click', () => {
    if (dragged) return;
    c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }));

  // drag to scroll (mouse / touch)
  let down = false, startX = 0, startScroll = 0;
  track.addEventListener('pointerdown', (e) => {
    down = true; dragged = false;
    startX = e.clientX; startScroll = track.scrollLeft;
    track.style.scrollBehavior = 'auto';
    track.style.scrollSnapType = 'none';
  });
  track.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) dragged = true;
    track.scrollLeft = startScroll - dx;
  });
  function endDrag() {
    if (!down) return;
    down = false;
    track.style.scrollBehavior = 'smooth';
    track.style.scrollSnapType = 'x mandatory';
    // snap to the card nearest the centre
    const r = track.getBoundingClientRect();
    const center = r.left + r.width / 2;
    let best = cards[0], bestDist = Infinity;
    cards.forEach((c) => {
      const cr = c.getBoundingClientRect();
      const d = Math.abs(cr.left + cr.width / 2 - center);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    best.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', endDrag);

  // start centred on the middle slide
  function centerMiddle() {
    const mid = cards[Math.floor(cards.length / 2)];
    const prev = track.style.scrollBehavior;
    track.style.scrollBehavior = 'auto';
    mid.scrollIntoView({ inline: 'center', block: 'nearest' });
    track.style.scrollBehavior = prev || 'smooth';
    updateActive();
  }
  requestAnimationFrame(centerMiddle);
  window.addEventListener('load', centerMiddle);
  updateActive();
}

// ===== NFT News carousel =====
const newsTrack = document.getElementById('newsTrack');
const newsDots = document.getElementById('newsDots');

if (newsTrack) {
  const article = {
    img: 'assets/img/nft-news.png',
    title: 'Wallet Integration',
    desc: 'Seamless integration with popular Web3 wallets, enabling users to connect and interact instantly.',
    date: '14 Mart 2026',
  };
  const items = Array.from({ length: 6 }, () => article);

  newsTrack.innerHTML = items.map((a) => `
    <a class="news-card" href="blog.html">
      <div class="news-thumb"><img src="${a.img}" alt="${a.title}" /></div>
      <div class="news-body"><h3>${a.title}</h3><p>${a.desc}</p></div>
      <div class="news-date">${a.date}</div>
    </a>`).join('');

  const cards = [...newsTrack.querySelectorAll('.news-card')];
  const step = () => cards[0].offsetWidth + 32;
  const perView = () => Math.max(1, Math.round(newsTrack.clientWidth / step()));
  const pages = () => Math.max(1, cards.length - perView() + 1);
  const activePage = () => Math.min(pages() - 1, Math.round(newsTrack.scrollLeft / step()));

  function renderDots() {
    const total = pages();
    const cur = activePage();
    newsDots.innerHTML = Array.from({ length: total }, (_, i) =>
      `<button class="dot ${i === cur ? 'active' : ''}" data-page="${i}" aria-label="Sayfa ${i + 1}"></button>`
    ).join('');
  }

  newsDots.addEventListener('click', (ev) => {
    const dot = ev.target.closest('.dot');
    if (dot) newsTrack.scrollTo({ left: parseInt(dot.dataset.page, 10) * step(), behavior: 'smooth' });
  });
  let rafN;
  newsTrack.addEventListener('scroll', () => {
    cancelAnimationFrame(rafN);
    rafN = requestAnimationFrame(renderDots);
  }, { passive: true });
  window.addEventListener('resize', renderDots);
  renderDots();
}

// ===== Journey steps (click text OR phone — they stay in sync) =====
const journeySteps = [...document.querySelectorAll('.journey-steps .step')];
const jpLayers = [document.getElementById('journeyPhone'), document.getElementById('journeyPhoneB')];
const journeyPhoneWrap = document.getElementById('journeyPhoneWrap');

if (jpLayers[0] && jpLayers[1]) {
  // preload every screenshot so the incoming layer never flashes blank
  journeySteps.forEach((s) => { if (s.dataset.img) { const i = new Image(); i.src = s.dataset.img; } });

  let front = 0;                                   // index of the currently visible layer
  jpLayers[1].style.opacity = '0';

  // the new screen darkens-in from behind while the old recedes & dims
  function showImage(src) {
    const cur = jpLayers[front];
    if (cur.src.endsWith(src)) return;
    const nxt = jpLayers[front ^ 1];

    nxt.src = src;
    nxt.style.transition = 'none';
    nxt.style.opacity = '0';
    nxt.style.transform = 'scale(0.85)';           // sits "behind"
    nxt.style.filter = 'brightness(0.3)';          // dark at first
    nxt.style.zIndex = '2';
    cur.style.zIndex = '1';
    void nxt.offsetWidth;                          // flush styles before animating

    requestAnimationFrame(() => {
      nxt.style.transition = 'opacity 0.5s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease';
      cur.style.transition = 'opacity 0.5s ease, transform 0.55s ease, filter 0.5s ease';
      nxt.style.opacity = '1';
      nxt.style.transform = 'scale(1)';            // grows forward into place
      nxt.style.filter = 'brightness(1)';
      cur.style.opacity = '0';
      cur.style.transform = 'scale(1.05)';         // old pushes back & fades
      cur.style.filter = 'brightness(0.35)';
    });
    front ^= 1;
  }

  function activateStep(step) {
    if (!step) return;
    journeySteps.forEach((s) => s.classList.remove('is-active'));
    step.classList.add('is-active');
    if (step.dataset.img) showImage(step.dataset.img);
  }

  journeySteps.forEach((step) => step.addEventListener('click', () => activateStep(step)));

  // clicking the phone advances to the next step that has its own screenshot
  const imgSteps = journeySteps.filter((s) => s.dataset.img);
  if (journeyPhoneWrap && imgSteps.length > 1) {
    journeyPhoneWrap.addEventListener('click', () => {
      const idx = imgSteps.findIndex((s) => s.classList.contains('is-active'));
      activateStep(imgSteps[(idx + 1) % imgSteps.length]);
    });
  }
}

// ===== FAQ accordion =====
const faqItems = document.querySelectorAll('.faq-item');
function setFaqHeight(item, open) {
  const a = item.querySelector('.faq-a');
  a.style.maxHeight = open ? a.scrollHeight + 'px' : null;
}
faqItems.forEach((item) => {
  const q = item.querySelector('.faq-q');
  if (item.classList.contains('is-open')) setFaqHeight(item, true);
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    faqItems.forEach((other) => {
      other.classList.remove('is-open');
      setFaqHeight(other, false);
    });
    if (!isOpen) {
      item.classList.add('is-open');
      setFaqHeight(item, true);
    }
  });
});
