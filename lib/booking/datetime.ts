const CASABLANCA_TIME_ZONE = "Africa/Casablanca";

export function casablancaCalendarDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CASABLANCA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function casablancaCalendarHour(date = new Date()): number {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: CASABLANCA_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .find((part) => part.type === "hour")?.value;

  return Number(hour ?? "0");
}

/**
 * Booking requests use a default pickup time of 10:00 Casablanca time.
 * Once that time has passed, the earliest selectable pickup date is tomorrow.
 */
export function minimumPickupCalendarDate(date = new Date()): string {
  const today = casablancaCalendarDate(date);
  return casablancaCalendarHour(date) >= 10 ? addCalendarDays(today, 1) : today;
}

export const RETURN_DATE_AFTER_DEPARTURE_MESSAGE =
  "La date de retour doit être postérieure à la date de départ.";

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function isReturnAfterDeparture(pickupDate: string, returnDate: string) {
  return Boolean(pickupDate && returnDate && returnDate > pickupDate);
}

function timeZoneOffset(timestamp: number): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CASABLANCA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return (
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    ) - timestamp
  );
}

export function bookingDateTimeToDate(date: string, time: string): Date | null {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallClockUtc = Date.UTC(year, month - 1, day, hour, minute);
  const check = new Date(wallClockUtc);

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute
  ) {
    return null;
  }

  let timestamp = wallClockUtc - timeZoneOffset(wallClockUtc);
  timestamp = wallClockUtc - timeZoneOffset(timestamp);
  const result = new Date(timestamp);

  return Number.isNaN(result.getTime()) ? null : result;
}
