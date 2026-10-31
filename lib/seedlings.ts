import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createPlant, todayISO } from "./plants";

export type SeedlingStatus = "seme" | "leve" | "transplante" | "echec";

export const STATUS_LABELS: Record<SeedlingStatus, string> = {
  seme: "Semé",
  leve: "Levé",
  transplante: "Transplanté",
  echec: "Échec",
};

export type Seedling = {
  id: string;
  name: string;
  species: string;
  sownOn: string; // date de semis (YYYY-MM-DD)
  quantity: number; // nombre de graines semées
  germinationDays: number; // délai de levée attendu, en jours
  location: string;
  notes: string;
  status: SeedlingStatus;
  germinatedOn?: string; // date de levée constatée
  germinatedCount?: number; // nombre de graines levées
  plantId?: string; // plante créée lors du transplantage
  createdAt: string;
};

export type SeedlingInput = Pick<
  Seedling,
  "name" | "species" | "sownOn" | "quantity" | "germinationDays" | "location" | "notes"
>;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "seedlings.json");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Arithmétique de dates en UTC : aucun décalage possible lié à l'heure d'été. */
export function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates ISO (b - a). */
export function diffDays(a: string, b: string): number {
  const t = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(b) - t(a)) / 86_400_000);
}

export function expectedGermination(s: Seedling): string {
  return shiftISO(s.sownOn, s.germinationDays);
}

async function readAll(): Promise<Seedling[]> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as Seedling[];
  } catch {
    return [];
  }
}

async function writeAll(items: Seedling[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

/** Date saisie valide et non future, sinon aujourd'hui. */
function cleanDate(date: string | undefined): string {
  const today = todayISO();
  return date && ISO_DATE.test(date) && date <= today ? date : today;
}

export async function listSeedlings(): Promise<Seedling[]> {
  const items = await readAll();
  return items.sort((a, b) => (a.sownOn < b.sownOn ? 1 : a.sownOn > b.sownOn ? -1 : 0));
}

export async function getSeedling(id: string): Promise<Seedling | undefined> {
  return (await readAll()).find((s) => s.id === id);
}

export async function createSeedling(input: SeedlingInput): Promise<Seedling> {
  const items = await readAll();
  const seedling: Seedling = {
    ...input,
    sownOn: cleanDate(input.sownOn),
    status: "seme",
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  items.push(seedling);
  await writeAll(items);
  return seedling;
}

export async function updateSeedling(id: string, input: SeedlingInput): Promise<void> {
  const items = await readAll();
  const i = items.findIndex((s) => s.id === id);
  if (i === -1) return;
  items[i] = { ...items[i], ...input, sownOn: cleanDate(input.sownOn) };
  await writeAll(items);
}

export async function deleteSeedling(id: string): Promise<void> {
  await writeAll((await readAll()).filter((s) => s.id !== id));
}

/** Marque le semis comme levé. La date ne peut pas précéder le semis ; le nombre est borné à la quantité semée. */
export async function markGerminated(id: string, date?: string, count?: number): Promise<void> {
  const items = await readAll();
  const s = items.find((x) => x.id === id);
  if (!s) return;
  const day = cleanDate(date);
  s.status = "leve";
  s.germinatedOn = day < s.sownOn ? s.sownOn : day;
  const n = Number.isFinite(count) && count! > 0 ? Math.round(count!) : s.quantity;
  s.germinatedCount = Math.min(n, s.quantity);
  await writeAll(items);
}

export async function markFailed(id: string): Promise<void> {
  const items = await readAll();
  const s = items.find((x) => x.id === id);
  if (!s) return;
  s.status = "echec";
  await writeAll(items);
}

/** Remet un semis à l'état « semé » (correction d'une erreur de saisie). */
export async function resetSeedling(id: string): Promise<void> {
  const items = await readAll();
  const s = items.find((x) => x.id === id);
  if (!s || s.status === "transplante") return;
  s.status = "seme";
  delete s.germinatedOn;
  delete s.germinatedCount;
  await writeAll(items);
}

/** Crée une plante à partir du semis levé et la rattache. Renvoie l'id de la plante, ou undefined. */
export async function transplant(id: string): Promise<string | undefined> {
  const items = await readAll();
  const s = items.find((x) => x.id === id);
  if (!s || s.status !== "leve") return undefined;
  const plant = await createPlant({
    name: s.name,
    species: s.species,
    location: s.location,
    light: "moyenne",
    wateringEveryDays: 7,
    lastWatered: todayISO(),
    notes: [s.notes, `Issu d'un semis du ${s.sownOn}.`].filter(Boolean).join("\n"),
  });
  s.status = "transplante";
  s.plantId = plant.id;
  await writeAll(items);
  return plant.id;
}
