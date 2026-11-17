import { CONFIG } from './config.js';

/**
 * Custom cursor — dot + ring lerp.
 * Trả về { attachHovers } để gọi sau khi DOM chính đã hiện.
 */
export function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');

  if (!cursor || !ring) {
    return { attachHovers: () => {} };
  }

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  const lerp = CONFIG.cursor.lerp;

  function animate() {
    rx += (mx - rx) * lerp;
    ry += (my - ry) * lerp;
    cursor.style.transform = `translate(${mx}px, ${my}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(animate);
  }
  animate();

  function attachHovers() {
    const selector = 'a, button, .project-card, .skill-card';
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  }

  return { attachHovers };
}