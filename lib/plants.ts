import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Light = "faible" | "moyenne" | "forte";
export type Health = "bonne" | "moyenne" | "mauvaise";

export const HEALTH_LABELS: Record<Health, string> = {
  bonne: "En forme",
  moyenne: "Moyenne",
  mauvaise: "Souffrante",
};

export type PlantPhoto = {
  id: string;
  file: string; // nom du fichier dans data/uploads
  date: string; // date de la prise de vue (YYYY-MM-DD)
  health?: Health; // état de santé constaté ce jour-là
  note: string;
};

export type Plant = {
  id: string;
  name: string;
  species: string;
  location: string;
  light: Light;
  wateringEveryDays: number;
  lastWatered: string; // ISO date (YYYY-MM-DD), toujours = arrosage le plus récent de l'historique
  waterings: string[]; // historique des arrosages (YYYY-MM-DD), du plus récent au plus ancien
  photos: PlantPhoto[]; // journal photo, de la plus récente à la plus ancienne
  notes: string;
  createdAt: string;
};

export type PlantInput = Omit<Plant, "id" | "createdAt" | "photos" | "waterings">;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "plants.json");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_PHOTOS_PER_UPLOAD = 10;
export const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Historique propre : dates valides, sans doublon, du plus récent au plus ancien. */
function normalizeHistory(dates: string[]): string[] {
  return [...new Set(dates.filter((d) => ISO_DATE.test(d)))].sort().reverse();
}

/** Tri du journal : date la plus récente d'abord (le tri est stable, les ajouts du jour restent en tête). */
function sortPhotos(photos: PlantPhoto[]): PlantPhoto[] {
  return [...photos].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

type StoredPlant = Omit<Plant, "photos" | "waterings"> & {
  waterings?: string[];
  photos?: PlantPhoto[];
  photo?: string; // ancien format : une seule photo
};

async function readAll(): Promise<Plant[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const plants = JSON.parse(raw) as StoredPlant[];
    return plants.map(({ photo, ...p }) => {
      // Migrations : l'ancienne photo unique devient la première entrée du journal,
      // et le dernier arrosage la première entrée de l'historique d'arrosage.
      const photos =
        p.photos ??
        (photo ? [{ id: randomUUID(), file: photo, date: p.createdAt.slice(0, 10), note: "" }] : []);
      return {
        ...p,
        waterings: normalizeHistory(p.waterings ?? [p.lastWatered]),
        photos: sortPhotos(photos),
      };
    });
  } catch {
    return [];
  }
}

async function writeAll(plants: Plant[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(plants, null, 2), "utf8");
}

/** Enregistre une image envoyée par formulaire. Renvoie le nom de fichier, ou undefined si invalide/absente. */
async function savePhoto(file: File): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;
  const ext = PHOTO_TYPES[file.type];
  if (!ext || file.size > MAX_PHOTO_BYTES) return undefined;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()));
  return name;
}

/** Enregistre plusieurs images ; ignore silencieusement celles qui sont invalides ou trop lourdes. */
export async function savePhotos(files: File[]): Promise<string[]> {
  const saved: string[] = [];
  for (const f of files.slice(0, MAX_PHOTOS_PER_UPLOAD)) {
    const name = await savePhoto(f);
    if (name) saved.push(name);
  }
  return saved;
}

async function removePhotoFile(name?: string) {
  if (!name) return;
  await fs.rm(path.join(UPLOADS_DIR, path.basename(name)), { force: true });
}

export async function listPlants(): Promise<Plant[]> {
  const plants = await readAll();
  return plants.sort((a, b) => nextWateringDate(a).getTime() - nextWateringDate(b).getTime());
}

export async function getPlant(id: string): Promise<Plant | undefined> {
  return (await readAll()).find((p) => p.id === id);
}

export async function createPlant(input: PlantInput, photoFiles: string[] = []): Promise<Plant> {
  const plants = await readAll();
  const plant: Plant = {
    ...input,
    waterings: [input.lastWatered],
    photos: photoFiles.map((file) => ({ id: randomUUID(), file, date: todayISO(), note: "" })),
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  plants.push(plant);
  await writeAll(plants);
  return plant;
}

export async function updatePlant(id: string, input: PlantInput): Promise<void> {
  const plants = await readAll();
  const i = plants.findIndex((p) => p.id === id);
  if (i === -1) return;
  // Une date saisie dans le formulaire rejoint l'historique ; le dernier arrosage reste le plus récent.
  const waterings = normalizeHistory([...plants[i].waterings, input.lastWatered]);
  plants[i] = { ...plants[i], ...input, waterings, lastWatered: waterings[0] };
  await writeAll(plants);
}

export async function deletePlant(id: string): Promise<void> {
  const plants = await readAll();
  const plant = plants.find((p) => p.id === id);
  for (const ph of plant?.photos ?? []) await removePhotoFile(ph.file);
  await writeAll(plants.filter((p) => p.id !== id));
}

/** Ajoute des photos au journal d'une plante. Renvoie le nombre de photos réellement enregistrées. */
export async function addPhotos(
  id: string,
  files: File[],
  meta: { date?: string; health?: string; note?: string },
): Promise<number> {
  const plants = await readAll();
  const plant = plants.find((p) => p.id === id);
  if (!plant) return 0;
  const today = todayISO();
  const date = meta.date && ISO_DATE.test(meta.date) && meta.date <= today ? meta.date : today;
  const health = (Object.keys(HEALTH_LABELS) as Health[]).find((h) => h === meta.health);
  const names = await savePhotos(files);
  const entries: PlantPhoto[] = names.map((file) => ({
    id: randomUUID(),
    file,
    date,
    health,
    note: (meta.note ?? "").trim(),
  }));
  plant.photos = sortPhotos([...entries, ...plant.photos]);
  await writeAll(plants);
  return entries.length;
}

export async function removePhoto(id: string, photoId: string): Promise<void> {
  const plants = await readAll();
  const plant = plants.find((p) => p.id === id);
  if (!plant) return;
  const photo = plant.photos.find((ph) => ph.id === photoId);
  if (!photo) return;
  plant.photos = plant.photos.filter((ph) => ph.id !== photoId);
  await writeAll(plants);
  await removePhotoFile(photo.file);
}

/** Photo de couverture : la plus récente du journal. */
export function coverPhoto(plant: Plant): PlantPhoto | undefined {
  return plant.photos[0];
}

/** Dernier état de santé renseigné dans le journal. */
export function latestHealth(plant: Plant): { health: Health; date: string } | undefined {
  const p = plant.photos.find((ph) => ph.health);
  return p?.health ? { health: p.health, date: p.date } : undefined;
}

/** Ajoute un arrosage à l'historique (aujourd'hui par défaut). Ignore les dates invalides ou futures. */
export async function addWatering(id: string, date: string = todayISO()): Promise<void> {
  if (!ISO_DATE.test(date) || date > todayISO()) return;
  const plants = await readAll();
  const plant = plants.find((p) => p.id === id);
  if (!plant) return;
  plant.waterings = normalizeHistory([...plant.waterings, date]);
  plant.lastWatered = plant.waterings[0];
  await writeAll(plants);
}

export async function removeWatering(id: string, date: string): Promise<void> {
  const plants = await readAll();
  const plant = plants.find((p) => p.id === id);
  if (!plant) return;
  plant.waterings = plant.waterings.filter((d) => d !== date);
  // Sans historique, on repart de la date d'ajout de la plante.
  plant.lastWatered = plant.waterings[0] ?? plant.createdAt.slice(0, 10);
  await writeAll(plants);
}

export async function markWatered(id: string): Promise<void> {
  await addWatering(id, todayISO());
}

/** Intervalle moyen (en jours) entre deux arrosages consécutifs, ou null s'il y en a moins de deux. */
export function averageInterval(plant: Plant): number | null {
  const d = plant.waterings;
  if (d.length < 2) return null;
  const span = (new Date(d[0] + "T00:00:00").getTime() - new Date(d[d.length - 1] + "T00:00:00").getTime()) / 86_400_000;
  return Math.round((span / (d.length - 1)) * 10) / 10;
}

export function todayISO(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function nextWateringDate(plant: Plant): Date {
  const d = new Date(plant.lastWatered + "T00:00:00");
  d.setDate(d.getDate() + plant.wateringEveryDays);
  return d;
}

/** Nombre de jours avant le prochain arrosage (négatif = en retard). */
export function daysUntilWatering(plant: Plant): number {
  const today = new Date(todayISO() + "T00:00:00");
  return Math.round((nextWateringDate(plant).getTime() - today.getTime()) / 86_400_000);
}
