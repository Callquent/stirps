import Link from "next/link";
import { buildMonth, monthKey, shiftMonth, type CalendarDay } from "@/lib/calendar";
import type { Plant } from "@/lib/plants";
import type { Seedling } from "@/lib/seedlings";
import { Icon } from "./icons";
import { KINDS } from "./kinds";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" });

/** Un jour prend l'apparence de son événement le plus urgent. */
function dotClass(day: CalendarDay): string {
  const top = [...day.events].sort((a, b) => KINDS[a.kind].priority - KINDS[b.kind].priority)[0];
  return top ? KINDS[top.kind].dot : "text-muted";
}

function summary(day: CalendarDay): string | undefined {
  return day.events.length ? day.events.map((e) => e.name).join(", ") : undefined;
}

export default function YearOverview({
  plants,
  seedlings,
  year,
  month,
  currentMonth,
}: {
  plants: Plant[];
  seedlings: Seedling[];
  year: number;
  month: number;
  currentMonth: string;
}) {
  const nav =
    "grid h-9 w-9 place-items-center rounded-lg text-green-800 shadow-[inset_0_0_0_1px_var(--color-green-300)] hover:bg-green-100";
  const selected = monthKey(year, month);

  return (
    <section aria-labelledby="annee" className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="annee" className="text-2xl">
          {year}
        </h2>
        <nav aria-label="Navigation de l'année" className="flex items-center gap-2">
          {Number(currentMonth.slice(0, 4)) !== year && (
            <Link href="/" className="btn-quiet">
              Revenir à aujourd'hui
            </Link>
          )}
          <Link href={`/?mois=${shiftMonth(year, month, -12)}`} className={nav} aria-label="Année précédente">
            <Icon name="left" />
          </Link>
          <Link href={`/?mois=${shiftMonth(year, month, 12)}`} className={nav} aria-label="Année suivante">
            <Icon name="right" />
          </Link>
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const key = monthKey(year, m);
          const weeks = buildMonth(plants, seedlings, year, m);
          const isSelected = key === selected;
          const isCurrent = key === currentMonth;
          const name = monthFmt.format(new Date(Date.UTC(year, m - 1, 1)));
          return (
            <Link
              key={key}
              href={`/?mois=${key}`}
              aria-label={`${name} ${year}`}
              aria-current={isSelected ? "date" : undefined}
              className={`block rounded-xl bg-surface p-2.5 transition-shadow hover:shadow-md ${
                isSelected
                  ? "shadow-[inset_0_0_0_2px_var(--color-green-700)]"
                  : "shadow-[inset_0_0_0_1px_var(--color-line)]"
              }`}
            >
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className={`font-display text-[15px] capitalize ${isCurrent ? "text-green-700" : ""}`}>{name}</span>
                {isCurrent && <span className="text-xs font-semibold text-green-700">en cours</span>}
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] leading-none">
                {WEEKDAYS.map((d, i) => (
                  <span key={i} className="pb-1 text-muted/70">
                    {d}
                  </span>
                ))}
                {weeks.flat().map((day) =>
                  day.inMonth ? (
                    <span key={day.date} title={summary(day)} className="grid h-6 place-items-center">
                      <span
                        className={`grid h-[1.4em] w-[1.4em] place-items-center rounded-full text-[10px] sm:text-[11px] ${dotClass(day)} ${
                          day.isToday ? "outline outline-2 outline-offset-1 outline-ink" : ""
                        }`}
                      >
                        {day.day}
                      </span>
                    </span>
                  ) : (
                    <span key={day.date} aria-hidden />
                  ),
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
