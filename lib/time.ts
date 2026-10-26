// The station runs on India Standard Time (UTC+5:30, no daylight saving).
const TZ = "Asia/Kolkata";
const OFFSET = "+05:30";

const partsFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** IST calendar date ("2026-10-25") and time ("17:30") of an instant. */
export function istParts(d: Date): { date: string; time: string; hour: number } {
  const p = Object.fromEntries(partsFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, hour: Number(p.hour) };
}

/** The instant of an IST date and time. */
export function istInstant(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${OFFSET}`);
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "17:30" → "5:30 pm" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

const dowShort = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const dowLong = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const monShort = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });

/** Labels for a calendar date relative to today. */
export function dayLabels(date: string, today: string) {
  const d = new Date(`${date}T12:00:00Z`);
  const num = d.getUTCDate();
  const short = dowShort.format(d);
  const mon = monShort.format(d);
  const isToday = date === today;
  const isTomorrow = date === addDays(today, 1);
  return {
    num,
    dow: isToday ? "Today" : short,
    long: isToday
      ? `Today, ${short} ${num} ${mon}`
      : isTomorrow
        ? `Tomorrow, ${short} ${num} ${mon}`
        : `${dowLong.format(d)} ${num} ${mon}`,
  };
}

/** "Today, Sun 25 Oct · 5:30 pm" for a slot instant. */
export function formatSlot(slotAt: string | Date, now: Date): string {
  const s = istParts(new Date(slotAt));
  return `${dayLabels(s.date, istParts(now).date).long} · ${formatTime(s.time)}`;
}

/** Bookable slot start times between two "HH:MM" times. */
export function slotTimes(start: string, end: string, minutes: number): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const out: string[] = [];
  for (let t = toMin(start); t + minutes <= toMin(end); t += minutes) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

export function greeting(now: Date): string {
  const h = istParts(now).hour;
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
