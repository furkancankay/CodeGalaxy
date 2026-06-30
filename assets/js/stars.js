/* Animated twinkling + drifting starfield on a canvas */
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars, shooting = null, t = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(220, Math.floor((w * h) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      tw: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.015 + 0.005,
      drift: Math.random() * 0.15 + 0.02
    }));
  }

  function maybeShoot() {
    if (shooting || Math.random() > 0.004) return;
    shooting = { x: Math.random() * w, y: Math.random() * h * 0.5, len: 0, max: 180 + Math.random() * 120, vx: 6 + Math.random() * 4, vy: 2 + Math.random() * 2 };
  }

  function frame() {
    t++;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.tw += s.sp;
      s.y += s.drift;
      if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      const a = 0.4 + Math.abs(Math.sin(s.tw)) * 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    }
    maybeShoot();
    if (shooting) {
      const s = shooting;
      s.len += s.vx;
      const x2 = s.x + s.len, y2 = s.y + s.len * (s.vy / s.vx);
      const grad = ctx.createLinearGradient(s.x, s.y, x2, y2);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, 'rgba(180,210,255,0.9)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (s.len > s.max) shooting = null;
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  frame();
})();
