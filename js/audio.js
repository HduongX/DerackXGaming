import { CONFIG } from './config.js';

/**
 * CosmicAudio — ambient pad + space wind + reverb.
 * Tự sinh impulse cho convolver nên KHÔNG cần file MP3.
 */
export class CosmicAudio {
  constructor(config = CONFIG.audio) {
    this.cfg = config;
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this._built = false;
  }

  start() {
    if (this._built) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      console.warn('Web Audio API không được hỗ trợ.');
      return;
    }

    const ctx = new AC();
    this.ctx = ctx;

    // Master
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    // Reverb
    const convolver = ctx.createConvolver();
    const impulseLen = ctx.sampleRate * 3.5;
    const impulse = ctx.createBuffer(2, impulseLen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c);
      for (let i = 0; i < impulseLen; i++) {
        data[i] = (Math.random() * 2 - 1) *
          Math.pow(1 - i / impulseLen, 2.6);
      }
    }
    convolver.buffer = impulse;
    const wetGain = ctx.createGain();
    wetGain.gain.value = this.cfg.reverbAmount;
    convolver.connect(wetGain).connect(master);

    // Pad chords
    this.cfg.padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 12;

      const oscGain = ctx.createGain();
      const baseGain = 0.09 / (i * 0.6 + 1);
      oscGain.gain.value = baseGain;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.03 + Math.random() * 0.09;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = baseGain * 0.55;
      lfo.connect(lfoGain).connect(oscGain.gain);
      lfo.start();

      osc.connect(oscGain);
      oscGain.connect(master);
      oscGain.connect(convolver);
      osc.start();
    });

    // Space wind
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 900;
    noiseFilter.Q.value = 0.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.018;

    const filterLfo = ctx.createOscillator();
    filterLfo.frequency.value = 0.06;
    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.value = 500;
    filterLfo.connect(filterLfoGain).connect(noiseFilter.frequency);
    filterLfo.start();

    noise.connect(noiseFilter).connect(noiseGain);
    noiseGain.connect(master);
    noiseGain.connect(convolver);
    noise.start();

    // Fade in
    master.gain.linearRampToValueAtTime(
      this.cfg.masterVolume,
      ctx.currentTime + this.cfg.fadeInTime
    );

    this._built = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    if (!this.master) return;
    this.muted = muted;
    const target = muted ? 0 : this.cfg.masterVolume;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(
      target,
      now + this.cfg.toggleFadeTime
    );
  }

  toggle() {
    this.setMuted(!this.muted);
    return this.muted;
  }
}

/** Wire toggle button vào instance CosmicAudio */
export function createAudioToggleButton(audio) {
  const btn = document.getElementById('audioToggle');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const muted = audio.toggle();
    btn.classList.toggle('muted', muted);
  });

  return {
    show: () => btn.classList.add('show'),
    hide: () => btn.classList.remove('show'),
  };
}
