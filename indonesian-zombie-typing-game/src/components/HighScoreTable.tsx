import type { ScoreEntry } from "../game/storage";

const MEDALS = ["#ffd23a", "#d9dee3", "#e0955a"];

interface Props {
  entries: ScoreEntry[];
  highlight?: number;
}

export function HighScoreTable({ entries, highlight = -1 }: Props) {
  if (!entries.length) {
    return (
      <div className="py-8 text-center text-sm text-stone-400">
        Belum ada skor. <span className="text-lime-300">Jadilah penyintas pertama!</span>
      </div>
    );
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[10px] font-bold tracking-[0.2em] text-stone-400">
          <th className="py-2 pl-3 text-left w-9">#</th>
          <th className="py-2 text-left">NAMA</th>
          <th className="py-2 text-right">SKOR</th>
          <th className="py-2 text-right pl-2 pr-3 sm:pr-0">GEL.</th>
          <th className="py-2 pr-3 text-right pl-2 hidden sm:table-cell">WPM</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, i) => {
          const hi = i === highlight;
          return (
            <tr
              key={`${e.date}-${i}`}
              className={
                hi
                  ? "bg-lime-300/15 text-lime-100 outline outline-1 outline-lime-300/40"
                  : i % 2
                    ? "bg-white/[0.03]"
                    : ""
              }
            >
              <td className="py-1.5 pl-3">
                {i < 3 ? (
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold text-black"
                    style={{ background: MEDALS[i] }}
                  >
                    {i + 1}
                  </span>
                ) : (
                  <span className="font-mono text-xs text-stone-400">{i + 1}</span>
                )}
              </td>
              <td className="py-1.5 max-w-[9rem] truncate font-bold">{e.name}</td>
              <td className="py-1.5 text-right font-mono font-extrabold tabular-nums">{e.score.toLocaleString("id-ID")}</td>
              <td className="py-1.5 pl-2 pr-3 text-right font-mono tabular-nums text-stone-300 sm:pr-0">{e.wave}</td>
              <td className="py-1.5 pl-2 pr-3 text-right font-mono tabular-nums text-stone-300 hidden sm:table-cell">{e.wpm}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
