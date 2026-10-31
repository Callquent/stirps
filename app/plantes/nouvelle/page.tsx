import { createPlantAction } from "@/lib/actions";
import PlantForm from "../../plant-form";

export default function NewPlantPage() {
  return (
    <div className="grid max-w-2xl gap-6">
      <h1 className="text-3xl sm:text-4xl">Nouvelle plante</h1>
      <PlantForm action={createPlantAction} submitLabel="Ajouter la plante" />
    </div>
  );
}
