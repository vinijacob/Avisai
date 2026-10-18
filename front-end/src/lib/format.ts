const locale = "pt-BR";

const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" });
const monthShort = new Intl.DateTimeFormat(locale, { month: "short" });
const fullDate = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });
const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

export function formatTime(iso: string) {
  return time.format(new Date(iso));
}

export function formatTimeRange(start: string, end: string | null) {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}

export function formatFullDate(iso: string) {
  return fullDate.format(new Date(iso));
}

export function dateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: monthShort.format(date).replace(".", ""),
    weekday: weekday.format(date),
  };
}

const DAY = 86_400_000;

export function relativeDay(iso: string, now = new Date()) {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / DAY);
  if (Math.abs(diff) < 7) return relative.format(diff, "day");
  if (Math.abs(diff) < 31) return relative.format(Math.round(diff / 7), "week");
  return relative.format(Math.round(diff / 30), "month");
}

export function isHappeningNow(start: string, end: string | null, now = new Date()) {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : s + 2 * 3_600_000;
  return now.getTime() >= s && now.getTime() <= e;
}

export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const monthYear = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });

export function formatMonthYear(iso: string) {
  return monthYear.format(new Date(iso));
}

export function ageFrom(birthDate: string, now = new Date()) {
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) return null;
  const hadBirthday = now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  return now.getFullYear() - year - (hadBirthday ? 0 : 1);
}

export function toDateInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  const split = digits.length === 11 ? 7 : 6;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`;
}
