import { notFound } from "next/navigation";
import {
  addPhotosAction,
  addWateringAction,
  deletePlantAction,
  removePhotoAction,
  removeWateringAction,
  updatePlantAction,
  waterPlantAction,
} from "@/lib/actions";
import {
  averageInterval,
  coverPhoto,
  getPlant,
  HEALTH_LABELS,
  MAX_PHOTOS_PER_UPLOAD,
  todayISO,
  type Health,
} from "@/lib/plants";
import Gauge from "../../gauge";
import { Icon } from "../../icons";
import { HEALTH_CLS } from "../../kinds";
import { wateringGauge } from "../../plant-status";
import PlantForm from "../../plant-form";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const shortFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function utc(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export default async function PlantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = await getPlant(id);
  if (!plant) notFound();

  const avg = averageInterval(plant);
  const g = wateringGauge(plant);
  const cover = coverPhoto(plant);

  return (
    <div className="grid max-w-3xl gap-10">
      <header className="flex flex-wrap items-start gap-5">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-green-100 text-green-400 sm:h-28 sm:w-28">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/photos/${cover.file}`} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon name="leaf" className="h-10 w-10" />
          )}
        </div>
        <div className="grid min-w-0 flex-1 gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl">{plant.name}</h1>
            {plant.species && <p className="italic text-muted">{plant.species}</p>}
          </div>
          <div className="grid max-w-sm gap-3">
            <Gauge ratio={g.ratio} tone={g.tone} caption={g.caption} label={`Arrosage de ${plant.name}`} />
            <form action={waterPlantAction.bind(null, plant.id)}>
              <button className="btn">
                <Icon name="drop" />
                Arrosée aujourd'hui
              </button>
            </form>
          </div>
        </div>
      </header>

      <section aria-labelledby="journal" className="grid gap-5 border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="journal" className="flex items-center gap-2.5 text-2xl">
            <Icon name="camera" className="h-5 w-5 text-green-600" />
            Journal photo
          </h2>
          <p className="text-sm text-muted">
            {plant.photos.length} photo{plant.photos.length > 1 ? "s" : ""}
          </p>
        </div>

        <form
          action={addPhotosAction.bind(null, plant.id)}
          className="grid gap-3 rounded-xl border border-dashed border-green-300 bg-green-50/70 p-4"
        >
          <label className="grid gap-1 text-sm font-medium">
            Ajouter des photos
            <input
              name="photos"
              type="file"
              multiple
              required
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-3 file:py-1.5 file:font-semibold file:text-white hover:file:bg-green-800"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Date de la prise de vue
              <input name="date" type="date" max={todayISO()} defaultValue={todayISO()} className="field" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              État de santé
              <select name="health" defaultValue="" className="field">
                <option value="">Non précisé</option>
                {(Object.keys(HEALTH_LABELS) as Health[]).map((h) => (
                  <option key={h} value={h}>
                    {HEALTH_LABELS[h]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            Observation
            <input name="note" placeholder="Feuilles jaunies, nouvelle pousse, parasites…" className="field" />
          </label>
          <p className="text-xs text-muted">
            JPEG, PNG, WebP ou GIF, 8 Mo maximum par photo, {MAX_PHOTOS_PER_UPLOAD} photos par envoi. La date, l'état et
            l'observation valent pour toutes les photos de l'envoi.
          </p>
          <button className="btn justify-self-start">
            <Icon name="plus" />
            Ajouter au journal
          </button>
        </form>

        {plant.photos.length === 0 ? (
          <p className="text-sm text-muted">Aucune photo pour l'instant : la première servira de couverture.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {plant.photos.map((photo) => (
              <li key={photo.id} className="overflow-hidden rounded-xl bg-surface ring-1 ring-line">
                <a href={`/photos/${photo.file}`} target="_blank" rel="noreferrer" className="block bg-green-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/photos/${photo.file}`}
                    alt={`${plant.name}, ${shortFmt.format(utc(photo.date))}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </a>
                <div className="grid gap-1.5 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{shortFmt.format(utc(photo.date))}</span>
                    {photo.health && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${HEALTH_CLS[photo.health]}`}>
                        {HEALTH_LABELS[photo.health]}
                      </span>
                    )}
                  </div>
                  {photo.note && <p className="text-muted">{photo.note}</p>}
                  <form action={removePhotoAction.bind(null, plant.id, photo.id)}>
                    <button className="btn-danger">Supprimer la photo</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="arrosages" className="grid gap-5 border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="arrosages" className="flex items-center gap-2.5 text-2xl">
            <Icon name="drop" className="h-5 w-5 text-rain" />
            Historique d'arrosage
          </h2>
          <p className="text-sm text-muted">
            {plant.waterings.length} arrosage{plant.waterings.length > 1 ? "s" : ""}
            {avg !== null && `, un tous les ${avg} j en moyenne pour un objectif de ${plant.wateringEveryDays} j`}
          </p>
        </div>

        <form action={addWateringAction.bind(null, plant.id)} className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm font-medium">
            Ajouter un arrosage passé
            <input name="date" type="date" required max={todayISO()} defaultValue={todayISO()} className="field" />
          </label>
          <button className="btn-quiet">Ajouter</button>
        </form>

        {plant.waterings.length === 0 ? (
          <p className="text-sm text-muted">Aucun arrosage enregistré.</p>
        ) : (
          <ol className="ml-1.5 border-l border-line">
            {plant.waterings.map((date, i) => (
              <li key={date} className="relative flex items-center justify-between gap-3 py-2 pl-5 text-sm">
                <span
                  aria-hidden
                  className={`absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-2 ring-ground ${
                    i === 0 ? "bg-rain" : "bg-green-300"
                  }`}
                />
                <span className="first-letter:uppercase">
                  {dateFmt.format(utc(date))}
                  {i === 0 && (
                    <span className="ml-2 rounded-full bg-rain/15 px-2 py-0.5 text-xs font-semibold text-rain-deep">
                      dernier
                    </span>
                  )}
                </span>
                <form action={removeWateringAction.bind(null, plant.id, date)}>
                  <button className="btn-danger" aria-label={`Supprimer l'arrosage du ${shortFmt.format(utc(date))}`}>
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="infos" className="grid gap-4 border-t border-line pt-6">
        <h2 id="infos" className="text-2xl">
          Informations
        </h2>
        <PlantForm action={updatePlantAction.bind(null, plant.id)} plant={plant} submitLabel="Enregistrer" />
      </section>

      <form action={deletePlantAction.bind(null, plant.id)}>
        <button className="btn-danger">Supprimer cette plante et toutes ses photos</button>
      </form>
    </div>
  );
}
