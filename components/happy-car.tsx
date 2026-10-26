/**
 * The Yalla Wash mascot. `tone` picks the colourway:
 * - "navy": navy car with teal foam, for light backgrounds
 * - "teal": teal car with white foam, for navy backgrounds
 * `mood` swaps the face or foam for the booked, washing and celebrating screens.
 */
export function HappyCar({
  size = 40,
  tone = "navy",
  mood = "happy",
  label,
}: {
  size?: number;
  tone?: "navy" | "teal";
  mood?: "happy" | "wink" | "washing" | "grin";
  label?: string;
}) {
  const body = tone === "navy" ? "#0B1F3A" : "#19D3BE";
  const glass = tone === "navy" ? "#BFF0E8" : "#0B1F3A";
  const smile = tone === "navy" ? "#19D3BE" : "#0B1F3A";
  const foam = tone === "navy" ? "#0FB5A3" : "#FFFFFF";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <path d="M32 58 L41 41 Q43 37 48 37 L72 37 Q77 37 79 41 L88 58 Z" fill={body} />
      <path d="M41 56 L47 44 L73 44 L79 56 Z" fill={glass} />
      <rect x="24" y="82" width="16" height="16" rx="5" fill={body} />
      <rect x="80" y="82" width="16" height="16" rx="5" fill={body} />
      <rect x="18" y="56" width="84" height="32" rx="12" fill={body} />
      <circle cx="37" cy="70" r="8" fill="#FFFFFF" />
      <circle cx="38.5" cy="68.5" r="3.5" fill="#0B1F3A" />
      {mood === "wink" ? (
        <path d="M76 71 Q83 63 90 71" fill="none" stroke="#0B1F3A" strokeWidth="4.5" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="83" cy="70" r="8" fill="#FFFFFF" />
          <circle cx="84.5" cy="68.5" r="3.5" fill="#0B1F3A" />
        </>
      )}
      {mood === "wink" || mood === "grin" ? (
        <path d="M48 74 Q60 88 72 74" fill="none" stroke={smile} strokeWidth="5" strokeLinecap="round" />
      ) : (
        <path d="M49 75 Q60 85 71 75" fill="none" stroke={smile} strokeWidth="5" strokeLinecap="round" />
      )}
      {mood === "washing" ? (
        <>
          <circle cx="30" cy="40" r="11" fill={foam} />
          <circle cx="46" cy="32" r="14" fill={foam} />
          <circle cx="64" cy="27" r="15" fill={foam} />
          <circle cx="81" cy="33" r="12" fill={foam} />
          <circle cx="94" cy="42" r="9" fill={foam} />
          <circle cx="104" cy="16" r="5" fill={foam} />
          <circle cx="16" cy="22" r="4" fill={foam} />
        </>
      ) : mood !== "grin" ? (
        <>
          <circle cx="44" cy="36" r="10" fill={foam} />
          <circle cx="60" cy="29" r="13" fill={foam} />
          <circle cx="77" cy="35" r="10" fill={foam} />
        </>
      ) : null}
    </svg>
  );
}

/** Small car used inside collected stamps. */
export function StampCar({ size = 34, body = "#0B1F3A" }: { size?: number; body?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      <path d="M32 58 L41 41 Q43 37 48 37 L72 37 Q77 37 79 41 L88 58 Z" fill={body} />
      <rect x="18" y="56" width="84" height="32" rx="12" fill={body} />
      <circle cx="37" cy="70" r="8" fill="#FFFFFF" />
      <circle cx="83" cy="70" r="8" fill="#FFFFFF" />
    </svg>
  );
}

export function Wordmark({ size = 22, onNavy = false }: { size?: number; onNavy?: boolean }) {
  return (
    <span className="font-extrabold tracking-[-0.5px]" style={{ fontSize: size }}>
      <span className={onNavy ? "text-white" : "text-navy-900"}>Yalla</span>{" "}
      <span className={onNavy ? "text-teal-400" : "text-teal-600"}>Wash</span>
    </span>
  );
}
