import type { Difficulty } from "./config";

export interface ScoreEntry {
  name: string;
  score: number;
  wave: number;
  wpm: number;
  acc: number;
  kills: number;
  date: number;
}

export type Board = Record<Difficulty, ScoreEntry[]>;

export interface Settings {
  sound: boolean;
  name: string;
  difficulty: Difficulty;
}

const SCORE_KEY = "ketik-atau-mati:scores:v1";
const SETTINGS_KEY = "ketik-atau-mati:settings:v1";
export const MAX_ENTRIES = 10;

const emptyBoard = (): Board => ({ mudah: [], sedang: [], sulit: [] });

export function loadBoard(): Board {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return emptyBoard();
    const parsed = JSON.parse(raw) as Partial<Board>;
    const b = emptyBoard();
    (Object.keys(b) as Difficulty[]).forEach((k) => {
      const list = Array.isArray(parsed[k]) ? parsed[k]! : [];
      b[k] = list
        .filter((e) => e && typeof e.score === "number")
        .sort((a, c) => c.score - a.score)
        .slice(0, MAX_ENTRIES);
    });
    return b;
  } catch {
    return emptyBoard();
  }
}

/** Menyimpan skor, mengembalikan peringkat (0-based) atau -1 bila tidak masuk papan. */
export function addScore(diff: Difficulty, entry: ScoreEntry): number {
  const board = loadBoard();
  const list = [...board[diff], entry].sort((a, b) => b.score - a.score || a.date - b.date);
  const rank = list.indexOf(entry);
  board[diff] = list.slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(board));
  } catch {
    /* penyimpanan penuh / diblokir */
  }
  return rank < MAX_ENTRIES ? rank : -1;
}

export function bestScore(diff: Difficulty): number {
  return loadBoard()[diff][0]?.score ?? 0;
}

export function loadSettings(): Settings {
  const def: Settings = { sound: true, name: "PENYINTAS", difficulty: "mudah" };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return def;
    const s = JSON.parse(raw) as Partial<Settings>;
    return {
      sound: typeof s.sound === "boolean" ? s.sound : def.sound,
      name: typeof s.name === "string" && s.name.trim() ? s.name.slice(0, 12) : def.name,
      difficulty:
        s.difficulty === "mudah" || s.difficulty === "sedang" || s.difficulty === "sulit"
          ? s.difficulty
          : def.difficulty,
    };
  } catch {
    return def;
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* abaikan */
  }
}
