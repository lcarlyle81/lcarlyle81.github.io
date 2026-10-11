// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Nav: border on scroll, mobile toggle
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Fade sections in as they scroll into view
const revealer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));

// Highlight the nav link for the section in view
const links = [...document.querySelectorAll('.nav-links a')];
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Stagger cards within each grid so they arrive one after another
document.querySelectorAll('.cards, .roadmap').forEach(grid => {
  [...grid.children].forEach((card, i) => {
    card.style.transitionDelay = `${(i % 3) * 90}ms`;
  });
});

// Count the highlight numbers up when they come into view
const counters = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    counters.unobserve(e.target);
    const el = e.target;
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) return;
    const duration = 1400;
    const start = performance.now();
    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(end * eased) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => {
  if (!reduceMotion) el.textContent = '0';
  counters.observe(el);
});

// Draw the experience timelines as you scroll, filling each dot as the line passes it
const timelines = [...document.querySelectorAll('.timeline')];
function updateTimelines() {
  const mark = window.innerHeight * 0.65;
  timelines.forEach(tl => {
    const r = tl.getBoundingClientRect();
    const p = Math.min(Math.max((mark - r.top) / r.height, 0), 1);
    tl.style.setProperty('--p', p.toFixed(3));
    tl.querySelectorAll(':scope > li').forEach(li => {
      li.classList.toggle('passed', li.getBoundingClientRect().top + 10 < mark);
    });
  });
}
if (!reduceMotion) {
  window.addEventListener('scroll', updateTimelines, { passive: true });
  window.addEventListener('resize', updateTimelines);
  updateTimelines();
}

// 3D heart: only load the viewer library and model when the section gets close
const heart = document.getElementById('heart3d');
if (heart) {
  const loadHeart = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    loadHeart.disconnect();
    const lib = document.createElement('script');
    lib.type = 'module';
    lib.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
    document.head.appendChild(lib);
    heart.addEventListener('load', () => heart.parentElement.classList.add('loaded'));
    if (reduceMotion) heart.removeAttribute('auto-rotate');
    heart.setAttribute('src', heart.dataset.src);
  }, { rootMargin: '400px 0px' });
  loadHeart.observe(heart);
}
