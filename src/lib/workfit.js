// Pure JavaScript rules-based WorkFit matching engine.
// Rules first, score second. Unknown is never treated as yes.
// Scores (0–10) are calculated strictly after mandatory eligibility checks pass.

export function normalizeWeights(weights = {}) {
  const safe = Object.fromEntries(
    ['quiet', 'wifi', 'seating'].map(key => [key, Math.max(0, Number(weights[key]) || 0)])
  );
  const sum = Object.values(safe).reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    Object.entries(safe).map(([key, val]) => [key, sum ? val / sum : 1 / 3])
  );
}

export function evaluateSpace(space, preferences = {}) {
  const failed = [];
  const unknown = [];

  function check(value, condition, description, failDetail = null) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      unknown.push(`${description}: not verified`);
    } else if (!condition(value)) {
      failed.push(failDetail || `${description}: requirement not met`);
    }
  }

  const m = preferences.must || {};

  // Mandatory Checks
  if (preferences.activity === 'meeting' || m.calls) {
    check(
      space.calls,
      v => v === true,
      'Speaking permission',
      'Speaking is not permitted. Excellent quietness does not override this rule.'
    );
  }

  if (preferences.activity === 'group' || m.group) {
    check(
      space.group,
      v => v === true,
      'Group discussion',
      'Group collaboration is not supported. Seating is reserved for solo work only.'
    );
  }

  if (m.charging) {
    check(
      space.charging,
      v => v === true,
      'Charging',
      'Charging points are unavailable or unverified at desks.'
    );
  }

  if (m.wifi) {
    check(
      space.wifi,
      v => Number.isFinite(v) && v >= 70,
      'Reliable Wi-Fi',
      `Wi-Fi rating (${space.wifi ?? 'unknown'}/100) is below the required 70/100 threshold.`
    );
  }

  if (m.free) {
    check(
      space.cost,
      v => v === 0,
      'Free access',
      `Paid venue (₹${space.cost}/visit). Free access was required.`
    );
  } else if (preferences.budget != null) {
    check(
      space.cost,
      v => v <= preferences.budget,
      'Budget',
      `Access cost (₹${space.cost}) exceeds your maximum budget of ₹${preferences.budget}.`
    );
  }

  if (preferences.startHour != null && preferences.duration != null) {
    const endHour = preferences.startHour + preferences.duration;
    check(
      space.opens,
      v => v <= preferences.startHour,
      'Opening time',
      `Opens at ${space.opens}:00, which is after your planned start time of ${preferences.startHour}:00.`
    );
    check(
      space.closes,
      v => v >= endHour,
      'Closing time',
      `Closes at ${space.closes}:00, before your planned session ends at ${endHour}:00.`
    );
  }

  // A known failure always has priority over unknown values.
  if (failed.length > 0) {
    return {
      ...space,
      status: 'incompatible',
      score: null,
      reasons: failed,
      tier: 'Incompatible'
    };
  }

  if (unknown.length > 0) {
    return {
      ...space,
      status: 'unverified',
      score: null,
      reasons: unknown,
      tier: 'Unverified'
    };
  }

  const keys = ['quiet', 'wifi', 'seating'];
  if (keys.some(key => !Number.isFinite(space[key]))) {
    return {
      ...space,
      status: 'unverified',
      score: null,
      reasons: ['Suitability details are incomplete'],
      tier: 'Unverified'
    };
  }

  // Transparent Activity-Weighted Scoring
  const weights = normalizeWeights(preferences.weights);
  const raw = keys.reduce((sum, key) => sum + space[key] * weights[key], 0) / 10;
  const score = Math.round(raw * 10) / 10;

  const reasons = [];
  if (space.quiet >= 85) reasons.push('Exceptionally quiet environment');
  else if (space.quiet >= 75) reasons.push('Good acoustic comfort');

  if (space.wifi >= 88) reasons.push('Fast & stable Wi-Fi');
  else if (space.wifi >= 70) reasons.push('Reliable Wi-Fi');

  if (space.seating >= 85) reasons.push('Highly ergonomic seating');
  else if (space.seating >= 75) reasons.push('Comfortable study chairs');

  if (space.calls && (preferences.activity === 'meeting' || m.calls)) {
    reasons.push('Call-friendly policies & phone booths');
  }
  if (space.charging && m.charging) reasons.push('Guaranteed charging at every desk');
  if (space.cost === 0) reasons.push('Completely free access');

  const tier =
    score >= 9.0
      ? 'Excellent Fit'
      : score >= 7.5
      ? 'Strong Fit'
      : score >= 6.0
      ? 'Good Fit'
      : 'Basic Fit';

  return {
    ...space,
    status: 'eligible',
    score,
    reasons,
    tier
  };
}

export function recommendSpaces(spaces, preferences = {}) {
  const statusRank = { eligible: 0, unverified: 1, incompatible: 2 };
  return spaces
    .map(space => evaluateSpace(space, preferences))
    .sort((a, b) => {
      const rankDiff = statusRank[a.status] - statusRank[b.status];
      if (rankDiff !== 0) return rankDiff;
      return (b.score ?? -1) - (a.score ?? -1);
    });
}

export function haversineKm(from, to) {
  if (!from || !to || from.lat == null || to.lat == null) return 0;
  const R = 6371;
  const rad = n => (n * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLng = rad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function directionsUrl(place, origin) {
  const base = 'https://www.google.com/maps/dir/?api=1';
  const destination = encodeURIComponent(`${place.lat},${place.lng}`);
  const start = origin ? `&origin=${encodeURIComponent(`${origin.lat},${origin.lng}`)}` : '';
  return `${base}&destination=${destination}${start}&travelmode=walking`;
}
