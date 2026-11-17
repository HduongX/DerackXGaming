import { CONFIG } from './config.js';
import { Starfield } from './starfield.js';
import { Loader } from './loader.js';
import { initCursor } from './cursor.js';
import { initEnterScreen } from './enter.js';
import { CosmicAudio, createAudioToggleButton } from './audio.js';
import { initScrollReveal } from './reveal.js';

async function boot() {
  // 1. Nền vũ trụ chạy trước mọi thứ
  const starfield = new Starfield(document.getElementById('stars'));

  // 2. Custom cursor
  const cursor = initCursor();

  // 3. Loading sequence
  const loader = new Loader();
  await loader.start(); // chờ loader fade hết

  // 4. Hiện enter screen
  const enterScreen = document.getElementById('enterScreen');
  enterScreen.classList.remove('hidden');
  cursor.attachHovers();

  // 5. Bắt sự kiện "Bước vào vũ trụ"
  initEnterScreen({
    onEnter: async () => {
      // 5a. Audio (phải gọi trong user gesture)
      const audio = new CosmicAudio();
      audio.start();
      audio.resume();
      const audioBtn = createAudioToggleButton(audio);
      audioBtn.show();

      // 5b. Warp effect
      starfield.warpTo(1, CONFIG.starfield.warpDuration);

      // 5c. Reveal main
      const main = document.getElementById('main');
      main.classList.remove('hidden');
      void main.offsetWidth; // force reflow để transition chạy
      main.classList.add('reveal');

      // 5d. Cho warp "hạ cánh" mềm
      setTimeout(() => {
        starfield.warpTo(CONFIG.starfield.restWarp, 2400);
      }, 500);

      // 5e. Scroll reveal sau khi main hiện
      setTimeout(() => initScrollReveal(), 100);
    },
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}