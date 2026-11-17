import { CONFIG } from './config.js';

/**
 * Loader — chạy progress bar, đổi status, fade out.
 * `start()` trả về Promise — resolve khi loader biến mất.
 */
export class Loader {
  constructor(config = CONFIG.loader) {
    this.cfg = config;
    this.el = document.getElementById('loader');
    this.fill = document.getElementById('progressFill');
    this.num = document.getElementById('progressNum');
    this.status = document.getElementById('loaderStatus');
    this.progress = 0;
    this.startTime = 0;
  }

  start() {
    this.startTime = performance.now();
    return new Promise((resolve) => {
      this._tick(resolve);
    });
  }

  _tick(resolve) {
    const inc = Math.random() * 7 + 1.5;
    this.progress = Math.min(this.progress + inc, 100);
    this.fill.style.width = this.progress + '%';
    this.num.textContent = Math.floor(this.progress);
    this._updateStatus();

    if (this.progress < 100) {
      setTimeout(() => this._tick(resolve), Math.random() * 180 + 60);
    } else {
      const elapsed = performance.now() - this.startTime;
      const wait = Math.max(0, this.cfg.minDuration - elapsed) + 600;

      setTimeout(() => {
        this.el.classList.add('done');
        // chờ transition CSS (0.8s) rồi mới resolve
        setTimeout(resolve, 800);
      }, wait);
    }
  }

  _updateStatus() {
    let current = this.cfg.statuses[0].text;
    for (const s of this.cfg.statuses) {
      if (this.progress >= s.at) current = s.text;
    }
    if (this.status.textContent !== current) {
      this.status.style.opacity = '0';
      setTimeout(() => {
        this.status.textContent = current;
        this.status.style.opacity = '1';
      }, 200);
    }
  }
}