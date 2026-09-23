import { forwardRef } from "react";
import type { FormEvent, KeyboardEvent, CompositionEvent } from "react";
import { GrenadeIcon } from "./Icons";

interface Props {
  grenades: number;
  hint: string | null;
  focused: boolean;
  onGrenade: () => void;
  onInput: (e: FormEvent<HTMLInputElement>) => void;
  onBeforeInput: (e: FormEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onCompositionEnd: (e: CompositionEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const MobileInputBar = forwardRef<HTMLInputElement, Props>(function MobileInputBar(
  {
    grenades,
    hint,
    focused,
    onGrenade,
    onInput,
    onBeforeInput,
    onKeyDown,
    onCompositionEnd,
    onFocus,
    onBlur,
  },
  ref,
) {
  return (
    <div className="mobile-bar relative z-10 shrink-0">
      <div className={`mobile-bar-field ${focused ? "is-on" : "is-off"}`}>
        <input
          ref={ref}
          className="mobile-bar-input"
          id="play-type"
          name="play-type"
          type="text"
          inputMode="text"
          enterKeyHint="go"
          lang="id"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          maxLength={24}
          aria-label="Ketik kata untuk menembak"
          onInput={onInput}
          onBeforeInput={onBeforeInput}
          onKeyDown={onKeyDown}
          onCompositionEnd={onCompositionEnd}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-2.5 px-3">
          {focused ? (
            hint ? (
              <>
                <span className="text-[10px] font-bold tracking-[0.28em] text-stone-400">KETIK</span>
                <span className="mobile-bar-letter">{hint}</span>
                <span className="truncate text-xs text-stone-400">di keyboard HP-mu</span>
              </>
            ) : (
              <span className="truncate text-sm font-bold tracking-wide text-lime-200/90">
                Ketik huruf pertama kata di atas zombi
              </span>
            )
          ) : (
            <span className="truncate text-sm font-extrabold tracking-wide text-lime-300">Ketuk di sini untuk mengetik</span>
          )}
        </div>
      </div>
      <button
        type="button"
        className={`mobile-bar-bomb ${grenades <= 0 ? "empty" : ""}`}
        aria-label={`Lempar granat (${grenades} tersisa)`}
        onPointerDown={(e) => e.preventDefault()}
        onClick={onGrenade}
      >
        <GrenadeIcon className="h-6 w-6" />
        <span className="font-mono text-base font-extrabold">{grenades}</span>
      </button>
    </div>
  );
});
