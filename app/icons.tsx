// Jeu d'icônes à trait unique, dessinées sur une grille 24 x 24.
const PATHS = {
  drop: ["M12 3.5c3.2 4 5.5 6.9 5.5 10a5.5 5.5 0 0 1-11 0c0-3.1 2.3-6 5.5-10z"],
  sprout: ["M12 21v-8", "M12 13c0-3.5-2.5-6-6.5-6 0 3.7 2.5 6 6.5 6z", "M12 11c0-3 2.2-5.5 6-5.5 0 3.4-2.2 5.5-6 5.5z"],
  leaf: ["M20 4C10 4 5 9 5 15c0 2 .7 3.6 2 5 6 0 13-4 13-16z", "M5 20c3-6 6-9 10-11"],
  calendar: [
    "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z",
    "M4 9.5h16",
    "M8.5 2.5v3",
    "M15.5 2.5v3",
  ],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  alert: ["M12 4l9 15.5H3z", "M12 10v4", "M12 16.8v.2"],
  hourglass: ["M7 3.5h10", "M7 20.5h10", "M8 3.5c0 4 4 5 4 8.5s-4 4.5-4 8.5", "M16 3.5c0 4-4 5-4 8.5s4 4.5 4 8.5"],
  camera: [
    "M4 8a2 2 0 0 1 2-2h1.5l1.2-1.8h6.6L17.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z",
    "M12 9.3a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 1 0 0-6.4z",
  ],
  pin: ["M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z", "M12 7.7a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 1 0 0-4.6z"],
  sun: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8z",
    "M12 2.5v2.5",
    "M12 19v2.5",
    "M2.5 12H5",
    "M19 12h2.5",
    "M5.3 5.3l1.8 1.8",
    "M16.9 16.9l1.8 1.8",
    "M5.3 18.7l1.8-1.8",
    "M16.9 7.1l1.8-1.8",
  ],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  left: ["M15 6l-6 6 6 6"],
  right: ["M9 6l6 6-6 6"],
  plus: ["M12 5v14", "M5 12h14"],
  seed: [
    "M8 8.2a2 2 0 1 0 0 4 2 2 0 1 0 0-4z",
    "M16 6.4a2 2 0 1 0 0 4 2 2 0 1 0 0-4z",
    "M12.5 13.6a2 2 0 1 0 0 4 2 2 0 1 0 0-4z",
  ],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
