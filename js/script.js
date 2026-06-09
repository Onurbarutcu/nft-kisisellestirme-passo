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
  { img: 'assets/img/event-drakula.jpg', title: 'Drakula', date: '13 Haziran 20:30', url: 'https://www.passo.com.tr/tr/etkinlik/drakula-zorlupsm-turkcell-sahnesi-biletleri/11601319' },
  { img: 'assets/img/event-anyma.jpg',   title: 'ANYMA PRESENTS ÆDEN', date: '12 Eylül 16:00', url: 'https://www.passo.com.tr/tr/etkinlik/anyma-presents-aeden-atakoy-marina-arena-passo/10515320' },
  { img: 'assets/img/event-tan.jpg',     title: 'Tan Taşçı', date: '12 Haziran – 3 Ekim', url: 'https://www.passo.com.tr/tr/etkinlik-grubu/tan-tasci-konserleri-passo/161614' },
  { more: true, title: 'Tüm Etkinlikler', date: 'PASSO’da keşfet →', url: 'https://www.passo.com.tr/tr/kategori/muzik-konser-festival-biletleri/8615' },
];
const track = document.getElementById('eventsTrack');
const progress = document.getElementById('eventsProgress');

if (track) {
  // render every slide + a progress segment per slide
  track.innerHTML = events.map((e, i) => e.more ? `
    <div class="event-card event-more" data-index="${i}">
      <div class="event-poster more-poster">
        <div class="more-inner">
          <span class="more-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M10 8l4 4-4 4"/></svg></span>
          <strong>Daha Fazlası</strong>
          <span class="more-sub">Tüm Konser &amp; Festival Biletleri</span>
        </div>
      </div>
      <div class="event-meta"><h3>${e.title}</h3><div class="date">${e.date}</div></div>
    </div>` : `
    <div class="event-card" data-index="${i}">
      <div class="event-poster"><img src="${e.img}" alt="${e.title}" /></div>
      <div class="event-meta"><h3>${e.title}</h3><div class="date">${e.date}</div></div>
    </div>`).join('');
  progress.innerHTML = events.map((_, i) =>
    `<span class="seg" data-index="${i}"></span>`).join('');

  const cards = [...track.querySelectorAll('.event-card')];
  const segs = [...progress.querySelectorAll('.seg')];

  const GAP = 8;            // active ↔ passive gap (px)
  const ASPECT = 1.69;      // poster width / height
  let active = Math.min(1, cards.length - 1);   // start on ANYMA (centre of the event posters)

  // responsive real sizes — 3 cards fill the width with only small edge padding
  // (active + 2 passives = active * 2.314; + 2 gaps). 4th card sits off-screen.
  function sizes() {
    const vw = window.innerWidth;
    const activeW = vw > 768
      ? Math.min(820, (vw - 56) / 2.314)   // fill width, ~20px side padding, capped on ultra-wide
      : vw * 0.78;                          // mobile: dominant centre, neighbours peek
    return { activeW, passiveW: activeW * 0.657 };
  }

  // lay out the cards at their real sizes and slide the track so the active card is centred
  function layout(animate = true) {
    const { activeW, passiveW } = sizes();
    const activeH = activeW / ASPECT;
    track.style.transition = animate ? '' : 'none';

    cards.forEach((c, i) => {
      const on = i === active;
      const w = on ? activeW : passiveW;
      c.style.transition = animate ? '' : 'none';
      c.style.width = w + 'px';
      c.style.marginTop = ((activeH - w / ASPECT) / 2) + 'px';   // centre posters on one axis
      c.classList.toggle('active', on);
      c.style.cursor = on ? (events[i].url ? 'pointer' : 'default') : 'pointer';
      segs[i].classList.toggle('active', on);
    });

    const centerOfActive = active * (passiveW + GAP) + activeW / 2;
    track.style.transform = `translateX(${window.innerWidth / 2 - centerOfActive}px)`;

    if (!animate) {   // restore transitions on the next frame
      requestAnimationFrame(() => {
        track.style.transition = '';
        cards.forEach((c) => (c.style.transition = ''));
      });
    }
  }

  function setActive(i) {
    active = Math.max(0, Math.min(cards.length - 1, i));
    layout(true);
  }

  // click a side card to centre it; click the active card to open its event link
  let dragged = false;
  cards.forEach((c, i) => c.addEventListener('click', () => {
    if (dragged) return;
    if (i !== active) { setActive(i); return; }
    if (events[i].url) window.open(events[i].url, '_blank', 'noopener');
  }));
  segs.forEach((s, i) => s.addEventListener('click', () => setActive(i)));

  // drag / swipe to move one slide
  let down = false, startX = 0;
  track.addEventListener('pointerdown', (e) => { down = true; dragged = false; startX = e.clientX; });
  track.addEventListener('pointermove', (e) => {
    if (down && Math.abs(e.clientX - startX) > 6) dragged = true;
  });
  function endDrag(e) {
    if (!down) return;
    down = false;
    const dx = (e.clientX || startX) - startX;
    if (dx <= -40) setActive(active + 1);
    else if (dx >= 40) setActive(active - 1);
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', () => { down = false; });

  layout(false);
  window.addEventListener('load', () => layout(false));
  window.addEventListener('resize', () => layout(false));
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
