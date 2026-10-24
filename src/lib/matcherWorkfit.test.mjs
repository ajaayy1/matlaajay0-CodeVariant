import test from 'node:test';
import assert from 'node:assert/strict';
import { matcherSpaces } from '../data/matcherSpaces.js';
import { initialMatcherPreferences, evaluateMatcherSpace, rankMatcherSpaces } from './matcherWorkfit.js';

const library = matcherSpaces.find(s => s.id === 'library');
const focus = matcherSpaces.find(s => s.id === 'focus');
const research = matcherSpaces.find(s => s.id === 'research');

test('Online meeting excludes silent library', () => {
  const p = initialMatcherPreferences('meeting');
  assert.equal(evaluateMatcherSpace(library, p).status, 'incompatible');
});
test('Online meeting accepts suitable coworking', () => {
  const p = initialMatcherPreferences('meeting');
  const r = evaluateMatcherSpace(focus, p);
  assert.equal(r.status, 'eligible');
  assert.ok(r.score >= 0 && r.score <= 10);
});
test('Free only excludes paid coworking', () => {
  const p = initialMatcherPreferences('study');
  p.must.free = true;
  assert.equal(evaluateMatcherSpace(focus, p).status, 'incompatible');
});
test('Unknown mandatory charging never counts as yes', () => {
  const p = initialMatcherPreferences('study');
  p.must.charging = true;
  assert.equal(evaluateMatcherSpace(research, p).status, 'unverified');
});
test('Confirmed failure takes precedence over unverified fields', () => {
  const p = initialMatcherPreferences('meeting');
  assert.equal(evaluateMatcherSpace(research, p).status, 'incompatible');
});
test('Budget filters pricey venues', () => {
  const p = initialMatcherPreferences('laptop');
  p.budget = 100;
  assert.equal(evaluateMatcherSpace(focus, p).status, 'incompatible');
});
test('Eligible first in ranking', () => {
  const p = initialMatcherPreferences('study');
  const ranked = rankMatcherSpaces(matcherSpaces, p);
  const statuses = ranked.map(s => s.status);
  const priority = { eligible: 0, unverified: 1, incompatible: 2 };
  assert.ok(statuses.every((status, index) => index === 0 || priority[statuses[index - 1]] <= priority[status]));
});
test('Meeting / group activity hard rules cannot be bypassed with weight sliders', () => {
  const p = initialMatcherPreferences('group');
  p.weights = { quiet: 0, wifi: 100, seating: 0 };
  assert.equal(evaluateMatcherSpace(library, p).status, 'incompatible');
});
