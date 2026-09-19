// Procedural 8-bit Audio Synthesizer via Web Audio API (Zero external assets)
// Enhanced for Android WebKit & iOS Safari mobile gesture unlocking

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimeout: number | null = null;

  constructor() {
    // Auto unlock on first user gesture anywhere on page
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlock();
      };
      window.addEventListener('click', unlock, { passive: true, once: true });
      window.addEventListener('touchstart', unlock, { passive: true, once: true });
      window.addEventListener('pointerdown', unlock, { passive: true, once: true });
      window.addEventListener('keydown', unlock, { passive: true, once: true });
    }
  }

  public unlock() {
    try {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {}
  }

  private ensureContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
    if (muted) {
      this.stopBgm();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Safe tone generator using linear ramps (immune to WebKit exponentialRamp zero-value errors)
  private playTone(
    freq: number,
    type: OscillatorType = 'square',
    duration: number = 0.1,
    endFreq?: number,
    gainLevel: number = 0.3
  ) {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.masterGain) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq && endFreq !== freq) {
        osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
      }

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {}
  }

  // Mechanical arcade button click
  public playSwitchClick() {
    this.playTone(180, 'triangle', 0.03, 50, 0.25);
  }

  // Cartridge swap degauss sound
  public playCartridgeSwap() {
    this.playTone(80, 'sawtooth', 0.18, 260, 0.4);
    setTimeout(() => {
      this.playTone(1200, 'square', 0.05, 600, 0.3);
    }, 40);
  }

  // Coin inserted chime
  public playCoin() {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      // Note 1: B5 (987.77 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.linearRampToValueAtTime(0, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Note 2: E6 (1318.51 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.36);
    } catch {}
  }

  // Pacman Dot Eat (Waka)
  public playDot() {
    this.playTone(320, 'triangle', 0.05, 640, 0.28);
  }

  // Power Pellet Eat
  public playPowerPellet() {
    this.playTone(340, 'sawtooth', 0.22, 880, 0.35);
  }

  // Ghost Eat / Bonus Collect
  public playEatGhost(multiplier = 1) {
    const base = 480 * Math.min(2.5, multiplier);
    this.playTone(base, 'square', 0.12, base * 1.5, 0.4);
    setTimeout(() => {
      this.playTone(base * 1.8, 'square', 0.15, base * 2.2, 0.4);
    }, 60);
  }

  // Laser shoot
  public playLaser() {
    this.playTone(1050, 'sawtooth', 0.1, 140, 0.3);
  }

  // Explosion
  public playExplosion() {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.masterGain) return;

      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.18);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(60, now + 0.18);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.19);
    } catch {}
  }

  // Bounce (Breakout / Pong)
  public playBounce(pitchMultiplier = 1) {
    this.playTone(360 * pitchMultiplier, 'sine', 0.07, 180 * pitchMultiplier, 0.35);
  }

  // Brick Smash
  public playBrickSmash() {
    this.playTone(620, 'square', 0.08, 300, 0.35);
  }

  // Project Discovered Fanfare
  public playProjectDiscovered() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'square', 0.1, f * 1.05, 0.35);
      }, i * 65);
    });
  }

  // Game Over
  public playGameOver() {
    if (this.isMuted) return;
    const notes = [440, 392, 349.23, 261.63, 196];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.18, f * 0.9, 0.35);
      }, i * 140);
    });
  }

  // 8-bit Synth Chiptune BGM Loop
  public startBgm() {
    if (this.isMuted || this.bgmPlaying) return;
    this.ensureContext();
    this.bgmPlaying = true;

    const bassline = [174.61, 207.65, 233.08, 261.63, 233.08, 207.65];
    let step = 0;

    const playStep = () => {
      if (!this.bgmPlaying || this.isMuted) return;
      this.playTone(bassline[step % bassline.length], 'triangle', 0.16, undefined, 0.15);
      step++;
      this.bgmTimeout = window.setTimeout(playStep, 220);
    };

    playStep();
  }

  public stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimeout !== null) {
      clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
  }

  public isBgmActive(): boolean {
    return this.bgmPlaying;
  }
}

export const sounds = new SoundManager();
