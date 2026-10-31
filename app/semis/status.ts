import {
  diffDays,
  expectedGermination,
  type Seedling,
  type SeedlingStatus,
} from "@/lib/seedlings";
import { todayISO } from "@/lib/plants";
import type { GaugeTone } from "../gauge";

export const STATUS_CLS: Record<SeedlingStatus, string> = {
  seme: "bg-leaf/25 text-leaf-deep",
  leve: "bg-fern/15 text-fern-deep",
  transplante: "bg-green-100 text-green-800",
  echec: "bg-line/60 text-muted",
};

const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return fmt.format(new Date(Date.UTC(y, m - 1, d)));
}

/** Phrase décrivant où en est le semis (levée attendue, retard, levée constatée…). */
export function progress(s: Seedling): { text: string; late: boolean } {
  if (s.status === "seme") {
    const expected = expectedGermination(s);
    const days = diffDays(todayISO(), expected);
    if (days > 1) return { text: `Levée attendue le ${formatDate(expected)} (dans ${days} j)`, late: false };
    if (days === 1) return { text: "Levée attendue demain", late: false };
    if (days === 0) return { text: "Levée attendue aujourd'hui", late: false };
    return { text: `Levée attendue depuis ${-days} j (prévue le ${formatDate(expected)})`, late: true };
  }
  if (s.status === "leve" && s.germinatedOn) {
    const took = diffDays(s.sownOn, s.germinatedOn);
    return {
      text: `${s.germinatedCount ?? s.quantity}/${s.quantity} levé${(s.germinatedCount ?? s.quantity) > 1 ? "s" : ""} le ${formatDate(s.germinatedOn)} (après ${took} j)`,
      late: false,
    };
  }
  if (s.status === "transplante") return { text: "Transplanté : la plante est dans votre collection", late: false };
  return { text: "Semis non abouti", late: false };
}

/** Avancement vers la levée attendue : la jauge est pleine à la date prévue. */
export function germinationGauge(s: Seedling): { ratio: number; tone: GaugeTone; caption: string } | undefined {
  if (s.status !== "seme") return undefined;
  const days = diffDays(todayISO(), expectedGermination(s));
  const elapsed = diffDays(s.sownOn, todayISO());
  const ratio = s.germinationDays > 0 ? elapsed / s.germinationDays : 1;
  if (days < 0) return { ratio: 1, tone: "alert", caption: `Levée attendue depuis ${-days} j` };
  if (days === 0) return { ratio: 1, tone: "sun", caption: "Levée attendue aujourd'hui" };
  if (days === 1) return { ratio, tone: "leaf", caption: "Levée attendue demain" };
  return { ratio, tone: "leaf", caption: `Levée attendue dans ${days} j` };
}
