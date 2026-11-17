/**
 * CONFIG — Toàn bộ "núm vặn" của website nằm ở đây.
 * Sửa file này để tinh chỉnh mà không cần chạm vào logic.
 */
export const CONFIG = {
  // ─── Loading screen ───
  loader: {
    minDuration: 3200, // thời gian loading tối thiểu (ms)
    statuses: [
      { at: 0,  text: 'Đồng bộ hệ thống sao...' },
      { at: 22, text: 'Đang tải tinh vân...' },
      { at: 45, text: 'Hiệu chỉnh quỹ đạo hành tinh...' },
      { at: 65, text: 'Kết nối vệ tinh lượng tử...' },
      { at: 82, text: 'Mở khóa tọa độ vũ trụ...' },
      { at: 95, text: 'Sẵn sàng cất cánh ✦' },
    ],
  },

  // ─── Starfield ───
  starfield: {
    densityDivisor: 3500, // nhỏ hơn = nhiều sao hơn
    maxStars: 700,
    warpDuration: 1100,   // thời gian warp khi enter (ms)
    restWarp: 0.04,       // warp "nghỉ" (trôi chậm) sau khi vào
    maxParallax: 30,      // px — độ lệch do chuột
  },

  // ─── Custom cursor ───
  cursor: {
    lerp: 0.18, // 0..1 — càng cao càng "dính" chuột
  },

  // ─── Audio ───
  audio: {
    masterVolume: 0.18,
    reverbAmount: 0.55,
    padFreqs: [55, 82.41, 110, 164.81, 220, 329.63], // A minor layers
    fadeInTime: 3,       // giây
    toggleFadeTime: 0.6, // giây
  },

  // ─── Scroll reveal ───
  reveal: {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  },
};