import type { EventKind } from "@/lib/calendar";
import type { IconName } from "./icons";

/** Un seul endroit décide de l'apparence de chaque type d'événement du calendrier. */
export const KINDS: Record<
  EventKind,
  {
    legend: string; // libellé de la légende
    label: string; // phrase lue avec le nom (infobulle, lecteur d'écran)
    icon: IconName;
    chip: string; // étiquette dans le calendrier du mois
    dot: string; // pastille dans la vue de l'année
    priority: number; // plus petit = plus urgent
  }
> = {
  overdue: {
    legend: "En retard",
    label: "arrosage en retard",
    icon: "alert",
    chip: "border-alert bg-alert/10 text-alert",
    dot: "bg-alert text-white font-semibold",
    priority: 0,
  },
  late: {
    legend: "Levée en retard",
    label: "levée attendue, pas encore constatée",
    icon: "hourglass",
    chip: "border-ember bg-ember/10 text-ember",
    dot: "bg-ember text-white font-semibold",
    priority: 1,
  },
  due: {
    legend: "À arroser aujourd'hui",
    label: "à arroser aujourd'hui",
    icon: "drop",
    chip: "border-sun bg-sun/20 text-sun-deep",
    dot: "bg-sun text-ink font-semibold",
    priority: 2,
  },
  planned: {
    legend: "Prévu",
    label: "arrosage prévu",
    icon: "drop",
    chip: "border-rain bg-rain/10 text-rain-deep",
    dot: "bg-rain/15 text-rain-deep ring-1 ring-inset ring-rain",
    priority: 3,
  },
  expected: {
    legend: "Levée attendue",
    label: "levée attendue",
    icon: "hourglass",
    chip: "border-dusk bg-dusk/10 text-dusk",
    dot: "bg-dusk/10 text-dusk ring-1 ring-inset ring-dusk",
    priority: 4,
  },
  germinated: {
    legend: "Levée constatée",
    label: "levé",
    icon: "leaf",
    chip: "border-fern bg-fern/10 text-fern-deep",
    dot: "bg-fern text-white",
    priority: 5,
  },
  sown: {
    legend: "Semé",
    label: "semé",
    icon: "sprout",
    chip: "border-leaf bg-leaf/25 text-leaf-deep",
    dot: "bg-leaf text-ink",
    priority: 6,
  },
  done: {
    legend: "Fait",
    label: "arrosée",
    icon: "check",
    chip: "border-green-500 bg-green-100 text-green-800",
    dot: "bg-green-700 text-white",
    priority: 7,
  },
};

export const PLANT_KINDS: EventKind[] = ["done", "planned", "due", "overdue"];
export const SEEDLING_KINDS: EventKind[] = ["sown", "expected", "late", "germinated"];

/** Couleurs de l'état de santé, partagées par la liste et les fiches. */
export const HEALTH_CLS: Record<"bonne" | "moyenne" | "mauvaise", string> = {
  bonne: "bg-green-100 text-green-800",
  moyenne: "bg-[#f7e5bf] text-sun-deep",
  mauvaise: "bg-[#f4d9d4] text-alert",
};
