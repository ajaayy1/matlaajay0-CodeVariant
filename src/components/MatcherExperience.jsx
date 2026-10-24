import { useEffect, useMemo, useState } from 'react';
import { matcherActivities, matcherSpaces } from '../data/matcherSpaces.js';
import { initialMatcherPreferences, rankMatcherSpaces } from '../lib/matcherWorkfit.js';
import './MatcherExperience.css';

const METRICS = [
  ['quiet', '🤫', 'Quietness'],
  ['wifi', '📶', 'Wi-Fi quality'],
  ['seating', '🪑', 'Seating comfort']
];
const MUST_FIELDS = [
  ['calls', 'Calls / speaking allowed'],
  ['wifi', 'Reliable Wi-Fi (70+/100)'],
  ['charging', 'Charging point'],
  ['group', 'Group-friendly seating'],
  ['free', 'Free access only']
];

function money(n) {
  return n === 0 ? 'Free' : typeof n === 'number' ? `₹${n}/visit` : 'Unverified price';
}

function Status({ space }) {
  return <span className={`qp-status qp-status--${space.status}`}>
    {space.status === 'eligible' ? '✓ Eligible' : space.status === 'unverified' ? '? Unverified' : '× Excluded'}
  </span>;
}

function SpaceCard({ space, checked, onCompare, saved, onSave }) {
  const [details, setDetails] = useState(false);
  const directionsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.area)}`;
  return (
    <article className={`qp-result-card qp-result-card--${space.status}`}>
      <div className="qp-result-picture">
        <img src={`/images/${space.image}`} alt={`${space.name} illustrative workspace`} loading="lazy" />
        <span className="qp-picture-type">{space.category}</span>
      </div>
      <div className="qp-result-info">
        <div className="qp-small-row"><Status space={space}/><span className="qp-muted">{space.type}</span></div>
        <h3>{space.name}</h3>
        <p className="qp-muted">📍 {space.area} · {money(space.cost)}</p>
        <div className="qp-facilities">
          <span>🤫 {space.quiet ?? '?'}/100</span>
          <span>📶 {space.wifi ?? '?'}/100</span>
          <span>🪑 {space.seating ?? '?'}/100</span>
          <span>{space.calls ? '✓ Calls' : space.calls === false ? '× Calls' : '? Calls'}</span>
        </div>
        <p className="qp-reason"><strong>{space.status === 'incompatible' ? 'Why excluded:' : space.status === 'unverified' ? 'Needs verification:' : 'Why it fits:'}</strong> {space.reasons[0]}</p>
        {details && <div className="qp-detail-panel">
          <div>Charging: <strong>{space.charging === null ? 'Unknown' : space.charging ? 'Yes' : 'No'}</strong></div>
          <div>Group seating: <strong>{space.group === null ? 'Unknown' : space.group ? 'Yes' : 'No'}</strong></div>
          <div>Demo hours: <strong>{space.opens}:00–{space.closes}:00</strong></div>
          {space.reasons.length > 1 && <ul>{space.reasons.slice(1).map((r, i) => <li key={i}>{r}</li>)}</ul>}
        </div>}
      </div>
      <div className="qp-result-cta">
        <div className="qp-score">{space.score === null ? '—' : `${space.score.toFixed(1)}`}<small>{space.score === null ? space.tier : 'WorkFit / 10'}</small></div>
        {space.score !== null && <span className="qp-tier">{space.tier}</span>}
        <button className="qp-button qp-button--outline" type="button" onClick={() => setDetails(v => !v)}>{details ? 'Hide details' : 'Why this fit?'}</button>
        <label className="qp-compare-choice"><input type="checkbox" checked={checked} disabled={!checked && space.status !== 'eligible'} onChange={() => onCompare(space.id)} /> Compare</label>
        <button className="qp-button qp-button--outline" type="button" onClick={() => onSave(space.id)}>{saved ? '♥ Saved' : '♡ Save'}</button>
        <a className="qp-map-link" href={directionsSearch} target="_blank" rel="noopener noreferrer">Search this area on Maps ↗</a>
      </div>
    </article>
  );
}

function ComparisonTable({ spaces, preferences }) {
  const rows = [
    ['WorkFit score', s => s.score === null ? '—' : `${s.score.toFixed(1)}/10`],
    ['Eligibility', s => s.tier],
    ['Calls allowed', s => s.calls === null ? 'Unverified' : s.calls ? '✓ Yes' : '✕ No'],
    ['Group discussion', s => s.group === null ? 'Unverified' : s.group ? '✓ Yes' : '✕ No'],
    ['Charging', s => s.charging === null ? 'Unverified' : s.charging ? '✓ Yes' : '✕ No'],
    ['Wi-Fi', s => s.wifi === null ? 'Unverified' : `${s.wifi}/100`],
    ['Quietness', s => `${s.quiet}/100`],
    ['Seating', s => `${s.seating}/100`],
    ['Cost', s => money(s.cost)],
    ['Demo hours', s => `${s.opens}:00 – ${s.closes}:00`]
  ];
  return <div>
    <div className="qp-overflow">
      <table className="qp-comparison-table">
        <thead><tr><th>Criteria</th>{spaces.map(s => <th key={s.id}>{s.name}</th>)}</tr></thead>
        <tbody>{rows.map(([label, formatter]) => <tr key={label}><th>{label}</th>{spaces.map(s => <td key={s.id}>{formatter(s)}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <p className="qp-footnote">Compared for {matcherActivities.find(a => a.id === preferences.activity)?.label}. Scores use your weights only after every hard requirement passes.</p>
  </div>;
}

export default function MatcherExperience({ initialActivity = 'study' }) {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState(() => initialMatcherPreferences(initialActivity));
  const [compareIds, setCompareIds] = useState([]);
  const [showExcluded, setShowExcluded] = useState(false);
  const [savedIds, setSavedIds] = useState(() => { try { return JSON.parse(localStorage.getItem('qp-matcher-saved') || '[]'); } catch { return []; } });
  const [onlySaved, setOnlySaved] = useState(false);
  const [sort, setSort] = useState('fit');

  useEffect(() => {
    // Keep the landing-page activity choice in sync when a user changes it.
    setPrefs(old => old.activity === initialActivity ? old : initialMatcherPreferences(initialActivity));
    setStep(1);
  }, [initialActivity]);
  useEffect(() => { try { localStorage.setItem('qp-matcher-saved', JSON.stringify(savedIds)); } catch { /* Storage optional. */ } }, [savedIds]);

  const ranked = useMemo(() => rankMatcherSpaces(matcherSpaces, prefs), [prefs]);
  const eligible = ranked.filter(s => s.status === 'eligible');
  const unverified = ranked.filter(s => s.status === 'unverified');
  const incompatible = ranked.filter(s => s.status === 'incompatible');
  const filtered = (onlySaved ? ranked.filter(s => savedIds.includes(s.id)) : ranked).filter(s => showExcluded || s.status === 'eligible');
  const shown = sort === 'cost' ? [...filtered].sort((a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity)) : filtered;
  const compared = compareIds.map(id => ranked.find(s => s.id === id)).filter(Boolean);

  const move = next => {
    if (next === 3 && compareIds.length === 0) setCompareIds(eligible.slice(0, 2).map(s => s.id));
    setStep(next);
    requestAnimationFrame(() => document.getElementById('matcher')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const chooseActivity = id => { setPrefs(initialMatcherPreferences(id)); setCompareIds([]); };
  const toggleMust = field => setPrefs(old => ({ ...old, must: { ...old.must, [field]: !old.must[field] } }));
  const toggleCompare = id => setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  const toggleSave = id => setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <section id="matcher" className="qp-matcher" aria-label="3-Step WorkFit Matcher">
      <div className="qp-matcher-container">
        <div className="qp-stepper" aria-label="Matcher progress">
          {[['1', 'Preferences'], ['2', 'Matches'], ['3', 'Compare']].map(([num, name], i) =>
            <div key={num} className={`qp-stepper-item ${step === i + 1 ? 'is-current' : ''} ${step > i + 1 ? 'is-complete' : ''}`}>
              <span>{step > i + 1 ? '✓' : num}</span>{name}
            </div>
          )}
        </div>

        {step === 1 && <>
          <div className="qp-section-heading"><span className="qp-kicker">01 / 03 · PREFERENCES</span><h2>What will you work on?</h2><p>Pick your activity, then tell us what matters most.</p></div>
          <div className="qp-pref-layout"><div className="qp-panel">
            <h3>Your activity</h3>
            <div className="qp-activity-list">{matcherActivities.map(a => <button key={a.id} type="button" className={`qp-activity-choice ${prefs.activity === a.id ? 'active' : ''}`} onClick={() => chooseActivity(a.id)} aria-pressed={prefs.activity === a.id}><span className="qp-emoji">{a.icon}</span><span><strong>{a.label}</strong><small>{a.desc}</small></span><span className="qp-activity-check">{prefs.activity === a.id ? '✓' : '→'}</span></button>)}</div>
            <h3>Must have <small>Non-negotiable conditions</small></h3>
            <div className="qp-must-grid">{MUST_FIELDS.map(([id, label]) => <label key={id} className={`qp-must-item ${prefs.must[id] ? 'checked' : ''}`}><input type="checkbox" checked={prefs.must[id]} onChange={() => toggleMust(id)} />{label}</label>)}</div>
            <h3>Nice to have <small>Preference weights</small></h3>
            <div className="qp-ranges">{METRICS.map(([key, icon, label]) => <label className="qp-range" key={key}><span>{icon} {label}<b>{prefs.weights[key]}%</b></span><input type="range" min="0" max="100" step="5" value={prefs.weights[key]} onChange={e => setPrefs(old => ({ ...old, weights: { ...old.weights, [key]: Number(e.target.value) } }))} /></label>)}</div>
            <h3>Location, budget & session</h3>
            <div className="qp-input-grid"><label>Location<select value={prefs.location} onChange={e => setPrefs(old => ({ ...old, location: e.target.value }))}><option value="Both">Campus & city</option><option value="Campus">Campus only</option><option value="City">City only</option></select></label><label>Max budget (₹/visit)<input type="number" min="0" step="50" disabled={prefs.must.free} value={prefs.budget} onChange={e => setPrefs(old => ({ ...old, budget: Math.max(0, Number(e.target.value)) }))} /></label><label>Start hour<select value={prefs.startHour} onChange={e => setPrefs(old => ({ ...old, startHour: Number(e.target.value) }))}>{Array.from({length: 12}, (_, i) => i + 8).map(h => <option value={h} key={h}>{h}:00</option>)}</select></label><label>Duration<select value={prefs.duration} onChange={e => setPrefs(old => ({ ...old, duration: Number(e.target.value) }))}>{[1,2,3,4,5].map(h => <option value={h} key={h}>{h} hour{h !== 1 && 's'}</option>)}</select></label></div>
            <div className="qp-form-footer"><a href="#home" className="qp-button qp-button--outline">← Back to home</a><button type="button" className="qp-button" onClick={() => { setCompareIds([]); move(2); }}>Find matching spaces →</button></div>
          </div><aside className="qp-panel qp-aside"><div className="qp-aside-icon">⚖️</div><h3>Rules first. Score second.</h3><p>A venue with great Wi-Fi is still excluded if your activity requires speaking and its rules prohibit calls.</p><div className="qp-aside-info"><strong>WorkFit logic</strong><p>Mandatory constraints → eligible / unverified / incompatible → weighted score out of 10.</p></div><p className="qp-muted">The recommendations use fictional demonstration data, not verified live availability.</p></aside></div>
        </>}

        {step === 2 && <>
          <div className="qp-section-heading"><span className="qp-kicker">02 / 03 · YOUR MATCHES</span><h2>Your matching spaces</h2><p>Activity: <strong>{matcherActivities.find(a => a.id === prefs.activity)?.label}</strong>. WorkFit ranks only spaces that pass your must-haves.</p></div>
          <div className="qp-summary"><strong>{eligible.length} eligible</strong><span>{unverified.length} unverified</span><span>{incompatible.length} excluded</span></div>
          <div className="qp-toolbar"><label><input type="checkbox" checked={showExcluded} onChange={e => setShowExcluded(e.target.checked)} /> Show excluded & unverified</label><label><input type="checkbox" checked={onlySaved} onChange={e => setOnlySaved(e.target.checked)} /> Saved only</label><label>Sort <select value={sort} onChange={e => setSort(e.target.value)}><option value="fit">Best WorkFit</option><option value="cost">Lowest cost</option></select></label></div>
          <div className="qp-result-list">{shown.length ? shown.map(space => <SpaceCard key={space.id} space={space} checked={compareIds.includes(space.id)} onCompare={toggleCompare} saved={savedIds.includes(space.id)} onSave={toggleSave}/>) : <div className="qp-panel"><h3>No spaces in this view</h3><p>Try relaxing your requirements or turn off “Saved only”. Excluded spaces may still appear with an explanation.</p></div>}</div>
          <div className="qp-form-footer"><button className="qp-button qp-button--outline" onClick={() => move(1)}>← Edit preferences</button><div className="qp-comparison-action"><span>{compareIds.length}/3 selected</span><button className="qp-button" onClick={() => move(3)} disabled={!eligible.length}>Compare suitable spaces →</button></div></div>
          <p className="qp-footnote">These are fictional demonstration profiles. Policies, costs, images and opening hours are not live verified business information.</p>
        </>}

        {step === 3 && <>
          <div className="qp-section-heading"><span className="qp-kicker">03 / 03 · COMPARE & DECIDE</span><h2>Compare and decide</h2><p>Understand the trade-offs between your shortlisted workspaces.</p></div>
          {compared.length ? <ComparisonTable spaces={compared} preferences={prefs} /> : <div className="qp-panel">No workspaces selected. Return to results and pick up to three.</div>}
          {compared.length > 0 && <div className="qp-panel qp-decision"><span>🏆</span><div><strong>Top match: {compared.slice().sort((a,b) => (b.score ?? -1) - (a.score ?? -1))[0].name}</strong><p>Selected-workspace comparison based on your current WorkFit weights and mandatory requirements.</p></div></div>}
          <div className="qp-form-footer"><button className="qp-button qp-button--outline" onClick={() => move(2)}>← Back to results</button><a href="#home" className="qp-button" onClick={() => setStep(1)}>Return to homepage ↑</a></div>
        </>}
      </div>
    </section>
  );
}
