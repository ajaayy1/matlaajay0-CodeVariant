// Rules first, score second. Unknown values never count as confirmed amenities.
import { matcherActivities } from '../data/matcherSpaces.js';

export function initialMatcherPreferences(activityId = 'study') {
  const defaults = {
    study: { charging: false, wifi: false, calls: false, group: false },
    laptop: { charging: true, wifi: true, calls: false, group: false },
    group: { charging: false, wifi: false, calls: true, group: true },
    meeting: { charging: true, wifi: true, calls: true, group: false },
    reading: { charging: false, wifi: false, calls: false, group: false }
  };
  const act = matcherActivities.find(a => a.id === activityId) || matcherActivities[0];
  return {
    activity: act.id,
    must: { ...defaults[act.id], free: false },
    weights: { ...act.weights },
    budget: 500,
    location: 'Both',
    startHour: 10,
    duration: 2
  };
}

const verdict = (space, status, reasons, score = null) => ({
  ...space, status, score, reasons,
  tier: status === 'incompatible' ? 'Incompatible' : status === 'unverified' ? 'Unverified' :
    score >= 9 ? 'Excellent Fit' : score >= 7.5 ? 'Strong Fit' : score >= 6 ? 'Good Fit' : 'Basic Fit'
});

export function evaluateMatcherSpace(space, prefs) {
  const failed = [];
  const unknown = [];
  const must = prefs.must || {};
  const check = (value, ok, failMessage, unknownMessage) => {
    if (value === null || value === undefined || Number.isNaN(value)) unknown.push(unknownMessage || failMessage);
    else if (!ok(value)) failed.push(failMessage);
  };
  if (prefs.location !== 'Both' && space.type !== prefs.location) failed.push(`Outside your selected area (${prefs.location}).`);
  if (prefs.activity === 'meeting' || must.calls) check(space.calls, v => v === true, 'Speaking/calls are not permitted.', 'Speaking permission is unverified.');
  if (prefs.activity === 'group' || must.group) check(space.group, v => v === true, 'Group discussion is not permitted.', 'Group seating is unverified.');
  if (must.charging) check(space.charging, v => v === true, 'Charging points are unavailable.', 'Charging access is unverified.');
  if (must.wifi) check(space.wifi, v => v >= 70, 'Wi-Fi quality is below the 70/100 requirement.', 'Wi-Fi quality is unverified.');
  if (must.free) check(space.cost, v => v === 0, 'This workspace is paid; free access is required.', 'Access cost is unverified.');
  else check(space.cost, v => v <= prefs.budget, `Exceeds your ₹${prefs.budget} budget.`, 'Access cost is unverified.');
  if (prefs.startHour !== undefined && prefs.duration !== undefined) {
    check(space.opens, v => v <= prefs.startHour, 'Opens after your planned start time.', 'Opening hours are unverified.');
    check(space.closes, v => v >= prefs.startHour + prefs.duration, 'Closes before your session ends.', 'Closing hours are unverified.');
  }
  if (failed.length) return verdict(space, 'incompatible', failed);
  if (unknown.length) return verdict(space, 'unverified', unknown);
  if (['quiet', 'wifi', 'seating'].some(k => !Number.isFinite(space[k]))) return verdict(space, 'unverified', ['A suitability factor is unverified.']);
  const weights = prefs.weights || { quiet: 1, wifi: 1, seating: 1 };
  const total = Math.max(0, Number(weights.quiet) || 0) + Math.max(0, Number(weights.wifi) || 0) + Math.max(0, Number(weights.seating) || 0);
  const score = total
    ? Math.round((space.quiet * Math.max(0, weights.quiet) + space.wifi * Math.max(0, weights.wifi) + space.seating * Math.max(0, weights.seating)) / total) / 10
    : Math.round((space.quiet + space.wifi + space.seating) / 3) / 10;
  const reasons = [
    space.quiet >= 85 ? 'Very quiet environment' : space.quiet >= 75 ? 'Good noise control' : null,
    space.wifi >= 88 ? 'Excellent Wi-Fi quality' : space.wifi >= 70 ? 'Reliable Wi-Fi' : null,
    space.seating >= 85 ? 'Comfortable ergonomic seating' : null,
    (prefs.activity === 'meeting' || must.calls) && space.calls ? 'Speaking and calls permitted' : null,
    must.charging && space.charging ? 'Charging available' : null,
    space.cost === 0 ? 'Free access' : null
  ].filter(Boolean);
  return verdict(space, 'eligible', reasons.length ? reasons : ['Meets all your mandatory requirements'], score);
}

export function rankMatcherSpaces(spaces, preferences) {
  const priority = { eligible: 0, unverified: 1, incompatible: 2 };
  return spaces.map(s => evaluateMatcherSpace(s, preferences)).sort((a, b) =>
    priority[a.status] - priority[b.status] || (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name)
  );
}
