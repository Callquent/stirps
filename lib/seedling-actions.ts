"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSeedling,
  deleteSeedling,
  markFailed,
  markGerminated,
  resetSeedling,
  transplant,
  updateSeedling,
  type SeedlingInput,
} from "./seedlings";
import { todayISO } from "./plants";

function positiveInt(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

function parse(formData: FormData): SeedlingInput {
  return {
    name: String(formData.get("name") ?? "").trim() || "Semis sans nom",
    species: String(formData.get("species") ?? "").trim(),
    sownOn: String(formData.get("sownOn") || todayISO()),
    quantity: positiveInt(formData.get("quantity"), 1),
    germinationDays: positiveInt(formData.get("germinationDays"), 10),
    location: String(formData.get("location") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

function refresh(id?: string) {
  revalidatePath("/semis");
  if (id) revalidatePath(`/semis/${id}`);
}

export async function createSeedlingAction(formData: FormData) {
  await createSeedling(parse(formData));
  refresh();
  redirect("/semis");
}

export async function updateSeedlingAction(id: string, formData: FormData) {
  await updateSeedling(id, parse(formData));
  refresh(id);
  redirect("/semis");
}

export async function deleteSeedlingAction(id: string) {
  await deleteSeedling(id);
  refresh();
  redirect("/semis");
}

export async function germinateAction(id: string, formData: FormData) {
  const count = Number(formData.get("count"));
  await markGerminated(id, String(formData.get("date") ?? ""), count > 0 ? count : undefined);
  refresh(id);
}

/** Raccourci de la liste : levé aujourd'hui, toutes les graines. */
export async function quickGerminateAction(id: string) {
  await markGerminated(id);
  refresh(id);
}

export async function failAction(id: string) {
  await markFailed(id);
  refresh(id);
}

export async function resetAction(id: string) {
  await resetSeedling(id);
  refresh(id);
}

export async function transplantAction(id: string) {
  const plantId = await transplant(id);
  refresh(id);
  revalidatePath("/");
  revalidatePath("/plantes");
  redirect(plantId ? `/plantes/${plantId}` : `/semis/${id}`);
}
