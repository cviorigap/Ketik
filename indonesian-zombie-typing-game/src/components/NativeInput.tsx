import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Input teks tersembunyi untuk memunculkan KEYBOARD BAWAAN HP (iOS / Android).
 *
 * - Huruf dibaca dari event `input` (bukan `keydown`), karena keyboard virtual
 *   Android (Gboard, dll.) mengirim keydown "Unidentified" (keyCode 229).
 * - Nilai input dibandingkan dengan nilai sebelumnya, sehingga tetap bekerja
 *   baik saat keyboard mengirim huruf langsung maupun lewat "composition".
 * - `autocomplete="off"` → Chrome Android memberi flag NO_SUGGESTIONS ke keyboard
 *   (tanpa saran kata), `autocorrect/autocapitalize` dimatikan.
 */

export const NATIVE_INPUT_ID = "ketik-input";

export interface NativeInputHandle {
  /** Fokus & munculkan keyboard — harus dipanggil langsung dari ketukan/klik. */
  focus: () => void;
  /** Lepas lalu fokus ulang: memaksa keyboard muncul lagi (mis. setelah tombol "kembali" Android). */
  refocus: () => void;
  /** Tutup keyboard tanpa memicu callback onBlur. */
  blur: () => void;
  isFocused: () => boolean;
}

interface Props {
  onChar: (ch: string) => void;
  onBackspace: () => void;
  /** Dipanggil bila keyboard ditutup pengguna (input kehilangan fokus). */
  onBlur: () => void;
}

const MAX_COMPOSE = 48;

export const NativeInput = forwardRef<NativeInputHandle, Props>(function NativeInput(props, ref) {
  const el = useRef<HTMLInputElement>(null);
  const cb = useRef(props);
  cb.current = props;
  const st = useRef({ prev: "", composing: false, quiet: false });

  useImperativeHandle(ref, () => {
    const quietBlur = (i: HTMLInputElement) => {
      st.current.quiet = true;
      try {
        i.blur();
      } finally {
        st.current.quiet = false;
      }
    };
    return {
      focus() {
        const i = el.current;
        if (i && document.activeElement !== i) i.focus({ preventScroll: true });
      },
      refocus() {
        const i = el.current;
        if (!i) return;
        if (document.activeElement === i) quietBlur(i);
        i.focus({ preventScroll: true });
      },
      blur() {
        const i = el.current;
        if (i && document.activeElement === i) quietBlur(i);
      },
      isFocused: () => !!el.current && document.activeElement === el.current,
    };
  }, []);

  useEffect(() => {
    const i = el.current;
    if (!i) return;
    const s = st.current;

    const clear = () => {
      if (i.value !== "") i.value = "";
      s.prev = "";
    };

    // Bandingkan nilai sekarang dengan sebelumnya → huruf baru / hapus.
    const sync = (inputType: string) => {
      const val = i.value;
      const pv = s.prev.toLowerCase();
      const nv = val.toLowerCase();
      if (nv.length > pv.length && nv.startsWith(pv)) {
        const added = nv.slice(pv.length);
        for (let k = 0; k < added.length; k++) {
          const ch = added[k];
          if (ch >= "a" && ch <= "z") cb.current.onChar(ch);
        }
      } else if (nv.length < pv.length && pv.startsWith(nv)) {
        cb.current.onBackspace();
      } else if (inputType.startsWith("delete")) {
        cb.current.onBackspace();
      }
      // penggantian oleh autocorrect/saran diabaikan, cukup catat nilainya
      s.prev = val;
    };

    const onInput = (e: Event) => {
      const ie = e as InputEvent;
      sync(ie.inputType || "");
      // Jangan kosongkan input di tengah "composition" (bisa membuat huruf ganda di beberapa keyboard)
      if (!s.composing && !ie.isComposing) clear();
      else if (i.value.length > MAX_COMPOSE) clear();
    };
    const onCompStart = () => {
      s.composing = true;
    };
    const onCompEnd = () => {
      s.composing = false;
      // Firefox mengirim event input terakhir SETELAH compositionend
      window.setTimeout(() => {
        if (s.composing) return;
        sync("");
        clear();
      }, 0);
    };
    const onFocus = () => {
      s.composing = false;
      clear();
    };
    const onBlur = () => {
      s.composing = false;
      clear();
      if (!s.quiet) cb.current.onBlur();
    };

    i.addEventListener("input", onInput);
    i.addEventListener("compositionstart", onCompStart);
    i.addEventListener("compositionend", onCompEnd);
    i.addEventListener("focus", onFocus);
    i.addEventListener("blur", onBlur);
    return () => {
      i.removeEventListener("input", onInput);
      i.removeEventListener("compositionstart", onCompStart);
      i.removeEventListener("compositionend", onCompEnd);
      i.removeEventListener("focus", onFocus);
      i.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <input
      ref={el}
      id={NATIVE_INPUT_ID}
      type="text"
      name="ketik-zombi"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      enterKeyHint="enter"
      aria-label="Ketik kata untuk menembak zombi"
      data-form-type="other"
      data-lpignore="true"
      tabIndex={-1}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        margin: 0,
        padding: 0,
        border: 0,
        outline: "none",
        opacity: 0,
        fontSize: 16, // ≥16px: iOS tidak melakukan zoom saat fokus
        color: "transparent",
        caretColor: "transparent",
        background: "transparent",
        pointerEvents: "none",
      }}
    />
  );
});
