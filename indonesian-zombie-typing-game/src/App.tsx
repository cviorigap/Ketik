import { useCallback, useEffect, useRef, useState } from "react";
import { Engine, type GameStats } from "./game/engine";
import { sfx } from "./game/audio";
import { DIFFICULTY_ORDER, type Difficulty } from "./game/config";
import { addScore, loadBoard, loadSettings, saveSettings, type Board } from "./game/storage";
import { StartScreen } from "./components/StartScreen";
import { GameOverScreen, PauseScreen, type RoundResult } from "./components/Overlays";
import { TouchKeyboard, type TouchKeyboardHandle } from "./components/TouchKeyboard";
import { GrenadeIcon, PauseIcon } from "./components/Icons";

type Screen = "menu" | "playing" | "paused" | "gameover";

const detectTouch = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(pointer: coarse)").matches || (navigator.maxTouchPoints > 0 && !window.matchMedia?.("(pointer: fine)").matches));

export default function App() {
  const initial = useRef(loadSettings()).current;
  const [screen, setScreen] = useState<Screen>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [name, setName] = useState(initial.name);
  const [sound, setSound] = useState(initial.sound);
  const [board, setBoard] = useState<Board>(() => loadBoard());
  const [result, setResult] = useState<RoundResult | null>(null);
  const [grenades, setGrenades] = useState(1);
  const [isTouch, setIsTouch] = useState<boolean>(() => !!detectTouch());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const kbRef = useRef<TouchKeyboardHandle>(null);
  const screenRef = useRef(screen);
  const diffRef = useRef(difficulty);
  const nameRef = useRef(name);
  const overAt = useRef(0);
  screenRef.current = screen;
  diffRef.current = difficulty;
  nameRef.current = name;

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
      onHint: (ch) => kbRef.current?.setHint(ch),
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
  const start = useCallback((d?: Difficulty) => {
    const e = engineRef.current;
    if (!e) return;
    sfx.init();
    const diff = d ?? diffRef.current;
    setDifficulty(diff);
    e.startGame(diff);
    setGrenades(1);
    setScreen("playing");
  }, []);

  const pause = useCallback(() => {
    if (screenRef.current !== "playing") return;
    engineRef.current?.setPaused(true);
    setScreen("paused");
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.setPaused(false);
    setScreen("playing");
  }, []);

  const toMenu = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setPaused(false);
    e.startDemo();
    setScreen("menu");
  }, []);

  const toggleSound = useCallback(() => {
    sfx.init();
    setSound((s) => !s);
  }, []);

  /* ---------- keyboard fisik ---------- */
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
          pause();
        } else if (e.key === "Enter") {
          e.preventDefault();
          eng.throwGrenade();
        } else if (e.key === "Backspace") {
          e.preventDefault();
          eng.cancelTarget();
        } else if (e.key.length === 1 && /^[a-z]$/i.test(e.key)) {
          e.preventDefault();
          if (!e.repeat) eng.type(e.key);
        } else if (e.key === " ") {
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
      if (document.hidden) pause();
    };
    const onBlur = () => pause();
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

  const onTouchKey = useCallback((ch: string) => engineRef.current?.type(ch) ?? false, []);
  const onTouchBack = useCallback(() => engineRef.current?.cancelTarget(), []);
  const onGrenade = useCallback(() => {
    engineRef.current?.throwGrenade();
  }, []);

  const showKb = isTouch && screen !== "menu";

  return (
    <div className="fixed inset-0 flex select-none flex-col bg-[#040807]">
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ touchAction: "none" }}>
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
        {screen === "playing" && (
          <>
            <button className="hud-btn absolute right-3 top-3 h-11 w-11" onClick={pause} aria-label="Jeda">
              <PauseIcon />
            </button>
            {!isTouch && (
              <button
                className={`hud-btn absolute bottom-3 left-3 gap-2 px-3 py-2 ${grenades > 0 ? "" : "opacity-40"}`}
                onClick={onGrenade}
                aria-label={`Lempar granat (${grenades} tersisa)`}
              >
                <GrenadeIcon className="h-7 w-7" />
                <span className="font-mono text-lg font-extrabold text-amber-300">×{grenades}</span>
                <kbd className="key text-white/70">ENTER</kbd>
              </button>
            )}
          </>
        )}
      </div>

      {showKb && <TouchKeyboard ref={kbRef} grenades={grenades} onKey={onTouchKey} onBackspace={onTouchBack} onGrenade={onGrenade} />}

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
