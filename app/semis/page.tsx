import Link from "next/link";
import { quickGerminateAction } from "@/lib/seedling-actions";
import { listSeedlings, STATUS_LABELS, type Seedling } from "@/lib/seedlings";
import Gauge from "../gauge";
import { Icon } from "../icons";
import { formatDate, germinationGauge, progress, STATUS_CLS } from "./status";

export const dynamic = "force-dynamic";

function SeedlingTile({ s }: { s: Seedling }) {
  const g = germinationGauge(s);
  const p = progress(s);
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line transition-shadow hover:shadow-lg hover:shadow-green-900/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl">
            <Link href={`/semis/${s.id}`} className="hover:underline">
              {s.name}
            </Link>
          </h3>
          {s.species && <p className="text-sm italic text-muted">{s.species}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[s.status]}`}>
          {STATUS_LABELS[s.status]}
        </span>
      </div>

      {g ? (
        <Gauge ratio={g.ratio} tone={g.tone} caption={g.caption} label={`Levée de ${s.name}`} />
      ) : (
        <p className="text-sm font-medium text-fern-deep">{p.text}</p>
      )}

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <li className="flex items-center gap-1.5">
          <Icon name="seed" />
          {s.quantity} graine{s.quantity > 1 ? "s" : ""}
        </li>
        <li className="flex items-center gap-1.5">
          <Icon name="calendar" />
          Semé le {formatDate(s.sownOn)}
        </li>
        {s.location && (
          <li className="flex items-center gap-1.5">
            <Icon name="pin" />
            {s.location}
          </li>
        )}
      </ul>

      {s.status === "seme" && (
        <form action={quickGerminateAction.bind(null, s.id)} className="mt-auto">
          <button className="btn-quiet w-full">
            <Icon name="sprout" />
            Levé aujourd'hui
          </button>
        </form>
      )}
      {s.status === "leve" && (
        <Link href={`/semis/${s.id}`} className="btn mt-auto w-full">
          <Icon name="leaf" />
          Transplanter en plante
        </Link>
      )}
    </li>
  );
}

function Group({ title, items }: { title: string; items: Seedling[] }) {
  if (items.length === 0) return null;
  return (
    <section className="grid gap-4">
      <h2 className="flex items-baseline gap-2 border-b border-line pb-2 text-2xl">
        {title}
        <span className="font-sans text-sm text-muted">{items.length}</span>
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <SeedlingTile key={s.id} s={s} />
        ))}
      </ul>
    </section>
  );
}

export default async function SeedlingsPage() {
  const all = await listSeedlings();
  const sown = all.filter((s) => s.status === "seme");
  const up = all.filter((s) => s.status === "leve");
  const done = all.filter((s) => s.status === "transplante" || s.status === "echec");

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-3xl sm:text-4xl">Mes semis</h1>
          <p className="text-muted">
            {all.length === 0
              ? "Aucun semis pour l'instant."
              : `${sown.length} en attente de levée, ${up.length} à transplanter.`}
          </p>
        </div>
        <Link href="/semis/nouveau" className="btn">
          <Icon name="plus" />
          Ajouter un semis
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="panel grid justify-items-center gap-4 py-12 text-center">
          <Icon name="sprout" className="h-10 w-10 text-green-400" />
          <p className="max-w-sm text-muted">
            Notez la date et le nombre de graines : l'application prévoit la levée et vous la rappelle dans le calendrier.
          </p>
          <Link href="/semis/nouveau" className="btn">
            <Icon name="plus" />
            Ajouter mon premier semis
          </Link>
        </div>
      ) : (
        <>
          <Group title="En attente de levée" items={sown} />
          <Group title="Levés, à transplanter" items={up} />
          <Group title="Terminés" items={done} />
        </>
      )}
    </div>
  );
}
