// Stardate conversion utilities used across the app
import { StardateMode } from "../types";

// Constants for canon formula (based on TrekGuide.com analysis)
// Stardate 0000.0 = July 5, 2318 at noon (Starfleet Command time)
const CANON_SD_ZERO_YEAR = 2318;
const CANON_SD_ZERO_MONTH = 6; // July (0-indexed)
const CANON_SD_ZERO_DAY = 5;
const CANON_SD_ZERO_HOUR = 12;
const CANON_STARDATES_PER_YEAR = 918.23186;
const CANON_DAYS_PER_YEAR = 365.2422;

// Convert a JS Date (UTC) to a stardate number with one decimal
export function dateToStardate(date: Date, mode: StardateMode = 'simple'): number {
  if (mode === 'canon') {
    return dateToStardateCanon(date);
  }
  return dateToStardateSimple(date);
}

// Simple approximation: 1000 stardates per year
function dateToStardateSimple(date: Date): number {
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

// Canon formula: Based on TrekGuide.com analysis of actual episodes
// ~918.23186 stardates per year, starting from SD 0000.0 = July 5, 2318 noon
function dateToStardateCanon(date: Date): number {
  // Calculate milliseconds since SD 0000.0
  const sdZero = Date.UTC(CANON_SD_ZERO_YEAR, CANON_SD_ZERO_MONTH, CANON_SD_ZERO_DAY, CANON_SD_ZERO_HOUR);
  const targetMs = date.getTime();
  const msElapsed = targetMs - sdZero;
  
  // Convert to days
  const msInDay = 24 * 60 * 60 * 1000;
  const daysElapsed = msElapsed / msInDay;
  
  // Convert to stardates
  const stardateNum = (daysElapsed / CANON_DAYS_PER_YEAR) * CANON_STARDATES_PER_YEAR;
  
  return Math.round(stardateNum * 10) / 10; // one decimal
}

// Convert a stardate number to an approximate JS Date (UTC, at midnight)
export function stardateToDate(sd: number, mode: StardateMode = 'simple'): Date {
  if (mode === 'canon') {
    return stardateToDateCanon(sd);
  }
  return stardateToDateSimple(sd);
}

// Simple approximation: 1000 stardates per year
function stardateToDateSimple(sd: number): Date {
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

// Canon formula: Based on TrekGuide.com analysis
function stardateToDateCanon(sd: number): Date {
  // Convert stardate to days since SD 0000.0
  const daysElapsed = (sd / CANON_STARDATES_PER_YEAR) * CANON_DAYS_PER_YEAR;
  
  // Calculate milliseconds since SD 0000.0
  const msInDay = 24 * 60 * 60 * 1000;
  const sdZero = Date.UTC(CANON_SD_ZERO_YEAR, CANON_SD_ZERO_MONTH, CANON_SD_ZERO_DAY, CANON_SD_ZERO_HOUR);
  const targetMs = sdZero + (daysElapsed * msInDay);
  
  // Create date at midnight UTC (round to nearest day)
  const d = new Date(targetMs);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function formatStardate(sd: number): string {
  return sd.toFixed(1);
}
