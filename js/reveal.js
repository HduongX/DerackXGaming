import { CONFIG } from './config.js';

/** IntersectionObserver — fade-up các .reveal-on-scroll */
export function initScrollReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: CONFIG.reveal.threshold,
      rootMargin: CONFIG.reveal.rootMargin,
    }
  );

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => io.observe(el));
  return io;
}