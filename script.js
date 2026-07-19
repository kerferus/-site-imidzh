document.documentElement.classList.add('js');

// ===== ОБНАРУЖЕНИЕ TELEGRAM =====
const isTelegram = document.documentElement.classList.contains('telegram');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches || isTelegram;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches && !isTelegram;

/* ---------- Карусель рилсов ---------- */
const REELS = [
  { src: 'reels/reel1.mp4', poster: 'reels/reel1.jpg', title: 'Reels для психолога',
    text: '«С ваших рилсов за неделю — 4 новых клиента. Люди просто увидели и захотели». Reels для телесно-ориентированного психолога — без сложных воронок, визуал, который бьёт точно в цель.' },
  { src: 'reels/reel2.mp4', poster: 'reels/reel2.jpg', title: '2D FIT',
    text: 'Сняли Reels для 2D FIT — о том, зачем бизнесу крутые специалисты в штате. Коротко, ёмко и с пользой. Ролики уже в сети.' },
  { src: 'reels/reel3.mp4', poster: 'reels/reel3.jpg', title: '«Музей бомжей»',
    text: 'Тёплый и честный разговор, который цепляет с первых секунд. Снимаем подкасты любого уровня сложности — интересно и смотреть, и слушать.' },
  { src: 'reels/reel4.mp4', poster: 'reels/reel4.jpg', title: 'Проект «Чувства»',
    text: 'Выехали на пляж — ловили солнце, ветер и текстуры. 2 минуты атмосферы, которую не расскажешь словами. Просто посмотрите.' },
  { src: 'reels/reel5.mp4', poster: 'reels/reel5.jpg', title: '«Питер любят»',
    text: 'Визуал для подкаста о предпринимателях Санкт-Петербурга — живые разговоры и настоящие эмоции. Качественная картинка, свет и многокамерная съёмка.' },
];
const reelsModal = document.getElementById('reels');
if (reelsModal) {
  const v = document.getElementById('reel-video'), tt = document.getElementById('reel-title'),
        tx = document.getElementById('reel-text'), cnt = document.getElementById('reel-count');
  let idx = 0;
  const show = (i) => {
    idx = (i + REELS.length) % REELS.length;
    const r = REELS[idx];
    v.src = r.src; v.poster = r.poster; tt.textContent = r.title; tx.textContent = r.text;
    cnt.textContent = `${idx + 1} / ${REELS.length}`;
    v.play().catch(() => {});
  };
  const openReels = (i) => { reelsModal.classList.add('open'); reelsModal.setAttribute('aria-hidden', 'false'); show(i || 0); };
  const closeReels = () => { v.pause(); reelsModal.classList.remove('open'); reelsModal.setAttribute('aria-hidden', 'true'); };
  document.querySelectorAll('[data-open-reels]').forEach((b) => b.addEventListener('click', () => openReels(0)));
  reelsModal.querySelector('.reels-prev').addEventListener('click', () => show(idx - 1));
  reelsModal.querySelector('.reels-next').addEventListener('click', () => show(idx + 1));
  reelsModal.querySelector('.reels-x').addEventListener('click', closeReels);
  reelsModal.addEventListener('click', (e) => { if (e.target === reelsModal) closeReels(); });
  addEventListener('keydown', (e) => {
    if (!reelsModal.classList.contains('open')) return;
    if (e.key === 'Escape') closeReels();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = 0;
  reelsModal.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  reelsModal.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(dx < 0 ? idx + 1 : idx - 1);
  }, { passive: true });
}

/* ---------- Reveal ---------- */
const io = new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ---------- Счётчики достижений ---------- */
const countIo = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    countIo.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (REDUCE) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1200;
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-n[data-count]').forEach((el) => countIo.observe(el));

/* ---------- Сплит заголовка по словам (отключается в Telegram) ---------- */
const splitEl = document.querySelector('[data-split]');
if (splitEl && !REDUCE) {
  const out = [];
  splitEl.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      node.textContent.split(/(\s+)/).forEach((t) => {
        if (!t.trim()) { out.push(document.createTextNode(t)); }
        else { const s = document.createElement('span'); s.className = 'word'; s.textContent = t; out.push(s); }
      });
    } else { node.classList.add('word'); out.push(node); }
  });
  splitEl.replaceChildren(...out);
  splitEl.querySelectorAll('.word').forEach((w, i) => {
    w.style.transition = `transform .6s cubic-bezier(.2,.7,.2,1) ${i * 0.05}s, opacity .6s ${i * 0.05}s`;
    requestAnimationFrame(() => { w.style.transform = 'none'; w.style.opacity = '1'; });
  });
} else if (splitEl) {
  // В Telegram просто показываем заголовок без анимации
  splitEl.querySelectorAll('.word').forEach((w) => {
    w.style.opacity = '1';
    w.style.transform = 'none';
  });
}

/* ---------- Кастомный курсор + магнит + тилт (отключается в Telegram) ---------- */
if (FINE && !REDUCE) {
  const cur = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const label = document.querySelector('.cursor-label');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  (function ring_loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(ring_loop); })();
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover'); label.textContent = el.dataset.label || ''; });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); label.textContent = ''; });
  });
  // магнитные элементы
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
  // тилт карточек
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
  // параллакс линзы
  const lens = document.getElementById('lens');
  if (lens) addEventListener('mousemove', (e) => {
    lens.style.transform = `translate(${(e.clientX / innerWidth - 0.5) * -30}px, ${(e.clientY / innerHeight - 0.5) * -22}px)`;
  });
} else {
  // В Telegram скрываем курсор
  const cur = document.querySelector('.cursor');
  if (cur) cur.style.display = 'none';
}

/* ---------- Бегущая строка с инерцией от скролла (отключается в Telegram) ---------- */
if (!isTelegram) {
  const track = document.getElementById('ticker');
  if (track && !REDUCE) {
    let x = 0, base = 0.55, boost = 0, last = scrollY, half = 0;
    const measure = () => { half = track.scrollWidth / 2; };
    measure(); addEventListener('resize', measure);
    addEventListener('scroll', () => { boost = Math.min(8, Math.abs(scrollY - last) * 0.4); last = scrollY; }, { passive: true });
    (function loop() {
      x -= base + boost; boost *= 0.9;
      if (half && Math.abs(x) >= half) x = 0;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- AI-строка (обратное движение) ---------- */
  const trackAi = document.getElementById('ticker-ai');
  if (trackAi && !REDUCE) {
    let x = 0, half = 0;
    const measure = () => { half = trackAi.scrollWidth / 2; x = -half; };
    measure(); addEventListener('resize', measure);
    (function loop() {
      x += 0.4;
      if (half && x >= 0) x = -half;
      trackAi.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Параллакс фото-бэнда ---------- */
  const band = document.querySelector('.band img');
  if (band && !REDUCE) {
    addEventListener('scroll', () => {
      const r = band.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) band.style.transform = `translateY(${(r.top * -0.08)}px)`;
    }, { passive: true });
  }
}

/* ---------- Лайтбокс ---------- */
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
document.querySelectorAll('.gallery .shot img').forEach((img) => {
  img.parentElement.addEventListener('click', () => { lbImg.src = img.src; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); });
});
const closeLb = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
lb.addEventListener('click', closeLb);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

/* ---------- Мобильное меню ---------- */
const burger = document.querySelector('.burger');
const links = document.querySelector('.nav-links');
if (burger && links) {
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));
}

/* ---------- Пасхалка 1: режим «съёмки» (клик по REC) ---------- */
const rec = document.getElementById('rec');
const recTime = document.getElementById('rec-time');
let recOn = false, recT0 = 0, recTimer = null;
if (rec) rec.addEventListener('click', () => {
  recOn = !recOn;
  document.body.classList.toggle('recording', recOn);
  if (recOn) {
    recT0 = performance.now();
    recTimer = setInterval(() => {
      const s = Math.floor((performance.now() - recT0) / 1000);
      recTime.textContent = `${String((s / 60) | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }, 500);
  } else { clearInterval(recTimer); recTime.textContent = ''; }
});

/* ---------- Пасхалка 2: код Konami → «затвор» + конфетти ---------- */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let kpos = 0;
addEventListener('keydown', (e) => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  kpos = (k === KONAMI[kpos]) ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
  if (kpos === KONAMI.length) { kpos = 0; shutter(); }
});
function shutter() {
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;z-index:200;background:#fff;opacity:.9;pointer-events:none;transition:opacity .5s';
  document.body.appendChild(flash);
  requestAnimationFrame(() => { flash.style.opacity = '0'; });
  setTimeout(() => flash.remove(), 600);
  const marks = ['✦', '✶', '＋', '◆', '📸'];
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('div');
    p.textContent = marks[(Math.random() * marks.length) | 0];
    p.style.cssText = `position:fixed;left:${Math.random() * 100}vw;top:-5vh;z-index:201;pointer-events:none;font-size:${12 + Math.random() * 20}px;color:${Math.random() > .5 ? '#3a5bff' : '#f2b33d'};transition:transform 1.6s ease-in,opacity 1.6s`;
    document.body.appendChild(p);
    requestAnimationFrame(() => { p.style.transform = `translateY(${110 + Math.random() * 20}vh) rotate(${Math.random() * 720 - 360}deg)`; p.style.opacity = '0'; });
    setTimeout(() => p.remove(), 1800);
  }
  const t = document.createElement('div');
  t.textContent = '📸 Снято!';
  t.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:202;font-family:Unbounded,sans-serif;font-weight:900;font-size:9vw;color:#fff;mix-blend-mode:difference;pointer-events:none;transition:opacity .5s 1s';
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '0'; });
  setTimeout(() => t.remove(), 1600);
}

/* ---------- Пасхалка 3: сообщение в консоли ---------- */
console.log('%cИМИДЖ', 'font:900 42px Unbounded,sans-serif;color:#3a5bff');
console.log('%cЛюбишь смотреть в исходники? Нам нужны такие. Пиши → @IMIDZHRF  ·  подсказка: ↑↑↓↓←→←→BA', 'font:14px monospace;color:#f2b33d');
