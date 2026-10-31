import { todayISO } from "@/lib/plants";
import type { Seedling } from "@/lib/seedlings";

export default function SeedlingForm({
  action,
  seedling,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  seedling?: Seedling;
  submitLabel: string;
}) {
  return (
    <form action={action} className="panel grid gap-4">
      <label className="grid gap-1 text-sm font-medium">
        Nom
        <input name="name" required defaultValue={seedling?.name} className="field" placeholder="Tomates cerises" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Espèce ou variété
        <input name="species" defaultValue={seedling?.species} className="field italic" placeholder="Solanum lycopersicum" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Date de semis
          <input name="sownOn" type="date" max={todayISO()} defaultValue={seedling?.sownOn ?? todayISO()} className="field" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Nombre de graines semées
          <input name="quantity" type="number" min={1} defaultValue={seedling?.quantity ?? 6} className="field" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Levée attendue après (jours)
          <input
            name="germinationDays"
            type="number"
            min={1}
            defaultValue={seedling?.germinationDays ?? 10}
            className="field"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Emplacement
          <input name="location" defaultValue={seedling?.location} className="field" placeholder="Rebord de fenêtre, mini-serre…" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={seedling?.notes}
          className="field"
          placeholder="Terreau, chaleur, trempage des graines…"
        />
      </label>
      <button className="btn justify-self-start">{submitLabel}</button>
    </form>
  );
}
