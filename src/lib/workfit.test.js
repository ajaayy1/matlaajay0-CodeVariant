import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSpace,
  recommendSpaces,
  haversineKm,
  directionsUrl,
  normalizeWeights
} from './workfit.js';

const base = {
  id: 'lib',
  quiet: 95,
  wifi: 68,
  seating: 85,
  calls: false,
  group: false,
  charging: true,
  cost: 0,
  opens: 8,
  closes: 20,
  lat: 17.44,
  lng: 78.35
};

const pref = {
  activity: 'study',
  must: { wifi: false, charging: false, calls: false, group: false, free: false },
  weights: { quiet: 60, wifi: 15, seating: 25 },
  budget: 350,
  startHour: 14,
  duration: 2
};

test('study is eligible and yields /10 score', () => {
  const r = evaluateSpace(base, pref);
  assert.equal(r.status, 'eligible');
  assert.equal(r.score, 8.8);
});

test('online interview excludes library even though quiet', () => {
  const r = evaluateSpace(base, { ...pref, activity: 'meeting' });
  assert.equal(r.status, 'incompatible');
  assert.equal(r.score, null);
  assert.ok(r.reasons.join(' ').includes('Speaking'));
});

test('unknown charging is unverified', () => {
  const r = evaluateSpace({ ...base, charging: null }, { ...pref, must: { ...pref.must, charging: true } });
  assert.equal(r.status, 'unverified');
});

test('known failed constraint outranks missing information', () => {
  const r = evaluateSpace({ ...base, wifi: null }, { ...pref, activity: 'meeting', must: { ...pref.must, wifi: true } });
  assert.equal(r.status, 'incompatible');
});

test('weight sliders normalize to a unit sum', () => {
  const w = normalizeWeights({ quiet: 20, wifi: 40, seating: 40 });
  assert.equal(w.quiet + w.wifi + w.seating, 1);
});

test('result ordering keeps compatible ahead of incompatible', () => {
  const list = recommendSpaces(
    [base, { ...base, id: 'cow', calls: true, quiet: 82, wifi: 94, seating: 90, cost: 200 }],
    { ...pref, activity: 'meeting' }
  );
  assert.equal(list[0].id, 'cow');
  assert.equal(list[1].status, 'incompatible');
});

test('same starting point has zero distance', () => {
  assert.equal(haversineKm(base, base), 0);
});

test('maps link points at demo coordinates', () => {
  assert.match(directionsUrl(base), /google\.com\/maps\/dir/);
  assert.match(directionsUrl(base), /destination=/);
});
