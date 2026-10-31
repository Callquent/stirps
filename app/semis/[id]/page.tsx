import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteSeedlingAction,
  failAction,
  germinateAction,
  resetAction,
  transplantAction,
  updateSeedlingAction,
} from "@/lib/seedling-actions";
import { getPlant, todayISO } from "@/lib/plants";
import { expectedGermination, getSeedling, STATUS_LABELS } from "@/lib/seedlings";
import Gauge from "../../gauge";
import { Icon } from "../../icons";
import SeedlingForm from "../seedling-form";
import { formatDate, germinationGauge, progress, STATUS_CLS } from "../status";

export const dynamic = "force-dynamic";

export default async function SeedlingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSeedling(id);
  if (!s) notFound();

  const p = progress(s);
  const g = germinationGauge(s);
  const plant = s.plantId ? await getPlant(s.plantId) : undefined;

  return (
    <div className="grid max-w-2xl gap-10">
      <header className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl">{s.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[s.status]}`}>
            {STATUS_LABELS[s.status]}
          </span>
        </div>
        {s.species && <p className="-mt-3 italic text-muted">{s.species}</p>}

        <div className="grid max-w-md gap-3">
          {g ? (
            <Gauge ratio={g.ratio} tone={g.tone} caption={g.caption} label={`Levée de ${s.name}`} />
          ) : (
            <p className="font-medium text-fern-deep">{p.text}</p>
          )}
          {g && <p className="text-sm text-muted">Levée prévue le {formatDate(expectedGermination(s))}</p>}
        </div>
      </header>

      <section aria-labelledby="avancement" className="grid gap-5 border-t border-line pt-6">
        <h2 id="avancement" className="flex items-center gap-2.5 text-2xl">
          <Icon name="sprout" className="h-5 w-5 text-leaf-deep" />
          Avancement
        </h2>

        {s.status === "seme" && (
          <>
            <form action={germinateAction.bind(null, s.id)} className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-sm font-medium">
                Date de levée
                <input name="date" type="date" min={s.sownOn} max={todayISO()} defaultValue={todayISO()} className="field" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Graines levées
                <input name="count" type="number" min={1} max={s.quantity} defaultValue={s.quantity} className="field w-32" />
              </label>
              <button className="btn">
                <Icon name="sprout" />
                Marquer comme levé
              </button>
            </form>
            <form action={failAction.bind(null, s.id)}>
              <button className="btn-text">Le semis n'a pas levé</button>
            </form>
          </>
        )}

        {s.status === "leve" && (
          <div className="flex flex-wrap items-center gap-5">
            <form action={transplantAction.bind(null, s.id)}>
              <button className="btn">
                <Icon name="leaf" />
                Transplanter : créer la plante
              </button>
            </form>
            <form action={failAction.bind(null, s.id)}>
              <button className="btn-text">Marquer comme échec</button>
            </form>
          </div>
        )}

        {s.status === "transplante" && (
          <p>
            {plant ? (
              <Link href={`/plantes/${plant.id}`} className="btn-quiet">
                <Icon name="leaf" />
                Voir la plante « {plant.name} »
              </Link>
            ) : (
              <span className="text-muted">La plante créée à partir de ce semis a été supprimée.</span>
            )}
          </p>
        )}

        {(s.status === "leve" || s.status === "echec") && (
          <form action={resetAction.bind(null, s.id)}>
            <button className="btn-quiet">Remettre en « semé »</button>
          </form>
        )}
      </section>

      <section aria-labelledby="infos" className="grid gap-4 border-t border-line pt-6">
        <h2 id="infos" className="text-2xl">
          Informations
        </h2>
        <SeedlingForm action={updateSeedlingAction.bind(null, s.id)} seedling={s} submitLabel="Enregistrer" />
      </section>

      <form action={deleteSeedlingAction.bind(null, s.id)}>
        <button className="btn-danger">Supprimer ce semis</button>
      </form>
    </div>
  );
}
