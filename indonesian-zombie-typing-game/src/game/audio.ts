// Semua efek suara disintesis dengan Web Audio API — tanpa file aset.

type AC = AudioContext;

class SoundEngine {
  private ctx: AC | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private last: Record<string, number> = {};
  enabled = true;
  /** Dibisukan sementara (misal: mode demo di menu) */
  muted = false;

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      const ctx = new Ctor({ latencyHint: "interactive" });
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 12;
      comp.ratio.value = 5;
      comp.attack.value = 0.002;
      comp.release.value = 0.18;
      const master = ctx.createGain();
      master.gain.value = this.enabled ? 0.75 : 0;
      master.connect(comp);
      comp.connect(ctx.destination);

      const len = Math.floor(ctx.sampleRate * 1.2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

      // "buka kunci" audio untuk iOS
      const s = ctx.createBufferSource();
      s.buffer = ctx.createBuffer(1, 1, 22050);
      s.connect(ctx.destination);
      s.start(0);

      this.ctx = ctx;
      this.master = master;
      this.noiseBuf = buf;
      if (ctx.state === "suspended") void ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(on ? 0.75 : 0, this.ctx.currentTime, 0.02);
    }
  }

  private ready(): boolean {
    return !!this.ctx && this.enabled && !this.muted && this.ctx.state === "running";
  }

  private gap(key: string, min: number): boolean {
    const now = this.ctx!.currentTime;
    if (now - (this.last[key] ?? -9) < min) return false;
    this.last[key] = now;
    return true;
  }

  private noise(
    t: number,
    dur: number,
    type: BiquadFilterType,
    f0: number,
    f1: number,
    q: number,
    vol: number,
    attack = 0.002,
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.master!);
    src.start(t, Math.random() * 0.4);
    src.stop(t + dur + 0.05);
  }

  private tone(
    t: number,
    dur: number,
    type: OscillatorType,
    f0: number,
    f1: number,
    vol: number,
    attack = 0.004,
  ) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  shoot() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    const r = 0.88 + Math.random() * 0.24;
    this.noise(t, 0.1, "bandpass", 2800 * r, 500, 0.8, 0.6);
    this.noise(t, 0.04, "highpass", 6000, 3500, 0.6, 0.22);
    this.tone(t, 0.12, "sine", 180 * r, 42, 0.6);
  }

  lock() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.07, "square", 1100, 1700, 0.045);
  }

  typo() {
    if (!this.ready() || !this.gap("typo", 0.05)) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.16, "square", 160, 70, 0.1);
    this.tone(t, 0.16, "sawtooth", 166, 74, 0.07);
  }

  release() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.08, "triangle", 900, 400, 0.08);
  }

  splat(big = 1) {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.noise(t, 0.3 * big, "lowpass", 2000, 110, 1.2, 0.6);
    this.noise(t + 0.015, 0.14, "bandpass", 900, 260, 2.5, 0.35);
    this.tone(t, 0.24 * big, "sine", 260, 45, 0.5);
  }

  explode(size = 1) {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.noise(t, 0.9 * size, "lowpass", 1600, 45, 0.7, 0.95, 0.004);
    this.noise(t, 0.22, "highpass", 3200, 900, 0.5, 0.3);
    this.tone(t, 0.8 * size, "sine", 95, 24, 0.95);
  }

  hurt() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.45, "sawtooth", 130, 38, 0.32);
    this.noise(t, 0.35, "lowpass", 900, 70, 1, 0.7);
    this.tone(t, 0.3, "sine", 85, 28, 0.8);
  }

  heartbeat(intensity: number) {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    const v = 0.35 + intensity * 0.45;
    this.tone(t, 0.16, "sine", 64, 38, v, 0.01);
    this.tone(t + 0.17, 0.16, "sine", 56, 34, v * 0.7, 0.01);
  }

  groan() {
    if (!this.ready() || !this.gap("groan", 1.2)) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const dur = 0.9 + Math.random() * 0.7;
    const f = 62 + Math.random() * 48;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(f, t);
    o.frequency.linearRampToValueAtTime(f * (0.68 + Math.random() * 0.2), t + dur);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4 + Math.random() * 5;
    const lg = ctx.createGain();
    lg.gain.value = f * 0.09;
    lfo.connect(lg);
    lg.connect(o.frequency);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 3.5;
    bp.frequency.setValueAtTime(520 + Math.random() * 180, t);
    bp.frequency.linearRampToValueAtTime(300, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(bp);
    bp.connect(g);
    g.connect(this.master!);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }

  wave() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    for (const d of [0, 0.3]) {
      this.tone(t + d, 0.55, "sine", 115, 38, 0.85);
      this.noise(t + d, 0.32, "lowpass", 700, 70, 1, 0.5);
    }
    this.tone(t + 0.05, 1.3, "sawtooth", 110, 98, 0.07, 0.35);
    this.tone(t + 0.05, 1.3, "sawtooth", 116.5, 104, 0.06, 0.35);
  }

  waveClear() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => this.tone(t + i * 0.08, 0.18, "square", f, f, 0.06));
  }

  combo(tier: number) {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    const base = 392 * Math.pow(2, (tier * 2) / 12);
    [0, 4, 7, 12].forEach((s, i) => {
      const f = base * Math.pow(2, s / 12);
      this.tone(t + i * 0.05, 0.12, "square", f, f, 0.055);
    });
  }

  armor() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.4, "triangle", 1500, 1150, 0.25);
    this.tone(t, 0.3, "square", 2300, 1800, 0.05);
    this.noise(t, 0.09, "highpass", 6500, 3000, 1, 0.3);
  }

  pickup() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(t + i * 0.06, 0.22, "sine", f, f, 0.18));
  }

  grenadeThrow() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.04, "square", 2200, 2200, 0.07);
    this.noise(t + 0.03, 0.4, "bandpass", 350, 1800, 2, 0.22, 0.08);
  }

  bossRoar() {
    if (!this.ready()) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const dur = 1.7;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(400, t);
    lp.frequency.linearRampToValueAtTime(1100, t + 0.4);
    lp.frequency.linearRampToValueAtTime(300, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(g);
    g.connect(this.master!);
    for (const f of [52, 55.5, 78]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, t);
      o.frequency.linearRampToValueAtTime(f * 0.7, t + dur);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 7;
      const lg = ctx.createGain();
      lg.gain.value = f * 0.07;
      lfo.connect(lg);
      lg.connect(o.frequency);
      o.connect(lp);
      o.start(t);
      lfo.start(t);
      o.stop(t + dur);
      lfo.stop(t + dur);
    }
    this.noise(t, 1.2, "lowpass", 500, 60, 0.7, 0.35, 0.1);
  }

  bossHit() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.noise(t, 0.5, "lowpass", 1400, 60, 0.8, 0.8);
    this.tone(t, 0.35, "sawtooth", 95, 40, 0.3);
    this.tone(t, 0.4, "sine", 80, 30, 0.7);
  }

  gameOver() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 1.8, "sawtooth", 220, 38, 0.22, 0.02);
    this.tone(t + 0.25, 2.0, "sine", 110, 28, 0.45, 0.05);
    this.noise(t, 1.4, "lowpass", 1400, 40, 0.7, 0.9, 0.004);
  }

  thunder() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.noise(t, 2.8, "lowpass", 480, 40, 0.5, 0.45, 0.04);
    this.noise(t + 0.08, 1.1, "lowpass", 1300, 90, 0.5, 0.25, 0.01);
  }

  tick(go = false) {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    const f = go ? 1320 : 880;
    this.tone(t, go ? 0.2 : 0.09, "square", f, f, 0.07);
    if (go) this.tone(t, 0.3, "sine", 200, 55, 0.45);
  }

  click() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.06, "sine", 660, 990, 0.12);
  }

  start() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(t, 0.12, "square", 330, 660, 0.06);
    this.tone(t + 0.1, 0.25, "square", 660, 1320, 0.05);
    this.noise(t, 0.5, "lowpass", 1200, 60, 0.7, 0.5, 0.004);
    this.tone(t, 0.5, "sine", 90, 30, 0.7);
  }
}

export const sfx = new SoundEngine();
