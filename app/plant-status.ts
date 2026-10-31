import { daysUntilWatering, todayISO, type Plant } from "@/lib/plants";
import { diffDays } from "@/lib/seedlings";
import type { GaugeTone } from "./gauge";

/** Avancement vers le prochain arrosage : la jauge est pleine le jour de l'échéance. */
export function wateringGauge(plant: Plant): { ratio: number; tone: GaugeTone; caption: string } {
  const days = daysUntilWatering(plant);
  const elapsed = diffDays(plant.lastWatered, todayISO());
  const ratio = plant.wateringEveryDays > 0 ? elapsed / plant.wateringEveryDays : 1;
  if (days < 0) return { ratio: 1, tone: "alert", caption: `En retard de ${-days} j` };
  if (days === 0) return { ratio: 1, tone: "sun", caption: "À arroser aujourd'hui" };
  if (days === 1) return { ratio, tone: "rain", caption: "À arroser demain" };
  return { ratio, tone: "rain", caption: `Prochain arrosage dans ${days} j` };
}
