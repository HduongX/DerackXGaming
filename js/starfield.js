import { CONFIG } from './config.js';

/**
 * Starfield — canvas vũ trụ với parallax + warp.
 * Có thể tái sử dụng cho bất kỳ page nào: `new Starfield(canvasEl)`.
 */
export class Starfield {
  constructor(canvas, config = CONFIG.starfield) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cfg = config;

    this.stars = [];
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.warp = 0;
    this.warpTarget = 0;
    this.warpFrom = 0;
    this.warpStart = null;
    this.warpDur = 1000;

    this._onResize = () => this.resize();
    this._onMove = (e) => {
      this.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    this._animate = this._animate.bind(this);

    this.resize();
    this._initStars();
    window.addEventListener('resize', this._onResize);
    window.addEventListener('mousemove', this._onMove);
    requestAnimationFrame(this._animate);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cx = this.w / 2;
    this.cy = this.h / 2;
    this.maxDist = Math.hypot(this.w, this.h) / 2 + 100;
  }

  _initStars() {
    this.stars = [];
    const count = Math.min(
      this.cfg.maxStars,
      Math.floor((this.w * this.h) / this.cfg.densityDivisor)
    );
    for (let i = 0; i < count; i++) this.stars.push(this._makeStar());
  }

  _makeStar() {
    const rand = Math.random();
    let hue;
    if (rand < 0.6) hue = 200 + Math.random() * 60;        // xanh lam
    else if (rand < 0.85) hue = 260 + Math.random() * 40;   // tím
    else hue = 320 + Math.random() * 30;                    // hồng

    return {
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * this.maxDist * 0.8 + 20,
      baseSpeed: Math.random() * 0.15 + 0.05,
      angularSpeed: (Math.random() - 0.5) * 0.0006,
      size: Math.random() * 1.3 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      hue,
    };
  }

  /** Public API — gọi để tạo hiệu ứng warp */
  warpTo(target, duration = this.cfg.warpDuration) {
    this.warpFrom = this.warp;
    this.warpTarget = target;
    this.warpStart = performance.now();
    this.warpDur = duration;
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMove);
    cancelAnimationFrame(this._raf);
  }

  _animate(now) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    // Warp easing
    if (this.warpStart !== null) {
      const t = Math.min(1, (now - this.warpStart) / this.warpDur);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.warp = this.warpFrom + (this.warpTarget - this.warpFrom) * e;
      if (t >= 1) this.warpStart = null;
    }

    // Mouse lerp
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;

    const speedMult = 1 + this.warp * 40;
    const isWarping = this.warp > 0.06;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const prevDist = s.dist;

      s.dist += s.baseSpeed * speedMult *
        (isWarping ? 1 + (s.dist / this.maxDist) * 4 : 1);

      if (s.dist > this.maxDist) {
        s.dist = Math.random() * 20 + 5;
        s.angle = Math.random() * Math.PI * 2;
        s.twinkle = Math.random() * Math.PI * 2;
      }

      if (!isWarping) s.angle += s.angularSpeed;
      s.twinkle += s.twinkleSpeed;

      const parallax = (s.dist / this.maxDist) * this.cfg.maxParallax;
      const cos = Math.cos(s.angle);
      const sin = Math.sin(s.angle);
      const x = this.cx + cos * s.dist + this.mouse.x * parallax;
      const y = this.cy + sin * s.dist + this.mouse.y * parallax;

      const fadeIn = Math.min(1, s.dist / 40);
      const alpha = (0.35 + Math.sin(s.twinkle) * 0.4 + 0.35) * fadeIn;
      const size = s.size * (1 + this.warp * 0.8);

      if (isWarping) {
        const pDist = Math.max(0, prevDist - 2);
        const pParallax = (pDist / this.maxDist) * this.cfg.maxParallax;
        const px = this.cx + cos * pDist + this.mouse.x * pParallax;
        const py = this.cy + sin * pDist + this.mouse.y * pParallax;
        ctx.strokeStyle = `hsla(${s.hue}, 100%, 82%, ${alpha})`;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.fillStyle = `hsla(${s.hue}, 100%, 90%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this._raf = requestAnimationFrame(this._animate);
  }
}