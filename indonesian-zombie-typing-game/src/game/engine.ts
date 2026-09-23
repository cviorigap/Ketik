import bgUrl from "../assets/bg-raw.jpg";
import { sfx } from "./audio";
import { DIFFICULTIES, type Difficulty, type DifficultyConfig } from "./config";
import { getWordPool } from "./words";
import * as S from "./sprites";

export type ZKind = "walker" | "runner" | "pocong" | "bomber" | "tank" | "boss" | "medkit";
type KillCause = "shot" | "bomb" | "grenade";
type Mode = "demo" | "play" | "over";

export interface GameStats {
  score: number;
  wave: number;
  kills: number;
  wpm: number;
  accuracy: number;
  maxCombo: number;
  difficulty: Difficulty;
  duration: number;
}

export interface EngineEvents {
  onGameOver: (s: GameStats) => void;
  onGrenades: (n: number) => void;
  onHint: (ch: string | null) => void;
}

interface Zombie {
  id: number;
  kind: ZKind;
  x: number;
  z: number;
  speed: number;
  words: string[];
  wi: number;
  prog: number;
  hit: number;
  knock: number;
  wobble: number;
  phase: number;
  rate: number;
  spawnT: number;
  alive: boolean;
  armor: boolean;
  pal: S.ZPal;
  size: number;
  seed: number;
  fur: number[] | null;
  // proyeksi layar
  sx: number;
  sy: number;
  ss: number;
  pp: number;
  top: number;
  // label
  labelOff: number;
  lx: number;
  ly: number;
  lby: number;
  lty: number;
  lw: number;
  lh: number;
  lfs: number;
  lpad: number;
}

interface Particle {
  kind: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vr: number;
  color: string;
  grav: number;
  drag: number;
  floor: number;
  sprite: HTMLCanvasElement | null;
  shape: number;
}

interface FloatText {
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  font: "mono" | "ui" | "horror";
}
interface Tracer {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}
interface Ring {
  x: number;
  y: number;
  r: number;
  max: number;
  life: number;
  dur: number;
  color: string;
  w: number;
}
interface Decal {
  x: number;
  y: number;
  r: number;
  life: number;
  img: HTMLCanvasElement;
  rot: number;
}
interface Claw {
  x: number;
  y: number;
  life: number;
  rot: number;
  s: number;
}
interface FlyLetter {
  ch: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  life: number;
  size: number;
}
interface Pending {
  z: Zombie;
  t: number;
  cause: KillCause;
}
interface Blast {
  x: number;
  y: number;
  wx: number;
  wz: number;
  t: number;
}

const TAU = Math.PI * 2;
const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
const UI = 'Rubik, system-ui, "Segoe UI", sans-serif';
const HORROR = 'Creepster, Impact, "Arial Black", fantasy';
const MAX_LIVES = 5;
const MAX_GRENADES = 3;
const KILLS_PER_GRENADE = 15;
const MAX_P = 900;
const VP_Y = 0.6; // titik hilang pada gambar latar

const P_SPARK = 0;
const P_GOO = 1;
const P_GIB = 2;
const P_SMOKE = 3;
const P_SHELL = 4;
const P_GLOW = 5;
const P_DEBRIS = 6;

const TIERS = [0, 10, 25, 50, 100];
const TIER_COLORS = ["#f1ede2", "#a3ff3c", "#ffe14a", "#ffa126", "#ff4a3a"];
const multFor = (s: number) => (s >= 100 ? 5 : s >= 50 ? 4 : s >= 25 ? 3 : s >= 10 ? 2 : 1);

const KIND: Record<ZKind, { speed: number; size: number; words: number; score: number; rate: number; height: number }> = {
  walker: { speed: 1, size: 1, words: 1, score: 1, rate: 3.3, height: 100 },
  runner: { speed: 1.55, size: 0.84, words: 1, score: 1.4, rate: 8.5, height: 84 },
  pocong: { speed: 1.12, size: 1, words: 1, score: 1.25, rate: 4.4, height: 108 },
  bomber: { speed: 0.9, size: 1, words: 1, score: 1.3, rate: 3, height: 100 },
  tank: { speed: 0.72, size: 1.14, words: 2, score: 1.6, rate: 2.6, height: 102 },
  boss: { speed: 0.42, size: 1.3, words: 5, score: 2.5, rate: 1.9, height: 120 },
  medkit: { speed: 0.75, size: 0.85, words: 1, score: 0, rate: 1, height: 108 },
};

const LABEL_BORDER: Record<ZKind, string> = {
  walker: "rgba(200,255,170,0.3)",
  runner: "rgba(255,120,100,0.6)",
  pocong: "rgba(240,235,220,0.55)",
  bomber: "#ff9a2e",
  tank: "#c8d06a",
  boss: "#ff3b3b",
  medkit: "#6dff8a",
};

const WAVE_SUBS = [
  "Ketik kata untuk menembak!",
  "Jangan biarkan mereka lewat!",
  "Bau busuk makin dekat…",
  "Tahan barikade!",
  "Malam masih panjang…",
  "Mereka makin lapar!",
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const byZ = (a: Zombie, b: Zombie) => a.z - b.z;

export class Engine {
  private cv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ev: EngineEvents;
  private raf = 0;
  private last = 0;
  private dirty = true;

  // tata letak
  private W = 1;
  private H = 1;
  private dpr = 1;
  private maxDpr = 2;
  private ui = 1;
  private horizonY = 0;
  private spawnY = 0;
  private groundY = 0;
  private barTop = 0;
  private zH = 100;
  private fontBase = 20;
  private gunLen = 150;
  private pivotX = 0;
  private pivotY = 0;
  private charRatio = 0.6;
  private pad = 24;

  // aset & cache
  private bgImg: HTMLImageElement | null = null;
  private bgCache: HTMLCanvasElement | null = null;
  private barCache: HTMLCanvasElement | null = null;
  private barCacheH = 0;
  private vignette = S.makeVignette("0,0,0", 0.55, 0.62);
  private redVig = S.makeVignette("200,0,0", 0.35, 0.9);
  private glowOrange = S.makeGlow("255,140,40");
  private glowYellow = S.makeGlow("255,235,160");
  private glowGreen = S.makeGlow("150,255,90");
  private glowRed = S.makeGlow("255,50,35");
  private glowEye = S.makeGlow("255,230,90");
  private fogSprite = S.makeSoft("160,215,195", 0.85);
  private smokeSprite = S.makeSoft("45,50,48", 0.9, 64);
  private dotGreen = S.makeDot("#8fd14f");
  private dotDark = S.makeDot("#3f7a2a");
  private dotRed = S.makeDot("#7a1414");
  private dotBone = S.makeDot("#e8e3d3");
  private splats = [
    S.makeSplat("rgba(70,140,40,0.85)", 1),
    S.makeSplat("rgba(60,120,35,0.85)", 2),
    S.makeSplat("rgba(85,150,45,0.8)", 3),
  ];
  private scorch = S.makeSplat("rgba(10,8,6,0.8)", 4);

  isTouch = false;

  // status permainan
  private mode: Mode = "demo";
  private paused = false;
  private diff: Difficulty = "mudah";
  private cfg: DifficultyConfig = DIFFICULTIES.mudah;
  private pool: string[] = [];
  private poolShort: string[] = [];
  private recent: string[] = [];
  private recentSet = new Set<string>();
  private zombies: Zombie[] = [];
  private target: Zombie | null = null;
  private lockT = 0;
  private idc = 0;
  private dead = false;

  private score = 0;
  private displayScore = 0;
  private scorePop = 0;
  private multPop = 0;
  private lastMult = 1;
  private lives = MAX_LIVES;
  private heartLost = 0;
  private wave = 0;
  private kills = 0;
  private streak = 0;
  private maxStreak = 0;
  private correct = 0;
  private wrong = 0;
  private playTime = 0;
  private grenades = 1;
  private killsToGrenade = KILLS_PER_GRENADE;

  private toSpawn = 0;
  private spawned = 0;
  private spawnTimer = 0;
  private interval = 2;
  private travel = 9;
  private maxAlive = 3;
  private wavePhase: "fight" | "clear" = "fight";
  private waveTimer = 0;
  private waveDamage = false;
  private bossPending = false;
  private medkitPending = false;
  private firstSpawn = true;

  private bannerT = 99;
  private bannerDur = 2.4;
  private bannerText = "";
  private bannerSub = "";
  private bannerColor = "#a3ff3c";
  private tutorial = 0;
  private overT = 0;
  private overSent = false;
  private demoSpawnT = 0;
  private botT = 0;
  private lastHint: string | null = "?";

  // efek
  private parts: Particle[] = [];
  private nParts = 0;
  private texts: FloatText[] = [];
  private tracers: Tracer[] = [];
  private rings: Ring[] = [];
  private decals: Decal[] = [];
  private claws: Claw[] = [];
  private letters: FlyLetter[] = [];
  private pendingKills: Pending[] = [];
  private blasts: Blast[] = [];
  private grenade: { t: number; dur: number; x0: number; y0: number; x1: number; y1: number } | null = null;
  private embers: { x: number; y: number; v: number; s: number; ph: number }[] = [];
  private fogs: { x: number; y: number; w: number; v: number; a: number }[] = [];
  private labelOrder: Zombie[] = [];
  private hopts: S.HumanOpts;

  private trauma = 0;
  private flash = 0;
  private flashColor = "255,255,255";
  private dmgFlash = 0;
  private typoFlash = 0;
  private hitstop = 0;
  private slowmo = 0;
  private time = 0;
  private rt = 0;
  private gunAngle = -Math.PI / 2;
  private recoil = 0;
  private muzzle = 0;
  private flashRot = 0;
  private barShake = 0;
  private danger = 0;
  private beatT = 0;
  private beatPulse = 0;
  private groanT = 3;
  private lightning = 0;
  private lightningT = 9;
  private thunderT = -1;
  private perfSlow = 0;
  private perfFrames = 0;

  constructor(canvas: HTMLCanvasElement, ev: EngineEvents) {
    this.cv = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D tidak didukung");
    this.ctx = ctx;
    this.ev = ev;
    this.hopts = {
      flash: false,
      kind: "walker",
      armor: false,
      seed: 0,
      time: 0,
      glowEye: this.glowEye,
      glowRed: this.glowRed,
      glowOrange: this.glowOrange,
    };
    for (let i = 0; i < MAX_P; i++) {
      this.parts.push({
        kind: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, rot: 0, vr: 0,
        color: "#fff", grav: 0, drag: 0, floor: 1e9, sprite: null, shape: 0,
      });
    }
    for (let i = 0; i < 26; i++) {
      this.embers.push({ x: Math.random(), y: Math.random(), v: rand(0.015, 0.05), s: rand(1, 2.4), ph: rand(0, TAU) });
    }
    for (let i = 0; i < 6; i++) {
      this.fogs.push({ x: Math.random() * 1.4, y: rand(-0.5, 1), w: rand(0.6, 1.2), v: rand(0.006, 0.02) * (i % 2 ? 1 : -1), a: rand(0.1, 0.2) });
    }

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      this.bgImg = img;
      this.buildBg();
      this.dirty = true;
    };
    img.src = bgUrl;

    this.measure();
    if (document.fonts) {
      Promise.all([
        document.fonts.load(`800 20px ${MONO}`),
        document.fonts.load(`800 20px ${UI}`),
        document.fonts.load(`20px ${HORROR}`),
      ])
        .then(() => {
          this.measure();
          this.dirty = true;
        })
        .catch(() => undefined);
    }

    this.startDemo();
    this.raf = requestAnimationFrame(this.loop);
  }

  /* ================= API publik ================= */

  destroy() {
    cancelAnimationFrame(this.raf);
  }

  resize(w: number, h: number) {
    if (w < 2 || h < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    this.W = w;
    this.H = h;
    this.dpr = dpr;
    this.cv.width = Math.round(w * dpr);
    this.cv.height = Math.round(h * dpr);
    const portrait = h > w * 1.05;
    this.ui = clamp(Math.min(w / 760, h / 640), 0.78, 1.3);
    this.horizonY = h * (portrait ? 0.3 : 0.27);
    this.spawnY = h * (portrait ? 0.36 : 0.34);
    this.barTop = h * 0.845;
    this.groundY = h * 0.885;
    this.zH = Math.min(h * 0.33, w * 0.44);
    this.fontBase = clamp(Math.min(w, h) * 0.045, 19, 30);
    this.gunLen = Math.min(h * 0.36, w * 0.46, 300);
    this.pivotX = w / 2;
    this.pivotY = h + this.gunLen * 0.26;
    this.pad = Math.ceil(22 * this.ui);
    this.buildBg();
    this.buildBarricade();
    this.dirty = true;
    if (this.paused) {
      this.render(0);
      this.dirty = false;
    }
  }

  startGame(diff: Difficulty) {
    this.resetWorld();
    this.mode = "play";
    this.diff = diff;
    this.cfg = DIFFICULTIES[diff];
    this.pool = getWordPool(diff);
    this.poolShort = diff === "sulit" ? getWordPool(diff, 6) : this.pool;
    sfx.muted = false;
    this.tutorial = 14;
    this.wave = 0;
    this.nextWave();
    this.ev.onGrenades(this.grenades);
    this.emitHint();
    sfx.start();
  }

  startDemo() {
    this.resetWorld();
    this.mode = "demo";
    this.diff = "sedang";
    this.cfg = DIFFICULTIES.sedang;
    this.pool = getWordPool("sedang");
    this.poolShort = this.pool;
    this.travel = 9;
    this.wave = 4;
    this.demoSpawnT = 0.2;
    sfx.muted = true;
    this.emitHint();
  }

  setPaused(p: boolean) {
    this.paused = p;
    this.dirty = true;
    if (!p) this.last = 0;
  }

  /** Mengembalikan true bila huruf benar. */
  type(ch: string): boolean {
    if (this.mode !== "play" || this.paused) return false;
    return this.processChar(ch.toUpperCase());
  }

  cancelTarget() {
    if (this.mode !== "play" || this.paused || !this.target) return;
    this.target.prog = 0;
    this.target = null;
    sfx.release();
    this.emitHint();
  }

  throwGrenade(): boolean {
    if (this.mode !== "play" || this.paused || this.grenades <= 0 || this.grenade) return false;
    let n = 0;
    let sx = 0;
    let sy = 0;
    for (const z of this.zombies) {
      if (!z.alive || z.kind === "medkit") continue;
      this.project(z);
      n++;
      sx += z.sx;
      sy += z.sy - (z.sy - z.top) * 0.5;
    }
    if (n === 0) return false;
    this.grenades--;
    this.ev.onGrenades(this.grenades);
    this.grenade = { t: 0, dur: 0.42, x0: this.W * 0.5, y0: this.H + 10, x1: sx / n, y1: sy / n };
    sfx.grenadeThrow();
    return true;
  }

  /* ================= caches ================= */

  private measure() {
    const c = this.ctx;
    c.font = `800 100px ${MONO}`;
    const w = c.measureText("MMMMMMMMMM").width / 10;
    this.charRatio = w > 0 ? w / 100 : 0.6;
  }

  private buildBg() {
    const W = this.W;
    const H = this.H;
    const pad = this.pad;
    if (W < 2) return;
    const c = this.bgCache ?? document.createElement("canvas");
    c.width = Math.round((W + pad * 2) * this.dpr);
    c.height = Math.round((H + pad * 2) * this.dpr);
    const g = c.getContext("2d")!;
    g.setTransform(this.dpr, 0, 0, this.dpr, pad * this.dpr, pad * this.dpr);
    g.fillStyle = "#07100f";
    g.fillRect(-pad, -pad, W + pad * 2, H + pad * 2);
    const img = this.bgImg;
    if (img && img.naturalWidth > 0) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const vpx = 0.5 * iw;
      const vpy = VP_Y * ih;
      const sc = Math.max(
        (W / 2 + pad) / vpx,
        (W / 2 + pad) / (iw - vpx),
        (this.horizonY + pad) / vpy,
        (H + pad - this.horizonY) / (ih - vpy),
      );
      g.drawImage(img, W / 2 - vpx * sc, this.horizonY - vpy * sc, iw * sc, ih * sc);
    } else {
      const sky = g.createLinearGradient(0, -pad, 0, this.horizonY);
      sky.addColorStop(0, "#08151b");
      sky.addColorStop(1, "#1d4a3e");
      g.fillStyle = sky;
      g.fillRect(-pad, -pad, W + pad * 2, this.horizonY + pad);
      g.fillStyle = "#101718";
      g.fillRect(-pad, this.horizonY, W + pad * 2, H - this.horizonY + pad);
      g.fillStyle = "#1b2325";
      g.beginPath();
      g.moveTo(W / 2 - 8, this.horizonY);
      g.lineTo(W / 2 + 8, this.horizonY);
      g.lineTo(W * 1.2, H + pad);
      g.lineTo(-W * 0.2, H + pad);
      g.closePath();
      g.fill();
    }
    const top = g.createLinearGradient(0, -pad, 0, H * 0.24);
    top.addColorStop(0, "rgba(3,8,8,0.8)");
    top.addColorStop(1, "rgba(3,8,8,0)");
    g.fillStyle = top;
    g.fillRect(-pad, -pad, W + pad * 2, H * 0.24 + pad);
    const hz = g.createRadialGradient(W / 2, this.horizonY + H * 0.03, 0, W / 2, this.horizonY + H * 0.03, Math.max(W, H) * 0.45);
    hz.addColorStop(0, "rgba(140,220,170,0.2)");
    hz.addColorStop(1, "rgba(140,220,170,0)");
    g.fillStyle = hz;
    g.fillRect(-pad, -pad, W + pad * 2, H + pad * 2);
    g.fillStyle = "rgba(4,10,12,0.3)";
    g.fillRect(-pad, -pad, W + pad * 2, H + pad * 2);
    const bot = g.createLinearGradient(0, H * 0.6, 0, H + pad);
    bot.addColorStop(0, "rgba(0,0,0,0)");
    bot.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = bot;
    g.fillRect(-pad, H * 0.6, W + pad * 2, H * 0.4 + pad);
    this.bgCache = c;
  }

  private buildBarricade() {
    const wire = 16 * this.ui;
    const h = this.H - this.barTop + wire;
    const w = this.W + this.pad * 2;
    const c = this.barCache ?? document.createElement("canvas");
    c.width = Math.round(w * this.dpr);
    c.height = Math.round(h * this.dpr);
    const g = c.getContext("2d")!;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    S.drawBarricade(g, w, h, this.ui);
    this.barCache = c;
    this.barCacheH = h;
  }

  /* ================= loop ================= */

  private loop = (ts: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const raw = this.last ? (ts - this.last) / 1000 : 1 / 60;
    this.last = ts;
    if (this.paused) {
      if (this.dirty) {
        this.render(0);
        this.dirty = false;
      }
      return;
    }
    this.perf(raw);
    const dt = Math.min(0.05, Math.max(0, raw));
    this.step(dt);
    this.render(dt);
  };

  private perf(raw: number) {
    if (this.maxDpr <= 1 || raw > 0.25) return;
    this.perfFrames++;
    if (raw > 1 / 42) this.perfSlow++;
    if (this.perfFrames >= 150) {
      if (this.perfSlow > 70 && this.dpr > 1) {
        this.maxDpr = Math.max(1, this.dpr - 0.5);
        this.resize(this.W, this.H);
      }
      this.perfFrames = 0;
      this.perfSlow = 0;
    }
  }

  private step(realDt: number) {
    this.rt += realDt;
    this.trauma = Math.max(0, this.trauma - realDt * 1.5);
    this.flash = Math.max(0, this.flash - realDt * 2.6);
    this.dmgFlash = Math.max(0, this.dmgFlash - realDt * 1.5);
    this.typoFlash = Math.max(0, this.typoFlash - realDt);
    this.bannerT += realDt;
    let dt = realDt;
    if (this.hitstop > 0) {
      this.hitstop -= realDt;
      dt *= 0.06;
    }
    if (this.slowmo > 0) {
      this.slowmo -= realDt;
      dt *= 0.3;
    }
    if (this.mode === "over" && !this.overSent) {
      this.overT -= realDt;
      if (this.overT <= 0) {
        this.overSent = true;
        this.ev.onGameOver(this.stats());
      }
    }
    this.update(dt);
  }

  private update(dt: number) {
    this.time += dt;
    if (this.mode === "play") this.playTime += dt;
    this.lockT += dt;
    this.scorePop = Math.max(0, this.scorePop - dt * 4);
    this.multPop = Math.max(0, this.multPop - dt * 3);
    this.heartLost = Math.max(0, this.heartLost - dt * 1.6);
    this.barShake = Math.max(0, this.barShake - dt * 3);
    if (this.tutorial > 0) this.tutorial -= dt;
    this.displayScore += (this.score - this.displayScore) * Math.min(1, dt * 12);
    if (Math.abs(this.score - this.displayScore) < 1) this.displayScore = this.score;

    this.updateSpawner(dt);
    this.updateBot(dt);

    for (const z of this.zombies) {
      if (!z.alive) continue;
      z.spawnT += dt;
      if (z.hit > 0) z.hit -= dt;
      if (z.wobble > 0) z.wobble -= dt;
      z.knock *= Math.exp(-dt * 9);
      z.phase += dt * z.rate;
      let spd = z.speed;
      if (z.kind === "pocong") spd *= Math.abs(Math.sin(z.phase)) * 1.5708;
      z.z += spd * dt;
      if (z.z >= 1) this.reachBarricade(z);
    }

    // kematian tertunda (granat / ledakan berantai)
    for (let i = this.pendingKills.length - 1; i >= 0; i--) {
      const p = this.pendingKills[i];
      p.t -= dt;
      if (p.t > 0) continue;
      this.pendingKills.splice(i, 1);
      if (!p.z.alive) continue;
      if (p.z.kind === "boss") this.damageBoss(p.z, p.cause);
      else this.killZombie(p.z, p.cause);
    }
    for (let i = this.blasts.length - 1; i >= 0; i--) {
      const b = this.blasts[i];
      b.t -= dt;
      if (b.t > 0) continue;
      this.blasts.splice(i, 1);
      this.detonate(b);
    }
    if (this.grenade) {
      const g = this.grenade;
      g.t += dt;
      const k = Math.min(1, g.t / g.dur);
      const gx = g.x0 + (g.x1 - g.x0) * k;
      const gy = g.y0 + (g.y1 - g.y0) * k - Math.sin(k * Math.PI) * this.H * 0.28;
      this.spawnP(P_SPARK, gx, gy, rand(-80, 80), rand(-80, 40), 0.25, 1.6 * this.ui, "#ffcf6a", 0, 2);
      if (k >= 1) {
        this.grenade = null;
        this.grenadeBoom(g.x1, g.y1);
      }
    }

    if (this.dead) {
      const a = this.zombies;
      let j = 0;
      for (let i = 0; i < a.length; i++) if (a[i].alive) a[j++] = a[i];
      a.length = j;
      this.dead = false;
    }

    // senjata
    let aim = -Math.PI / 2 + Math.sin(this.rt * 0.9) * 0.06;
    const t = this.target;
    if (t && t.alive) {
      this.project(t);
      aim = clamp(Math.atan2(t.sy - (t.sy - t.top) * 0.55 - this.pivotY, t.sx - this.pivotX), -Math.PI + 0.25, -0.25);
    }
    this.gunAngle += (aim - this.gunAngle) * Math.min(1, dt * 18);
    this.recoil *= Math.exp(-dt * 14);
    if (this.muzzle > 0) this.muzzle -= dt;

    this.updateFx(dt);

    // suasana
    if (this.mode === "play") {
      let d = 0;
      for (const z of this.zombies) if (z.alive && z.kind !== "medkit" && z.z > d) d = z.z;
      this.danger += (d - this.danger) * Math.min(1, dt * 5);
      if (d > 0.62) {
        this.beatT -= dt;
        if (this.beatT <= 0) {
          const k = (d - 0.62) / 0.38;
          this.beatT = 0.95 - 0.5 * k;
          sfx.heartbeat(k);
          this.beatPulse = 1;
        }
      } else this.beatT = 0;
      this.groanT -= dt;
      if (this.groanT <= 0) {
        this.groanT = rand(2.2, 5.5);
        if (this.zombies.length) sfx.groan();
      }
    } else this.danger *= Math.exp(-dt * 3);
    this.beatPulse = Math.max(0, this.beatPulse - dt * 2.5);

    this.lightningT -= dt;
    if (this.lightningT <= 0) {
      this.lightning = 1;
      this.lightningT = rand(14, 30);
      this.thunderT = rand(0.3, 0.9);
    }
    if (this.lightning > 0) this.lightning = Math.max(0, this.lightning - dt * 2.2);
    if (this.thunderT > 0) {
      this.thunderT -= dt;
      if (this.thunderT <= 0) {
        sfx.thunder();
        this.addTrauma(0.08);
      }
    }
    for (const e of this.embers) {
      e.y -= e.v * dt;
      e.ph += dt * 2;
      if (e.y < -0.05) {
        e.y = 1.05;
        e.x = Math.random();
      }
    }
    for (const f of this.fogs) f.x += f.v * dt;
  }

  private updateFx(dt: number) {
    for (let i = 0; i < this.nParts; ) {
      const p = this.parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.nParts--;
        this.parts[i] = this.parts[this.nParts];
        this.parts[this.nParts] = p;
        continue;
      }
      p.vy += p.grav * dt;
      if (p.drag > 0) {
        const d = Math.exp(-p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > p.floor) {
        p.y = p.floor;
        p.vy *= -0.3;
        p.vx *= 0.55;
        p.vr *= 0.5;
        if (Math.abs(p.vy) < 40) {
          p.vy = 0;
          p.grav = 0;
          p.vx *= 0.5;
        }
      }
      i++;
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life += dt;
      t.y += t.vy * dt;
      t.vy *= Math.exp(-dt * 2.5);
      if (t.life >= t.max) this.texts.splice(i, 1);
    }
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      this.tracers[i].life -= dt;
      if (this.tracers[i].life <= 0) this.tracers.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += dt;
      if (r.life >= r.dur) this.rings.splice(i, 1);
    }
    for (let i = this.decals.length - 1; i >= 0; i--) {
      this.decals[i].life -= dt;
      if (this.decals[i].life <= 0) this.decals.splice(i, 1);
    }
    for (let i = this.claws.length - 1; i >= 0; i--) {
      this.claws[i].life -= dt;
      if (this.claws[i].life <= 0) this.claws.splice(i, 1);
    }
    for (let i = this.letters.length - 1; i >= 0; i--) {
      const l = this.letters[i];
      l.life -= dt;
      l.vy += 500 * this.ui * dt;
      l.x += l.vx * dt;
      l.y += l.vy * dt;
      l.rot += l.vr * dt;
      if (l.life <= 0) this.letters.splice(i, 1);
    }
  }

  /* ================= gelombang & kemunculan ================= */

  private resetWorld() {
    this.zombies.length = 0;
    this.target = null;
    this.nParts = 0;
    this.texts.length = 0;
    this.tracers.length = 0;
    this.rings.length = 0;
    this.decals.length = 0;
    this.claws.length = 0;
    this.letters.length = 0;
    this.pendingKills.length = 0;
    this.blasts.length = 0;
    this.grenade = null;
    this.score = 0;
    this.displayScore = 0;
    this.lastMult = 1;
    this.lives = MAX_LIVES;
    this.kills = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correct = 0;
    this.wrong = 0;
    this.playTime = 0;
    this.grenades = 1;
    this.killsToGrenade = KILLS_PER_GRENADE;
    this.trauma = 0;
    this.flash = 0;
    this.dmgFlash = 0;
    this.hitstop = 0;
    this.slowmo = 0;
    this.overSent = false;
    this.overT = 0;
    this.firstSpawn = true;
    this.recent.length = 0;
    this.recentSet.clear();
    this.bannerT = 99;
    this.heartLost = 0;
    this.danger = 0;
    this.tutorial = 0;
    this.paused = false;
    this.lastHint = "?";
  }

  private nextWave() {
    this.wave++;
    const c = this.cfg;
    const w = this.wave - 1;
    this.travel = Math.max(c.minTravel, c.travel * Math.pow(0.94, w));
    this.interval = Math.max(c.minInterval, c.interval * Math.pow(0.9, w));
    this.maxAlive = Math.min(c.maxAliveCap, c.maxAlive + Math.floor(w / 1.5));
    const boss = this.wave % 5 === 0;
    this.toSpawn = c.baseCount + c.perWave * w;
    if (boss) this.toSpawn = Math.round(this.toSpawn * 0.5);
    this.spawned = 0;
    this.bossPending = boss;
    this.medkitPending = this.wave % 3 === 0 && this.lives < MAX_LIVES;
    this.spawnTimer = this.wave === 1 ? 0.35 : boss ? 1.6 : 1.1;
    this.wavePhase = "fight";
    this.waveDamage = false;
    this.showBanner(
      `GELOMBANG ${this.wave}`,
      boss ? "BOS DATANG: GENDERUWO!" : WAVE_SUBS[(this.wave - 1) % WAVE_SUBS.length],
      boss ? "#ff4a3a" : "#a3ff3c",
    );
    sfx.wave();
  }

  private clearWave() {
    this.wavePhase = "clear";
    this.waveTimer = 2.6;
    const perfect = !this.waveDamage;
    const bonus = Math.round(this.wave * 60 * this.cfg.scoreMul) * (perfect ? 2 : 1);
    this.addScore(bonus);
    this.popText(`GELOMBANG ${this.wave} BERES!`, this.W / 2, this.H * 0.42, "#a3ff3c", 34, "horror", 1.9, 0);
    this.popText(`${perfect ? "SEMPURNA! " : ""}+${bonus}`, this.W / 2, this.H * 0.42 + 38 * this.ui, perfect ? "#ffd23a" : "#ffffff", 20, "mono", 1.9, 0);
    sfx.waveClear();
  }

  private showBanner(text: string, sub: string, color: string) {
    this.bannerText = text;
    this.bannerSub = sub;
    this.bannerColor = color;
    this.bannerT = 0;
  }

  private hostiles(): number {
    let n = 0;
    for (const z of this.zombies) if (z.alive && z.kind !== "medkit") n++;
    return n;
  }

  private updateSpawner(dt: number) {
    if (this.mode === "demo") {
      this.demoSpawnT -= dt;
      if (this.demoSpawnT <= 0 && this.hostiles() < 4) {
        const r = Math.random();
        this.spawn(r < 0.5 ? "walker" : r < 0.68 ? "runner" : r < 0.84 ? "pocong" : r < 0.93 ? "bomber" : "tank");
        this.demoSpawnT = rand(1.0, 1.9);
      }
      return;
    }
    if (this.mode !== "play") return;
    if (this.wavePhase === "clear") {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) this.nextWave();
      return;
    }
    this.spawnTimer -= dt;
    const h = this.hostiles();
    if (this.spawnTimer <= 0) {
      if (this.bossPending) {
        this.spawn("boss");
        this.bossPending = false;
        this.spawnTimer = 2.5;
      } else if (this.spawned < this.toSpawn) {
        if (h < this.maxAlive) {
          this.spawn(this.pickKind());
          this.spawned++;
          this.spawnTimer = this.interval * rand(0.75, 1.2);
        } else this.spawnTimer = 0.3;
      }
    }
    if (this.medkitPending && this.spawned >= this.toSpawn * 0.5) {
      this.medkitPending = false;
      this.spawn("medkit");
    }
    if (!this.bossPending && this.spawned >= this.toSpawn && h === 0) this.clearWave();
  }

  private pickKind(): ZKind {
    const w = this.wave;
    const table: [ZKind, number][] = [["walker", 10]];
    if (w >= 2) table.push(["runner", 2 + Math.min(4, w * 0.5)]);
    if (w >= 3) table.push(["pocong", 2.6]);
    if (w >= 4) table.push(["bomber", 1.7]);
    if (w >= 6) table.push(["tank", 1.9]);
    let total = 0;
    for (const [, v] of table) total += v;
    let r = Math.random() * total;
    for (const [k, v] of table) {
      r -= v;
      if (r <= 0) return k;
    }
    return "walker";
  }

  private addRecent(w: string) {
    this.recent.push(w);
    this.recentSet.add(w);
    const cap = Math.min(40, Math.floor(this.pool.length / 3));
    while (this.recent.length > cap) this.recentSet.delete(this.recent.shift()!);
  }

  private pickWords(n: number, kind: ZKind): string[] {
    const used = new Set<string>();
    const onScreen = new Set<string>();
    for (const z of this.zombies) {
      if (!z.alive) continue;
      used.add(z.words[z.wi][z.prog] ?? "");
      for (const w of z.words) onScreen.add(w);
    }
    const pool = kind === "runner" ? this.poolShort : this.pool;
    const res: string[] = [];
    for (let i = 0; i < n; i++) {
      let pick = "";
      for (let tries = 0; tries < 70; tries++) {
        const w = pool[(Math.random() * pool.length) | 0];
        if (onScreen.has(w) || res.includes(w)) continue;
        if (this.recentSet.has(w) && tries < 55) continue;
        if (i === 0 && used.has(w[0]) && tries < 60) continue;
        pick = w;
        break;
      }
      if (!pick) pick = pool[(Math.random() * pool.length) | 0];
      res.push(pick);
      this.addRecent(pick);
    }
    return res;
  }

  private pickX(): number {
    let best = 0;
    let bestD = -1;
    for (let i = 0; i < 10; i++) {
      const x = rand(-0.8, 0.8);
      let d = 3;
      for (const z of this.zombies) if (z.alive && z.z < 0.5) d = Math.min(d, Math.abs(z.x - x) + z.z * 1.4);
      if (d > bestD) {
        bestD = d;
        best = x;
      }
    }
    return best;
  }

  private spawn(kind: ZKind) {
    const info = KIND[kind];
    const nWords = kind === "boss" ? (this.diff === "sulit" ? 4 : 5) : info.words;
    const words = this.pickWords(nWords, kind);
    const startZ = kind === "boss" ? 0.15 : this.mode === "play" && this.firstSpawn ? 0.12 : 0;
    this.firstSpawn = false;
    const z: Zombie = {
      id: ++this.idc,
      kind,
      x: kind === "boss" ? 0 : this.pickX(),
      z: startZ,
      speed: (info.speed / this.travel) * rand(0.94, 1.06),
      words,
      wi: 0,
      prog: 0,
      hit: 0,
      knock: 0,
      wobble: 0,
      phase: rand(0, TAU),
      rate: info.rate * rand(0.9, 1.1),
      spawnT: 0,
      alive: true,
      armor: kind === "tank",
      pal: S.randomPal(kind),
      size: info.size,
      seed: Math.random(),
      fur: kind === "boss" ? S.makeFur() : null,
      sx: 0, sy: 0, ss: 0, pp: 0, top: 0,
      labelOff: 0, lx: 0, ly: 0, lby: 0, lty: 0, lw: 0, lh: 0, lfs: 0, lpad: 0,
    };
    this.zombies.push(z);
    if (kind === "boss") {
      sfx.bossRoar();
      this.addTrauma(0.55);
      this.flash = 0.25;
      this.flashColor = "255,40,30";
    }
  }

  /* ================= pertempuran ================= */

  private project(z: Zombie) {
    const t = clamp(z.z, 0, 1.05);
    const p = t * (0.55 + 0.45 * t);
    const s = 0.36 + 0.64 * p;
    z.pp = p;
    z.ss = s * z.size;
    z.sy = this.spawnY + (this.groundY - this.spawnY) * p;
    z.sx = this.W * 0.5 + z.x * this.W * 0.4 * (0.36 + 0.64 * p);
    z.top = z.sy - KIND[z.kind].height * ((this.zH * z.ss) / 100);
  }

  private processChar(ch: string): boolean {
    let t = this.target;
    if (t && !t.alive) t = this.target = null;
    if (!t) {
      let best: Zombie | null = null;
      for (const z of this.zombies) {
        if (!z.alive || z.spawnT < 0.12) continue;
        if (z.words[z.wi][z.prog] !== ch) continue;
        if (!best || z.z > best.z) best = z;
      }
      if (!best) {
        this.typo(null);
        return false;
      }
      this.target = best;
      this.lockT = 0;
      t = best;
      sfx.lock();
    }
    const word = t.words[t.wi];
    if (word[t.prog] === ch) {
      t.prog++;
      this.correct++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      this.checkTier();
      this.shoot(t);
      if (t.prog >= word.length) this.completeWord(t);
      this.emitHint();
      return true;
    }
    this.typo(t);
    return false;
  }

  private checkTier() {
    const m = multFor(this.streak);
    if (m > this.lastMult && this.mode === "play") {
      this.popText(`COMBO x${m}!`, this.W / 2, this.barTop - 92 * this.ui, TIER_COLORS[m - 1], 30, "horror", 1.1, -12);
      sfx.combo(m);
      this.addTrauma(0.12);
      this.multPop = 1;
    }
    this.lastMult = m;
  }

  private typo(t: Zombie | null) {
    this.wrong++;
    if (this.lastMult > 1 && this.mode === "play") {
      this.popText("COMBO PUTUS", this.W / 2, this.barTop - 92 * this.ui, "#ff5a4a", 26, "horror", 0.9, -12);
    }
    this.streak = 0;
    this.lastMult = 1;
    if (t) t.wobble = 0.3;
    this.typoFlash = 0.2;
    this.addTrauma(0.1);
    sfx.typo();
    this.vibrate(18);
  }

  private shoot(t: Zombie) {
    this.project(t);
    const u = (this.zH * t.ss) / 100;
    const h = t.sy - t.top;
    const tx = t.sx + rand(-4, 4) * u;
    const ty = t.sy - h * 0.58 + rand(-6, 6) * u;
    const ang = clamp(Math.atan2(ty - this.pivotY, tx - this.pivotX), -Math.PI + 0.25, -0.25);
    this.gunAngle = ang;
    const L = this.gunLen * 1.07;
    const mx = this.pivotX + Math.cos(ang) * L;
    const my = this.pivotY + Math.sin(ang) * L;
    this.tracers.push({ x1: mx, y1: my, x2: tx, y2: ty, life: 0.08 });
    this.recoil = 1;
    this.muzzle = 0.055;
    this.flashRot = Math.random() * TAU;

    for (let i = 0; i < 7; i++) {
      const a = ang + Math.PI + rand(-1.1, 1.1);
      const sp = rand(1.5, 4.5) * h;
      this.spawnP(P_SPARK, tx, ty, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.1, 0.22), rand(1.2, 2.4) * this.ui, i % 2 ? "#ffe9a8" : "#ffb347", 0, 3);
    }
    const bone = t.kind === "pocong";
    for (let i = 0; i < 5; i++) {
      const a = ang + rand(-0.7, 0.7);
      const sp = rand(0.8, 2.4) * h;
      this.spawnGoo(tx, ty, Math.cos(a) * sp, Math.sin(a) * sp - h * 0.6, rand(3, 7) * u, t.sy + rand(-2, 4) * u, h * 6, bone);
    }
    this.spawnP(P_GLOW, tx, ty, 0, 0, 0.09, h * 0.5 + 20 * this.ui, "", 0, 0, 1e9, this.glowYellow);
    const ex = this.pivotX + Math.cos(ang) * this.gunLen * 0.45;
    const ey = this.pivotY + Math.sin(ang) * this.gunLen * 0.45;
    const perp = ang + Math.PI / 2;
    const sh = this.spawnP(P_SHELL, ex, ey, Math.cos(perp) * rand(150, 260) * this.ui, -rand(260, 380) * this.ui, 0.9, 7 * this.ui, "#d9a93a", 1500 * this.ui, 0);
    if (sh) sh.vr = rand(-20, 20);

    if (t.lfs > 0) {
      const word = t.words[t.wi];
      const cw = t.lfs * this.charRatio;
      this.letters.push({
        ch: word[t.prog - 1],
        x: t.lx + t.lpad + (t.prog - 0.5) * cw,
        y: t.ly + t.lh / 2,
        vx: rand(-70, 70) * this.ui,
        vy: -rand(140, 220) * this.ui,
        rot: 0,
        vr: rand(-7, 7),
        life: 0.55,
        size: t.lfs,
      });
    }
    t.hit = 0.075;
    t.knock = 1;
    t.z = Math.max(0, t.z - (t.kind === "boss" ? 0.004 : 0.012));
    this.addTrauma(0.06);
    sfx.shoot();
    this.vibrate(6);
  }

  private completeWord(t: Zombie) {
    const word = t.words[t.wi];
    const info = KIND[t.kind];
    if (t.wi < t.words.length - 1) {
      t.wi++;
      t.prog = 0;
      const m = multFor(this.streak);
      const pts = Math.round(word.length * 10 * info.score * this.cfg.scoreMul * m);
      this.project(t);
      const u = (this.zH * t.ss) / 100;
      const cy = t.sy - (t.sy - t.top) * 0.6;
      if (this.mode === "play") {
        this.addScore(pts);
        this.popText(`+${pts}`, t.sx + (t.sy - t.top) * 0.42, cy, TIER_COLORS[m - 1], 22, "mono", 0.8, -60);
      }
      if (t.kind === "tank" && t.armor) {
        t.armor = false;
        sfx.armor();
        for (let i = 0; i < 7; i++) {
          const p = this.spawnP(P_DEBRIS, t.sx + rand(-10, 10) * u, cy + rand(-30, 5) * u, rand(-2, 2) * 100 * u, -rand(2, 3.5) * 100 * u, rand(0.9, 1.4), rand(6, 11) * u, i < 2 ? "#3f4a33" : "#2c3524", 800 * u, 0, t.sy + rand(0, 4) * u);
          if (p) p.vr = rand(-12, 12);
        }
        for (let i = 0; i < 12; i++) {
          const a = rand(0, TAU);
          const sp = rand(150, 400) * this.ui;
          this.spawnP(P_SPARK, t.sx, cy - 25 * u, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.15, 0.3), 2 * this.ui, "#e8f0ff", 0, 3);
        }
        this.popText("ZIRAH HANCUR!", t.sx, cy + 12 * u, "#d6de7a", 20, "ui", 0.9, -30);
        t.z = Math.max(0, t.z - 0.06);
        this.addTrauma(0.22);
      } else if (t.kind === "boss") {
        sfx.bossHit();
        this.addTrauma(0.45);
        this.hitstop = Math.max(this.hitstop, 0.07);
        t.z = Math.max(0, t.z - 0.05);
        this.gore(t, 0.45);
      }
      t.hit = 0.14;
      return;
    }
    this.killZombie(t, "shot");
  }

  private damageBoss(z: Zombie, cause: KillCause) {
    if (z.wi < z.words.length - 1) {
      z.wi++;
      z.prog = 0;
      z.hit = 0.2;
      z.z = Math.max(0, z.z - 0.08);
      this.gore(z, 0.5);
      sfx.bossHit();
      this.emitHint();
    } else this.killZombie(z, cause);
  }

  private killZombie(z: Zombie, cause: KillCause) {
    if (!z.alive) return;
    z.alive = false;
    this.dead = true;
    if (this.target === z) this.target = null;
    this.project(z);
    const info = KIND[z.kind];
    const u = (this.zH * z.ss) / 100;
    const cy = z.sy - (z.sy - z.top) * 0.55;

    if (z.kind === "medkit") {
      this.collectMedkit(z, cy);
      this.emitHint();
      return;
    }
    this.gore(z, 1);
    const boss = z.kind === "boss";
    this.addTrauma(boss ? 0.95 : cause === "shot" ? 0.22 : 0.12);
    this.hitstop = Math.max(this.hitstop, boss ? 0.2 : 0.045);
    sfx.splat(boss ? 2 : 1);
    this.vibrate(boss ? [60, 30, 120] : 14);

    if (this.mode === "play") {
      this.kills++;
      const m = cause === "shot" ? multFor(this.streak) : 1;
      const word = z.words[z.words.length - 1];
      let pts = word.length * 10 * info.score * this.cfg.scoreMul * m;
      if (boss) pts += 500 * this.cfg.scoreMul;
      const close = cause === "shot" && z.z > 0.86;
      if (close) pts += 50;
      pts = Math.round(pts);
      this.addScore(pts);
      this.popText(`+${pts}`, z.sx, cy - 34 * u, TIER_COLORS[m - 1], boss ? 34 : 24, "mono", 0.9, -90);
      if (close) this.popText("NYARIS!", z.sx, cy - 64 * u, "#ff6b3a", 24, "horror", 0.9, -60);
      if (boss) {
        this.showBanner("GENDERUWO TUMBANG!", `+${pts}`, "#ffd23a");
        this.flash = 0.6;
        this.flashColor = "255,255,255";
      }
      this.killsToGrenade--;
      if (this.killsToGrenade <= 0) {
        this.killsToGrenade = KILLS_PER_GRENADE;
        if (this.grenades < MAX_GRENADES) {
          this.grenades++;
          this.ev.onGrenades(this.grenades);
          this.popText("+1 GRANAT", this.W * 0.2, this.barTop - 30 * this.ui, "#ffb020", 22, "ui", 1.3, -40);
        }
      }
      if (this.tutorial > 1) this.tutorial = 1;
    }
    if (z.kind === "bomber") this.blasts.push({ x: z.sx, y: cy, wx: z.x, wz: z.z, t: 0.08 });
    this.emitHint();
  }

  private collectMedkit(z: Zombie, cy: number) {
    const u = (this.zH * z.ss) / 100;
    if (this.mode === "play") {
      if (this.lives < MAX_LIVES) {
        this.lives++;
        this.popText("+1 NYAWA", z.sx, cy - 30 * u, "#6dff8a", 26, "ui", 1.2, -60);
      } else {
        this.addScore(250);
        this.popText("+250", z.sx, cy - 30 * u, "#6dff8a", 26, "mono", 1.2, -60);
      }
    }
    sfx.pickup();
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU);
      const sp = rand(60, 260) * this.ui;
      this.spawnP(P_GLOW, z.sx, cy, Math.cos(a) * sp, Math.sin(a) * sp - 60 * this.ui, rand(0.4, 0.8), rand(14, 26) * this.ui, "", 0, 2, 1e9, this.glowGreen);
    }
    this.rings.push({ x: z.sx, y: cy, r: 10, max: 120 * this.ui, life: 0, dur: 0.45, color: "rgba(120,255,150,", w: 5 * this.ui });
  }

  private reachBarricade(z: Zombie) {
    z.alive = false;
    this.dead = true;
    if (this.target === z) this.target = null;
    this.project(z);
    if (z.kind === "medkit" || this.mode !== "play") {
      for (let i = 0; i < 4; i++) {
        this.spawnP(P_SMOKE, z.sx + rand(-20, 20) * this.ui, z.sy - rand(10, 60) * this.ui, rand(-20, 20), -rand(20, 50), rand(0.5, 0.9), rand(40, 70) * this.ui, "", 0, 1.5, 1e9, this.smokeSprite);
      }
      this.emitHint();
      return;
    }
    const dmg = z.kind === "boss" ? 2 : 1;
    this.lives = Math.max(0, this.lives - dmg);
    this.heartLost = 1;
    this.waveDamage = true;
    if (this.lastMult > 1) this.popText("COMBO PUTUS", this.W / 2, this.barTop - 92 * this.ui, "#ff5a4a", 26, "horror", 0.9, -12);
    this.streak = 0;
    this.lastMult = 1;
    this.addTrauma(0.8);
    this.dmgFlash = 1;
    this.barShake = 1;
    this.claws.push({ x: clamp(z.sx, this.W * 0.25, this.W * 0.75), y: this.H * 0.5, life: 0.6, rot: rand(-0.25, 0.25), s: Math.min(this.W, this.H) * 0.45 });
    this.gore(z, 0.7);
    sfx.hurt();
    this.vibrate([70, 40, 110]);
    if (this.lives <= 0) this.gameOver();
    this.emitHint();
  }

  private gameOver() {
    this.mode = "over";
    this.slowmo = 1.3;
    this.overT = 1.6;
    this.target = null;
    this.pendingKills.length = 0;
    this.grenade = null;
    sfx.gameOver();
    this.showBanner("TAMAT!", "Barikade jebol…", "#ff3b3b");
    this.emitHint();
  }

  private detonate(b: Blast) {
    this.explosionFx(b.x, b.y, this.zH * 0.7, 1);
    sfx.explode(1);
    this.addTrauma(0.5);
    this.flash = Math.max(this.flash, 0.35);
    this.flashColor = "255,200,140";
    this.hitstop = Math.max(this.hitstop, 0.07);
    this.vibrate([30, 20, 60]);
    let n = 0;
    for (const z of this.zombies) {
      if (!z.alive) continue;
      const dx = (z.x - b.wx) / 0.55;
      const dz = (z.z - b.wz) / 0.28;
      if (dx * dx + dz * dz <= 1) {
        n++;
        this.pendingKills.push({ z, t: 0.05 + Math.random() * 0.1, cause: "bomb" });
      }
    }
    if (n > 0 && this.mode === "play") this.popText(`BOOM x${n}!`, b.x, b.y - 50 * this.ui, "#ff9a2e", 34, "horror", 1.1, -50);
  }

  private grenadeBoom(x: number, y: number) {
    this.explosionFx(x, y, this.zH * 1.2, 1.6);
    this.flash = 0.95;
    this.flashColor = "255,240,210";
    this.addTrauma(1);
    this.hitstop = Math.max(this.hitstop, 0.12);
    sfx.explode(1.7);
    this.vibrate([40, 30, 140]);
    let n = 0;
    const span = Math.max(this.W, this.H);
    for (const z of this.zombies) {
      if (!z.alive) continue;
      this.project(z);
      const d = Math.hypot(z.sx - x, z.sy - y);
      this.pendingKills.push({ z, t: 0.04 + (d / span) * 0.35, cause: "grenade" });
      if (z.kind !== "medkit") n++;
    }
    if (n >= 2) this.popText(`LEDAKAN x${n}!`, x, y - 40 * this.ui, "#ffb020", 38, "horror", 1.2, -40);
  }

  private addScore(n: number) {
    this.score += n;
    this.scorePop = 1;
  }

  private addTrauma(n: number) {
    this.trauma = Math.min(1, this.trauma + n);
  }

  private vibrate(p: number | number[]) {
    if (!this.isTouch || this.mode !== "play") return;
    try {
      navigator.vibrate?.(p);
    } catch {
      /* tidak didukung */
    }
  }

  private emitHint() {
    const t = this.target;
    const h = this.mode === "play" && t && t.alive ? (t.words[t.wi][t.prog] ?? null) : null;
    if (h !== this.lastHint) {
      this.lastHint = h;
      this.ev.onHint(h);
    }
  }

  private stats(): GameStats {
    const minutes = Math.max(this.playTime, 1) / 60;
    return {
      score: this.score,
      wave: this.wave,
      kills: this.kills,
      wpm: Math.round(this.correct / 5 / minutes),
      accuracy: this.correct + this.wrong > 0 ? this.correct / (this.correct + this.wrong) : 0,
      maxCombo: this.maxStreak,
      difficulty: this.diff,
      duration: this.playTime,
    };
  }

  private updateBot(dt: number) {
    if (this.mode !== "demo") return;
    this.botT -= dt;
    if (this.botT > 0) return;
    let t = this.target;
    if (!t || !t.alive) {
      t = null;
      for (const z of this.zombies) if (z.alive && z.spawnT > 0.8 && z.z > 0.2 && (!t || z.z > t.z)) t = z;
      if (!t) {
        this.botT = 0.2;
        return;
      }
    }
    this.processChar(t.words[t.wi][t.prog]);
    this.botT = this.target ? rand(0.08, 0.16) : rand(0.45, 0.85);
  }

  /* ================= partikel ================= */

  private spawnP(
    kind: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    color: string,
    grav = 0,
    drag = 0,
    floor = 1e9,
    sprite: HTMLCanvasElement | null = null,
  ): Particle | null {
    if (this.nParts >= MAX_P) return null;
    const p = this.parts[this.nParts++];
    p.kind = kind;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.max = life;
    p.size = size;
    p.color = color;
    p.grav = grav;
    p.drag = drag;
    p.floor = floor;
    p.sprite = sprite;
    p.rot = Math.random() * TAU;
    p.vr = 0;
    p.shape = 0;
    return p;
  }

  private spawnGoo(x: number, y: number, vx: number, vy: number, size: number, floor: number, grav: number, bone: boolean) {
    const r = Math.random();
    const sprite = bone ? (r < 0.5 ? this.dotBone : this.dotGreen) : r < 0.62 ? this.dotGreen : r < 0.85 ? this.dotDark : this.dotRed;
    this.spawnP(P_GOO, x, y, vx, vy, rand(0.7, 1.3), Math.max(2, size), "", grav, 0.6, floor, sprite);
  }

  private gore(z: Zombie, power: number) {
    const u = (this.zH * z.ss) / 100;
    const h = z.sy - z.top;
    const cx = z.sx;
    const cy = z.sy - h * 0.55;
    const floor = z.sy;
    const boss = z.kind === "boss";
    const bone = z.kind === "pocong";
    const n = Math.round((boss ? 50 : 24) * power);
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU);
      const sp = rand(0.6, 3.4) * h;
      this.spawnGoo(cx + rand(-0.15, 0.15) * h, cy + rand(-0.25, 0.25) * h, Math.cos(a) * sp, Math.sin(a) * sp - h * 1.3, rand(3, 9) * u * (boss ? 1.2 : 1), floor + rand(-2, 5) * u, h * 7, bone);
    }
    const colors =
      z.kind === "pocong"
        ? ["#e8e3d3", "#bdb6a2", "#7b8876"]
        : z.kind === "runner"
          ? ["#8a9c90", "#627368", "#d9d2c0"]
          : boss
            ? ["#2e2019", "#4a3428", "#1b130f"]
            : [z.pal.skin, z.pal.shirt, z.pal.pants, z.pal.skinDark];
    const ng = Math.round((boss ? 18 : 8) * power);
    for (let i = 0; i < ng; i++) {
      const p = this.spawnP(P_GIB, cx + rand(-0.2, 0.2) * h, cy + rand(-0.3, 0.3) * h, rand(-1.8, 1.8) * h, -rand(1.6, 3.4) * h, rand(1.2, 2), rand(6, 13) * u, colors[i % colors.length], 7 * h, 0.2, floor + rand(-3, 6) * u);
      if (p) {
        p.vr = rand(-14, 14);
        p.shape = i === 0 ? 1 : 0;
      }
    }
    for (let i = 0; i < 3 * power; i++) {
      this.spawnP(P_SMOKE, cx + rand(-10, 10) * u, cy + rand(-10, 10) * u, rand(-20, 20) * u, -rand(20, 45) * u, rand(0.5, 0.9), rand(28, 45) * u, "", 0, 1.5, 1e9, this.smokeSprite);
    }
    this.spawnP(P_GLOW, cx, cy, 0, 0, 0.2, h * 1.6, "", 0, 0, 1e9, this.glowGreen);
    this.rings.push({ x: cx, y: cy, r: h * 0.1, max: h * 0.9, life: 0, dur: 0.35, color: "rgba(190,255,120,", w: 4 * this.ui });
    if (this.decals.length > 40) this.decals.shift();
    this.decals.push({ x: z.sx, y: z.sy, r: 34 * u * (boss ? 1.4 : 1), life: 8, img: this.splats[(Math.random() * this.splats.length) | 0], rot: rand(0, TAU) });
  }

  private explosionFx(x: number, y: number, R: number, power: number) {
    this.spawnP(P_GLOW, x, y, 0, 0, 0.35, R * 3.2, "", 0, 0, 1e9, this.glowOrange);
    this.spawnP(P_GLOW, x, y, 0, 0, 0.18, R * 1.6, "", 0, 0, 1e9, this.glowYellow);
    const sparkCols = ["#ffe08a", "#ff9a2e", "#ff5a2a"];
    for (let i = 0; i < 28 * power; i++) {
      const a = rand(0, TAU);
      const sp = rand(1.5, 6) * R;
      this.spawnP(P_SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.2, 0.5), rand(1.5, 3.2) * this.ui, sparkCols[i % 3], R * 2, 2.2);
    }
    for (let i = 0; i < 10 * power; i++) {
      this.spawnP(P_SMOKE, x + rand(-0.3, 0.3) * R, y + rand(-0.3, 0.3) * R, rand(-0.6, 0.6) * R, -rand(0.3, 1) * R, rand(0.8, 1.5), rand(0.6, 1.1) * R, "", 0, 1.2, 1e9, this.smokeSprite);
    }
    const debrisCols = ["#2a2522", "#3b322b", "#1c1917"];
    for (let i = 0; i < 10 * power; i++) {
      const p = this.spawnP(P_DEBRIS, x, y, rand(-2.5, 2.5) * R, -rand(1.5, 3.5) * R, rand(0.9, 1.5), rand(3, 7) * this.ui, debrisCols[i % 3], 6 * R, 0, y + R * 0.6 + rand(0, R * 0.3));
      if (p) p.vr = rand(-15, 15);
    }
    this.rings.push({ x, y, r: R * 0.2, max: R * 2.2, life: 0, dur: 0.45, color: "rgba(255,230,180,", w: 6 * this.ui });
    this.rings.push({ x, y, r: R * 0.1, max: R * 1.4, life: 0, dur: 0.3, color: "rgba(255,160,60,", w: 10 * this.ui });
    if (this.decals.length > 40) this.decals.shift();
    this.decals.push({ x, y: y + R * 0.5, r: R * 0.9, life: 8, img: this.scorch, rot: rand(0, TAU) });
  }

  /* ================= render ================= */

  private render(dt: number) {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;
    const ui = this.ui;
    const pad = this.pad;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    const sh = this.trauma * this.trauma;
    const ox = sh * 18 * ui * (Math.sin(this.rt * 57.3) * 0.6 + Math.sin(this.rt * 23.1) * 0.4);
    const oy = sh * 18 * ui * (Math.cos(this.rt * 49.7) * 0.6 + Math.sin(this.rt * 31.9) * 0.4);
    const rot = sh * 0.035 * Math.sin(this.rt * 37.1);
    ctx.save();
    ctx.translate(W / 2 + ox, H / 2 + oy);
    ctx.rotate(rot);
    ctx.translate(-W / 2, -H / 2);

    if (this.bgCache) ctx.drawImage(this.bgCache, -pad, -pad, W + pad * 2, H + pad * 2);
    else {
      ctx.fillStyle = "#07100f";
      ctx.fillRect(-pad, -pad, W + pad * 2, H + pad * 2);
    }
    if (this.lightning > 0) {
      const a = this.lightning * (0.55 + 0.45 * Math.sin(this.rt * 70)) * 0.28;
      ctx.fillStyle = `rgba(190,215,255,${a.toFixed(3)})`;
      ctx.fillRect(-pad, -pad, W + pad * 2, H + pad * 2);
    }

    // noda di tanah
    for (const d of this.decals) {
      ctx.globalAlpha = Math.min(1, d.life / 2) * 0.85;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.scale(1, 0.36);
      ctx.rotate(d.rot);
      ctx.drawImage(d.img, -d.r, -d.r, d.r * 2, d.r * 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // zombi
    for (const z of this.zombies) this.project(z);
    this.zombies.sort(byZ);
    for (const z of this.zombies) if (z.alive) this.drawZombie(z);

    // kabut
    for (const f of this.fogs) {
      const x = ((((f.x % 1.4) + 1.4) % 1.4) - 0.2) * W;
      const y = this.horizonY + (this.spawnY - this.horizonY) * 0.8 + f.y * H * 0.08;
      const w = f.w * W * 0.6 + 220 * ui;
      const h = w * 0.3;
      ctx.globalAlpha = f.a;
      ctx.drawImage(this.fogSprite, x - w / 2, y - h / 2, w, h);
    }
    ctx.globalAlpha = 1;

    // barikade
    if (this.barCache) {
      const by = this.barTop - 16 * ui + Math.sin(this.rt * 60) * this.barShake * 5 * ui;
      ctx.drawImage(this.barCache, -pad, by, W + pad * 2, this.barCacheH);
    }

    this.drawParticles();

    // pelacak peluru
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const t of this.tracers) {
      const a = t.life / 0.08;
      ctx.strokeStyle = `rgba(255,228,160,${a.toFixed(3)})`;
      ctx.lineWidth = 3.4 * ui * a + 0.5;
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";

    // granat terbang
    if (this.grenade) {
      const g = this.grenade;
      const k = Math.min(1, g.t / g.dur);
      const gx = g.x0 + (g.x1 - g.x0) * k;
      const gy = g.y0 + (g.y1 - g.y0) * k - Math.sin(k * Math.PI) * H * 0.28;
      const s = (14 - k * 6) * ui;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(this.rt * 14);
      ctx.fillStyle = "#3b4a2a";
      ctx.beginPath();
      S.ell(ctx, 0, 0, s * 0.75, s);
      ctx.fill();
      ctx.fillStyle = "#9aa0a6";
      ctx.fillRect(-s * 0.3, -s * 1.25, s * 0.6, s * 0.35);
      ctx.restore();
    }

    // senjata
    S.drawGun(ctx, this.pivotX, this.pivotY, this.gunAngle, this.gunLen, this.recoil, this.muzzle > 0 ? 1 : 0, this.flashRot, this.glowOrange, this.glowYellow);

    // laser & bidikan
    const tg = this.target;
    if (tg && tg.alive) {
      const h = tg.sy - tg.top;
      const cx = tg.sx;
      const cy = tg.sy - h * 0.58;
      const L = this.gunLen * 1.07;
      const mx = this.pivotX + Math.cos(this.gunAngle) * L;
      const my = this.pivotY + Math.sin(this.gunAngle) * L;
      ctx.strokeStyle = "rgba(255,45,35,0.4)";
      ctx.lineWidth = 1.6 * ui;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      const ds = 18 * ui;
      ctx.drawImage(this.glowRed, cx - ds / 2, cy - ds / 2, ds, ds);
      ctx.globalCompositeOperation = "source-over";
      const k = Math.min(1, this.lockT / 0.15);
      const sc = 1.7 - 0.7 * (1 - Math.pow(1 - k, 3));
      const hw = Math.max(h * 0.34, 16 * ui) * sc;
      const hh = h * 0.6 * sc;
      const L2 = Math.min(hw, hh) * 0.42;
      const midY = tg.sy - h * 0.5;
      ctx.strokeStyle = `rgba(255,75,58,${(0.95 * k).toFixed(3)})`;
      ctx.lineWidth = 2.6 * ui;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const sx = i % 2 === 0 ? -1 : 1;
        const sy = i < 2 ? -1 : 1;
        const x0 = cx + sx * hw;
        const y0 = midY + sy * hh;
        ctx.moveTo(x0 - sx * L2, y0);
        ctx.lineTo(x0, y0);
        ctx.lineTo(x0, y0 - sy * L2);
      }
      ctx.stroke();
    }

    // label kata
    this.layoutLabels(dt);
    for (let i = this.labelOrder.length - 1; i >= 0; i--) this.drawLabel(this.labelOrder[i]);

    // huruf beterbangan
    if (this.letters.length) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const l of this.letters) {
        ctx.globalAlpha = Math.max(0, l.life / 0.55);
        ctx.font = `800 ${Math.round(l.size)}px ${MONO}`;
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.fillStyle = "#b6ff6a";
        ctx.fillText(l.ch, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    // teks mengambang
    this.drawTexts();
    ctx.restore();

    // lapisan layar
    ctx.drawImage(this.vignette, 0, 0, W, H);
    let redA = this.dmgFlash * 0.85;
    if (this.mode === "play" && this.danger > 0.7) redA = Math.max(redA, ((this.danger - 0.7) / 0.3) * (0.22 + 0.33 * this.beatPulse));
    redA = Math.max(redA, this.typoFlash * 1.2);
    if (redA > 0.01) {
      ctx.globalAlpha = Math.min(1, redA);
      ctx.drawImage(this.redVig, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    for (const c of this.claws) {
      const k = c.life / 0.6;
      const grow = Math.min(1, (1 - k) / 0.15);
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.lineCap = "round";
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = pass === 0 ? `rgba(120,0,0,${(0.85 * k).toFixed(3)})` : `rgba(255,70,55,${(0.7 * k).toFixed(3)})`;
        ctx.lineWidth = (pass === 0 ? 11 : 4) * ui;
        ctx.beginPath();
        for (let i = -1; i <= 1; i++) {
          const x0 = i * c.s * 0.17 - c.s * 0.22;
          const y0 = -c.s * 0.5;
          ctx.moveTo(x0, y0);
          ctx.lineTo(x0 + c.s * 0.44 * grow, y0 + c.s * grow);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(${this.flashColor},${(Math.min(1, this.flash) * 0.6).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (this.mode !== "demo") this.drawHud();
    this.drawBanner();
    if (this.mode === "play" && this.tutorial > 0) this.drawTutorial();
  }

  private drawZombie(z: Zombie) {
    const ctx = this.ctx;
    const u = (this.zH * z.ss) / 100;
    const flash = z.hit > 0;
    ctx.save();
    ctx.translate(z.sx, z.sy);
    if (z.spawnT < 0.45) ctx.globalAlpha = z.spawnT / 0.45;
    if (z.knock > 0.02) {
      ctx.translate(0, -z.knock * 2.5 * u);
      ctx.rotate(z.knock * 0.07 * (z.seed > 0.5 ? 1 : -1));
    }
    switch (z.kind) {
      case "walker":
      case "bomber":
      case "tank": {
        const o = this.hopts;
        o.flash = flash;
        o.kind = z.kind;
        o.armor = z.armor;
        o.seed = z.seed;
        o.time = this.time;
        S.drawHumanoid(ctx, u, z.phase, flash ? S.FLASH_PAL : z.pal, o);
        break;
      }
      case "runner":
        S.drawTuyul(ctx, u, z.phase, flash, this.glowRed);
        break;
      case "pocong":
        S.drawPocong(ctx, u, z.phase, flash, this.glowRed);
        break;
      case "boss":
        S.drawBoss(ctx, u, z.phase, flash, z.fur ?? [], this.glowRed);
        break;
      case "medkit":
        S.drawMedkit(ctx, u, z.phase, flash, this.glowGreen);
        break;
    }
    ctx.restore();
  }

  private drawParticles() {
    const ctx = this.ctx;
    for (let i = 0; i < this.nParts; i++) {
      const p = this.parts[i];
      if (p.kind === P_SPARK || p.kind === P_GLOW) continue;
      const a = Math.min(1, p.life / (p.max * 0.4));
      ctx.globalAlpha = a;
      if (p.kind === P_GOO) {
        const s = p.size;
        ctx.drawImage(p.sprite!, p.x - s / 2, p.y - s / 2, s, s);
      } else if (p.kind === P_SMOKE) {
        const s = p.size * (1 + (1 - p.life / p.max) * 1.4);
        ctx.globalAlpha = a * 0.55;
        ctx.drawImage(p.sprite!, p.x - s / 2, p.y - s / 2, s, s);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        const s = p.size;
        if (p.kind === P_SHELL) {
          ctx.fillRect(-s * 0.25, -s * 0.5, s * 0.5, s);
          ctx.fillStyle = "#8a6420";
          ctx.fillRect(-s * 0.25, s * 0.3, s * 0.5, s * 0.2);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.55, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "rgba(90,15,15,0.9)";
          ctx.beginPath();
          ctx.arc(s * 0.15, s * 0.1, s * 0.22, 0, TAU);
          ctx.fill();
        } else {
          ctx.fillRect(-s / 2, -s * 0.3, s, s * 0.6);
          if (p.kind === P_GIB) {
            ctx.fillStyle = "rgba(110,18,18,0.9)";
            ctx.fillRect(-s / 2, -s * 0.3, s * 0.32, s * 0.6);
          }
        }
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = 0; i < this.nParts; i++) {
      const p = this.parts[i];
      if (p.kind !== P_SPARK && p.kind !== P_GLOW) continue;
      const a = Math.min(1, p.life / (p.max * 0.6));
      ctx.globalAlpha = a;
      if (p.kind === P_SPARK) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
        ctx.stroke();
      } else {
        const s = p.size * (0.7 + 0.3 * (p.life / p.max));
        ctx.drawImage(p.sprite!, p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    // gelombang kejut
    for (const r of this.rings) {
      const k = r.life / r.dur;
      const rad = r.r + (r.max - r.r) * (1 - Math.pow(1 - k, 3));
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `${r.color}${(1 - k).toFixed(3)})`;
      ctx.lineWidth = r.w * (1 - k) + 0.5;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, rad, rad * 0.55, 0, 0, TAU);
      ctx.stroke();
    }
    // bara api melayang
    const W = this.W;
    const H = this.H;
    for (const e of this.embers) {
      const x = e.x * W + Math.sin(e.ph) * 12 * this.ui;
      const y = e.y * H;
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(e.ph * 2.3);
      const s = e.s * 4 * this.ui;
      ctx.drawImage(this.glowOrange, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  private layoutLabels(dt: number) {
    const list = this.labelOrder;
    list.length = 0;
    const ui = this.ui;
    const minY = this.mode === "demo" ? 6 : 66 * ui;
    for (const z of this.zombies) {
      if (!z.alive || z.spawnT < 0.05) continue;
      const word = z.words[z.wi];
      const isT = z === this.target;
      const fs = Math.round(this.fontBase * (0.8 + 0.2 * z.pp) * (isT ? 1.12 : 1));
      const cw = fs * this.charRatio;
      const icon = z.kind === "bomber" || z.kind === "medkit" ? fs * 0.95 : 0;
      const padX = fs * 0.42;
      z.lfs = fs;
      z.lpad = padX + icon;
      z.lw = cw * word.length + padX * 2 + icon;
      z.lh = Math.round(fs * 1.45);
      z.lx = clamp(z.sx - z.lw / 2, 4, this.W - z.lw - 4);
      z.lby = z.top - z.lh - 7 * ui;
      list.push(z);
    }
    const tg = this.target;
    list.sort((a, b) => (a === tg ? -1 : b === tg ? 1 : b.z - a.z));
    for (let i = 0; i < list.length; i++) {
      const z = list[i];
      let y = z.lby;
      for (let iter = 0; iter < 10; iter++) {
        let moved = false;
        for (let j = 0; j < i; j++) {
          const o = list[j];
          if (z.lx < o.lx + o.lw + 3 && z.lx + z.lw + 3 > o.lx && y < o.lty + o.lh + 3 && y + z.lh + 3 > o.lty) {
            const up = o.lty - z.lh - 4;
            y = up >= minY ? up : o.lty + o.lh + 4;
            moved = true;
          }
        }
        if (!moved) break;
      }
      if (y < minY) y = minY;
      z.lty = y;
      const off = y - z.lby;
      if (dt > 0) z.labelOff += (off - z.labelOff) * Math.min(1, dt * 14);
      if (z.spawnT < 0.1) z.labelOff = off;
      z.ly = z.lby + z.labelOff;
    }
  }

  private drawLabel(z: Zombie) {
    const ctx = this.ctx;
    const ui = this.ui;
    const word = z.words[z.wi];
    const isT = z === this.target;
    const fs = z.lfs;
    const cw = fs * this.charRatio;
    const wob = z.wobble > 0 ? Math.sin(z.wobble * 70) * 6 * ui * (z.wobble / 0.3) : 0;
    const x0 = z.lx + wob;
    const y0 = z.ly;
    const w = z.lw;
    const h = z.lh;
    const alpha = z.spawnT < 0.3 ? z.spawnT / 0.3 : 1;
    ctx.globalAlpha = alpha;

    if (z.labelOff < -6) {
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.2 * ui;
      ctx.beginPath();
      ctx.moveTo(clamp(z.sx, x0 + 8, x0 + w - 8), y0 + h);
      ctx.lineTo(z.sx, z.top - 3 * ui);
      ctx.stroke();
    }

    S.rrect(ctx, x0, y0, w, h, h * 0.32);
    ctx.fillStyle = isT ? "rgba(52,8,8,0.93)" : "rgba(6,10,10,0.8)";
    ctx.fill();
    ctx.lineWidth = isT ? 2.4 * ui : 1.4 * ui;
    ctx.strokeStyle = z.wobble > 0 ? "#ff3b3b" : isT ? "#ff4b3a" : LABEL_BORDER[z.kind];
    ctx.stroke();

    const cyy = y0 + h / 2;
    if (z.kind === "bomber") {
      const ix = x0 + fs * 0.42 + fs * 0.4;
      ctx.fillStyle = "#ff9a2e";
      ctx.beginPath();
      ctx.arc(ix, cyy + fs * 0.06, fs * 0.28, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#ffd23a";
      ctx.lineWidth = 2 * ui;
      ctx.beginPath();
      ctx.moveTo(ix + fs * 0.16, cyy - fs * 0.16);
      ctx.lineTo(ix + fs * 0.3, cyy - fs * 0.34);
      ctx.stroke();
    } else if (z.kind === "medkit") {
      const ix = x0 + fs * 0.42 + fs * 0.4;
      const a = fs * 0.34;
      const b = fs * 0.12;
      ctx.fillStyle = "#6dff8a";
      ctx.fillRect(ix - b, cyy - a, b * 2, a * 2);
      ctx.fillRect(ix - a, cyy - b, a * 2, b * 2);
    }

    ctx.font = `800 ${fs}px ${MONO}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const tx = x0 + z.lpad;
    const ty = cyy + fs * 0.05;
    if (z.prog > 0) {
      ctx.fillStyle = "#7dff4a";
      ctx.fillText(word.slice(0, z.prog), tx, ty);
    }
    ctx.fillStyle = isT ? "#ffffff" : "#f3ecdc";
    ctx.fillText(word.slice(z.prog), tx + z.prog * cw, ty);
    if (isT && z.prog < word.length) {
      ctx.fillStyle = "#ffd23a";
      ctx.fillRect(tx + z.prog * cw + cw * 0.08, y0 + h - fs * 0.26, cw * 0.84, Math.max(2, 2.4 * ui));
    }

    if (z.words.length > 1) {
      const n = z.words.length;
      const gap = 10 * ui;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i < z.wi ? "rgba(255,255,255,0.2)" : i === z.wi ? "#ffd23a" : LABEL_BORDER[z.kind];
        ctx.beginPath();
        ctx.arc(x0 + w / 2 + (i - (n - 1) / 2) * gap, y0 - 6 * ui, 2.8 * ui, 0, TAU);
        ctx.fill();
      }
    }
    if (isT) {
      const px = clamp(z.sx, x0 + 10, x0 + w - 10);
      ctx.fillStyle = "#ff4b3a";
      ctx.beginPath();
      ctx.moveTo(px - 6 * ui, y0 + h);
      ctx.lineTo(px + 6 * ui, y0 + h);
      ctx.lineTo(px, y0 + h + 7 * ui);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private popText(text: string, x: number, y: number, color: string, size: number, font: FloatText["font"], life: number, vy: number) {
    const margin = Math.min(this.W * 0.3, text.length * size * this.ui * 0.3 + 10);
    const px = clamp(x, margin, this.W - margin);
    let py = Math.max(y, 80 * this.ui);
    const hgt = size * this.ui * 1.15;
    for (let iter = 0; iter < 5; iter++) {
      let hit = false;
      for (const t of this.texts) {
        if (t.life > 0.45) continue;
        if (Math.abs(t.x - px) < Math.max(margin, 90 * this.ui) && Math.abs(t.y - py) < hgt) {
          py = t.y + hgt;
          hit = true;
        }
      }
      if (!hit) break;
    }
    this.texts.push({
      text,
      x: px,
      y: py,
      vy: vy * this.ui,
      life: 0,
      max: life,
      color,
      size,
      font,
    });
    if (this.texts.length > 24) this.texts.shift();
  }

  private drawTexts() {
    const ctx = this.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    for (const t of this.texts) {
      const k = t.life / t.max;
      const pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.6 : k < 0.22 ? 1.2 - ((k - 0.12) / 0.1) * 0.2 : 1;
      const a = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      const fs = Math.max(8, Math.round(t.size * this.ui * pop));
      ctx.font = t.font === "mono" ? `800 ${fs}px ${MONO}` : t.font === "horror" ? `${fs}px ${HORROR}` : `800 ${fs}px ${UI}`;
      ctx.globalAlpha = Math.max(0, a);
      ctx.lineWidth = Math.max(3, fs * 0.18);
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  private drawHud() {
    const ctx = this.ctx;
    const ui = this.ui;
    const W = this.W;
    const top = 12 * ui;
    const hs = 22 * ui;
    const gap = 5 * ui;
    const hx = (i: number) => 16 * ui + hs / 2 + i * (hs + gap);
    const hy = top + hs / 2;
    for (let i = 0; i < MAX_LIVES; i++) {
      const filled = i < this.lives;
      let s = hs;
      if (filled && this.lives === 1) s *= 1 + Math.sin(this.rt * 9) * 0.1;
      S.heartPath(ctx, hx(i), hy + 2 * ui, s);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();
      S.heartPath(ctx, hx(i), hy, s);
      ctx.fillStyle = filled ? "#ff3b4f" : "rgba(255,255,255,0.1)";
      ctx.fill();
      ctx.lineWidth = 1.5 * ui;
      ctx.strokeStyle = filled ? "#ffb3ba" : "rgba(255,255,255,0.28)";
      ctx.stroke();
      if (filled) {
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        S.ell(ctx, hx(i) - s * 0.2, hy - s * 0.16, s * 0.1, s * 0.07);
        ctx.fill();
      }
    }
    if (this.heartLost > 0 && this.lives < MAX_LIVES) {
      const k = 1 - this.heartLost;
      ctx.globalAlpha = this.heartLost;
      S.heartPath(ctx, hx(this.lives), hy - k * 12 * ui, hs * (1 + k * 1.3));
      ctx.fillStyle = "#ff3b4f";
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.font = `800 ${Math.round(12 * ui)}px ${UI}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(`GELOMBANG ${this.wave}`, 16 * ui + 1, top + hs + 8 * ui + 1);
    ctx.fillStyle = "#c9dccd";
    ctx.fillText(`GELOMBANG ${this.wave}`, 16 * ui, top + hs + 8 * ui);

    const scoreStr = Math.round(this.displayScore).toLocaleString("id-ID");
    const fs = Math.round(30 * ui * (1 + this.scorePop * 0.12));
    ctx.font = `800 ${fs}px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(scoreStr, W / 2 + 2 * ui, top + 18 * ui);
    ctx.fillStyle = "#f4f1e8";
    ctx.fillText(scoreStr, W / 2, top + 16 * ui);

    const m = multFor(this.streak);
    const y2 = top + 40 * ui;
    const bw = 92 * ui;
    const bh = 6 * ui;
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    S.rrect(ctx, W / 2 - bw / 2, y2, bw, bh, bh / 2);
    ctx.fill();
    const prog = m >= 5 ? 1 : (this.streak - TIERS[m - 1]) / (TIERS[m] - TIERS[m - 1]);
    if (prog > 0) {
      ctx.fillStyle = TIER_COLORS[m - 1];
      S.rrect(ctx, W / 2 - bw / 2, y2, Math.max(bh, bw * prog), bh, bh / 2);
      ctx.fill();
    }
    ctx.font = `800 ${Math.round(16 * ui * (1 + this.multPop * 0.5))}px ${MONO}`;
    ctx.fillStyle = TIER_COLORS[m - 1];
    ctx.textAlign = "right";
    ctx.fillText(`x${m}`, W / 2 - bw / 2 - 8 * ui, y2 + bh / 2 + 1);
    ctx.textAlign = "left";
    ctx.font = `700 ${Math.round(11 * ui)}px ${UI}`;
    ctx.fillStyle = "rgba(225,238,225,0.8)";
    ctx.fillText(`${this.streak} COMBO`, W / 2 + bw / 2 + 8 * ui, y2 + bh / 2 + 1);

    let boss: Zombie | null = null;
    for (const z of this.zombies) if (z.alive && z.kind === "boss") boss = z;
    if (boss) {
      const bw2 = Math.min(W * 0.36, 170 * ui);
      const bx = 16 * ui;
      const by = top + hs + 34 * ui;
      ctx.font = `${Math.round(17 * ui)}px ${HORROR}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText("GENDERUWO", bx + 1, by + 1);
      ctx.fillStyle = `rgba(255,74,58,${(0.8 + 0.2 * Math.sin(this.rt * 6)).toFixed(3)})`;
      ctx.fillText("GENDERUWO", bx, by);
      const n = boss.words.length;
      const g2 = 3 * ui;
      const seg = (bw2 - (n - 1) * g2) / n;
      for (let i = 0; i < n; i++) {
        const x = bx + i * (seg + g2);
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(x, by + 10 * ui, seg, 6 * ui);
        const f = i < boss.wi ? 0 : i > boss.wi ? 1 : 1 - boss.prog / boss.words[i].length;
        if (f > 0) {
          ctx.fillStyle = "#ff3b3b";
          ctx.fillRect(x, by + 10 * ui, seg * f, 6 * ui);
        }
      }
    }

    if (!this.isTouch && this.mode === "play") {
      ctx.font = `700 ${Math.round(11 * ui)}px ${UI}`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(230,240,230,0.6)";
      ctx.fillText("ESC jeda  ·  BACKSPACE lepas target", W - 14 * ui, this.H - 10 * ui);
    }
  }

  private drawBanner() {
    const t = this.bannerT;
    if (t > this.bannerDur) return;
    const ctx = this.ctx;
    const ui = this.ui;
    const scale = easeOutBack(Math.min(1, t / 0.35));
    const alpha = t > this.bannerDur - 0.5 ? Math.max(0, (this.bannerDur - t) / 0.5) : Math.min(1, t / 0.12);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.W / 2, this.H * 0.56);
    ctx.scale(scale, scale);
    const fs = Math.round(Math.min(66 * ui, this.W * 0.12));
    ctx.font = `${fs}px ${HORROR}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 8 * ui;
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.strokeText(this.bannerText, 0, 0);
    ctx.fillStyle = this.bannerColor;
    ctx.fillText(this.bannerText, 0, 0);
    if (this.bannerSub) {
      ctx.font = `800 ${Math.round(16 * ui)}px ${UI}`;
      ctx.lineWidth = 5 * ui;
      ctx.strokeText(this.bannerSub, 0, fs * 0.72);
      ctx.fillStyle = "#f2efe6";
      ctx.fillText(this.bannerSub, 0, fs * 0.72);
    }
    ctx.restore();
  }

  private drawTutorial() {
    const ctx = this.ctx;
    const ui = this.ui;
    const a = Math.min(1, this.tutorial / 0.6) * (0.8 + 0.2 * Math.sin(this.rt * 5));
    const text = this.isTouch ? "KETIK DI KEYBOARD HP UNTUK MENEMBAK!" : "KETIK KATA DI ATAS ZOMBI UNTUK MENEMBAK!";
    const sub = "Huruf pertama mengunci target · salah ketik memutus combo";
    const y = this.barTop - 44 * ui;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `800 ${Math.round(15 * ui)}px ${UI}`;
    const w1 = ctx.measureText(text).width;
    ctx.font = `600 ${Math.round(11 * ui)}px ${UI}`;
    const w2 = ctx.measureText(sub).width;
    const bw = Math.min(this.W - 16, Math.max(w1, w2) + 28 * ui);
    const bh = 44 * ui;
    S.rrect(ctx, this.W / 2 - bw / 2, y - bh / 2, bw, bh, 12 * ui);
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fill();
    ctx.strokeStyle = "rgba(163,255,60,0.45)";
    ctx.lineWidth = 1.5 * ui;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.round(15 * ui)}px ${UI}`;
    ctx.fillStyle = "#a3ff3c";
    ctx.fillText(text, this.W / 2, y - 7 * ui, this.W - 30);
    ctx.font = `600 ${Math.round(11 * ui)}px ${UI}`;
    ctx.fillStyle = "rgba(235,240,230,0.85)";
    ctx.fillText(sub, this.W / 2, y + 11 * ui, this.W - 30);
    ctx.restore();
  }
}
