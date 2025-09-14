import { dateToStardate, stardateToDate, formatStardate } from './stardate';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// Basic round-trip: pick a known date
const d = new Date(Date.UTC(2371, 0, 15)); // Jan 15, 2371
const sd = dateToStardate(d);
console.log('Computed stardate for 2371-01-15:', sd);
assert(Number.isFinite(sd), 'stardate should be finite');
const back = stardateToDate(sd);
console.log('Round-trip date:', back.toISOString().slice(0,10));
assert(back.getUTCFullYear() >= 2364, 'expected TNG-era round-trip');

// Formatting test
const formatted = formatStardate(sd);
assert(/^[0-9]+\.[0-9]$/.test(formatted), 'format should be one decimal');

console.log('Stardate tests passed.');
