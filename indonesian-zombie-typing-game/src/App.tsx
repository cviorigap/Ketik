import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as RMouseEvent } from "react";
import { Engine, type GameStats } from "./game/engine";
import { sfx } from "./game/audio";
import { DIFFICULTY_ORDER, type Difficulty } from "./game/config";
import { addScore, loadBoard, loadSettings, saveSettings, type Board } from "./game/storage";
import { StartScreen } from "./components/StartScreen";
import { GameOverScreen, PauseScreen, type PauseReason, type RoundResult } from "./components/Overlays";
import { NATIVE_INPUT_ID, NativeInput, type NativeInputHandle } from "./components/NativeInput";
import { GrenadeIcon, PauseIcon } from "./components/Icons";

type Screen = "menu" | "playing" | "paused" | "gameover";

const detectTouch = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(pointer: coarse)").matches || (navigator.maxTouchPoints > 0 && !window.matchMedia?.("(pointer: fine)").matches));

export default function App() {
  const initial = useRef(loadSettings()).current;
  const [screen, setScreenState] = useState<Screen>("menu");
  const [pauseReason, setPauseReason] = useState<PauseReason>("manual");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [name, setName] = useState(initial.name);
  const [sound, setSound] = useState(initial.sound);
  const [board, setBoard] = useState<Board>(() => loadBoard());
  const [result, setResult] = useState<RoundResult | null>(null);
  const [grenades, setGrenades] = useState(1);
  const [isTouch, setIsTouch] = useState<boolean>(() => !!detectTouch());
  const [cramped, setCramped] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const inputRef = useRef<NativeInputHandle>(null);
  const screenRef = useRef<Screen>("menu");
  const diffRef = useRef(difficulty);
  const nameRef = useRef(name);
  const touchRef = useRef(isTouch);
  const kbOpenRef = useRef(false);
  const overAt = useRef(0);
  diffRef.current = difficulty;
  nameRef.current = name;
  touchRef.current = isTouch;

  // ref diperbarui seketika agar handler sinkron (blur, keydown) melihat layar terbaru
  const setScreen = useCallback((s: Screen) => {
    screenRef.current = s;
    setScreenState(s);
  }, []);

  /* ---------- keyboard HP ---------- */

  /** Munculkan keyboard bawaan HP. Wajib dipanggil langsung di dalam event ketukan/klik. */
  const openKeyboard = useCallback((force = false) => {
    if (!touchRef.current) return;
    const inp = inputRef.current;
    if (!inp) return;
    if (!inp.isFocused()) inp.focus();
    else if (force) inp.refocus();
  }, []);

  const closeKeyboard = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  /* ---------- game over ---------- */
  const handleGameOver = (s: GameStats) => {
    const before = loadBoard()[s.difficulty][0]?.score ?? 0;
    const playerName = nameRef.current.trim() || "PENYINTAS";
    const rank =
      s.score > 0
        ? addScore(s.difficulty, {
            name: playerName,
            score: s.score,
            wave: s.wave,
            wpm: s.wpm,
            acc: Math.round(s.accuracy * 100),
            kills: s.kills,
            date: Date.now(),
          })
        : -1;
    setBoard(loadBoard());
    setResult({ ...s, rank, isBest: s.score > 0 && s.score > before, prevBest: before, name: playerName });
    overAt.current = performance.now();
    setScreen("gameover");
    closeKeyboard();
  };
  const gameOverRef = useRef(handleGameOver);
  gameOverRef.current = handleGameOver;

  /* ---------- engine ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const engine = new Engine(canvas, {
      onGameOver: (s) => gameOverRef.current(s),
      onGrenades: (n) => setGrenades(n),
    });
    engine.isTouch = !!detectTouch();
    engineRef.current = engine;
    if (/[?&]debug\b/.test(window.location.search)) {
      (window as unknown as { __engine?: Engine }).__engine = engine;
    }
    const fit = () => {
      const r = stage.getBoundingClientRect();
      engine.resize(r.width, r.height);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    fit();
    return () => {
      ro.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) engineRef.current.isTouch = isTouch;
  }, [isTouch]);

  useEffect(() => {
    saveSettings({ sound, name, difficulty });
  }, [sound, name, difficulty]);

  useEffect(() => {
    sfx.setEnabled(sound);
  }, [sound]);

  /* ---------- aksi ---------- */
  const start = useCallback(
    (d?: Difficulty) => {
      const e = engineRef.current;
      if (!e) return;
      openKeyboard(); // paling awal, selagi masih di dalam event ketukan
      sfx.init();
      const diff = d ?? diffRef.current;
      setDifficulty(diff);
      e.startGame(diff);
      setGrenades(1);
      setScreen("playing");
    },
    [openKeyboard, setScreen],
  );

  const pause = useCallback(
    (reason: PauseReason = "manual") => {
      const e = engineRef.current;
      if (screenRef.current !== "playing" || !e || e.isGameOver()) return;
      e.setPaused(true);
      setPauseReason(reason);
      setScreen("paused");
      closeKeyboard();
    },
    [closeKeyboard, setScreen],
  );
  const pauseRef = useRef(pause);
  pauseRef.current = pause;

  const resume = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    openKeyboard();
    e.resume(touchRef.current);
    setScreen("playing");
  }, [openKeyboard, setScreen]);

  const toMenu = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    closeKeyboard();
    e.setPaused(false);
    e.startDemo();
    setScreen("menu");
  }, [closeKeyboard, setScreen]);

  const toggleSound = useCallback(() => {
    sfx.init();
    setSound((s) => !s);
  }, []);

  /* ---------- ukuran layar mengikuti area di atas keyboard HP ---------- */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const vv = window.visualViewport;
    const tallest = new Map<number, number>();
    const apply = () => {
      const h = vv ? vv.height : window.innerHeight;
      const top = vv ? Math.max(0, vv.offsetTop) : 0;
      root.style.height = `${Math.round(h)}px`;
      root.style.transform = `translate3d(0,${Math.round(top)}px,0)`;

      // deteksi keyboard: tinggi terlihat jauh lebih kecil dari tinggi maksimum pada lebar ini
      const w = Math.round(window.innerWidth);
      const base = Math.max(tallest.get(w) ?? 0, h, window.innerHeight);
      tallest.set(w, base);
      const open = h < base * 0.8;
      if (kbOpenRef.current && !open) {
        if (touchRef.current) pauseRef.current("keyboard");
        if (window.scrollY) window.scrollTo(0, 0);
      }
      kbOpenRef.current = open;
      setCramped(h < 260 && w > h * 1.4);
    };
    apply();
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  /* ---------- keyboard fisik & tombol khusus ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const eng = engineRef.current;
      if (!eng) return;
      const tgt = e.target as HTMLElement | null;
      const typing = !!tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA");
      const s = screenRef.current;
      sfx.init();

      if (s === "playing") {
        if (e.key === "Escape") {
          e.preventDefault();
          pause("manual");
        } else if (e.key === "Enter") {
          e.preventDefault();
          eng.throwGrenade();
        } else if (e.key === "Backspace") {
          e.preventDefault();
          eng.cancelTarget();
        } else if (e.key.length === 1 && /^[a-z]$/i.test(e.key)) {
          // huruf dari keyboard HP diproses lewat event "input" pada NativeInput
          if (tgt?.id === NATIVE_INPUT_ID) return;
          e.preventDefault();
          if (!e.repeat) eng.type(e.key);
        } else if (e.key === " " && tgt?.id !== NATIVE_INPUT_ID) {
          e.preventDefault();
        }
        return;
      }
      if (typing) return;

      if (s === "menu") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        } else if (e.key === "1" || e.key === "2" || e.key === "3") {
          sfx.click();
          setDifficulty(DIFFICULTY_ORDER[Number(e.key) - 1]);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          const i = DIFFICULTY_ORDER.indexOf(diffRef.current);
          const n = (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
          sfx.click();
          setDifficulty(DIFFICULTY_ORDER[n]);
        }
      } else if (s === "paused") {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          resume();
        }
      } else if (s === "gameover") {
        if (performance.now() - overAt.current < 650) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        } else if (e.key === "Escape") {
          e.preventDefault();
          toMenu();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pause, resume, start, toMenu]);

  /* ---------- jeda otomatis, audio, deteksi sentuh ---------- */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pause("hidden");
    };
    const onBlur = () => pause("hidden");
    const unlock = () => sfx.init();
    const onTouch = () => setIsTouch(true);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchend", unlock, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true, once: true });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [pause]);

  /* ---------- handler input HP ---------- */
  const onNativeChar = useCallback((ch: string) => {
    engineRef.current?.type(ch);
  }, []);
  const onNativeBack = useCallback(() => engineRef.current?.cancelTarget(), []);
  const onNativeBlur = useCallback(() => pauseRef.current(document.hidden ? "hidden" : "keyboard"), []);

  // Ketukan di layar permainan tidak boleh mencuri fokus dari input (keyboard tetap terbuka)
  const onRootMouseDown = (e: RMouseEvent) => {
    if (!touchRef.current || screenRef.current !== "playing") return;
    if ((e.target as HTMLElement).closest("input, textarea")) return;
    e.preventDefault();
  };
  // Keyboard tertutup? ketuk layar untuk memunculkannya lagi
  const onStageTap = () => {
    if (screenRef.current !== "playing") return;
    openKeyboard(!kbOpenRef.current);
  };
  const onGrenade = () => {
    engineRef.current?.throwGrenade();
    openKeyboard();
  };

  return (
    <div
      ref={rootRef}
      className="fixed left-0 top-0 flex w-full select-none flex-col overflow-hidden bg-[#040807]"
      style={{ height: "100%" }}
      onMouseDown={onRootMouseDown}
    >
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ touchAction: "none" }} onClick={onStageTap}>
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
        {screen === "playing" && (
          <>
            <button className="hud-btn absolute right-3 top-3 h-11 w-11" onClick={() => pause("manual")} aria-label="Jeda">
              <PauseIcon />
            </button>
            <button
              className={`hud-btn absolute bottom-3 left-3 gap-2 ${isTouch ? "h-14 px-3.5" : "px-3 py-2"} ${grenades > 0 ? "" : "opacity-40"}`}
              onClick={onGrenade}
              aria-label={`Lempar granat (${grenades} tersisa)`}
            >
              <GrenadeIcon className={isTouch ? "h-8 w-8" : "h-7 w-7"} />
              <span className="font-mono text-lg font-extrabold text-amber-300">×{grenades}</span>
              {!isTouch && <kbd className="key text-white/70">ENTER</kbd>}
            </button>
            {isTouch && cramped && (
              <div className="pointer-events-none absolute bottom-3 right-3 whitespace-nowrap rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-bold text-amber-200">
                ↻ Putar HP ke posisi tegak
              </div>
            )}
          </>
        )}
      </div>

      {isTouch && <NativeInput ref={inputRef} onChar={onNativeChar} onBackspace={onNativeBack} onBlur={onNativeBlur} />}

      {screen === "menu" && (
        <StartScreen
          difficulty={difficulty}
          onDifficulty={setDifficulty}
          name={name}
          onName={setName}
          sound={sound}
          onToggleSound={toggleSound}
          board={board}
          isTouch={isTouch}
          onStart={() => start()}
        />
      )}
      {screen === "paused" && (
        <PauseScreen
          reason={pauseReason}
          onResume={resume}
          onRestart={() => start()}
          onMenu={toMenu}
          sound={sound}
          onToggleSound={toggleSound}
          isTouch={isTouch}
        />
      )}
      {screen === "gameover" && result && (
        <GameOverScreen result={result} board={board} isTouch={isTouch} onRestart={() => start()} onMenu={toMenu} />
      )}
    </div>
  );
}
