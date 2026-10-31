"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPhotos,
  addWatering,
  createPlant,
  deletePlant,
  markWatered,
  removePhoto,
  removeWatering,
  savePhotos,
  todayISO,
  updatePlant,
  type Light,
  type PlantInput,
} from "./plants";

function parse(formData: FormData): PlantInput {
  const light = String(formData.get("light") ?? "moyenne") as Light;
  const every = Number(formData.get("wateringEveryDays"));
  return {
    name: String(formData.get("name") ?? "").trim() || "Plante sans nom",
    species: String(formData.get("species") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    light: ["faible", "moyenne", "forte"].includes(light) ? light : "moyenne",
    wateringEveryDays: Number.isFinite(every) && every > 0 ? Math.round(every) : 7,
    lastWatered: String(formData.get("lastWatered") || todayISO()),
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

function photoFiles(formData: FormData): File[] {
  return formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
}

function refresh(id: string) {
  revalidatePath("/");
  revalidatePath("/plantes");
  revalidatePath(`/plantes/${id}`);
}

export async function createPlantAction(formData: FormData) {
  const photos = await savePhotos(photoFiles(formData));
  await createPlant(parse(formData), photos);
  revalidatePath("/");
  revalidatePath("/plantes");
  redirect("/plantes");
}

export async function updatePlantAction(id: string, formData: FormData) {
  await updatePlant(id, parse(formData));
  revalidatePath("/");
  revalidatePath("/plantes");
  redirect("/plantes");
}

export async function deletePlantAction(id: string) {
  await deletePlant(id);
  revalidatePath("/");
  revalidatePath("/plantes");
  redirect("/plantes");
}

export async function waterPlantAction(id: string) {
  await markWatered(id);
  refresh(id);
}

export async function addWateringAction(id: string, formData: FormData) {
  await addWatering(id, String(formData.get("date") ?? ""));
  refresh(id);
}

export async function removeWateringAction(id: string, date: string) {
  await removeWatering(id, date);
  refresh(id);
}

export async function addPhotosAction(id: string, formData: FormData) {
  await addPhotos(id, photoFiles(formData), {
    date: String(formData.get("date") ?? ""),
    health: String(formData.get("health") ?? ""),
    note: String(formData.get("note") ?? ""),
  });
  refresh(id);
}

export async function removePhotoAction(id: string, photoId: string) {
  await removePhoto(id, photoId);
  refresh(id);
}
