import Link from "next/link";
import { buildMonth, monthKey, shiftMonth, type EventKind } from "@/lib/calendar";
import type { Plant } from "@/lib/plants";
import type { Seedling } from "@/lib/seedlings";
import { Icon, type IconName } from "./icons";
import { KINDS, PLANT_KINDS, SEEDLING_KINDS } from "./kinds";

const WEEKDAYS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const MAX_VISIBLE = 3;

const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export default function WateringCalendar({
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
  const weeks = buildMonth(plants, seedlings, year, month);
  const label = monthFmt.format(new Date(Date.UTC(year, month - 1, 1)));
  const key = monthKey(year, month);
  const nav =
    "grid h-9 w-9 place-items-center rounded-lg text-green-800 shadow-[inset_0_0_0_1px_var(--color-green-300)] hover:bg-green-100";

  // Nombre d'événements de chaque type dans le mois affiché (hors jours des mois voisins)
  const counts = new Map<EventKind, number>();
  for (const day of weeks.flat()) {
    if (!day.inMonth) continue;
    for (const ev of day.events) counts.set(ev.kind, (counts.get(ev.kind) ?? 0) + 1);
  }
  const groups: { id: string; title: string; icon: IconName; kinds: EventKind[] }[] = [
    { id: "legende-arrosage", title: "Arrosage", icon: "drop", kinds: PLANT_KINDS },
    ...(seedlings.length > 0
      ? [{ id: "legende-semis", title: "Semis", icon: "sprout" as const, kinds: SEEDLING_KINDS }]
      : []),
  ];

  return (
    <section aria-labelledby="calendrier" className="panel grid gap-4 p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="calendrier" className="text-2xl capitalize sm:text-3xl">
          {label}
        </h2>
        <nav aria-label="Navigation du calendrier" className="flex items-center gap-2">
          {key !== currentMonth && (
            <Link href="/" className="btn-quiet">
              Aujourd'hui
            </Link>
          )}
          <Link href={`/?mois=${shiftMonth(year, month, -1)}`} className={nav} aria-label="Mois précédent">
            <Icon name="left" />
          </Link>
          <Link href={`/?mois=${shiftMonth(year, month, 1)}`} className={nav} aria-label="Mois suivant">
            <Icon name="right" />
          </Link>
        </nav>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-line text-xs shadow-[0_0_0_1px_var(--color-line)]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-green-50 py-2 text-center font-medium text-muted">
            {d}
          </div>
        ))}
        {weeks.flat().map((day) => {
          const visible = day.events.slice(0, MAX_VISIBLE);
          const hidden = day.events.length - visible.length;
          return (
            <div
              key={day.date}
              className={`min-h-16 p-1 sm:min-h-24 sm:p-1.5 ${day.inMonth ? "bg-surface" : "bg-green-50/80"}`}
              aria-label={dayFmt.format(new Date(day.date + "T00:00:00Z"))}
            >
              <div
                className={`mb-1 grid h-6 w-6 place-items-center rounded-full text-xs ${
                  day.isToday
                    ? "bg-ink font-semibold text-surface"
                    : day.inMonth
                      ? "font-medium text-ink"
                      : "text-muted/60"
                }`}
              >
                {day.day}
              </div>
              <ul className="flex flex-wrap gap-0.5 sm:grid sm:gap-1">
                {visible.map((ev) => {
                  const k = KINDS[ev.kind];
                  return (
                    <li key={`${ev.id}-${ev.kind}`} className="min-w-0">
                      <Link
                        href={ev.href}
                        title={`${ev.name} : ${k.label}`}
                        className={`flex items-center gap-1 truncate rounded-r-md border-l-2 px-1 py-0.5 text-[10px] leading-tight hover:brightness-95 sm:text-[11px] ${k.chip} ${
                          day.inMonth ? "" : "opacity-60"
                        }`}
                      >
                        {/* Mobile : deux lettres ; à partir de sm : icône et nom complet */}
                        <Icon name={k.icon} className="hidden h-3 w-3 sm:block" />
                        <span aria-hidden className="font-semibold sm:hidden">
                          {ev.name.slice(0, 2)}
                        </span>
                        <span className="sr-only sm:not-sr-only sm:truncate">{ev.name}</span>
                        <span className="sr-only"> : {k.label}</span>
                      </Link>
                    </li>
                  );
                })}
                {hidden > 0 && (
                  <li
                    className="px-1 text-[10px] text-muted"
                    title={day.events
                      .slice(MAX_VISIBLE)
                      .map((e) => e.name)
                      .join(", ")}
                  >
                    +{hidden}
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className={`grid gap-x-10 gap-y-5 border-t border-line pt-4 ${groups.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {groups.map((g) => (
          <div key={g.id} role="group" aria-labelledby={g.id} className="grid content-start gap-2">
            <div className="flex items-center gap-2 border-b border-line/70 pb-1.5">
              <Icon name={g.icon} className="h-4 w-4 text-green-600" />
              <h3 id={g.id} className="font-sans text-sm font-semibold tracking-normal">
                {g.title}
              </h3>
              <span className="ml-auto text-xs text-muted">ce mois-ci</span>
            </div>
            <ul className="grid gap-1.5 text-sm">
              {g.kinds.map((k) => {
                const n = counts.get(k) ?? 0;
                return (
                  <li key={k} className={`flex items-center gap-2.5 ${n === 0 ? "opacity-50" : ""}`}>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${KINDS[k].dot}`}>
                      <Icon name={KINDS[k].icon} className="h-3 w-3" />
                    </span>
                    <span className="text-muted">{KINDS[k].legend}</span>
                    <span className="ml-auto font-semibold tabular-nums text-ink">
                      {n}
                      <span className="sr-only"> ce mois-ci</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
