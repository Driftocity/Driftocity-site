/* ══════════════════════════════════════
   PREMIUM HERO CANVAS ANIMATION
   Layers: aurora → pixel grid → orbs → streaks → mouse glow
══════════════════════════════════════ */
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const c = document.getElementById('heroCanvas');
    if (c) c.style.display = 'none';
    return;
  }

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  let W, H, raf;
  let mouse = { x: -999, y: -999 };
  let t = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildGrid();
  }

  const CELL = 38;
  let gridDots = [];

  function buildGrid() {
    gridDots = [];
    const cols = Math.ceil(W / CELL) + 1;
    const rows = Math.ceil(H / CELL) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        gridDots.push({
          bx: c * CELL,
          by: r * CELL,
          phase: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.006,
          size:  1 + Math.random() * 0.8,
        });
      }
    }
  }

  function drawGrid() {
    gridDots.forEach(d => {
      const breathe = 0.5 + 0.5 * Math.sin(t * d.speed * 60 + d.phase);
      const dx = d.bx - mouse.x;
      const dy = d.by - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const mGlow = dist < 140 ? (1 - dist / 140) * 0.7 : 0;
      const alpha = 0.06 + breathe * 0.10 + mGlow;

      const r = Math.round(91  + mGlow * 60);
      const g = Math.round(78  + mGlow * 20);
      const b = Math.round(255);

      ctx.beginPath();
      ctx.arc(d.bx, d.by, d.size + mGlow * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    });
  }

  const ORBS = [
    { x: 0.20, y: 0.30, r: 0.28, c: '91,78,255',  spd: 0.00012, phase: 0.0  },
    { x: 0.78, y: 0.55, r: 0.22, c: '120,60,255', spd: 0.00009, phase: 1.8  },
    { x: 0.50, y: 0.85, r: 0.18, c: '60,100,255', spd: 0.00015, phase: 3.4  },
  ];

  function drawOrbs() {
    ORBS.forEach(o => {
      const cx = (o.x + Math.sin(t * o.spd * 1000 + o.phase) * 0.06) * W;
      const cy = (o.y + Math.cos(t * o.spd * 800  + o.phase) * 0.04) * H;
      const rad = o.r * Math.min(W, H);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0,   `rgba(${o.c},0.13)`);
      g.addColorStop(0.5, `rgba(${o.c},0.05)`);
      g.addColorStop(1,   `rgba(${o.c},0)`);

      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  let streaks = [];

  function spawnStreak() {
    const fromLeft = Math.random() > 0.5;
    streaks.push({
      x:     fromLeft ? -60 : W + 60,
      y:     Math.random() * H * 0.7,
      len:   60 + Math.random() * 100,
      spd:   (1.2 + Math.random() * 1.6) * (fromLeft ? 1 : -1),
      alpha: 0.5 + Math.random() * 0.4,
      width: 0.6 + Math.random() * 0.8,
      life:  1,
    });
  }

  let nextStreak = 0;
  function drawStreaks(now) {
    if (now > nextStreak) {
      spawnStreak();
      nextStreak = now + 1200 + Math.random() * 2400;
    }
    streaks = streaks.filter(s => s.life > 0);
    streaks.forEach(s => {
      s.x    += s.spd * 2.5;
      s.life -= 0.012;
      const fade = s.life * s.alpha;
      const x2   = s.x - s.len * Math.sign(s.spd);

      const g = ctx.createLinearGradient(s.x, s.y, x2, s.y);
      g.addColorStop(0,   `rgba(180,160,255,0)`);
      g.addColorStop(0.3, `rgba(180,160,255,${fade * 0.9})`);
      g.addColorStop(1,   `rgba(120,100,255,0)`);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(x2, s.y);
      ctx.strokeStyle = g;
      ctx.lineWidth   = s.width;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.width * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,210,255,${fade * 0.8})`;
      ctx.fill();
    });
  }

  let ripples = [];
  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -999; mouse.y = -999;
  });
  canvas.parentElement.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, r: 0, life: 1 });
  });

  function drawRipples() {
    ripples = ripples.filter(r => r.life > 0);
    ripples.forEach(r => {
      r.r    += 4;
      r.life -= 0.025;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(160,140,255,${r.life * 0.5})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    });
  }

  let lastTime = 0;
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;
    t += dt * 0.001;

    ctx.clearRect(0, 0, W, H);

    drawOrbs();
    drawGrid();
    drawStreaks(now);
    drawRipples();

    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  raf = requestAnimationFrame(loop);
})();
