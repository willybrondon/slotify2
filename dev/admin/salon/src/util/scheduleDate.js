import moment from "moment";

/**
 * Parse schedule event datetimes as salon wall-clock (no UTC shift).
 * Legacy API responses used ISO strings ending with Z.
 */
export function parseWallClockDate(value) {
  if (value == null) return null;
  if (value instanceof Date) return value;

  const str = String(value).trim();
  if (!str) return null;

  if (str.endsWith("Z")) {
    const utc = moment.utc(str);
    if (!utc.isValid()) return null;
    return new Date(
      utc.year(),
      utc.month(),
      utc.date(),
      utc.hour(),
      utc.minute(),
      utc.second()
    );
  }

  const local = moment(str, ["YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD HH:mm:ss"], true);
  if (local.isValid()) return local.toDate();

  const fallback = moment(str);
  return fallback.isValid() ? fallback.toDate() : null;
}
