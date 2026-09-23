import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { PointerEvent as RPointerEvent } from "react";
import { BackspaceIcon, GrenadeIcon } from "./Icons";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export interface TouchKeyboardHandle {
  setHint: (ch: string | null) => void;
}

interface Props {
  grenades: number;
  onKey: (ch: string) => boolean;
  onBackspace: () => void;
  onGrenade: () => void;
}

export const TouchKeyboard = forwardRef<TouchKeyboardHandle, Props>(function TouchKeyboard(
  { grenades, onKey, onBackspace, onGrenade },
  ref,
) {
  const keys = useRef(new Map<string, HTMLElement>());
  const hint = useRef<string | null>(null);
  const timers = useRef(new Map<HTMLElement, number>());
  const cb = useRef({ onKey, onBackspace, onGrenade });
  cb.current = { onKey, onBackspace, onGrenade };

  useImperativeHandle(
    ref,
    () => ({
      setHint(ch) {
        if (hint.current === ch) return;
        if (hint.current) keys.current.get(hint.current)?.classList.remove("hint");
        hint.current = ch;
        if (ch) keys.current.get(ch)?.classList.add("hint");
      },
    }),
    [],
  );

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => clearTimeout(id));
  }, []);

  const flashKey = (el: HTMLElement, cls: "down" | "bad") => {
    el.classList.remove("down", "bad");
    el.classList.add(cls);
    const old = timers.current.get(el);
    if (old) clearTimeout(old);
    timers.current.set(
      el,
      window.setTimeout(() => el.classList.remove(cls), 110),
    );
  };

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-k]");
    if (!el) return;
    e.preventDefault();
    const k = el.dataset.k!;
    if (k === "BACK") {
      cb.current.onBackspace();
      flashKey(el, "down");
    } else if (k === "BOMB") {
      cb.current.onGrenade();
      flashKey(el, "down");
    } else {
      const ok = cb.current.onKey(k);
      flashKey(el, ok ? "down" : "bad");
    }
  };

  return (
    <div
      className="kb relative z-10 shrink-0"
      onPointerDown={onPointerDown}
      onContextMenu={(e) => e.preventDefault()}
      role="group"
      aria-label="Keyboard permainan"
    >
      {ROWS.map((row, r) => (
        <div className="kb-row" key={row} style={r === 1 ? { padding: "0 4.5%" } : undefined}>
          {r === 2 && (
            <div data-k="BOMB" className={`kb-key wide grenade ${grenades <= 0 ? "empty" : ""}`} aria-label={`Granat (${grenades})`}>
              <GrenadeIcon className="w-5 h-5" />
              <span className="ml-0.5 font-mono text-sm font-extrabold">{grenades}</span>
            </div>
          )}
          {row.split("").map((ch) => (
            <div
              key={ch}
              data-k={ch}
              data-label={ch}
              className="kb-key"
              ref={(el) => {
                if (el) keys.current.set(ch, el);
              }}
            >
              {ch}
            </div>
          ))}
          {r === 2 && (
            <div data-k="BACK" className="kb-key wide" aria-label="Lepas target">
              <BackspaceIcon className="w-6 h-6" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
