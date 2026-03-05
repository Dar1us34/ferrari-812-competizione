// ===== Small helpers =====
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const easeOutExpo = t => (t===1?1:1-Math.pow(2,-10*t));

// ===== Navigation toggle =====
(function navToggle(){
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
})();

// ===== Smooth scroll to stats =====
(function scrollToStats(){
  const btn = document.getElementById('scroll-stats');
  const section = document.getElementById('stats');
  if(!btn || !section) return;
  btn.addEventListener('click', () => {
    section.scrollIntoView({behavior:'smooth',block:'start'});
  });
})();

// ===== Hero particles =====
(function heroParticles(){
  const canvas = document.getElementById('hero-particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const DPR = window.devicePixelRatio || 1;

  function resize(){
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function init(){
    resize();
    particles = Array.from({length:24}, () => ({
      x: Math.random()*w,
      y: Math.random()*h,
      r: 1 + Math.random()*2,
      vx: (Math.random()-0.5)*0.15,
      vy: -0.1 - Math.random()*0.25,
      a: 0.2 + Math.random()*0.5
    }));
    requestAnimationFrame(loop);
  }

  function loop(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if(p.y < -10){ p.y = h + 10; p.x = Math.random()*w; }
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  init();
})();

// ===== Stat animation function (0 → final value) =====
function animateStatCanvas(canvasId, valueId, end, decimals){
  const canvas = document.getElementById(canvasId);
  const el = document.getElementById(valueId);
  if(!canvas || !el) return;

  const ctx = canvas.getContext('2d');
  const duration = 2000;
  const startTime = performance.now();

  function draw(now){
    const t = clamp((now - startTime) / duration, 0, 1);
    const p = easeOutExpo(t);

    // Update number
    const currentValue = (end * p).toFixed(decimals);
    el.textContent = currentValue;

    // Draw arc
    const angle = p * Math.PI * 2;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = "#e11000";
    ctx.lineWidth = 10;
    ctx.arc(canvas.width/2, canvas.height/2, 60, -Math.PI/2, angle - Math.PI/2);
    ctx.stroke();

    if(t < 1){
      requestAnimationFrame(draw);
    } else {
      el.textContent = end.toFixed(decimals);
    }
  }

  requestAnimationFrame(draw);
}

// ===== Model data =====
const models = {
  competizione: { hp: 830, speed: 211, zero: 2.85 },
  superfast:   { hp: 789, speed: 211, zero: 2.90 },
  f12tdf:      { hp: 769, speed: 211, zero: 2.90 }
};

// ===== Dynamic model switching =====
(function specSwitcher(){
  const buttons = document.querySelectorAll('.spec-btn');
  if(!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {

      // Update active button
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const model = btn.dataset.model;
      const data = models[model];

      // Re-animate stats
      animateStatCanvas('hpCanvas','hp',data.hp,0);
      animateStatCanvas('speedCanvas','speed',data.speed,0);
      animateStatCanvas('zeroCanvas','zero',data.zero,2);

      // Pulse effect
      setTimeout(() => {
        document.getElementById('hp').classList.add('pulse');
        document.getElementById('speed').classList.add('pulse');
        document.getElementById('zero').classList.add('pulse');
      }, 2200);
    });
  });
})();

// ===== Cinematic Stats Reveal + Animation =====
(function statsObserver(){
  const section = document.getElementById('stats');
  const cards = document.querySelectorAll('.stat-card');
  let fired = false;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting && !fired) {

        // Staggered reveal
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('reveal'), i * 180);
        });

        // First-time animation (Competizione)
        animateStatCanvas('hpCanvas','hp',830,0);
        animateStatCanvas('speedCanvas','speed',211,0);
        animateStatCanvas('zeroCanvas','zero',2.85,2);

        setTimeout(() => {
          document.getElementById('hp').classList.add('pulse');
          document.getElementById('speed').classList.add('pulse');
          document.getElementById('zero').classList.add('pulse');
        }, 2600);

        fired = true;
        obs.disconnect();
      }
    });
  }, {threshold:0.4});

  io.observe(section);
})();

// ===== Engine sound =====
(function engineSound(){
  const btn = document.getElementById('sound-btn');
  const audio = document.getElementById('engine-sound');
  if(!btn || !audio) return;

  btn.addEventListener('click', async () => {
    try{
      if(audio.paused){
        await audio.play();
        btn.textContent = 'Stop engine';
        btn.setAttribute('aria-pressed','true');
      }else{
        audio.pause();
        audio.currentTime = 0;
        btn.textContent = 'Start engine';
        btn.setAttribute('aria-pressed','false');
      }
    }catch(e){
      console.warn('Audio play failed', e);
    }
  });

  audio.addEventListener('ended', () => {
    btn.textContent = 'Start engine';
    btn.setAttribute('aria-pressed','false');
  });
})();

// ===== Gallery + lightbox =====
(function gallery(){
  const container = document.getElementById('gallery-container');
  if(!container) return;

  const images = [
    { src: "images/ferrari_front2.jpg", alt: "Ferrari 812 Superfast front view", caption: "Exterior — Front view" },
    { src: "images/ferrari_rear2.jpg", alt: "Ferrari 812 Superfast rear view", caption: "Exterior — Rear view" },
    { src: "images/ferrari_interior2.jpg", alt: "Ferrari 812 Superfast interior", caption: "Interior — Cockpit" },
    { src: "images/ferrari_engine2.jpg", alt: "Ferrari 6.5L V12 engine", caption: "Engine — V12 6.5L" }
  ];

  images.forEach((img, index) => {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item';
    figure.dataset.index = index;

    const image = document.createElement('img');
    image.className = 'gallery-thumb';
    image.src = img.src;
    image.alt = img.alt;
    image.loading = 'lazy';

    const caption = document.createElement('figcaption');
    caption.className = 'gallery-caption';
    caption.textContent = img.caption;

    figure.appendChild(image);
    figure.appendChild(caption);
    container.appendChild(figure);
  });

  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCap = lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');
  let currentIndex = -1;

  function open(index){
    const item = images[index];
    if(!item) return;
    currentIndex = index;
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = item.caption;
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function close(){
    lightbox.setAttribute('aria-hidden','true');
    lbImg.src = '';
    document.body.style.overflow = '';
    currentIndex = -1;
  }

  container.addEventListener('click', e => {
    const fig = e.target.closest('.gallery-item');
    if(!fig) return;
    open(Number(fig.dataset.index));
  });

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', e => {
    if(e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if(lightbox.getAttribute('aria-hidden') === 'true') return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowRight'){
      const next = (currentIndex + 1) % images.length;
      open(next);
    }
    if(e.key === 'ArrowLeft'){
      const prev = (currentIndex - 1 + images.length) % images.length;
      open(prev);
    }
  });
})();
