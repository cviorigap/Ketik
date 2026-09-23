// Gambar prosedural untuk semua karakter & objek permainan.

export const TAU = Math.PI * 2;

export interface ZPal {
  skin: string;
  skinDark: string;
  shirt: string;
  shirtDark: string;
  pants: string;
  hair: string;
  eye: string;
}

export const FLASH_PAL: ZPal = {
  skin: "#ffffff",
  skinDark: "#f1f1f1",
  shirt: "#ffffff",
  shirtDark: "#ececec",
  pants: "#f6f6f6",
  hair: "#ffffff",
  eye: "#ffffff",
};

const SKINS: [string, string][] = [
  ["#7f9c5a", "#5e7a40"],
  ["#6d8f63", "#4f6e48"],
  ["#8ea56d", "#6b834f"],
  ["#93a78b", "#6f8467"],
  ["#7b8f4e", "#5b6d36"],
  ["#a3a07a", "#7d7a58"],
];
const SHIRTS: [string, string][] = [
  ["#3b4a6b", "#2b3650"],
  ["#6b3434", "#4f2424"],
  ["#55585c", "#3d4043"],
  ["#2f5d57", "#214440"],
  ["#7a6a3a", "#5a4e2a"],
  ["#4a3b6b", "#35294f"],
  ["#8b8574", "#6b6657"],
  ["#9c4a2a", "#733520"],
];
const PANTS = ["#2a2f3a", "#3a3226", "#2d3b2d", "#403a4a", "#1f2530"];
const HAIR = ["#1d1a16", "#3a2a1a", "#2a2a2a", "#5a4a3a", "#141414"];

const pick = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0];

export function randomPal(kind: string): ZPal {
  const [skin, skinDark] = pick(SKINS);
  let [shirt, shirtDark] = pick(SHIRTS);
  let pants = pick(PANTS);
  if (kind === "tank") {
    shirt = "#4b5a3a";
    shirtDark = "#38432b";
    pants = "#3a4430";
  } else if (kind === "bomber") {
    shirt = "#5c6168";
    shirtDark = "#43474d";
  }
  return {
    skin,
    skinDark,
    shirt,
    shirtDark,
    pants,
    hair: pick(HAIR),
    eye: kind === "tank" ? "#ff5a3a" : "#fff27a",
  };
}

/* ---------- helper ---------- */

export function ell(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.moveTo(x + rx, y);
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
}

export function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + 0.42 * s);
  ctx.bezierCurveTo(x - 0.1 * s, y + 0.3 * s, x - 0.5 * s, y + 0.08 * s, x - 0.5 * s, y - 0.16 * s);
  ctx.bezierCurveTo(x - 0.5 * s, y - 0.42 * s, x - 0.2 * s, y - 0.52 * s, x, y - 0.28 * s);
  ctx.bezierCurveTo(x + 0.2 * s, y - 0.52 * s, x + 0.5 * s, y - 0.42 * s, x + 0.5 * s, y - 0.16 * s);
  ctx.bezierCurveTo(x + 0.5 * s, y + 0.08 * s, x + 0.1 * s, y + 0.3 * s, x, y + 0.42 * s);
  ctx.closePath();
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

export function makeGlow(rgb: string, size = 64): HTMLCanvasElement {
  const [c, x] = canvas(size, size);
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.22, `rgba(${rgb},0.6)`);
  g.addColorStop(0.55, `rgba(${rgb},0.18)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

export function makeSoft(rgb: string, alpha: number, size = 128): HTMLCanvasElement {
  const [c, x] = canvas(size, size);
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.5, `rgba(${rgb},${alpha * 0.45})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

export function makeDot(color: string, size = 32): HTMLCanvasElement {
  const [c, x] = canvas(size, size);
  x.fillStyle = color;
  x.beginPath();
  x.arc(size / 2, size / 2, size / 2 - 1, 0, TAU);
  x.fill();
  x.fillStyle = "rgba(255,255,255,0.28)";
  x.beginPath();
  x.arc(size * 0.37, size * 0.35, size * 0.14, 0, TAU);
  x.fill();
  return c;
}

export function makeSplat(color: string, seed: number, size = 96): HTMLCanvasElement {
  const [c, x] = canvas(size, size);
  const r = size * 0.28;
  const cx = size / 2;
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  x.fillStyle = color;
  x.beginPath();
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const k = r * (0.75 + rnd() * 0.5);
    const px = cx + Math.cos(a) * k;
    const py = cx + Math.sin(a) * k;
    if (i === 0) x.moveTo(px, py);
    else x.lineTo(px, py);
  }
  x.closePath();
  x.fill();
  for (let i = 0; i < 9; i++) {
    const a = rnd() * TAU;
    const d = r * (1.1 + rnd() * 0.65);
    x.beginPath();
    x.arc(cx + Math.cos(a) * d, cx + Math.sin(a) * d, size * (0.02 + rnd() * 0.045), 0, TAU);
    x.fill();
  }
  return c;
}

export function makeVignette(rgb: string, inner: number, alpha: number): HTMLCanvasElement {
  const size = 256;
  const [c, x] = canvas(size, size);
  const g = x.createRadialGradient(size / 2, size / 2, size * inner * 0.5, size / 2, size / 2, size * 0.72);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(1, `rgba(${rgb},${alpha})`);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

export function makeFur(n = 28): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(0.84 + Math.random() * 0.26);
  return out;
}

function glowAt(ctx: CanvasRenderingContext2D, g: HTMLCanvasElement, x: number, y: number, s: number) {
  ctx.drawImage(g, x - s / 2, y - s / 2, s, s);
}

/* ---------- zombi biasa / bom / tentara ---------- */

export interface HumanOpts {
  flash: boolean;
  kind: "walker" | "bomber" | "tank";
  armor: boolean;
  seed: number;
  time: number;
  glowEye: HTMLCanvasElement;
  glowRed: HTMLCanvasElement;
  glowOrange: HTMLCanvasElement;
}

function claws(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, u: number) {
  for (let i = -1; i <= 1; i++) {
    ctx.moveTo(x + i * 2.4 * u, y - 3 * u);
    ctx.lineTo(x + i * 3.3 * u + dir * 0.8 * u, y - 7.2 * u);
  }
}

export function drawHumanoid(ctx: CanvasRenderingContext2D, u: number, t: number, pal: ZPal, o: HumanOpts) {
  const step = Math.sin(t);
  const bob = Math.abs(Math.cos(t)) * 2.4 * u;
  const sx = step * 2.2 * u;
  const bx = sx * 0.5;
  const hipY = -44 * u - bob * 0.4;
  const shY = -77 * u - bob;
  const lLift = Math.max(0, step) * 6 * u;
  const rLift = Math.max(0, -step) * 6 * u;

  // bayangan
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.beginPath();
  ell(ctx, 0, 0, 21 * u, 5 * u);
  ctx.fill();

  // kaki
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = pal.pants;
  ctx.lineWidth = 9 * u;
  ctx.beginPath();
  ctx.moveTo(-6 * u + sx * 0.3, hipY);
  ctx.lineTo(-8.5 * u, -5 * u - lLift);
  ctx.moveTo(6 * u + sx * 0.3, hipY);
  ctx.lineTo(8.5 * u, -5 * u - rLift);
  ctx.stroke();
  ctx.fillStyle = o.flash ? "#fff" : "#17140f";
  ctx.beginPath();
  ell(ctx, -8.5 * u, -3 * u - lLift, 5.5 * u, 3.2 * u);
  ell(ctx, 8.5 * u, -3 * u - rLift, 5.5 * u, 3.2 * u);
  ctx.fill();

  // badan
  ctx.fillStyle = pal.shirt;
  ctx.beginPath();
  ctx.moveTo(-15 * u + sx, shY + 1 * u);
  ctx.quadraticCurveTo(sx, shY - 3 * u, 15 * u + sx, shY + 1 * u);
  ctx.lineTo(12.5 * u + bx, hipY + 2 * u);
  ctx.lineTo(8 * u + bx, hipY - 1.5 * u);
  ctx.lineTo(4 * u + bx, hipY + 3 * u);
  ctx.lineTo(-1 * u + bx, hipY - 1 * u);
  ctx.lineTo(-6 * u + bx, hipY + 3.5 * u);
  ctx.lineTo(-12.5 * u + bx, hipY + 1 * u);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.shirtDark;
  ctx.beginPath();
  ctx.moveTo(8 * u + sx, shY);
  ctx.lineTo(15 * u + sx, shY + 1 * u);
  ctx.lineTo(12.5 * u + bx, hipY + 2 * u);
  ctx.lineTo(8 * u + bx, hipY - 1.5 * u);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.skinDark;
  ctx.beginPath();
  ctx.moveTo(-5 * u + sx, shY - 1 * u);
  ctx.lineTo(5 * u + sx, shY - 1 * u);
  ctx.lineTo(sx, shY + 7 * u);
  ctx.closePath();
  ctx.fill();
  if (!o.flash) {
    const k = Math.floor(o.seed * 7);
    ctx.fillStyle = "rgba(96,12,14,0.6)";
    ctx.beginPath();
    ell(ctx, (-6 + (k % 3) * 4) * u + sx, shY + (14 + (k % 5)) * u, 4 * u, 3 * u);
    ell(ctx, (4 - (k % 4) * 2) * u + bx, hipY - 8 * u, 3 * u, 4.5 * u);
    ctx.fill();
  }

  if (o.kind === "bomber") {
    ctx.fillStyle = o.flash ? "#fff" : "#3a3024";
    ctx.fillRect(-13 * u + bx, shY + 20 * u, 26 * u, 4 * u);
    ctx.fillStyle = o.flash ? "#fff" : "#c62828";
    for (let i = 0; i < 4; i++) {
      rrect(ctx, (-11.5 + i * 6) * u + bx, shY + 8 * u, 4.8 * u, 15 * u, 1.6 * u);
      ctx.fill();
    }
    ctx.fillStyle = o.flash ? "#fff" : "#d8c9a0";
    ctx.fillRect(-12.5 * u + bx, shY + 13 * u, 25 * u, 2.2 * u);
    const blink = (o.time * 4 + o.seed) % 1 < 0.5;
    ctx.fillStyle = blink ? "#ff3030" : "#5a1010";
    ctx.beginPath();
    ell(ctx, bx, shY + 5.5 * u, 2 * u, 2 * u);
    ctx.fill();
    if (blink && !o.flash) {
      ctx.globalCompositeOperation = "lighter";
      glowAt(ctx, o.glowRed, bx, shY + 5.5 * u, 16 * u);
      ctx.globalCompositeOperation = "source-over";
    }
  } else if (o.kind === "tank" && o.armor) {
    ctx.fillStyle = o.flash ? "#fff" : "#2c3524";
    rrect(ctx, -12.5 * u + sx * 0.8, shY + 2 * u, 25 * u, 25 * u, 3 * u);
    ctx.fill();
    ctx.fillStyle = o.flash ? "#fff" : "#3e4a31";
    for (let i = 0; i < 3; i++) {
      rrect(ctx, (-10.5 + i * 7.3) * u + sx * 0.8, shY + 17 * u, 6.2 * u, 7.5 * u, 1.5 * u);
      ctx.fill();
    }
    ctx.fillStyle = o.flash ? "#fff" : "#1d2318";
    ctx.fillRect(-12.5 * u + sx * 0.8, shY + 9 * u, 25 * u, 2 * u);
  }

  // kepala
  const hx = sx * 1.15;
  const hy = shY - 10.5 * u;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(Math.sin(t * 0.5 + o.seed * 6) * 0.16);
  ctx.fillStyle = pal.skinDark;
  ctx.fillRect(-3.5 * u, 4 * u, 7 * u, 7 * u);
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(0, 0, 10.5 * u, 0, TAU);
  ctx.fill();
  ctx.fillStyle = pal.skinDark;
  ctx.beginPath();
  ctx.arc(0, 1 * u, 10.5 * u, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.closePath();
  ctx.fill();

  if (o.kind === "tank" && o.armor) {
    ctx.fillStyle = o.flash ? "#fff" : "#3f4a33";
    ctx.beginPath();
    ctx.arc(0, -1.5 * u, 12 * u, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = o.flash ? "#fff" : "#2a3222";
    ctx.fillRect(-13.5 * u, -2.8 * u, 27 * u, 2.8 * u);
  } else {
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.arc(0, -1 * u, 10.9 * u, Math.PI * 1.04, Math.PI * 1.96);
    ctx.lineTo(8 * u, -3 * u);
    ctx.lineTo(5 * u, -6.5 * u);
    ctx.lineTo(2 * u, -3.5 * u);
    ctx.lineTo(-1.5 * u, -7 * u);
    ctx.lineTo(-4.5 * u, -3 * u);
    ctx.lineTo(-8 * u, -5.5 * u);
    ctx.lineTo(-10.4 * u, -2 * u);
    ctx.closePath();
    ctx.fill();
    if (o.seed > 0.5) {
      ctx.fillStyle = o.flash ? "#fff" : "#d98a9a";
      ctx.beginPath();
      ell(ctx, 4.5 * u, -7.8 * u, 3.6 * u, 2.4 * u);
      ctx.fill();
    }
  }

  // mata
  ctx.fillStyle = o.flash ? "#fff" : "rgba(20,8,8,0.8)";
  ctx.beginPath();
  ell(ctx, -4 * u, 0, 3 * u, 2.6 * u);
  ell(ctx, 4 * u, 0, 3 * u, 2.6 * u);
  ctx.fill();
  ctx.fillStyle = pal.eye;
  ctx.beginPath();
  ell(ctx, -4 * u, 0, 1.5 * u, 1.5 * u);
  ell(ctx, 4 * u, 0.3 * u, 1.3 * u, 1.3 * u);
  ctx.fill();
  if (!o.flash && u > 0.3) {
    ctx.globalCompositeOperation = "lighter";
    const g = o.kind === "tank" ? o.glowRed : o.glowEye;
    glowAt(ctx, g, -4 * u, 0, 9 * u);
    glowAt(ctx, g, 4 * u, 0, 9 * u);
    ctx.globalCompositeOperation = "source-over";
  }
  // mulut
  const open = (2 + Math.abs(Math.sin(t * 1.3 + o.seed * 5)) * 2.2) * 0.6 * u;
  ctx.fillStyle = o.flash ? "#fff" : "#2a0707";
  ctx.beginPath();
  ell(ctx, 0.5 * u, 5.6 * u, 4 * u, open);
  ctx.fill();
  ctx.fillStyle = o.flash ? "#fff" : "#e8dfc2";
  ctx.fillRect(-2.2 * u, 5.6 * u - open, 1.4 * u, 1.3 * u);
  ctx.fillRect(1.3 * u, 5.6 * u - open, 1.4 * u, 1.3 * u);
  ctx.restore();

  // tangan menjulur ke depan
  const a1 = Math.sin(t + 1.2) * 2.6 * u;
  const a2 = -a1;
  const shLx = -14 * u + sx;
  const shRx = 14 * u + sx;
  const shYY = shY + 3 * u;
  const elLx = -20 * u + sx;
  const elRx = 20 * u + sx;
  const elLy = shY + 13 * u + a1 * 0.5;
  const elRy = shY + 13 * u + a2 * 0.5;
  const hLx = -17 * u + sx * 1.3;
  const hRx = 17 * u + sx * 1.3;
  const hLy = shY + 6 * u + a1;
  const hRy = shY + 6 * u + a2;
  ctx.strokeStyle = pal.shirt;
  ctx.lineWidth = 7.5 * u;
  ctx.beginPath();
  ctx.moveTo(shLx, shYY);
  ctx.lineTo(elLx, elLy);
  ctx.moveTo(shRx, shYY);
  ctx.lineTo(elRx, elRy);
  ctx.stroke();
  ctx.strokeStyle = pal.skin;
  ctx.lineWidth = 6 * u;
  ctx.beginPath();
  ctx.moveTo(elLx, elLy);
  ctx.lineTo(hLx, hLy);
  ctx.moveTo(elRx, elRy);
  ctx.lineTo(hRx, hRy);
  ctx.stroke();
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ell(ctx, hLx, hLy, 4.6 * u, 4.6 * u);
  ell(ctx, hRx, hRy, 4.6 * u, 4.6 * u);
  ctx.fill();
  ctx.strokeStyle = pal.skinDark;
  ctx.lineWidth = 1.8 * u;
  ctx.beginPath();
  claws(ctx, hLx, hLy, -1, u);
  claws(ctx, hRx, hRy, 1, u);
  ctx.stroke();

  if (o.kind === "bomber" && !o.flash && u > 0.25) {
    // percikan sumbu
    const fx = 13 * u + sx;
    const fy = shY + 3 * u;
    ctx.strokeStyle = "#2b2b2b";
    ctx.lineWidth = 1.2 * u;
    ctx.beginPath();
    ctx.moveTo(8 * u + bx, shY + 9 * u);
    ctx.quadraticCurveTo(12 * u + sx, shY + 6 * u, fx, fy);
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, o.glowOrange, fx, fy, (10 + Math.sin(o.time * 40) * 3) * u);
    ctx.globalCompositeOperation = "source-over";
  }
}

/* ---------- tuyul (pelari) ---------- */

export function drawTuyul(ctx: CanvasRenderingContext2D, u: number, t: number, flash: boolean, glowRed: HTMLCanvasElement) {
  const step = Math.sin(t);
  const bob = Math.abs(Math.cos(t)) * 3 * u;
  const skin = flash ? "#fff" : "#8a9c90";
  const skinD = flash ? "#eee" : "#627368";
  const lLift = Math.max(0, step) * 6 * u;
  const rLift = Math.max(0, -step) * 6 * u;

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ell(ctx, 0, 0, 16 * u, 4.5 * u);
  ctx.fill();

  ctx.lineCap = "round";
  ctx.strokeStyle = skinD;
  ctx.lineWidth = 5.5 * u;
  ctx.beginPath();
  ctx.moveTo(-4 * u, -30 * u - bob * 0.3);
  ctx.lineTo(-6.5 * u, -4 * u - lLift);
  ctx.moveTo(4 * u, -30 * u - bob * 0.3);
  ctx.lineTo(6.5 * u, -4 * u - rLift);
  ctx.stroke();

  ctx.fillStyle = skin;
  ctx.beginPath();
  ell(ctx, 0, -44 * u - bob, 9.5 * u, 11.5 * u);
  ctx.fill();
  ctx.fillStyle = flash ? "#fff" : "#d9d2c0";
  rrect(ctx, -9 * u, -37 * u - bob * 0.5, 18 * u, 10 * u, 4 * u);
  ctx.fill();

  const sw = Math.sin(t + 1) * 2.5 * u;
  ctx.strokeStyle = skin;
  ctx.lineWidth = 4.2 * u;
  ctx.beginPath();
  ctx.moveTo(-7 * u, -51 * u - bob);
  ctx.lineTo(-14 * u, -47 * u - bob + sw);
  ctx.moveTo(7 * u, -51 * u - bob);
  ctx.lineTo(14 * u, -47 * u - bob - sw);
  ctx.stroke();
  ctx.strokeStyle = skinD;
  ctx.lineWidth = 1.5 * u;
  ctx.beginPath();
  claws(ctx, -14 * u, -46 * u - bob + sw, -1, u * 0.8);
  claws(ctx, 14 * u, -46 * u - bob - sw, 1, u * 0.8);
  ctx.stroke();

  const hy = -67 * u - bob;
  ctx.fillStyle = skinD;
  ctx.beginPath();
  ctx.moveTo(-11 * u, hy - 3 * u);
  ctx.lineTo(-23 * u, hy - 10 * u);
  ctx.lineTo(-12 * u, hy + 5 * u);
  ctx.closePath();
  ctx.moveTo(11 * u, hy - 3 * u);
  ctx.lineTo(23 * u, hy - 10 * u);
  ctx.lineTo(12 * u, hy + 5 * u);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, hy, 13.5 * u, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ell(ctx, -4 * u, hy - 7.5 * u, 5 * u, 2.8 * u);
  ctx.fill();

  ctx.fillStyle = flash ? "#fff" : "#1a0c0c";
  ctx.beginPath();
  ell(ctx, -5 * u, hy + 1 * u, 3.8 * u, 3.2 * u);
  ell(ctx, 5 * u, hy + 1 * u, 3.8 * u, 3.2 * u);
  ctx.fill();
  ctx.fillStyle = "#ff3b2f";
  ctx.beginPath();
  ell(ctx, -5 * u, hy + 1 * u, 1.8 * u, 1.8 * u);
  ell(ctx, 5 * u, hy + 1 * u, 1.8 * u, 1.8 * u);
  ctx.fill();
  if (!flash && u > 0.25) {
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, glowRed, -5 * u, hy + 1 * u, 13 * u);
    glowAt(ctx, glowRed, 5 * u, hy + 1 * u, 13 * u);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.fillStyle = flash ? "#fff" : "#2a0707";
  ctx.beginPath();
  ctx.moveTo(-7 * u, hy + 6.5 * u);
  ctx.quadraticCurveTo(0, hy + 13.5 * u, 7 * u, hy + 6.5 * u);
  ctx.quadraticCurveTo(0, hy + 9 * u, -7 * u, hy + 6.5 * u);
  ctx.fill();
  ctx.fillStyle = flash ? "#fff" : "#efe7cf";
  ctx.beginPath();
  for (let i = -2; i <= 2; i++) {
    const tx = i * 2.6 * u;
    ctx.moveTo(tx - 1 * u, hy + 7.6 * u);
    ctx.lineTo(tx + 1 * u, hy + 7.6 * u);
    ctx.lineTo(tx, hy + 9.6 * u);
    ctx.closePath();
  }
  ctx.fill();
}

/* ---------- pocong (melompat) ---------- */

export function drawPocong(ctx: CanvasRenderingContext2D, u: number, t: number, flash: boolean, glowRed: HTMLCanvasElement) {
  const hop = Math.abs(Math.sin(t));
  const lift = hop * 12 * u;
  ctx.fillStyle = `rgba(0,0,0,${0.42 - hop * 0.2})`;
  ctx.beginPath();
  ell(ctx, 0, 0, (16 - hop * 5) * u, 4.5 * u);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -lift);
  const land = 1 - hop;
  const sq = 1 + land * land * land * 0.1;
  ctx.scale(sq, 1 / sq);
  const cloth = flash ? "#fff" : "#e8e3d3";
  const shade = flash ? "#f0f0f0" : "#bdb6a2";
  const rope = flash ? "#fff" : "#6d5c45";

  ctx.fillStyle = cloth;
  ctx.beginPath();
  ctx.moveTo(-8 * u, 0);
  ctx.quadraticCurveTo(-15 * u, -40 * u, -12 * u, -76 * u);
  ctx.quadraticCurveTo(-12 * u, -98 * u, 0, -98 * u);
  ctx.quadraticCurveTo(12 * u, -98 * u, 12 * u, -76 * u);
  ctx.quadraticCurveTo(15 * u, -40 * u, 8 * u, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.moveTo(8 * u, 0);
  ctx.quadraticCurveTo(15 * u, -40 * u, 12 * u, -76 * u);
  ctx.quadraticCurveTo(8 * u, -45 * u, 3 * u, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = shade;
  ctx.lineWidth = 1.3 * u;
  ctx.beginPath();
  ctx.moveTo(-5 * u, -70 * u);
  ctx.quadraticCurveTo(-8 * u, -40 * u, -4 * u, -10 * u);
  ctx.moveTo(2 * u, -66 * u);
  ctx.quadraticCurveTo(0, -40 * u, 1 * u, -14 * u);
  ctx.stroke();

  ctx.fillStyle = cloth;
  ctx.beginPath();
  ctx.moveTo(-2 * u, -97 * u);
  ctx.lineTo(-6.5 * u, -107 * u);
  ctx.lineTo(0, -102 * u);
  ctx.lineTo(6.5 * u, -107 * u);
  ctx.lineTo(2 * u, -97 * u);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = rope;
  ctx.lineWidth = 1.9 * u;
  ctx.beginPath();
  ctx.moveTo(-3 * u, -97.5 * u);
  ctx.lineTo(3 * u, -97.5 * u);
  ctx.moveTo(-11.8 * u, -74 * u);
  ctx.quadraticCurveTo(0, -71.5 * u, 11.8 * u, -74 * u);
  ctx.moveTo(-13.6 * u, -40 * u);
  ctx.quadraticCurveTo(0, -37.5 * u, 13.6 * u, -40 * u);
  ctx.moveTo(-10 * u, -10 * u);
  ctx.quadraticCurveTo(0, -8 * u, 10 * u, -10 * u);
  ctx.stroke();

  ctx.fillStyle = flash ? "#fff" : "#27302a";
  ctx.beginPath();
  ell(ctx, 0, -85 * u, 7.5 * u, 9 * u);
  ctx.fill();
  ctx.fillStyle = flash ? "#fff" : "#7b8876";
  ctx.beginPath();
  ell(ctx, 0, -84 * u, 6 * u, 7.5 * u);
  ctx.fill();
  ctx.fillStyle = flash ? "#fff" : "#15100e";
  ctx.beginPath();
  ell(ctx, -2.6 * u, -86 * u, 2.2 * u, 2.6 * u);
  ell(ctx, 2.6 * u, -86 * u, 2.2 * u, 2.6 * u);
  ell(ctx, 0, -80 * u, 2 * u, 1.2 * u);
  ctx.fill();
  ctx.fillStyle = "#ff5a3a";
  ctx.beginPath();
  ell(ctx, -2.6 * u, -86 * u, 0.9 * u, 0.9 * u);
  ell(ctx, 2.6 * u, -86 * u, 0.9 * u, 0.9 * u);
  ctx.fill();
  if (!flash && u > 0.25) {
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, glowRed, -2.6 * u, -86 * u, 8 * u);
    glowAt(ctx, glowRed, 2.6 * u, -86 * u, 8 * u);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}

/* ---------- bos: genderuwo ---------- */

export function drawBoss(
  ctx: CanvasRenderingContext2D,
  u: number,
  t: number,
  flash: boolean,
  fur: number[],
  glowRed: HTMLCanvasElement,
) {
  const step = Math.sin(t);
  const bob = Math.abs(Math.cos(t)) * 2.5 * u;
  const breathe = Math.sin(t * 0.7) * 1.2 * u;
  const furC = flash ? "#fff" : "#2e2019";
  const furL = flash ? "#fff" : "#4a3428";
  const furD = flash ? "#eee" : "#1b130f";

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.beginPath();
  ell(ctx, 0, 0, 34 * u, 7 * u);
  ctx.fill();

  const lLift = Math.max(0, step) * 5 * u;
  const rLift = Math.max(0, -step) * 5 * u;
  ctx.lineCap = "round";
  ctx.strokeStyle = furD;
  ctx.lineWidth = 13 * u;
  ctx.beginPath();
  ctx.moveTo(-11 * u, -36 * u);
  ctx.lineTo(-14 * u, -6 * u - lLift);
  ctx.moveTo(11 * u, -36 * u);
  ctx.lineTo(14 * u, -6 * u - rLift);
  ctx.stroke();

  const cy = -58 * u - bob;
  const rx = 30 * u + breathe;
  const ry = 36 * u;
  ctx.fillStyle = furC;
  ctx.beginPath();
  for (let i = 0; i < fur.length; i++) {
    const a = (i / fur.length) * TAU;
    const k = i % 2 === 0 ? fur[i] : fur[i] * 0.88;
    const px = Math.cos(a) * rx * k;
    const py = cy + Math.sin(a) * ry * k;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = furL;
  ctx.beginPath();
  ell(ctx, 0, cy + 6 * u, 16 * u, 20 * u);
  ctx.fill();

  const sw = Math.sin(t + 1) * 4 * u;
  const lhx = -34 * u + sw * 0.3;
  const lhy = -24 * u + sw;
  const rhx = 34 * u - sw * 0.3;
  const rhy = -24 * u - sw;
  ctx.strokeStyle = furC;
  ctx.lineWidth = 12 * u;
  ctx.beginPath();
  ctx.moveTo(-24 * u, cy - 20 * u);
  ctx.quadraticCurveTo(-42 * u, cy + 2 * u, lhx, lhy);
  ctx.moveTo(24 * u, cy - 20 * u);
  ctx.quadraticCurveTo(42 * u, cy + 2 * u, rhx, rhy);
  ctx.stroke();
  ctx.strokeStyle = flash ? "#fff" : "#d8cfb8";
  ctx.lineWidth = 2.2 * u;
  ctx.beginPath();
  for (let i = -1; i <= 1; i++) {
    ctx.moveTo(lhx + i * 3 * u, lhy + 4 * u);
    ctx.quadraticCurveTo(lhx + i * 3.5 * u, lhy + 9 * u, lhx + i * 4 * u + 2 * u, lhy + 11 * u);
    ctx.moveTo(rhx + i * 3 * u, rhy + 4 * u);
    ctx.quadraticCurveTo(rhx + i * 3.5 * u, rhy + 9 * u, rhx + i * 4 * u - 2 * u, rhy + 11 * u);
  }
  ctx.stroke();

  const hy = cy - 38 * u;
  ctx.fillStyle = furC;
  ctx.beginPath();
  ell(ctx, 0, hy, 17 * u, 15 * u);
  ctx.fill();
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    const bx = Math.cos(a) * 15 * u;
    const by = hy + Math.sin(a) * 13 * u;
    ctx.moveTo(bx - 3 * u, by + 2 * u);
    ctx.lineTo(bx + Math.cos(a) * 7 * u, by + Math.sin(a) * 7 * u);
    ctx.lineTo(bx + 3 * u, by + 2 * u);
    ctx.closePath();
  }
  ctx.fill();
  ctx.fillStyle = furD;
  ctx.beginPath();
  ell(ctx, 0, hy + 3 * u, 11 * u, 9 * u);
  ctx.fill();
  ctx.fillStyle = "#ff2a1a";
  ctx.beginPath();
  ell(ctx, -5 * u, hy + 1 * u, 2.8 * u, 1.9 * u);
  ell(ctx, 5 * u, hy + 1 * u, 2.8 * u, 1.9 * u);
  ctx.fill();
  if (!flash) {
    ctx.globalCompositeOperation = "lighter";
    glowAt(ctx, glowRed, -5 * u, hy + 1 * u, 24 * u);
    glowAt(ctx, glowRed, 5 * u, hy + 1 * u, 24 * u);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.strokeStyle = furL;
  ctx.lineWidth = 2.2 * u;
  ctx.beginPath();
  ctx.moveTo(-10 * u, hy - 4.5 * u);
  ctx.lineTo(-2 * u, hy - 1 * u);
  ctx.moveTo(10 * u, hy - 4.5 * u);
  ctx.lineTo(2 * u, hy - 1 * u);
  ctx.stroke();
  const open = (2.6 + Math.abs(Math.sin(t * 0.9)) * 1.6) * u;
  ctx.fillStyle = flash ? "#fff" : "#300808";
  ctx.beginPath();
  ell(ctx, 0, hy + 8 * u, 6.5 * u, open);
  ctx.fill();
  ctx.fillStyle = flash ? "#fff" : "#efe6cc";
  ctx.beginPath();
  ctx.moveTo(-5 * u, hy + 8 * u + open);
  ctx.lineTo(-3 * u, hy + 8 * u + open);
  ctx.lineTo(-4 * u, hy + 3 * u);
  ctx.closePath();
  ctx.moveTo(5 * u, hy + 8 * u + open);
  ctx.lineTo(3 * u, hy + 8 * u + open);
  ctx.lineTo(4 * u, hy + 3 * u);
  ctx.closePath();
  ctx.fill();
}

/* ---------- kotak medis dengan parasut ---------- */

export function drawMedkit(ctx: CanvasRenderingContext2D, u: number, t: number, flash: boolean, glowGreen: HTMLCanvasElement) {
  const sw = Math.sin(t * 1.6) * 0.12;
  const hover = Math.sin(t * 2.2) * 3 * u;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ell(ctx, 0, 0, 12 * u, 3 * u);
  ctx.fill();

  ctx.save();
  ctx.translate(0, -26 * u + hover);
  ctx.translate(0, -62 * u);
  ctx.rotate(sw);
  ctx.translate(0, 62 * u);

  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha *= 0.55 + Math.sin(t * 5) * 0.2;
  glowAt(ctx, glowGreen, 0, -11 * u, 60 * u);
  ctx.globalAlpha /= 0.55 + Math.sin(t * 5) * 0.2;
  ctx.globalCompositeOperation = "source-over";

  const cy = -64 * u;
  for (let i = 0; i < 4; i++) {
    const a0 = Math.PI + (i * Math.PI) / 4;
    ctx.fillStyle = flash ? "#fff" : i % 2 === 0 ? "#d63a3a" : "#ece8dc";
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.ellipse(0, cy, 26 * u, 16 * u, 0, a0, a0 + Math.PI / 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(230,230,230,0.7)";
  ctx.lineWidth = Math.max(0.6, 0.8 * u);
  ctx.beginPath();
  ctx.moveTo(-26 * u, cy);
  ctx.lineTo(-9 * u, -22 * u);
  ctx.moveTo(26 * u, cy);
  ctx.lineTo(9 * u, -22 * u);
  ctx.moveTo(-9 * u, cy);
  ctx.lineTo(-5 * u, -22 * u);
  ctx.moveTo(9 * u, cy);
  ctx.lineTo(5 * u, -22 * u);
  ctx.stroke();

  ctx.fillStyle = flash ? "#fff" : "#8a6a3c";
  rrect(ctx, -11 * u, -22 * u, 22 * u, 22 * u, 2 * u);
  ctx.fill();
  ctx.strokeStyle = "rgba(40,25,10,0.6)";
  ctx.lineWidth = 1.2 * u;
  ctx.beginPath();
  ctx.moveTo(-11 * u, -15 * u);
  ctx.lineTo(11 * u, -15 * u);
  ctx.moveTo(-11 * u, -7 * u);
  ctx.lineTo(11 * u, -7 * u);
  ctx.stroke();
  ctx.fillStyle = "#f2f2f2";
  rrect(ctx, -6.5 * u, -17.5 * u, 13 * u, 13 * u, 1.5 * u);
  ctx.fill();
  ctx.fillStyle = "#e02424";
  ctx.fillRect(-1.8 * u, -15.5 * u, 3.6 * u, 9 * u);
  ctx.fillRect(-4.5 * u, -12.8 * u, 9 * u, 3.6 * u);
  ctx.restore();
}

/* ---------- senjata pemain ---------- */

export function drawGun(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  angle: number,
  len: number,
  recoil: number,
  muzzle: number,
  flashRot: number,
  glowOrange: HTMLCanvasElement,
  glowYellow: HTMLCanvasElement,
) {
  const u = len / 100;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle + Math.PI / 2);
  ctx.translate(0, recoil * 10 * u);

  ctx.save();
  ctx.scale(1.45, 1);
  // lengan jaket
  ctx.fillStyle = "#35422d";
  ctx.beginPath();
  ctx.moveTo(-9 * u, -60 * u);
  ctx.lineTo(-54 * u, 44 * u);
  ctx.lineTo(-30 * u, 58 * u);
  ctx.lineTo(5 * u, -56 * u);
  ctx.closePath();
  ctx.moveTo(4 * u, 0);
  ctx.lineTo(34 * u, 62 * u);
  ctx.lineTo(58 * u, 50 * u);
  ctx.lineTo(15 * u, -8 * u);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(210,255,200,0.1)";
  ctx.beginPath();
  ctx.moveTo(-7 * u, -58 * u);
  ctx.lineTo(-44 * u, 42 * u);
  ctx.lineTo(-38 * u, 46 * u);
  ctx.lineTo(0, -56 * u);
  ctx.closePath();
  ctx.moveTo(6 * u, 0);
  ctx.lineTo(40 * u, 60 * u);
  ctx.lineTo(45 * u, 57 * u);
  ctx.lineTo(10 * u, -4 * u);
  ctx.closePath();
  ctx.fill();

  // popor kayu
  ctx.fillStyle = "#7a4a28";
  ctx.beginPath();
  ctx.moveTo(-7 * u, -14 * u);
  ctx.lineTo(7 * u, -14 * u);
  ctx.lineTo(11.5 * u, 42 * u);
  ctx.lineTo(-11.5 * u, 42 * u);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,225,190,0.2)";
  ctx.fillRect(-4.5 * u, -12 * u, 2.2 * u, 52 * u);

  // laras ganda
  ctx.fillStyle = "#2b3037";
  rrect(ctx, -6.6 * u, -102 * u, 6.2 * u, 68 * u, 2 * u);
  ctx.fill();
  rrect(ctx, 0.4 * u, -102 * u, 6.2 * u, 68 * u, 2 * u);
  ctx.fill();
  ctx.fillStyle = "#8a96a3";
  ctx.fillRect(-4.8 * u, -100 * u, 1.3 * u, 62 * u);
  ctx.fillRect(2.2 * u, -100 * u, 1.3 * u, 62 * u);
  ctx.fillStyle = "#14171b";
  ctx.fillRect(-0.4 * u, -101 * u, 0.8 * u, 64 * u);
  ctx.strokeStyle = "rgba(190,255,200,0.22)";
  ctx.lineWidth = Math.max(1, 0.5 * u);
  rrect(ctx, -6.8 * u, -102 * u, 13.6 * u, 68 * u, 2.4 * u);
  ctx.stroke();
  ctx.fillStyle = "#4d5661";
  rrect(ctx, -7 * u, -104 * u, 14 * u, 4.2 * u, 1.6 * u);
  ctx.fill();
  ctx.fillStyle = "#ffb43a";
  ctx.beginPath();
  ell(ctx, 0, -99 * u, 1.3 * u, 1.3 * u);
  ctx.fill();

  // pegangan depan
  ctx.fillStyle = "#7c4d2b";
  rrect(ctx, -7.8 * u, -78 * u, 15.6 * u, 26 * u, 3 * u);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 1.1 * u;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.moveTo(-6.5 * u, -74 * u + i * 4.2 * u);
    ctx.lineTo(6.5 * u, -74 * u + i * 4.2 * u);
  }
  ctx.stroke();

  // badan senjata
  ctx.fillStyle = "#3b434d";
  rrect(ctx, -8.2 * u, -42 * u, 16.4 * u, 30 * u, 3 * u);
  ctx.fill();
  ctx.fillStyle = "#77838f";
  ctx.fillRect(-6.3 * u, -39 * u, 2 * u, 24 * u);
  ctx.fillStyle = "#23282e";
  ctx.fillRect(-8.2 * u, -22 * u, 16.4 * u, 2.2 * u);

  // sarung tangan
  ctx.fillStyle = "#302a24";
  rrect(ctx, -9.6 * u, -72 * u, 19.2 * u, 14 * u, 5 * u);
  ctx.fill();
  rrect(ctx, -9.2 * u, -9 * u, 18.4 * u, 15 * u, 5 * u);
  ctx.fill();
  ctx.fillStyle = "rgba(255,240,220,0.16)";
  ctx.fillRect(-7 * u, -70.5 * u, 14 * u, 2.2 * u);
  ctx.fillRect(-7 * u, -7.5 * u, 14 * u, 2.2 * u);
  ctx.restore();

  // kilatan moncong
  if (muzzle > 0) {
    ctx.globalCompositeOperation = "lighter";
    const k = 0.8 + Math.random() * 0.5;
    glowAt(ctx, glowOrange, 0, -108 * u, 95 * u * k);
    glowAt(ctx, glowYellow, 0, -108 * u, 38 * u * k);
    ctx.fillStyle = "#fff6cf";
    ctx.save();
    ctx.translate(0, -110 * u);
    ctx.rotate(flashRot);
    ctx.beginPath();
    const spikes = 7;
    for (let i = 0; i < spikes * 2; i++) {
      const r = (i % 2 === 0 ? 19 : 5.5) * u * k;
      const a = (i / (spikes * 2)) * TAU;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}

/* ---------- barikade (di-cache) ---------- */

export function drawBarricade(ctx: CanvasRenderingContext2D, W: number, h: number, ui: number) {
  const wireH = 16 * ui;
  const body = h - wireH;
  const top = wireH;

  // tiang belakang
  for (let x = 30 * ui; x < W; x += 120 * ui) {
    ctx.fillStyle = "#24170e";
    ctx.fillRect(x, top - 6 * ui, 13 * ui, body + 6 * ui);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x + 2 * ui, top - 6 * ui, 3 * ui, body);
  }

  // papan kayu
  const plank = (y: number, ph: number, rot: number, color: string, seed: number) => {
    ctx.save();
    ctx.translate(W / 2, y + ph / 2);
    ctx.rotate(rot);
    const w = W + 60;
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -ph / 2, w, ph);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(-w / 2, -ph / 2, w, ph * 0.16);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(-w / 2, ph / 2 - ph * 0.2, w, ph * 0.2);
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const gy = -ph / 2 + ph * (0.3 + i * 0.2);
      ctx.moveTo(-w / 2, gy);
      for (let x = -w / 2; x < w / 2; x += 40) {
        ctx.lineTo(x + 40, gy + Math.sin((x + seed * 97 + i * 31) * 0.05) * 1.6);
      }
    }
    ctx.stroke();
    ctx.fillStyle = "#a9aeb4";
    for (let x = -w / 2 + 36 * ui + seed * 20; x < w / 2; x += 120 * ui) {
      ctx.beginPath();
      ctx.arc(x, -ph * 0.18, 1.8 * ui, 0, TAU);
      ctx.arc(x, ph * 0.18, 1.8 * ui, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  };
  plank(top + body * 0.02, body * 0.2, -0.014, "#6a4a2e", 1);
  plank(top + body * 0.2, body * 0.19, 0.011, "#5b3e26", 2);

  // karung pasir
  const bagH = Math.max(body * 0.36, 14);
  const bagW = bagH * 2.3;
  const rows: number[] = [top + body * 0.4, top + body * 0.4 + bagH * 0.78];
  rows.forEach((y, row) => {
    for (let x = -bagW * 0.4 - (row % 2) * bagW * 0.45; x < W + bagW; x += bagW * 0.9) {
      ctx.fillStyle = row === 0 ? "#6a5f45" : "#5e543d";
      rrect(ctx, x, y, bagW, bagH, bagH * 0.45);
      ctx.fill();
      ctx.fillStyle = "rgba(255,240,200,0.12)";
      rrect(ctx, x + bagW * 0.08, y + bagH * 0.1, bagW * 0.84, bagH * 0.42, bagH * 0.25);
      ctx.fill();
      ctx.strokeStyle = "rgba(20,16,8,0.65)";
      ctx.lineWidth = 1.5;
      rrect(ctx, x, y, bagW, bagH, bagH * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + bagW * 0.84, y + bagH * 0.22);
      ctx.lineTo(x + bagW * 0.84, y + bagH * 0.8);
      ctx.stroke();
    }
  });

  // kawat berduri
  ctx.strokeStyle = "rgba(160,168,176,0.85)";
  ctx.lineWidth = Math.max(1, 1.3 * ui);
  ctx.beginPath();
  const loop = 20 * ui;
  for (let x = -loop; x < W + loop; x += loop * 0.8) {
    ctx.moveTo(x + loop * 0.6, wireH * 0.62);
    ctx.ellipse(x, wireH * 0.62, loop * 0.6, wireH * 0.42, 0, 0, TAU);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(200,205,210,0.9)";
  ctx.beginPath();
  for (let x = 0; x < W; x += loop * 0.8) {
    const y = wireH * 0.25;
    ctx.moveTo(x - 3 * ui, y - 3 * ui);
    ctx.lineTo(x + 3 * ui, y + 3 * ui);
    ctx.moveTo(x + 3 * ui, y - 3 * ui);
    ctx.lineTo(x - 3 * ui, y + 3 * ui);
  }
  ctx.stroke();
}
