export type Difficulty = "mudah" | "sedang" | "sulit";

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  letters: string;
  tagline: string;
  sample: string[];
  /** Detik yang dibutuhkan zombi biasa untuk mencapai barikade di gelombang 1 */
  travel: number;
  minTravel: number;
  /** Jeda kemunculan zombi di gelombang 1 */
  interval: number;
  minInterval: number;
  baseCount: number;
  perWave: number;
  maxAlive: number;
  maxAliveCap: number;
  scoreMul: number;
  accent: string;
  key: string;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  mudah: {
    id: "mudah",
    label: "Mudah",
    letters: "3 huruf",
    tagline: "Pemanasan penyintas",
    sample: ["API", "BOM", "DOR"],
    travel: 9.5,
    minTravel: 4.2,
    interval: 2.0,
    minInterval: 0.7,
    baseCount: 8,
    perWave: 3,
    maxAlive: 3,
    maxAliveCap: 8,
    scoreMul: 1,
    accent: "#a3ff3c",
    key: "1",
  },
  sedang: {
    id: "sedang",
    label: "Sedang",
    letters: "4–5 huruf",
    tagline: "Kota mulai gelap",
    sample: ["OTAK", "MAYAT", "KABUR"],
    travel: 10.5,
    minTravel: 4.8,
    interval: 2.4,
    minInterval: 1.0,
    baseCount: 8,
    perWave: 3,
    maxAlive: 3,
    maxAliveCap: 7,
    scoreMul: 1.5,
    accent: "#ffb020",
    key: "2",
  },
  sulit: {
    id: "sulit",
    label: "Sulit",
    letters: "6–8 huruf",
    tagline: "Kiamat zombi",
    sample: ["POCONG", "KUBURAN", "BARIKADE"],
    travel: 12,
    minTravel: 5.6,
    interval: 3.0,
    minInterval: 1.3,
    baseCount: 7,
    perWave: 3,
    maxAlive: 3,
    maxAliveCap: 6,
    scoreMul: 2,
    accent: "#ff3b3b",
    key: "3",
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["mudah", "sedang", "sulit"];
