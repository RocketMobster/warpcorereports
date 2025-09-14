// Stardate conversion utilities used across the app

// Convert a JS Date (UTC) to a stardate number with one decimal
export function dateToStardate(date: Date): number {
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 1);
  const msInDay = 24 * 60 * 60 * 1000;
  const dayOfYear = Math.floor((Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - startOfYear) / msInDay) + 1;
  let stardateNum: number;
  if (year < 2364) {
    // Pre-TNG era approximation
    stardateNum = 1000 * (year - 2323) + (dayOfYear / 365) * 1000;
  } else {
    // TNG-era approximation widely used by fansites
    stardateNum = 41000 + (year - 2364) * 1000 + (dayOfYear / 365) * 1000;
  }
  return Math.round(stardateNum * 10) / 10; // one decimal
}

// Convert a stardate number to an approximate JS Date (UTC, at midnight)
export function stardateToDate(sd: number): Date {
  let year: number;
  let fraction: number;
  if (sd >= 41000) {
    const offset = sd - 41000;
    year = 2364 + Math.floor(offset / 1000);
    fraction = (offset % 1000) / 1000;
  } else {
    year = 2323 + Math.floor(sd / 1000);
    fraction = (sd % 1000) / 1000;
  }
  const dayOfYear = Math.max(1, Math.min(365, Math.round(fraction * 365)));
  // Build date as UTC at midnight
  const d = new Date(Date.UTC(year, 0, 1));
  d.setUTCDate(dayOfYear);
  return d;
}

export function formatStardate(sd: number): string {
  return sd.toFixed(1);
}
