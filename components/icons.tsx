import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Stroke({ size = 22, strokeWidth = 2.2, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const BackIcon = (p: IconProps) => (
  <Stroke strokeWidth={2.5} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Stroke>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Stroke strokeWidth={2.4} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Stroke>
);

export const UserIcon = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Stroke>
);

export const PinIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Stroke>
);

export const CalendarIcon = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </Stroke>
);

export const CalendarPlusIcon = (p: IconProps) => (
  <Stroke strokeWidth={2.4} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M16 3v4M8 3v4M3 10h18M12 13v5M9.5 15.5h5" />
  </Stroke>
);

export const HomeIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </Stroke>
);

export const GiftIcon = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S9 8 12 8c3 0 6-.5 6-1.5S14 4 12 8z" />
  </Stroke>
);

export const DropIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
  </Stroke>
);

export const CrownIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />
  </Stroke>
);

export const SparkleIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M12 2 Q13.6 10.4 22 12 Q13.6 13.6 12 22 Q10.4 13.6 2 12 Q10.4 10.4 12 2 Z" />
  </svg>
);

export const BoltIcon = (p: IconProps) => (
  <Stroke strokeWidth={2.4} {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </Stroke>
);

export const BellIcon = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </Stroke>
);

export const CardIcon = (p: IconProps) => (
  <Stroke {...p}>
    <rect x="2" y="6" width="20" height="13" rx="3" />
    <path d="M2 10h20M6 15h4" />
  </Stroke>
);

export const CheckIcon = ({ size = 16, ...p }: IconProps) => (
  <Stroke size={size} strokeWidth={3.5} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Stroke>
);

export const StarIcon = ({ size = 46, filled, ...rest }: IconProps & { filled: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
    <path
      d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"
      fill={filled ? "#19D3BE" : "#FFFFFF"}
      stroke={filled ? "#0A8F82" : "#C9D5E0"}
      strokeWidth={filled ? 1.4 : 1.6}
      strokeLinejoin="round"
    />
  </svg>
);

/** Side silhouettes for each vehicle, drawn in a 48×24 box, with wheel centres (x) and radius. */
const CAR_WHEELS = { wheels: [13, 36], r: 4.5 };
const TWO_WHEELS = { wheels: [10, 38], r: 5 };
export const VEHICLE_SHAPES: Record<string, { d: string; wheels: number[]; r: number }> = {
  sedan: {
    d: "M3 17 V13 Q3 11 6 10.5 L13 9.5 L18 5 Q19 4 21 4 H31 Q33 4 34.5 5.5 L38 9.5 L43 10.5 Q45 11 45 13 V17 Z",
    ...CAR_WHEELS,
  },
  suv: { d: "M3 17 V10 Q3 8 5 8 L9 7.5 L12 3.5 Q13 2.5 15 2.5 H37 Q39 2.5 40 4 L42 8 Q45 8.5 45 11 V17 Z", ...CAR_WHEELS },
  van: { d: "M3 17 V6 Q3 2.5 7 2.5 H34 Q37 2.5 39 5 L44 10 Q45 11 45 13 V17 Z", ...CAR_WHEELS },
  pickup: {
    d: "M3 17 V10 Q3 8.5 5 8.5 H14 L17 4 Q18 3 20 3 H27 Q28.5 3 28.5 4.5 V9 H43 Q45 9 45 11 V17 Z",
    ...CAR_WHEELS,
  },
  // Motorcycle: tail, seat, tank and front fork, facing right.
  bike: {
    d: "M5 13 L9 9.5 H19 L21 7 H29 Q31 7 32 8.5 L34 10 L36 5 H40 L39.5 7 L38 7 L36.5 12 L41 15.5 L38 17 L33 13 H26 L23 17 H15 L12 13 Z",
    ...TWO_WHEELS,
  },
  // Scooter: rear body and seat, low floorboard, tall front shield and handlebar.
  scooter: {
    d: "M4 15 Q4 9.5 10 9.5 H21 Q23 9.5 23 11.5 V13 H30 L34.5 4 H37 V2.5 H40 V4 H39 L36.5 8.5 L40 15.5 L36 17 L33 15 H14 Q12 17 9 17 H5 Z",
    ...TWO_WHEELS,
  },
  // Auto-rickshaw: canopy over an open cab, front wheel under the nose.
  auto: {
    d: "M5 17 V8 Q5 3 10 3 H31 Q35 3 37 6 L41 12 Q44 12.5 44 15 V17 H39 V12 L35 8 H30 V17 Z M10 7 V12 H25 V7 Z",
    wheels: [12, 39],
    r: 4.5,
  },
};

export function CarSilhouette({
  type,
  width = 72,
  color = "#0B1F3A",
  ring = "#FFFFFF",
  hub = "#BFF0E8",
}: {
  type: string;
  width?: number;
  color?: string;
  ring?: string;
  hub?: string | null;
}) {
  const shape = VEHICLE_SHAPES[type] ?? VEHICLE_SHAPES.sedan;
  return (
    <svg viewBox="0 0 48 24" width={width} height={width / 2} aria-hidden="true">
      <path d={shape.d} fill={color} fillRule="evenodd" />
      {shape.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={24 - shape.r - 1.5} r={shape.r} fill={color} stroke={ring} strokeWidth="1.5" />
          {hub && <circle cx={cx} cy={24 - shape.r - 1.5} r="1.6" fill={hub} />}
        </g>
      ))}
    </svg>
  );
}
