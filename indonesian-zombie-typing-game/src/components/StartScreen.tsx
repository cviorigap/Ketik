import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DIFFICULTIES, DIFFICULTY_ORDER, type Difficulty } from "../game/config";
import type { Board } from "../game/storage";
import { sfx } from "../game/audio";
import { HighScoreTable } from "./HighScoreTable";
import { CloseIcon, HelpIcon, SoundIcon, TrophyIcon } from "./Icons";

interface Props {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  name: string;
  onName: (n: string) => void;
  sound: boolean;
  onToggleSound: () => void;
  board: Board;
  isTouch: boolean;
  onStart: () => void;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 animate-fade-in" onClick={onClose}>
      <div className="panel w-full max-w-lg max-h-[88dvh] flex flex-col animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="font-horror text-3xl text-[#b4ff5a] title-glow tracking-wide">{title}</h3>
          <button className="hud-btn h-9 w-9" onClick={onClose} aria-label="Tutup">
            <CloseIcon />
          </button>
        </div>
        <div className="scroll-thin overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}

const ENEMIES: { name: string; desc: string; color: string }[] = [
  { name: "Zombi", desc: "Pejalan lambat. Mangsa empuk.", color: "#8fd14f" },
  { name: "Tuyul", desc: "Kecil dan sangat cepat!", color: "#ff7a64" },
  { name: "Pocong", desc: "Melompat-lompat tak terduga.", color: "#efe9d8" },
  { name: "Zombi Bom", desc: "Meledak & membasmi zombi di sekitarnya.", color: "#ff9a2e" },
  { name: "Zombi Tentara", desc: "Berzirah — butuh 2 kata.", color: "#c8d06a" },
  { name: "Genderuwo", desc: "Bos tiap 5 gelombang. Banyak kata!", color: "#ff3b3b" },
  { name: "Kotak Medis", desc: "Ketik katanya untuk +1 nyawa.", color: "#6dff8a" },
];

export function StartScreen(p: Props) {
  const [panel, setPanel] = useState<"none" | "scores" | "help">("none");
  const [tab, setTab] = useState<Difficulty>(p.difficulty);

  useEffect(() => {
    if (panel === "none") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel("none");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  return (
    <div
      className="fixed inset-0 z-30 overflow-y-auto overscroll-contain scroll-thin"
      style={{
        background:
          "radial-gradient(ellipse at 50% 38%, rgba(2,6,5,0.5) 0%, rgba(2,6,5,0.78) 55%, rgba(2,5,4,0.95) 100%)",
      }}
    >
      <div className="fixed right-3 top-3 z-10 flex gap-2">
        <button className="hud-btn h-11 w-11" onClick={p.onToggleSound} aria-label={p.sound ? "Matikan suara" : "Nyalakan suara"}>
          <SoundIcon on={p.sound} />
        </button>
      </div>

      <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center gap-5 px-4 py-10 sm:gap-6">
        <header className="text-center animate-rise">
          <p className="text-[10px] font-bold tracking-[0.5em] text-lime-300/80 sm:text-xs">GAME MENGETIK · ZOMBI · BAHASA INDONESIA</p>
          <h1 className="font-horror mt-2 leading-[0.88] text-[clamp(3.3rem,13vw,7.6rem)] text-[#b4ff5a] title-glow">
            <span className="flicker inline-block">KETIK</span>{" "}
            <span className="text-[#ff3b3b] blood-glow text-[0.62em] align-middle">atau</span>{" "}
            <span className="inline-block">MATI</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-stone-300/90 sm:text-base">
            Kota dikepung mayat hidup! Ketik kata di atas kepala mereka untuk menembak — sebelum barikade jebol.
          </p>
        </header>

        <section className="w-full animate-rise" style={{ animationDelay: "80ms" }}>
          <h2 className="mb-2.5 text-center text-[11px] font-bold tracking-[0.35em] text-stone-400">PILIH KESULITAN</h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Tingkat kesulitan">
            {DIFFICULTY_ORDER.map((id) => {
              const d = DIFFICULTIES[id];
              const active = id === p.difficulty;
              const best = p.board[id][0]?.score ?? 0;
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    sfx.init();
                    sfx.click();
                    p.onDifficulty(id);
                  }}
                  className={`relative rounded-2xl border p-3 text-left transition duration-150 sm:p-4 ${
                    active ? "bg-black/70 -translate-y-1" : "border-white/10 bg-black/45 hover:border-white/25 hover:bg-black/60"
                  }`}
                  style={
                    active
                      ? { borderColor: d.accent, boxShadow: `0 0 0 1px ${d.accent}, 0 14px 34px -12px ${d.accent}` }
                      : undefined
                  }
                >
                  {!p.isTouch && (
                    <kbd className="key absolute right-2 top-2 text-white/60">{d.key}</kbd>
                  )}
                  <div className="font-horror text-[1.65rem] leading-none sm:text-4xl" style={{ color: d.accent }}>
                    {d.label}
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-extrabold text-white/90 sm:text-sm">{d.letters}</div>
                  <div className="mt-0.5 hidden text-[11px] text-stone-400 sm:block">{d.tagline}</div>
                  <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
                    {d.sample.map((w) => (
                      <span key={w} className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white/60">
                        {w}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-white/50 sm:text-xs">
                    <TrophyIcon className="h-3 w-3" />
                    <span className="font-mono text-white/80">{best.toLocaleString("id-ID")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex w-full max-w-md flex-col items-stretch gap-3 animate-rise sm:flex-row" style={{ animationDelay: "160ms" }}>
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/55 px-3 py-2.5 focus-within:border-lime-300/60">
            <span className="text-[10px] font-bold tracking-widest text-stone-400">NAMA</span>
            <input
              value={p.name}
              maxLength={12}
              onChange={(e) => p.onName(e.target.value.toUpperCase().replace(/[^A-Z0-9 _-]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                  p.onStart();
                }
              }}
              className="min-w-0 flex-1 bg-transparent font-mono font-extrabold uppercase tracking-wider text-white outline-none"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="characters"
              aria-label="Nama pemain"
            />
          </label>
          <button className="btn-start pulse" onClick={p.onStart}>
            MULAI
            {!p.isTouch && <kbd className="key">ENTER</kbd>}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 animate-rise" style={{ animationDelay: "220ms" }}>
          <button
            className="btn-ghost"
            onClick={() => {
              setTab(p.difficulty);
              setPanel("scores");
            }}
          >
            <TrophyIcon /> PAPAN SKOR
          </button>
          <button className="btn-ghost" onClick={() => setPanel("help")}>
            <HelpIcon /> CARA MAIN
          </button>
        </div>

        <p className="text-center text-[11px] text-stone-500">
          {p.isTouch
            ? "Keyboard bawaan HP-mu muncul otomatis saat bermain · ketuk layar bila tertutup"
            : "ENTER mulai · 1 2 3 pilih kesulitan · ESC jeda saat bermain"}
        </p>
      </div>

      {panel === "scores" && (
        <Modal title="Papan Skor" onClose={() => setPanel("none")}>
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-black/40 p-1">
            {DIFFICULTY_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`rounded-lg py-2 text-xs font-extrabold tracking-widest transition ${
                  tab === id ? "bg-white/10" : "text-stone-400 hover:text-white"
                }`}
                style={tab === id ? { color: DIFFICULTIES[id].accent } : undefined}
              >
                {DIFFICULTIES[id].label.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-white/5 bg-black/30">
            <HighScoreTable entries={p.board[tab]} />
          </div>
          <p className="mt-3 text-center text-[11px] text-stone-500">Skor disimpan di perangkat ini.</p>
        </Modal>
      )}

      {panel === "help" && (
        <Modal title="Cara Main" onClose={() => setPanel("none")}>
          <ol className="space-y-2.5 text-sm text-stone-200">
            {[
              <>Ketik <b className="text-lime-300">huruf pertama</b> sebuah kata — senjatamu langsung mengunci zombi itu.</>,
              <>Selesaikan katanya. Setiap huruf benar = <b className="text-amber-300">satu tembakan</b> yang mendorong zombi mundur.</>,
              <>Salah ketik memutus combo. Combo <b>10 / 25 / 50 / 100</b> melipatkan skor hingga <b className="text-red-400">x5</b>.</>,
              <><b className="text-amber-300">Granat</b> (ENTER / tombol granat di kiri bawah) meledakkan semua zombi di layar. Dapat +1 tiap 15 zombi.</>,
              <><b>BACKSPACE</b> melepas target · <b>ESC</b> / tombol jeda menjeda permainan.</>,
              <>Main di HP? Pakai <b className="text-lime-300">keyboard bawaan HP-mu</b>. Menutup keyboard otomatis menjeda permainan.</>,
              <>Zombi yang mencapai barikade merenggut nyawamu. Habis 5 nyawa = tamat!</>,
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-300/15 font-mono text-[11px] font-extrabold text-lime-300">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <h4 className="mb-2 mt-5 text-[11px] font-bold tracking-[0.3em] text-stone-400">KENALI MUSUHMU</h4>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {ENEMIES.map((e) => (
              <div key={e.name} className="flex items-start gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: e.color, boxShadow: `0 0 8px ${e.color}` }} />
                <div>
                  <div className="text-sm font-extrabold" style={{ color: e.color }}>
                    {e.name}
                  </div>
                  <div className="text-xs text-stone-400">{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
