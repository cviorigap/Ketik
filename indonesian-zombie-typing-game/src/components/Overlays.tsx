import { useEffect, useMemo, useState } from "react";
import { DIFFICULTIES } from "../game/config";
import type { GameStats } from "../game/engine";
import type { Board } from "../game/storage";
import { HighScoreTable } from "./HighScoreTable";
import { SkullIcon, SoundIcon } from "./Icons";

export interface RoundResult extends GameStats {
  rank: number;
  isBest: boolean;
  prevBest: number;
  name: string;
}

/* ---------------- JEDA ---------------- */

interface PauseProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  sound: boolean;
  onToggleSound: () => void;
  isTouch: boolean;
}

export function PauseScreen({ onResume, onRestart, onMenu, sound, onToggleSound, isTouch }: PauseProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
      <div className="panel w-full max-w-sm p-6 text-center animate-pop-in">
        <h2 className="font-horror text-6xl leading-none text-[#b4ff5a] title-glow">JEDA</h2>
        <p className="mt-2 text-sm text-stone-400">Zombi menunggu… tarik napas dulu.</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button className="btn-start" onClick={onResume} autoFocus>
            LANJUT
            {!isTouch && <kbd className="key">ESC</kbd>}
          </button>
          <button className="btn-ghost" onClick={onRestart}>
            ULANGI DARI AWAL
          </button>
          <button className="btn-ghost" onClick={onMenu}>
            MENU UTAMA
          </button>
          <button className="btn-ghost" onClick={onToggleSound}>
            <SoundIcon on={sound} className="h-4 w-4" /> SUARA: {sound ? "NYALA" : "MATI"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- TAMAT ---------------- */

const TITLES = ["KAMU DIMAKAN!", "BARIKADE JEBOL!", "OTAKMU DISANTAP!", "TAMAT RIWAYATMU!"];

interface OverProps {
  result: RoundResult;
  board: Board;
  isTouch: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/35 px-2 py-2.5 text-center">
      <div className="font-mono text-lg font-extrabold tabular-nums sm:text-xl" style={{ color: accent ?? "#f4f1e8" }}>
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-bold tracking-[0.2em] text-stone-400 sm:text-[10px]">{label}</div>
    </div>
  );
}

export function GameOverScreen({ result, board, isTouch, onRestart, onMenu }: OverProps) {
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);
  const title = useMemo(() => TITLES[Math.floor(Math.random() * TITLES.length)], []);
  const cfg = DIFFICULTIES[result.difficulty];

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(result.score * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const t = window.setTimeout(() => setReady(true), 600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [result.score]);

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto p-3 animate-fade-in scroll-thin"
      style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(60,0,0,0.55), rgba(0,0,0,0.88) 70%)" }}
    >
      <div className="flex min-h-full items-center justify-center py-4">
        <div className="panel w-full max-w-lg p-5 animate-pop-in sm:p-7" style={{ borderColor: "rgba(255,59,59,0.25)" }}>
          <div className="flex justify-center text-red-500/80">
            <SkullIcon className="h-8 w-8" />
          </div>
          <h2 className="font-horror mt-1 text-center text-[clamp(2.3rem,10vw,4rem)] leading-none text-[#ff3b3b] blood-glow">{title}</h2>
          <p className="mt-2 text-center text-[11px] font-bold tracking-[0.3em] text-stone-400">
            <span style={{ color: cfg.accent }}>{cfg.label.toUpperCase()}</span> · GELOMBANG {result.wave} · {result.name}
          </p>

          <div className="mt-4 text-center">
            <div className="text-[10px] font-bold tracking-[0.4em] text-stone-400">SKOR</div>
            <div className="font-mono text-5xl font-extrabold tabular-nums text-white sm:text-6xl">{shown.toLocaleString("id-ID")}</div>
            <div className="mt-2 flex justify-center">
              {result.isBest ? (
                <span className="animate-badge rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 px-4 py-1 text-xs font-extrabold tracking-widest text-black shadow-[0_0_24px_rgba(255,210,58,0.55)]">
                  ★ SKOR TERTINGGI BARU! ★
                </span>
              ) : result.rank >= 0 ? (
                <span className="rounded-full bg-lime-300/15 px-3 py-1 text-xs font-bold tracking-wider text-lime-200">
                  Masuk papan skor · peringkat #{result.rank + 1}
                </span>
              ) : (
                <span className="text-xs text-stone-400">
                  Rekor: <span className="font-mono text-stone-200">{result.prevBest.toLocaleString("id-ID")}</span>
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <Stat label="ZOMBI" value={String(result.kills)} accent="#8fd14f" />
            <Stat label="WPM" value={String(result.wpm)} accent="#ffd23a" />
            <Stat label="AKURASI" value={`${Math.round(result.accuracy * 100)}%`} />
            <Stat label="COMBO" value={String(result.maxCombo)} accent="#ffa126" />
          </div>

          <div className="mt-5">
            <h3 className="mb-1.5 text-[10px] font-bold tracking-[0.3em] text-stone-400">PAPAN SKOR · {cfg.label.toUpperCase()}</h3>
            <div className="scroll-thin max-h-44 overflow-y-auto rounded-xl border border-white/5 bg-black/30">
              <HighScoreTable entries={board[result.difficulty]} highlight={result.rank} />
            </div>
          </div>

          <div className={`mt-5 grid grid-cols-[1fr_auto] gap-2 transition-opacity ${ready ? "" : "pointer-events-none opacity-60"}`}>
            <button className="btn-start pulse" onClick={onRestart}>
              MAIN LAGI
              {!isTouch && <kbd className="key">ENTER</kbd>}
            </button>
            <button className="btn-ghost" onClick={onMenu}>
              MENU
              {!isTouch && <kbd className="key">ESC</kbd>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
