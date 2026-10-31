import type { Plant } from "@/lib/plants";
import { todayISO } from "@/lib/plants";

export default function PlantForm({
  action,
  plant,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  plant?: Plant;
  submitLabel: string;
}) {
  return (
    <form action={action} className="panel grid gap-4">
      {!plant && (
        <label className="grid gap-1 text-sm font-medium">
          Photos
          <input
            name="photos"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-green-100 file:px-3 file:py-1.5 file:font-semibold file:text-green-800 hover:file:bg-green-200"
          />
          <span className="text-xs font-normal text-muted">
            Facultatif. Vous pourrez en ajouter d'autres plus tard dans le journal photo de la plante.
          </span>
        </label>
      )}
      <label className="grid gap-1 text-sm font-medium">
        Nom
        <input name="name" required defaultValue={plant?.name} className="field" placeholder="Ma monstera" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Espèce
        <input name="species" defaultValue={plant?.species} className="field italic" placeholder="Monstera deliciosa" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Pièce ou emplacement
          <input name="location" defaultValue={plant?.location} className="field" placeholder="Salon" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Luminosité
          <select name="light" defaultValue={plant?.light ?? "moyenne"} className="field">
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="forte">Forte</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Arrosage tous les (jours)
          <input
            name="wateringEveryDays"
            type="number"
            min={1}
            defaultValue={plant?.wateringEveryDays ?? 7}
            className="field"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Dernier arrosage
          <input name="lastWatered" type="date" defaultValue={plant?.lastWatered ?? todayISO()} className="field" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Notes
        <textarea name="notes" rows={3} defaultValue={plant?.notes} className="field" />
      </label>
      <button className="btn justify-self-start">{submitLabel}</button>
    </form>
  );
}
