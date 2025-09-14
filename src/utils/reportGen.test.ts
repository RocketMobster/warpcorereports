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
