import { generateReport } from './reportGen';
import { GeneratorConfig, Rank } from '../types';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// Deterministic seed and config
const cfg: GeneratorConfig = {
  problemsCount: 2,
  graphsEnabled: false,
  signatoryName: 'Test Engineer',
  signatoryRank: 'Lieutenant' as Rank,
  signatoryReference: true,
  vessel: 'USS Enterprise NCC-1701-D',
  stardate: '',
  seed: 'test-seed-123',
  humorLevel: 3,
  problemDetailLevel: 2,
  figureBias: 'auto'
};

const report = generateReport(cfg);

// First reference should include the signatory (formatted as "Last, First Rank")
assert(report.references.length > 0, 'references should not be empty');
const first = report.references[0];
assert(first.text.includes('Engineer, Test Lieutenant'), 'first reference should include signatory');
// Should start with id 1
assert(first.id === 1, 'first reference id should be 1');
// No bracket prefix in text
assert(!/^\[\d+\]/.test(first.text), 'reference text should not start with bracket number');

console.log('reportGen signatory reference test passed.');

// Test: disabling canon names prevents famous names in references
const cfgNoCanon: GeneratorConfig = {
  ...cfg,
  seed: 'no-canon-seed-456',
  allowCanonNames: false
};
const reportNoCanon = generateReport(cfgNoCanon);
// Only scan author segments (before the em dash) to avoid matching titles/journals
const authorsOnly = reportNoCanon.references
  .map(r => r.text.split(' — ')[0])
  .join('\n');
// Look for specific famous formatted patterns to avoid false positives on last names
const famousAuthorPatterns = [
  /Forge,\s+Geordi\s+La\b/i, // Geordi La Forge formatted as "Forge, Geordi La"
  /O'Brien,\s+Miles\b/i,
  /Scott,\s+Montgomery\b/i,
  /Dax,\s+Jadzia\b/i,
  /Dax,\s+Ezri\b/i,
  /\bSpock\b/i,
  /\bWorf,\b/i
];
famousAuthorPatterns.forEach(rx => {
  assert(!rx.test(authorsOnly), 'canon author should be excluded when allowCanonNames=false');
});

console.log('reportGen canon exclusion test passed.');

// Test: filterCanonByEra limits famous authors to vessel-active years
const cfgEraFilter: GeneratorConfig = {
  ...cfg,
  seed: 'era-filter-seed-789',
  allowCanonNames: true,
  filterCanonByEra: true,
  vessel: 'USS Voyager NCC-74656' // 2371-2378
};
const reportEra = generateReport(cfgEraFilter);
const authorsOnlyEra = reportEra.references.map(r => r.text.split(' — ')[0]).join('\n');
// Montgomery Scott (2265-2293) should not appear on Voyager-era reports
const scottyPattern = /Scott,\s+Montgomery\b/i;
assert(!scottyPattern.test(authorsOnlyEra), 'out-of-era famous author should be filtered out');

console.log('reportGen era filter test passed.');

// Test: frequency=off yields no famous authors
const cfgFreqOff: GeneratorConfig = {
  ...cfg,
  seed: 'freq-off-seed-123',
  allowCanonNames: true,
  filterCanonByEra: true,
  famousAuthorFrequency: 'off'
};
const reportFreqOff = generateReport(cfgFreqOff);
const authorsOnlyOff = reportFreqOff.references.map(r => r.text.split(' — ')[0]).join('\n');
console.log('authorsOnlyOff:\n' + authorsOnlyOff);
const curatedFamousPatterns = [
  /Forge,\s+Geordi\s+La\b/i,
  /O'Brien,\s+Miles\b/i,
  /Scott,\s+Montgomery\b/i,
  /Dax,\s+Jadzia\b/i,
  /Dax,\s+Ezri\b/i,
  /(?:^|,\s)Spock(?:,|$)/i,
  /(?:^|,\s)Worf(?:,|$)/i,
  /Torres,\s+B'Elanna\b/i,
  /(?:^|,\s)Data(?:,|$)/i,
  /Crusher,\s+Beverly\b/i,
  /Nine,\s+Seven\s+of\b/i,
  /Uhura,\s+Nyota\b/i,
  /Chapel,\s+Christine\b/i
];
curatedFamousPatterns.forEach(rx => {
  assert(!rx.test(authorsOnlyOff), 'no famous authors should appear when frequency is off');
});

// Test: at most one famous per reference entry
const cfgOncePerRef: GeneratorConfig = {
  ...cfg,
  seed: 'once-per-ref-456',
  allowCanonNames: true,
  filterCanonByEra: true,
  famousAuthorFrequency: 'frequent'
};
const reportOncePer = generateReport(cfgOncePerRef);
reportOncePer.references.forEach(ref => {
  const head = ref.text.split(' — ')[0];
  const count = curatedFamousPatterns.reduce((acc, rx) => acc + (rx.test(head) ? 1 : 0), 0);
  assert(count <= 1, 'at most one famous author per reference entry');
});

console.log('reportGen frequency tests passed.');
