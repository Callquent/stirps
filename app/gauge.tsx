export type GaugeTone = "rain" | "sun" | "alert" | "leaf";

const FILL: Record<GaugeTone, string> = {
  rain: "bg-rain",
  sun: "bg-sun",
  alert: "bg-alert",
  leaf: "bg-leaf",
};

const CAPTION: Record<GaugeTone, string> = {
  rain: "text-rain-deep",
  sun: "text-sun-deep",
  alert: "text-alert",
  leaf: "text-leaf-deep",
};

/**
 * Jauge de progression vers une échéance : arrosage d'une plante, levée d'un semis.
 * `ratio` = temps écoulé / durée prévue ; la jauge est pleine à l'échéance.
 */
export default function Gauge({
  ratio,
  tone,
  caption,
  label,
}: {
  ratio: number;
  tone: GaugeTone;
  caption: string;
  label: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return (
    <div className="grid gap-1.5">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={caption}
        className="h-1.5 overflow-hidden rounded-full bg-green-100"
      >
        <div className={`gauge-fill h-full rounded-full ${FILL[tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-sm font-medium ${CAPTION[tone]}`}>{caption}</p>
    </div>
  );
}
