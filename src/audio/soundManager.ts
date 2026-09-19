// Procedural 8-bit Audio Synthesizer via Web Audio API
// Enhanced with Analog Low-Pass Filter, Voice Limiter, and Haptic Feedback

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analogFilter: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimeout: number | null = null;

  // Voice Limiter / Throttle to prevent GC Stutter & AudioNode exhaustion on Android
  private lastSoundTime: Record<string, number> = {};
  private activeVoices: number = 0;
  private readonly maxSimultaneousVoices: number = 6;

  constructor() {
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

  // Safe Haptic Feedback for Android Mobile
  public vibrate(pattern: number | number[] = 15) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {}
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

          // Master Gain Node
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);

          // Biquad Low-Pass Analog Filter (Cuts out piercing 3kHz-8kHz digital harshness)
          this.analogFilter = this.ctx.createBiquadFilter();
          this.analogFilter.type = 'lowpass';
          this.analogFilter.frequency.setValueAtTime(2800, this.ctx.currentTime);
          this.analogFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

          // Signal Chain: Nodes -> Filter -> MasterGain -> Destination
          this.analogFilter.connect(this.masterGain);
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

  // Safe tone generator with voice limiter and analog warmth
  private playTone(
    freq: number,
    type: OscillatorType = 'square',
    duration: number = 0.1,
    endFreq?: number,
    gainLevel: number = 0.3,
    soundKey?: string,
    throttleMs: number = 25
  ) {
    if (this.isMuted) return;

    // Throttle check
    const nowMs = performance.now();
    if (soundKey) {
      if (this.lastSoundTime[soundKey] && nowMs - this.lastSoundTime[soundKey] < throttleMs) {
        return; // Throttled to protect GC
      }
      this.lastSoundTime[soundKey] = nowMs;
    }

    if (this.activeVoices >= this.maxSimultaneousVoices) return;

    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.analogFilter) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      this.activeVoices++;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq && endFreq !== freq) {
        osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
      }

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(gain);
      gain.connect(this.analogFilter);

      osc.start(now);
      osc.stop(now + duration + 0.02);

      osc.onended = () => {
        this.activeVoices = Math.max(0, this.activeVoices - 1);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    }
  }

  public playSwitchClick() {
    this.vibrate(10);
    this.playTone(180, 'triangle', 0.03, 50, 0.25, 'click', 20);
  }

  public playCartridgeSwap() {
    this.vibrate([25, 40, 20]);
    this.playTone(80, 'sawtooth', 0.18, 260, 0.4, 'cart', 100);
    setTimeout(() => {
      this.playTone(1200, 'square', 0.05, 600, 0.3);
    }, 40);
  }

  public playCoin() {
    this.vibrate([15, 30, 25]);
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.analogFilter) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.linearRampToValueAtTime(0, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.analogFilter);
      osc1.start(now);
      osc1.stop(now + 0.13);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.analogFilter);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.36);
    } catch {}
  }

  public playDot() {
    this.playTone(320, 'triangle', 0.04, 600, 0.26, 'dot', 35);
  }

  public playPowerPellet() {
    this.vibrate(30);
    this.playTone(340, 'sawtooth', 0.22, 880, 0.35, 'pellet', 100);
  }

  public playEatGhost(multiplier = 1) {
    this.vibrate([20, 30, 25]);
    const base = 480 * Math.min(2.5, multiplier);
    this.playTone(base, 'square', 0.12, base * 1.5, 0.4, 'ghost', 80);
    setTimeout(() => {
      this.playTone(base * 1.8, 'square', 0.15, base * 2.2, 0.4);
    }, 60);
  }

  public playLaser() {
    this.vibrate(12);
    this.playTone(1050, 'sawtooth', 0.09, 140, 0.3, 'laser', 40);
  }

  public playExplosion() {
    this.vibrate([40, 30, 60]);
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.analogFilter) return;

      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.2);
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
      filter.frequency.linearRampToValueAtTime(60, now + 0.2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.analogFilter);

      noise.start(now);
      noise.stop(now + 0.21);
    } catch {}
  }

  public playBounce(pitchMultiplier = 1) {
    this.vibrate(8);
    this.playTone(360 * pitchMultiplier, 'sine', 0.06, 180 * pitchMultiplier, 0.32, 'bounce', 30);
  }

  public playBrickSmash() {
    this.vibrate(15);
    this.playTone(620, 'square', 0.08, 300, 0.35, 'brick', 30);
  }

  public playProjectDiscovered() {
    this.vibrate([30, 40, 30, 40, 50]);
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'square', 0.1, f * 1.05, 0.35);
      }, i * 65);
    });
  }

  public playGameOver() {
    this.vibrate([50, 60, 80]);
    if (this.isMuted) return;
    const notes = [440, 392, 349.23, 261.63, 196];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.18, f * 0.9, 0.35);
      }, i * 140);
    });
  }

  // 2-Voice Chiptune BGM Loop with Analog Filter Warmth
  public startBgm() {
    if (this.isMuted || this.bgmPlaying) return;
    this.ensureContext();
    this.bgmPlaying = true;

    const bassline = [174.61, 174.61, 207.65, 207.65, 233.08, 233.08, 261.63, 261.63];
    const arpeggio = [523.25, 698.46, 880.00, 1046.50, 659.25, 783.99, 987.77, 1318.51];
    let step = 0;

    const playStep = () => {
      if (!this.bgmPlaying || this.isMuted) return;
      this.playTone(bassline[step % bassline.length], 'triangle', 0.18, undefined, 0.16);
      if (step % 2 === 0) {
        this.playTone(arpeggio[(step / 2) % arpeggio.length], 'square', 0.09, undefined, 0.08);
      }
      step++;
      this.bgmTimeout = window.setTimeout(playStep, 180);
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
