/**
 * Enter screen — chỉ chịu trách nhiệm hide/show & bắt sự kiện click.
 * Toàn bộ logic "khi user enter thì làm gì" do main.js quyết định qua callback.
 */
export function initEnterScreen({ onEnter }) {
  const screen = document.getElementById('enterScreen');
  const btn = document.getElementById('enterBtn');

  let fired = false;

  btn.addEventListener('click', async () => {
    if (fired) return;
    fired = true;
    btn.disabled = true;

    // Fade screen out
    screen.classList.add('fade-out');

    // Gọi callback (main.js sẽ warp, start audio, reveal main)
    if (typeof onEnter === 'function') {
      await onEnter();
    }

    // Xoá khỏi flow sau transition
    setTimeout(() => {
      screen.style.display = 'none';
    }, 700);
  }, { once: true });

  return { screen, btn };
}