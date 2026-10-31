import Link from "next/link";
import { waterPlantAction } from "@/lib/actions";
import {
  coverPhoto,
  daysUntilWatering,
  HEALTH_LABELS,
  latestHealth,
  listPlants,
  type Plant,
} from "@/lib/plants";
import Gauge from "../gauge";
import { Icon } from "../icons";
import { HEALTH_CLS } from "../kinds";
import { wateringGauge } from "../plant-status";

export const dynamic = "force-dynamic";

function PlantTile({ plant }: { plant: Plant }) {
  const g = wateringGauge(plant);
  const cover = coverPhoto(plant);
  const health = latestHealth(plant);
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition-shadow hover:shadow-lg hover:shadow-green-900/10">
      <Link href={`/plantes/${plant.id}`} className="relative block aspect-[5/4] bg-green-100" aria-label={plant.name}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/photos/${cover.file}`} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-green-400">
            <Icon name="leaf" className="h-14 w-14" />
          </span>
        )}
        {health && (
          <span
            className={`absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${HEALTH_CLS[health.health]}`}
          >
            {HEALTH_LABELS[health.health]}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="text-xl">
            <Link href={`/plantes/${plant.id}`} className="hover:underline">
              {plant.name}
            </Link>
          </h2>
          {plant.species && <p className="text-sm italic text-muted">{plant.species}</p>}
        </div>
        <Gauge ratio={g.ratio} tone={g.tone} caption={g.caption} label={`Arrosage de ${plant.name}`} />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <li className="flex items-center gap-1.5">
            <Icon name="pin" />
            {plant.location || "Sans emplacement"}
          </li>
          <li className="flex items-center gap-1.5">
            <Icon name="sun" />
            Lumière {plant.light}
          </li>
          <li className="flex items-center gap-1.5">
            <Icon name="drop" />
            Tous les {plant.wateringEveryDays} j
          </li>
        </ul>
        <form action={waterPlantAction.bind(null, plant.id)} className="mt-auto">
          <button className="btn-quiet w-full">
            <Icon name="drop" />
            Arrosée aujourd'hui
          </button>
        </form>
      </div>
    </li>
  );
}

export default async function PlantsPage() {
  const plants = await listPlants();
  const due = plants.filter((p) => daysUntilWatering(p) <= 0).length;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-3xl sm:text-4xl">Mes plantes</h1>
          <p className="text-muted">
            {plants.length === 0
              ? "Aucune plante pour l'instant."
              : `${plants.length} plante${plants.length > 1 ? "s" : ""}, ${
                  due > 0 ? `dont ${due} à arroser` : "rien à arroser pour le moment"
                }.`}
          </p>
        </div>
        <Link href="/plantes/nouvelle" className="btn">
          <Icon name="plus" />
          Ajouter une plante
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="panel grid justify-items-center gap-4 py-12 text-center">
          <Icon name="leaf" className="h-10 w-10 text-green-400" />
          <p className="max-w-sm text-muted">
            Ajoutez votre première plante, ou transplantez un semis levé pour la retrouver ici.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/plantes/nouvelle" className="btn">
              <Icon name="plus" />
              Ajouter une plante
            </Link>
            <Link href="/semis" className="btn-quiet">
              <Icon name="sprout" />
              Voir mes semis
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((p) => (
            <PlantTile key={p.id} plant={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
