import { useCallback, useEffect, useRef, useState } from "react";
import type { CompositionEvent, FormEvent, KeyboardEvent as RKeyboardEvent, PointerEvent as RPointerEvent } from "react";
import { flushSync } from "react-dom";
import { Engine, type GameStats } from "./game/engine";
import { sfx } from "./game/audio";
import { DIFFICULTY_ORDER, type Difficulty } from "./game/config";
import { addScore, loadBoard, loadSettings, saveSettings, type Board } from "./game/storage";
import { StartScreen } from "./components/StartScreen";
import { GameOverScreen, PauseScreen, type RoundResult } from "./components/Overlays";
import { MobileInputBar } from "./components/MobileInputBar";
import { GrenadeIcon, PauseIcon } from "./components/Icons";

type Screen = "menu" | "playing" | "paused" | "gameover";

const detectTouch = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(pointer: coarse)").matches ||
    (navigator.maxTouchPoints > 0 && !window.matchMedia?.("(pointer: fine)").matches));

const isLetter = (ch: string) => ch.length === 1 && /[a-z]/i.test(ch);

export default function App() {
  const initial = useRef(loadSettings()).current;
  const [screen, setScreen] = useState<Screen>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [name, setName] = useState(initial.name);
  const [sound, setSound] = useState(initial.sound);
  const [board, setBoard] = useState<Board>(() => loadBoard());
  const [result, setResult] = useState<RoundResult | null>(null);
  const [grenades, setGrenades] = useState(1);
  const [hint, setHint] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState<boolean>(() => !!detectTouch());
  const [kbFocused, setKbFocused] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const playInputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef(screen);
  const diffRef = useRef(difficulty);
  const nameRef = useRef(name);
  const isTouchRef = useRef(isTouch);
  const overAt = useRef(0);
  screenRef.current = screen;
  diffRef.current = difficulty;
  nameRef.current = name;
  isTouchRef.current = isTouch;

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
    playInputRef.current?.blur();
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
      onHint: (ch) => setHint(ch),
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

  /* ---------- visual viewport: area main mengecil saat keyboard HP terbuka ---------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const apply = () => {
      window.scrollTo(0, 0);
      const vv = window.visualViewport;
      if (!vv) {
        root.style.top = "0px";
        root.style.left = "0px";
        root.style.width = "100%";
        root.style.height = "100%";
        return;
      }
      root.style.top = `${Math.round(vv.offsetTop)}px`;
      root.style.left = `${Math.round(vv.offsetLeft)}px`;
      root.style.width = `${Math.round(vv.width)}px`;
      root.style.height = `${Math.round(vv.height)}px`;
    };
    apply();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);

  const focusPlayInput = useCallback(() => {
    const el = playInputRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
  }, []);

  /* ---------- aksi ---------- */
  const start = useCallback(
    (d?: Difficulty) => {
      const e = engineRef.current;
      if (!e) return;
      sfx.init();
      const touch = !!detectTouch() || isTouchRef.current;
      const diff = d ?? diffRef.current;
      setDifficulty(diff);
      e.startGame(diff);
      setGrenades(1);
      flushSync(() => {
        if (touch) setIsTouch(true);
        setScreen("playing");
      });
      if (touch) focusPlayInput();
    },
    [focusPlayInput],
  );

  const pause = useCallback(() => {
    if (screenRef.current !== "playing") return;
    playInputRef.current?.blur();
    engineRef.current?.setPaused(true);
    setScreen("paused");
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.setPaused(false);
    flushSync(() => setScreen("playing"));
    if (isTouchRef.current) focusPlayInput();
  }, [focusPlayInput]);

  const toMenu = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    playInputRef.current?.blur();
    e.setPaused(false);
    e.startDemo();
    setScreen("menu");
  }, []);

  const toggleSound = useCallback(() => {
    sfx.init();
    setSound((s) => !s);
  }, []);

  const drainLetters = (raw: string) => {
    const eng = engineRef.current;
    if (!eng || screenRef.current !== "playing") return;
    for (const ch of raw) {
      if (isLetter(ch)) eng.type(ch);
    }
  };

  const clearPlayInput = () => {
    const el = playInputRef.current;
    if (el && el.value) el.value = "";
  };

  const onPlayInput = (e: FormEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
    if (!v) return;
    e.currentTarget.value = "";
    drainLetters(v);
  };

  const onPlayBeforeInput = (e: FormEvent<HTMLInputElement>) => {
    if (screenRef.current !== "playing") return;
    const ne = e.nativeEvent;
    if (typeof InputEvent === "undefined" || !(ne instanceof InputEvent)) return;
    // Huruf ditangani di onInput agar tidak dobel. Hapus = lepas target.
    if (ne.inputType.startsWith("delete")) {
      e.preventDefault();
      engineRef.current?.cancelTarget();
      clearPlayInput();
    }
  };

  const onPlayCompositionEnd = (e: CompositionEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
    e.currentTarget.value = "";
    if (v) drainLetters(v);
  };

  const onPlayKeyDown = (e: RKeyboardEvent<HTMLInputElement>) => {
    if (screenRef.current !== "playing") return;
    if (e.key === "Enter") {
      e.preventDefault();
      engineRef.current?.throwGrenade();
      clearPlayInput();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      engineRef.current?.cancelTarget();
      clearPlayInput();
    } else if (e.key === " ") {
      e.preventDefault();
    } else if (e.key === "Escape") {
      e.preventDefault();
      pause();
    }
  };

  /* ---------- keyboard fisik (desktop) + pintasan ---------- */
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
        if (tgt === playInputRef.current) return;
        if (e.key === "Escape") {
          e.preventDefault();
          pause();
        } else if (e.key === "Enter") {
          e.preventDefault();
          eng.throwGrenade();
        } else if (e.key === "Backspace") {
          e.preventDefault();
          eng.cancelTarget();
        } else if (e.key.length === 1 && isLetter(e.key)) {
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
    const onBlur = () => {
      // Di HP, buka keyboard bawaan sering memicu window.blur — jangan jeda.
      if (isTouchRef.current) return;
      if (document.activeElement === playInputRef.current) return;
      pause();
    };
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

  const onGrenade = useCallback(() => {
    engineRef.current?.throwGrenade();
  }, []);

  const onStagePointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (screenRef.current !== "playing" || !isTouchRef.current) return;
    if ((e.target as HTMLElement).closest("button")) return;
    focusPlayInput();
  };

  const showMobileBar = isTouch && screen === "playing";

  return (
    <div ref={rootRef} className="fixed flex select-none flex-col bg-[#040807]" style={{ top: 0, left: 0, width: "100%", height: "100%" }}>
      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ touchAction: "none" }}
        onPointerDown={onStagePointerDown}
      >
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

      {showMobileBar && (
        <MobileInputBar
          ref={playInputRef}
          grenades={grenades}
          hint={hint}
          focused={kbFocused}
          onGrenade={onGrenade}
          onInput={onPlayInput}
          onBeforeInput={onPlayBeforeInput}
          onKeyDown={onPlayKeyDown}
          onCompositionEnd={onPlayCompositionEnd}
          onFocus={() => setKbFocused(true)}
          onBlur={() => setKbFocused(false)}
        />
      )}

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
