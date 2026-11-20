import { init3DBackground } from './three-bg.js';
// Import Lenis qua CDN trong JS
import Lenis from 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.mjs';

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Khởi tạo 3D Background
  init3DBackground();

  // 2. Smooth Scroll (Lenis)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Cập nhật Lenis khi click anchor link
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target);
        // Đóng menu mobile nếu đang mở
        document.querySelector('.nav-menu').classList.remove('active');
      }
    });
  });

  // 3. Xử lý Dropdown Mobile
  const menuBtn = document.createElement('button');
  menuBtn.innerHTML = '☰';
  menuBtn.className = 'nav-link';
  menuBtn.style.fontSize = '1.5rem';
  menuBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
  document.querySelector('.navbar').appendChild(menuBtn);

  menuBtn.addEventListener('click', () => {
    document.querySelector('.nav-menu').classList.toggle('active');
  });

  window.addEventListener('resize', () => {
    menuBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
  });

  // 4. Copy Email (Cho phép copy ở phần tử này)
  const emailText = document.getElementById('email-text');
  const copyToast = document.getElementById('copy-toast');
  
  emailText.addEventListener('click', () => {
    const email = emailText.innerText;
    navigator.clipboard.writeText(email).then(() => {
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 2000);
    });
  });

  // 5. Chặn Copy toàn trang (Chỉ trừ phần email)
  document.addEventListener('copy', (e) => {
    if (!e.target.classList.contains('allow-copy')) {
      e.preventDefault();
      // Có thể thêm thông báo nếu muốn
    }
  });

  // 6. Audio Player
  const tracks = [
    { file: 'music/Bread-Lukrembo.mp3', name: 'Ambient Space 1' },
    { file: 'music/lukrembo-marshmallow.mp3', name: 'Cosmic Journey 2' },
    { file: 'music/lukrembo-onion.mp3', name: 'Starlight 3' }
  ];
  
  const audio = new Audio();
  const playBtn = document.getElementById('play-pause-btn');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const trackTitle = document.getElementById('audio-title');
  const volSlider = document.getElementById('volume-slider');
  let isPlaying = false;

  // Random nhạc
  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
  audio.src = randomTrack.file;
  trackTitle.textContent = randomTrack.name;
  audio.loop = true;
  audio.volume = 0.5;

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    } else {
      audio.play().catch(e => console.log('Cần tương tác để phát nhạc:', e));
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    }
    isPlaying = !isPlaying;
  });

  volSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
  });

  // 7. Modal Logic
  window.openModal = function(id) {
    document.getElementById('modal-overlay').classList.add('active');
    document.querySelectorAll('.modal-content').forEach(el => el.classList.remove('active'));
    document.getElementById('modal-' + id).classList.add('active');
    lenis.stop(); // Ngăn scroll khi mở modal
  };

  window.closeModal = function() {
    document.getElementById('modal-overlay').classList.remove('active');
    lenis.start();
  };

  // Đóng modal khi bấm ra ngoài
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // 8. Calculator Logic
  let currentInput = '0';
  let history = '';
  let shouldResetScreen = false;
  const display = document.getElementById('calc-display');
  const historyDisplay = document.getElementById('calc-history');

  window.calcAction = function(action) {
    if (action === 'clear') {
      currentInput = '0';
      history = '';
    } else if (action === 'del') {
      currentInput = currentInput.toString().slice(0, -1) || '0';
    } else if (action === '=') {
      try {
        // Đánh giá biểu thức an toàn
        const result = eval(currentInput.replace('×', '*').replace('÷', '/'));
        history = currentInput + ' =';
        currentInput = Number.isInteger(result) ? result.toString() : result.toFixed(4);
        shouldResetScreen = true;
      } catch {
        currentInput = 'Error';
        shouldResetScreen = true;
      }
    } else {
      if (shouldResetScreen && !isNaN(action)) {
        currentInput = action;
        shouldResetScreen = false;
      } else if (shouldResetScreen && isNaN(action)) {
        currentInput = currentInput + action;
        shouldResetScreen = false;
      } else {
        if (currentInput === '0' && !isNaN(action)) {
          currentInput = action;
        } else {
          currentInput += action;
        }
      }
    }
    display.textContent = currentInput;
    historyDisplay.textContent = history;
  };

  // 9. Scroll Reveal Animation đơn giản (dùng Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.9, 0.3, 1)';
    io.observe(el);
  });

});
