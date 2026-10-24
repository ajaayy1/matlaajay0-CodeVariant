import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ACTIVITIES, SPACES, DEMO_ORIGIN } from './data/demoSpaces.js';
import { recommendSpaces, haversineKm, directionsUrl } from './lib/workfit.js';

const activityById = id => ACTIVITIES.find(a => a.id === id) || ACTIVITIES[0];
const money = cost => (cost == null ? 'Unknown' : cost === 0 ? 'Free' : `₹${cost}/visit`);

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Button({ children, variant = 'solid', className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

function StatusBadge({ place }) {
  const tone = place.status === 'eligible' ? 'green' : place.status === 'unverified' ? 'amber' : 'red';
  return <Badge tone={tone}>{place.tier}</Badge>;
}

function Score({ place }) {
  if (place.status === 'eligible') {
    return (
      <div className="score">
        <strong>
          {place.score.toFixed(1)}
          <small>/10</small>
        </strong>
        <span>WorkFit</span>
      </div>
    );
  }
  return <Badge tone={place.status === 'unverified' ? 'amber' : 'red'}>{place.tier}</Badge>;
}

/* -------------------------------------------------------------
 * Photo Carousel for Place Cards
 * ------------------------------------------------------------- */
function CardPhotoCarousel({ place, onOpenGallery, style = {} }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos =
    place.photos && place.photos.length > 0
      ? place.photos
      : [{ src: place.photo, caption: place.name }];

  const currentPhoto = photos[photoIndex] || photos[0];

  function handlePrev(e) {
    e.stopPropagation();
    setPhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function handleNext(e) {
    e.stopPropagation();
    setPhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  function handleDot(e, index) {
    e.stopPropagation();
    setPhotoIndex(index);
  }

  return (
    <div className="card-photo-wrapper" style={style}>
      <img
        src={`/images/${currentPhoto.src}`}
        alt={currentPhoto.caption || place.name}
        onClick={e => {
          e.stopPropagation();
          onOpenGallery(place, photoIndex);
        }}
        title="Click to view full photo gallery"
      />

      {photos.length > 1 && (
        <>
          <button className="carousel-nav-btn prev" onClick={handlePrev} aria-label="Previous photo">
            ‹
          </button>
          <button className="carousel-nav-btn next" onClick={handleNext} aria-label="Next photo">
            ›
          </button>

          <div className="carousel-dots">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === photoIndex ? 'active' : ''}`}
                onClick={e => handleDot(e, i)}
              />
            ))}
          </div>
        </>
      )}

      <button
        className="photo-count-pill"
        onClick={e => {
          e.stopPropagation();
          onOpenGallery(place, photoIndex);
        }}
        title="View all pictures"
      >
        📷 {photoIndex + 1}/{photos.length}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------
 * Full-Screen Photo Gallery Modal (Lightbox)
 * ------------------------------------------------------------- */
function GalleryModal({ place, initialIndex = 0, onClose, onBookDesk, onOpenNavigator }) {
  const photos =
    place.photos && place.photos.length > 0
      ? place.photos
      : [{ src: place.photo, caption: place.name }];
  const [index, setIndex] = useState(initialIndex);

  const currentPhoto = photos[index] || photos[0];

  function handlePrev() {
    setIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function handleNext() {
    setIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content gallery-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="eyebrow">
              PHOTO GALLERY ({index + 1} of {photos.length})
            </span>
            <h2 style={{ color: '#173c38', margin: '4px 0 0' }}>{place.name}</h2>
            <p className="subtle-text">{place.area} · {place.category}</p>
          </div>
          <div className="flex gap8">
            <Button variant="outline" className="btn-sm" onClick={() => { onClose(); onOpenNavigator(place); }}>
              ⌖ In-App Route
            </Button>
            <Button className="btn-sm" onClick={() => { onClose(); onBookDesk(place); }}>
              🎟️ Reserve Desk
            </Button>
          </div>
        </div>

        <div className="gallery-stage">
          <img src={`/images/${currentPhoto.src}`} alt={currentPhoto.caption} />
          {photos.length > 1 && (
            <>
              <button className="gallery-nav-arrow prev" onClick={handlePrev} aria-label="Previous">
                ‹
              </button>
              <button className="gallery-nav-arrow next" onClick={handleNext} aria-label="Next">
                ›
              </button>
            </>
          )}
          <div className="gallery-stage-caption">
            <h4>{currentPhoto.caption}</h4>
            <p>Verified venue photograph · Hyderabad workspace</p>
          </div>
        </div>

        {photos.length > 1 && (
          <div className="gallery-thumb-strip">
            {photos.map((p, i) => (
              <div
                key={i}
                className={`gallery-thumb ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                title={p.caption}
              >
                <img src={`/images/${p.src}`} alt={p.caption} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Top Navigation
 * ------------------------------------------------------------- */
function Nav({ page, setPage, activeCount, bookingCount, onOpenProfile, onOpenBookings }) {
  const [open, setOpen] = useState(false);

  function navigate(to) {
    setPage(to);
    setOpen(false);
  }

  return (
    <header className="topnav">
      <div className="nav-shell">
        <button className="brand" onClick={() => navigate('home')} aria-label="Go to homepage">
          <span className="brand-leaf">🍃</span>
          <span>
            <strong>The Quiet Place</strong>
            <small>Find your space. Find your focus.</small>
          </span>
        </button>

        <nav className={`nav-links ${open ? 'nav-open' : ''}`} aria-label="Main navigation">
          {[
            ['home', 'Home'],
            ['guided', '3-Step Matcher'],
            ['explore', 'Explore Spaces'],
            ['about', 'How It Works'],
            ['saved', 'Saved']
          ].map(([key, label]) => (
            <button
              key={key}
              className={page === key ? 'active' : ''}
              onClick={() => navigate(key)}
            >
              {label}
              {key === 'saved' && activeCount > 0 && (
                <span className="nav-count">{activeCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-right">
          {bookingCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={onOpenBookings}>
              🎟️ {bookingCount} {bookingCount === 1 ? 'Booking' : 'Bookings'}
            </button>
          )}
          <button className="btn btn-outline btn-sm" onClick={onOpenProfile}>
            👤 Team Matla (PS03)
          </button>
          <button
            className="menu-toggle"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------
 * Screen: Home (Matching Slide 1 & 2)
 * ------------------------------------------------------------- */
function Home({ activity, onActivity, go, openDetail, spaces, onStartGuided, onOpenNavigator, onOpenGallery }) {
  const [problemTab, setProblemTab] = useState('interview');
  const [heroBg, setHeroBg] = useState('panoramic');

  const heroBackgrounds = {
    panoramic: { label: '🌿 Biophilic Workspace', url: '/images/hero-panoramic.jpg' },
    library: { label: '📚 Campus Library', url: '/images/library-reading.jpg' },
    coworking: { label: '🏢 Hitec City Loft', url: '/images/coworking-lounge.jpg' },
    courtyard: { label: '☕ Garden Café', url: '/images/cafe-courtyard.jpg' }
  };

  return (
    <main>
      {/* Hero Banner (Slide 1) */}
      <section
        className="hero"
        style={{
          '--hero-bg': `url('${heroBackgrounds[heroBg].url}')`
        }}
      >
        <div className="hero-inner container">
          <div className="hero-content">
            <span className="eyebrow">CAMPUS AND CITY WORKSPACES · HYDERABAD</span>
            <h1>
              Find the right space<br />
              for what you need to do.
            </h1>
            <p>
              Discover quiet, comfortable and suitable spaces on campus and across Hyderabad —
              matched to your activity, preferences and requirements.
            </p>

            <div className="hero-vibe-bar">
              <span className="hero-vibe-label">Background Ambience:</span>
              {Object.entries(heroBackgrounds).map(([key, item]) => (
                <button
                  key={key}
                  className={`hero-vibe-btn ${heroBg === key ? 'active' : ''}`}
                  onClick={() => setHeroBg(key)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-note">
            <span className="hero-note-icon">☼</span>
            <div>
              <strong>Different tasks. Different environments.</strong>
              <small>Currently: {heroBackgrounds[heroBg].label.replace(/^[^\s]+ /, '')}</small>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Activity Selector (Slide 1) */}
      <section className="container">
        <div className="activity-panel">
          <div className="activity-panel-head">
            <h2>What are you looking for a space to do?</h2>
            <button className="text-button" onClick={() => go('about')}>
              Not sure? Take a quick tour →
            </button>
          </div>

          <div className="activity-row">
            {ACTIVITIES.map(a => (
              <button
                key={a.id}
                className={`activity-card ${a.id === activity ? 'chosen' : ''}`}
                onClick={() => onActivity(a.id)}
                aria-pressed={a.id === activity}
              >
                <div className="activity-icon">{a.icon}</div>
                <strong>{a.label}</strong>
                <small>{a.shortDesc}</small>
              </button>
            ))}
            <Button onClick={onStartGuided}>Find My Space →</Button>
          </div>
        </div>
      </section>

      {/* 4 Feature Points (Slide 1) */}
      <section className="container selling-points">
        <div>
          <span className="selling-points-icon">🎯</span>
          <div>
            <strong>Activity-based matching</strong>
            <p>Spaces suited to what you need to do</p>
          </div>
        </div>
        <div>
          <span className="selling-points-icon">📍</span>
          <div>
            <strong>Campus & city options</strong>
            <p>Libraries, study rooms, cafés, coworking and more</p>
          </div>
        </div>
        <div>
          <span className="selling-points-icon">⚖️</span>
          <div>
            <strong>Compare and choose</strong>
            <p>See what fits your needs best</p>
          </div>
        </div>
        <div>
          <span className="selling-points-icon">🎚️</span>
          <div>
            <strong>Real preferences, real fit</strong>
            <p>Filter by quietness, Wi-Fi, cost, access and more</p>
          </div>
        </div>
      </section>

      {/* Problem Spotlight Banner (Slide 2) */}
      <section className="container">
        <div className="problem-banner">
          <div className="problem-grid">
            <div>
              <span className="eyebrow">THE CORE PROBLEM</span>
              <h2>Right location, wrong environment.</h2>
              <p>
                A map shows where a place is. It can’t tell you whether you can do your work there.
                People piece together noise, Wi-Fi, charging, rules, and budget from reviews.
              </p>
              <div className="segmented">
                <button
                  className={problemTab === 'study' ? 'active' : ''}
                  onClick={() => setProblemTab('study')}
                >
                  Deep Study
                </button>
                <button
                  className={problemTab === 'interview' ? 'active' : ''}
                  onClick={() => setProblemTab('interview')}
                >
                  Online Interview
                </button>
                <button
                  className={problemTab === 'group' ? 'active' : ''}
                  onClick={() => setProblemTab('group')}
                >
                  Group Discussion
                </button>
              </div>
            </div>

            <div className="problem-cards">
              {problemTab === 'study' && (
                <>
                  <div className="problem-item">
                    <span className="problem-item-icon">📖</span>
                    <strong>Campus Library: 8.8/10</strong>
                    <Badge tone="green">Good fit</Badge>
                    <p>The campus library works: quiet, comfortable seating, average Wi-Fi.</p>
                  </div>
                  <div className="problem-item">
                    <span className="problem-item-icon">🏢</span>
                    <strong>FocusHub Coworking: 8.6/10</strong>
                    <Badge tone="green">Good fit</Badge>
                    <p>Quiet desk zones, strong connectivity, but costs ₹299/visit.</p>
                  </div>
                  <div className="problem-item">
                    <span className="problem-item-icon">☕</span>
                    <strong>Corner Café: 5.9/10</strong>
                    <Badge tone="amber">Basic fit</Badge>
                    <p>Too much ambient chatter and music for intense exam study.</p>
                  </div>
                </>
              )}

              {problemTab === 'interview' && (
                <>
                  <div className="problem-item" style={{ borderColor: '#f3c1ba', background: '#fdf3f1' }}>
                    <span className="problem-item-icon">❌</span>
                    <strong style={{ color: '#b84b3d' }}>Campus Library: Excluded</strong>
                    <Badge tone="red">Not Allowed</Badge>
                    <p>The library fails: speaking isn’t allowed. Silence cannot override this rule.</p>
                  </div>
                  <div className="problem-item" style={{ borderColor: '#b7d8be', background: '#f1f8f3' }}>
                    <span className="problem-item-icon">⭐</span>
                    <strong style={{ color: '#1b533a' }}>FocusHub Coworking: 8.9/10</strong>
                    <Badge tone="green">Strong Fit</Badge>
                    <p>Soundproof phone booths, ultra 94/100 Wi-Fi, and call-friendly policy.</p>
                  </div>
                  <div className="problem-item">
                    <span className="problem-item-icon">☕</span>
                    <strong>Corner Café: 6.9/10</strong>
                    <Badge tone="amber">Plan B</Badge>
                    <p>Calls allowed, but unpredictable background barista and blender noise.</p>
                  </div>
                </>
              )}

              {problemTab === 'group' && (
                <>
                  <div className="problem-item">
                    <span className="problem-item-icon">👥</span>
                    <strong>Collab Commons: 8.9/10</strong>
                    <Badge tone="green">Strong Fit</Badge>
                    <p>Moveable tables, whiteboards, and free conversation permissions.</p>
                  </div>
                  <div className="problem-item" style={{ borderColor: '#f3c1ba', background: '#fdf3f1' }}>
                    <span className="problem-item-icon">❌</span>
                    <strong style={{ color: '#b84b3d' }}>Silent Reading Room</strong>
                    <Badge tone="red">Excluded</Badge>
                    <p>Fails group requirement: conversational study breaks room policy.</p>
                  </div>
                  <div className="problem-item">
                    <span className="problem-item-icon">☕</span>
                    <strong>Roastery Coffee House</strong>
                    <Badge tone="green">Good Fit</Badge>
                    <p>Spacious outdoor seating, great chai and coffee for group chats.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Around You Carousel (Slide 1) */}
      <section className="container featured">
        <div className="featured-head">
          <div>
            <span className="eyebrow">HYDERABAD CAMPUS & CITY SPACES</span>
            <h2>Popular around you</h2>
          </div>
          <button className="text-button" onClick={() => go('explore')}>
            Explore all spaces →
          </button>
        </div>

        <div className="featured-grid">
          {spaces.slice(0, 5).map(p => (
            <article key={p.id} className="featured-card">
              <CardPhotoCarousel
                place={p}
                onOpenGallery={onOpenGallery}
                onDetail={() => openDetail(p.id)}
              />
              <div className="featured-card-body">
                <div>
                  <strong onClick={() => openDetail(p.id)} style={{ cursor: 'pointer' }}>{p.name}</strong>
                  <p>{p.tagline || `${p.category} · ${money(p.cost)}`}</p>
                  {p.liveStatus && (
                    <div className="live-meter-badge">
                      <span className="live-pulse"></span>
                      <span>{p.liveStatus.freeDesks} seats free</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button className="text-button" style={{ fontSize: '0.8rem' }} onClick={() => onOpenNavigator(p)}>
                    ⌖ View Map
                  </button>
                  <Button variant="outline" className="btn-sm" onClick={() => openDetail(p.id)}>
                    Details →
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="tiny" style={{ marginTop: '16px', textAlign: 'center' }}>
          * Prototype demonstration data with illustrative Hyderabad coordinates. Click any photo to open full gallery.
        </p>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------
 * Screen 01/03: Preferences (Slide 7)
 * ------------------------------------------------------------- */
function Step01Preferences({ activity, onActivity, form, onFormChange, onNext, onCancel }) {
  const act = activityById(activity);

  return (
    <div className="container page-pad">
      <div className="section-head">
        <div className="section-head-row">
          <span className="eyebrow">01 · PREFERENCES</span>
          <span className="step-indicator">01 / 03</span>
        </div>
        <h1>What will you work on?</h1>
        <p>Choose your activity, then tell us what matters.</p>
      </div>

      <div className="pref-layout">
        <div className="card pref-form">
          <span className="field-label" style={{ fontWeight: 800, fontSize: '0.82rem', color: '#62756c' }}>
            YOUR ACTIVITY
          </span>

          <div className="pref-activity-list">
            {ACTIVITIES.map(a => {
              const selected = a.id === activity;
              return (
                <button
                  key={a.id}
                  className={`pref-activity-card ${selected ? 'active' : ''}`}
                  onClick={() => onActivity(a.id)}
                  type="button"
                >
                  <div className="pref-check-circle">{selected ? '✓' : '○'}</div>
                  <div className="pref-activity-card-info">
                    <strong>{a.label}</strong>
                    <small>{a.shortDesc}</small>
                  </div>
                  <span className="pref-arrow">{selected ? '✓' : '→'}</span>
                </button>
              );
            })}
          </div>

          <h3 className="pref-section-title must-title">
            MUST HAVE <small>Non-negotiable conditions</small>
          </h3>
          <div className="check-grid">
            {[
              ['calls', 'Calls / Speaking allowed'],
              ['wifi', 'Wi-Fi available (≥ 70)'],
              ['charging', 'Charging point'],
              ['free', 'Free access only'],
              ['group', 'Group friendly seating']
            ].map(([key, label]) => (
              <label
                key={key}
                className={`check-tile ${form.must[key] ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={form.must[key]}
                  onChange={e =>
                    onFormChange({ must: { ...form.must, [key]: e.target.checked } })
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <h3 className="pref-section-title">
            NICE TO HAVE <small>Preference weights</small>
          </h3>
          {[
            ['quiet', 'Quietness', '🤫'],
            ['wifi', 'Wi-Fi quality', '📶'],
            ['seating', 'Seating comfort', '🪑']
          ].map(([key, label, icon]) => (
            <label className="range-label" key={key}>
              <span>
                <span>{icon} {label}</span>
                <strong>{form.weights[key]}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.weights[key]}
                onChange={e =>
                  onFormChange({
                    weights: { ...form.weights, [key]: +e.target.value }
                  })
                }
              />
            </label>
          ))}

          <h3 className="pref-section-title">
            LOCATION & BUDGET <small>Practical bounds</small>
          </h3>
          <div className="two-input">
            <label>
              Campus or City
              <select
                value={form.location}
                onChange={e => onFormChange({ location: e.target.value })}
              >
                <option value="Both">Both campus & city</option>
                <option value="Campus">Campus only</option>
                <option value="City">City only</option>
              </select>
            </label>
            <label>
              Max Budget (₹ / visit)
              <input
                type="number"
                min="0"
                step="50"
                value={form.budget}
                disabled={form.must.free}
                onChange={e => onFormChange({ budget: Math.max(0, +e.target.value) })}
              />
            </label>
          </div>

          <div className="form-footer">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onNext}>
              Find matching spaces →
            </Button>
          </div>
        </div>

        <aside className="card pref-aside">
          <div className="aside-icon">⚖️</div>
          <h2>Rules first. Score second.</h2>
          <p>
            A space that has 100/100 Wi-Fi and plush couches will still be rejected if you need to take an
            interview and conversations are banned.
          </p>
          <div className="notice">
            <strong>WorkFit matching rule:</strong>
            <br />
            Unknown information is never assumed true. Hard constraints filter candidates first;
            only confirmed eligible spaces receive a ranking score.
          </div>
          <p className="tiny">
            Currently tailored for: <strong>{act.label}</strong>
          </p>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Screen 02/03: Matching Spaces (Slide 7)
 * ------------------------------------------------------------- */
function Step02Results({
  activity,
  places,
  form,
  onBack,
  onGoCompare,
  openDetail,
  onBookDesk,
  onOpenNavigator,
  onOpenGallery
}) {
  const act = activityById(activity);
  const eligible = places.filter(p => p.status === 'eligible');
  const incompatible = places.filter(p => p.status === 'incompatible');
  const unverified = places.filter(p => p.status === 'unverified');

  const mustTags = [];
  if (form.must.calls || activity === 'meeting') mustTags.push('Calls');
  if (form.must.wifi) mustTags.push('Wi-Fi');
  if (form.must.charging) mustTags.push('Charging');
  if (form.must.free) mustTags.push('Free');

  return (
    <div className="container page-pad">
      <div className="section-head">
        <div className="section-head-row">
          <span className="eyebrow">02 · RESULTS</span>
          <span className="step-indicator">02 / 03</span>
        </div>
        <h1>Your matching spaces</h1>
        <p>
          {act.label} {mustTags.length > 0 ? `· ${mustTags.join(' + ')}` : ''}
        </p>
      </div>

      <div className="results-summary-bar">
        <strong>{eligible.length} compatible</strong>
        <span>•</span>
        <span>{incompatible.length} excluded</span>
        <span>•</span>
        <span>{unverified.length} unverified</span>
      </div>

      <div className="results-list">
        {/* Compatible Spaces */}
        {eligible.map(place => (
          <article key={place.id} className="result-card-v2">
            <CardPhotoCarousel
              place={place}
              onOpenGallery={onOpenGallery}
              onDetail={() => openDetail(place.id)}
            />
            <div className="result-card-v2-main">
              <div className="flex gap8">
                <span className="kind-chip" style={{ position: 'static' }}>{place.type}</span>
                <StatusBadge place={place} />
                {place.liveStatus && (
                  <div className="live-meter-badge">
                    <span className="live-pulse"></span>
                    <span>{place.liveStatus.freeDesks} seats free • {place.liveStatus.noiseDb} dB</span>
                  </div>
                )}
              </div>
              <h3>{place.name}</h3>
              <p>{place.area} · {money(place.cost)}</p>
              <div className="amenity-chips">
                <span>{place.calls ? 'Calls allowed' : 'Quiet policy'}</span>
                <span>{place.charging ? 'Charging points' : 'No charging'}</span>
                <span>Wi-Fi {place.wifi ?? '?'}/100</span>
                <span>{place.cost === 0 ? 'Free access' : `Paid: ₹${place.cost}`}</span>
              </div>
            </div>
            <div className="result-card-v2-cta">
              <Score place={place} />
              <div className="flex gap8" style={{ marginTop: '4px' }}>
                <Button variant="outline" className="btn-sm" onClick={() => onOpenNavigator(place)}>
                  ⌖ Route & Nearby
                </Button>
                <Button variant="outline" className="btn-sm" onClick={() => openDetail(place.id)}>
                  Details
                </Button>
              </div>
              <Button className="btn-sm" onClick={() => onBookDesk(place)}>
                🎟️ Reserve Desk
              </Button>
            </div>
          </article>
        ))}

        {/* Incompatible / Excluded Spaces (Slide 7) */}
        {incompatible.slice(0, 2).map(place => (
          <div key={place.id} className="excluded-card">
            <div className="excluded-header">
              <span>×</span>
              <span>{place.name} — excluded</span>
            </div>
            <p className="excluded-reason">
              Reason: {place.reasons[0] || 'Mandatory requirement not met.'}
            </p>
            <p className="excluded-subtext">
              High ratings in other categories cannot override a non-negotiable failure.
            </p>
          </div>
        ))}
      </div>

      <div className="flex between" style={{ marginTop: '30px' }}>
        <Button variant="outline" onClick={onBack}>
          ← Back to Preferences
        </Button>
        <Button onClick={onGoCompare}>
          Compare suitable spaces →
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Screen 03/03: Compare and Decide (Slide 7)
 * ------------------------------------------------------------- */
function Step03Compare({
  activity,
  places,
  form,
  onBack,
  goExplore,
  onBookDesk,
  onOpenNavigator
}) {
  const act = activityById(activity);
  const eligible = places.filter(p => p.status === 'eligible');
  const topCandidate = eligible[0] || places[0];
  const secondCandidate = eligible[1] || places.find(p => p.status === 'incompatible') || places[1];

  const essentialsList = [];
  if (form.must.calls || activity === 'meeting') essentialsList.push('Calls');
  if (form.must.wifi) essentialsList.push('Wi-Fi');
  if (form.must.charging) essentialsList.push('Charging');

  return (
    <div className="container page-pad">
      <div className="section-head">
        <div className="section-head-row">
          <span className="eyebrow">03 · COMPARE</span>
          <span className="step-indicator">03 / 03</span>
        </div>
        <h1>Compare and decide</h1>
        <p>See why a space fits before choosing.</p>
      </div>

      <div className="compare-table-shell">
        <div className="compare-strip">
          <div>
            <strong>MY ACTIVITY:</strong> {act.label}
          </div>
          <div>
            <strong>Essentials:</strong> {essentialsList.join(' · ') || 'Standard activity criteria'}
          </div>
        </div>

        <table className="compare-matrix">
          <thead>
            <tr>
              <th>Criteria</th>
              <th>
                {topCandidate?.name || 'Workspace A'}
                <div style={{ marginTop: '4px' }}>
                  {topCandidate && <StatusBadge place={topCandidate} />}
                </div>
              </th>
              <th>
                {secondCandidate?.name || 'Workspace B'}
                <div style={{ marginTop: '4px' }}>
                  {secondCandidate && <StatusBadge place={secondCandidate} />}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Calls allowed</th>
              <td className={topCandidate?.calls ? 'cell-yes' : 'cell-no'}>
                {topCandidate?.calls ? 'Yes' : 'No'}
              </td>
              <td className={secondCandidate?.calls ? 'cell-yes' : 'cell-no'}>
                {secondCandidate?.calls ? 'Yes' : 'No'}
              </td>
            </tr>
            <tr>
              <th>Wi-Fi</th>
              <td>
                {topCandidate?.wifi ? `${topCandidate.wifi}/100 (Strong)` : 'Unknown'}
              </td>
              <td>
                {secondCandidate?.wifi ? `${secondCandidate.wifi}/100 (Moderate)` : 'Unknown'}
              </td>
            </tr>
            <tr>
              <th>Charging</th>
              <td className={topCandidate?.charging ? 'cell-yes' : 'cell-no'}>
                {topCandidate?.charging ? 'Yes' : 'No'}
              </td>
              <td className={secondCandidate?.charging ? 'cell-yes' : 'cell-no'}>
                {secondCandidate?.charging ? 'Yes' : 'No'}
              </td>
            </tr>
            <tr>
              <th>Quietness</th>
              <td>{topCandidate?.quiet}/100</td>
              <td>{secondCandidate?.quiet}/100</td>
            </tr>
            <tr>
              <th>Price</th>
              <td>{money(topCandidate?.cost)}</td>
              <td>{money(secondCandidate?.cost)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="why-decision-box">
        <strong>Why {topCandidate?.name}?</strong>
        <p>
          All essential requirements pass; {secondCandidate?.name}{' '}
          {secondCandidate?.status === 'incompatible'
            ? 'fails mandatory conditions'
            : 'ranks lower on weighted activity preferences'}.
        </p>
      </div>

      <div className="flex between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Results
        </Button>
        <div className="flex gap8">
          <Button variant="outline" onClick={goExplore}>
            Explore All Spaces
          </Button>
          {topCandidate && (
            <Button variant="outline" onClick={() => onOpenNavigator(topCandidate)}>
              ⌖ In-App Route
            </Button>
          )}
          {topCandidate && topCandidate.status === 'eligible' && (
            <Button onClick={() => onBookDesk(topCandidate)}>
              🎟️ Reserve {topCandidate.name}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Screen: Explore Spaces (List & Live Leaflet Map)
 * ------------------------------------------------------------- */
function ExploreSpaces({
  places,
  origin,
  hasUserLocation,
  onLocate,
  onResetOrigin,
  form,
  onFormChange,
  activity,
  onActivity,
  onDetail,
  onCompare,
  compareList,
  onFavorite,
  favorites,
  onBookDesk,
  onOpenNavigator,
  onCheckin,
  onOpenGallery
}) {
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('fit');
  const [maxRadiusKm, setMaxRadiusKm] = useState('all');

  const shown = useMemo(() => {
    return places
      .filter(p => {
        const matchLoc = form.location === 'Both' || p.type === form.location;
        const matchCat = form.category === 'Any' || p.category === form.category;
        const matchQ = `${p.name} ${p.area} ${p.category} ${p.tagline || ''}`
          .toLowerCase()
          .includes(query.toLowerCase());

        const dist = haversineKm(origin, p);
        const matchRadius =
          maxRadiusKm === 'all'
            ? true
            : maxRadiusKm === '2'
            ? dist <= 2
            : maxRadiusKm === '5'
            ? dist <= 5
            : dist <= 10;

        return matchLoc && matchCat && matchQ && matchRadius;
      })
      .sort((a, b) => {
        if (sort === 'distance') return haversineKm(origin, a) - haversineKm(origin, b);
        if (sort === 'cost') return (a.cost ?? 999) - (b.cost ?? 999);
        if (sort === 'quiet') return (b.quiet ?? 0) - (a.quiet ?? 0);
        return 0; // default WorkFit recommendation order
      });
  }, [places, form.location, form.category, query, sort, origin, maxRadiusKm]);

  const eligibleCount = shown.filter(p => p.status === 'eligible').length;

  return (
    <div className="container page-pad">
      <div className="section-head">
        <span className="eyebrow">WORKSPACE DISCOVERY · HYDERABAD</span>
        <h1>Explore Spaces & Nearby Map</h1>
        <p>Interactive discovery with photo switchers, distance, live status, and in-app routes.</p>
      </div>

      <div className="explore-layout">
        {/* Sidebar Filters */}
        <aside className="card filter-sidebar">
          <h3>Filters & Range</h3>

          <label className="field-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#62756c' }}>
            Distance Range
          </label>
          <div className="radius-pills">
            {[
              ['all', 'All Distances'],
              ['2', '< 2 km'],
              ['5', '< 5 km'],
              ['10', '< 10 km']
            ].map(([val, label]) => (
              <button
                key={val}
                className={`radius-pill ${maxRadiusKm === val ? 'active' : ''}`}
                onClick={() => setMaxRadiusKm(val)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="field-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#62756c', marginTop: '12px' }}>
            Current Activity
          </label>
          <select value={activity} onChange={e => onActivity(e.target.value)}>
            {ACTIVITIES.map(a => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>

          <label className="field-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#62756c', marginTop: '16px' }}>
            Campus or City
          </label>
          <div className="segmented" style={{ width: '100%', display: 'flex' }}>
            {['Both', 'Campus', 'City'].map(loc => (
              <button
                key={loc}
                className={form.location === loc ? 'active' : ''}
                onClick={() => onFormChange({ location: loc })}
                style={{ flex: 1 }}
              >
                {loc}
              </button>
            ))}
          </div>

          <label className="field-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#62756c', marginTop: '16px' }}>
            Space Category
          </label>
          <select value={form.category} onChange={e => onFormChange({ category: e.target.value })}>
            {['Any', 'Library', 'Coworking', 'Café', 'Study Hall', 'Study Room'].map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="field-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#62756c', marginTop: '16px' }}>
            Mandatory Conditions
          </label>
          {[
            ['calls', 'Calls allowed'],
            ['wifi', 'Wi-Fi ≥ 70'],
            ['charging', 'Charging point'],
            ['free', 'Free access']
          ].map(([key, label]) => (
            <label key={key} className="check-tile" style={{ margin: '6px 0', padding: '10px' }}>
              <input
                type="checkbox"
                checked={form.must[key]}
                onChange={e =>
                  onFormChange({ must: { ...form.must, [key]: e.target.checked } })
                }
              />
              <span>{label}</span>
            </label>
          ))}

          <div className="hint-box" style={{ marginTop: '20px' }}>
            <strong>Visual Inspection:</strong>
            <p style={{ margin: '6px 0 0', fontSize: '0.78rem' }}>
              Cycle photos using arrows on any card or click to open full gallery.
            </p>
          </div>
        </aside>

        {/* Results Area */}
        <div className="result-area">
          <div className="toolbar">
            <div>
              <strong>{shown.length} spaces found</strong>
              <Badge tone="green">{eligibleCount} eligible</Badge>
            </div>
            <div className="segmented">
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
                ☷ List
              </button>
              <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
                ⌖ Live Map
              </button>
            </div>
          </div>

          <div className="origin-row">
            <span>
              ⌖ {hasUserLocation ? 'Distances calculated from your current GPS location' : 'Distances from Hitec City / Campus Junction'}
            </span>
            <Button variant="outline" className="btn-sm" onClick={onLocate}>
              Use my location
            </Button>
            {hasUserLocation && (
              <Button variant="ghost" className="btn-sm" onClick={onResetOrigin}>
                Reset
              </Button>
            )}
          </div>

          <div className="search-row">
            <input
              placeholder="Search by venue name, area (e.g. Hitec City, Banjara Hills)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search spaces"
            />
            <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
              <option value="fit">Best WorkFit Rank</option>
              <option value="distance">Nearest to you</option>
              <option value="cost">Lowest Cost</option>
              <option value="quiet">Acoustic Quietness</option>
            </select>
          </div>

          {view === 'map' ? (
            <InteractiveMap
              spaces={shown}
              origin={origin}
              hasUserLocation={hasUserLocation}
              onDetail={onDetail}
              onBookDesk={onBookDesk}
              onOpenNavigator={onOpenNavigator}
            />
          ) : shown.length > 0 ? (
            <div className="results-list">
              {shown.map(place => (
                <article key={place.id} className="result-card-v2">
                  <div style={{ position: 'relative' }}>
                    <CardPhotoCarousel
                      place={place}
                      onOpenGallery={onOpenGallery}
                      onDetail={() => onDetail(place.id)}
                    />
                    <button
                      className="heart-chip"
                      onClick={() => onFavorite(place.id)}
                      aria-label="Favorite"
                    >
                      {favorites.includes(place.id) ? '♥' : '♡'}
                    </button>
                  </div>
                  <div className="result-card-v2-main">
                    <div className="flex gap8">
                      <span className="kind-chip" style={{ position: 'static' }}>{place.type}</span>
                      <StatusBadge place={place} />
                      <span className="subtle-text">{place.category} · {money(place.cost)}</span>
                    </div>
                    <h3>{place.name}</h3>
                    <p>
                      {place.area} • ~{haversineKm(origin, place).toFixed(1)} km away
                    </p>

                    {place.liveStatus && (
                      <div className="live-meter-badge">
                        <span className="live-pulse"></span>
                        <span>{place.liveStatus.freeDesks} seats free • {place.liveStatus.noiseDb} dB ({place.liveStatus.noiseDesc})</span>
                      </div>
                    )}

                    <div className="amenity-chips">
                      <span>{place.calls ? 'Calls allowed' : 'Quiet policy'}</span>
                      <span>{place.charging ? 'Charging points' : 'No charging'}</span>
                      <span>Wi-Fi {place.wifi ?? '?'}/100</span>
                      <span>Quiet {place.quiet}/100</span>
                    </div>

                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: place.status === 'incompatible' ? '#b84b3d' : '#275946' }}>
                      <strong>{place.status === 'eligible' ? 'Why this match? ' : place.status === 'incompatible' ? 'Why excluded? ' : 'Missing info: '}</strong>
                      {place.reasons[0] || 'Meets criteria.'}
                    </div>
                  </div>
                  <div className="result-card-v2-cta">
                    <Score place={place} />
                    <div className="flex gap8">
                      <Button variant="outline" className="btn-sm" onClick={() => onOpenNavigator(place)}>
                        ⌖ In-App Route
                      </Button>
                      <Button variant="outline" className="btn-sm" onClick={() => onDetail(place.id)}>
                        Details
                      </Button>
                    </div>
                    <div className="flex gap8">
                      <button className="text-button" style={{ fontSize: '0.78rem' }} onClick={() => onCheckin(place)}>
                        📍 Check in
                      </button>
                      <Button className="btn-sm" onClick={() => onBookDesk(place)}>
                        🎟️ Reserve
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <h2>No spaces match these filters</h2>
              <p>Try resetting location, increasing distance range, or clearing mandatory conditions.</p>
              <Button onClick={() => { onFormChange({ category: 'Any', location: 'Both' }); setMaxRadiusKm('all'); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Interactive Leaflet Map Component (In-App Live Map)
 * ------------------------------------------------------------- */
function InteractiveMap({ spaces, origin, hasUserLocation, onDetail, onBookDesk, onOpenNavigator }) {
  const mapEl = useRef(null);
  const instance = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const active = spaces.find(p => p.id === activeId) || spaces[0];

  useEffect(() => {
    if (!mapEl.current || !window.L) return;
    const L = window.L;

    const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView(
      [origin.lat, origin.lng],
      12
    );
    instance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const bounds = [[origin.lat, origin.lng]];

    spaces.forEach(place => {
      const bg =
        place.status === 'incompatible'
          ? '#b75f51'
          : place.status === 'unverified'
          ? '#d99b65'
          : place.type === 'Campus'
          ? '#173c38'
          : '#2e7a56';

      const label =
        place.score == null ? (place.status === 'incompatible' ? '×' : '?') : place.score.toFixed(1);

      const icon = L.divIcon({
        className: 'quiet-marker',
        html: `<span style="background:${bg}">${label}</span>`,
        iconAnchor: [19, 38],
        iconSize: [38, 38]
      });

      L.marker([place.lat, place.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${place.name}</strong><br/>${place.type} · ${place.category}<br/>WorkFit: ${place.tier}<br/>~${haversineKm(origin, place).toFixed(1)} km away`
        )
        .on('click', () => setActiveId(place.id));

      bounds.push([place.lat, place.lng]);
    });

    // User / Demo location marker
    L.circleMarker([origin.lat, origin.lng], {
      radius: 9,
      color: '#173c38',
      fillColor: '#58a082',
      fillOpacity: 1,
      weight: 3
    })
      .addTo(map)
      .bindPopup(hasUserLocation ? 'Your Location' : 'Hyderabad Demo Origin');

    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });

    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      clearTimeout(timer);
      instance.current = null;
      map.remove();
    };
  }, [spaces, origin, hasUserLocation]);

  return (
    <div className="map-view">
      <div className="map-header">
        <div>
          <strong>Interactive Hyderabad Workspace Map</strong>
          <small>OpenStreetMap tiles with color-coded WorkFit pins</small>
        </div>
        <Badge tone="green">Live Demo Pins</Badge>
      </div>

      <div className="real-map" ref={mapEl} aria-label="Interactive map" />

      {active && (
        <div className="map-selection">
          <div>
            <strong>{active.name}</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#62756c' }}>
              {active.tier} • {active.area} • ~{haversineKm(origin, active).toFixed(1)} km away
            </p>
          </div>
          <div className="flex gap8">
            <Button variant="outline" className="btn-sm" onClick={() => onOpenNavigator(active)}>
              ⌖ In-App Route
            </Button>
            <Button variant="outline" className="btn-sm" onClick={() => onDetail(active.id)}>
              Details
            </Button>
            <Button className="btn-sm" onClick={() => onBookDesk(active)}>
              Reserve
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
 * In-App Navigator & Route Preview Modal
 * ------------------------------------------------------------- */
function NavigatorModal({ place, origin, hasUserLocation, onClose, onBookDesk }) {
  const mapRef = useRef(null);
  const distance = haversineKm(origin, place);
  const walkMins = Math.max(2, Math.round((distance / 4.5) * 60));
  const driveMins = Math.max(2, Math.round((distance / 25) * 60));

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    const map = L.map(mapRef.current, { scrollWheelZoom: false });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Origin marker
    L.circleMarker([origin.lat, origin.lng], {
      radius: 9,
      color: '#173c38',
      fillColor: '#58a082',
      fillOpacity: 1,
      weight: 3
    })
      .addTo(map)
      .bindPopup(hasUserLocation ? 'Your Location' : 'Hyderabad Demo Origin');

    // Destination marker
    const icon = L.divIcon({
      className: 'quiet-marker',
      html: `<span style="background:#173c38">📍</span>`,
      iconAnchor: [19, 38],
      iconSize: [38, 38]
    });

    L.marker([place.lat, place.lng], { icon })
      .addTo(map)
      .bindPopup(`<strong>${place.name}</strong><br/>${place.area}`)
      .openPopup();

    // Dotted route line connecting them
    const routeLine = L.polyline(
      [
        [origin.lat, origin.lng],
        [place.lat, place.lng]
      ],
      {
        color: '#2e7a56',
        weight: 4,
        dashArray: '8, 8'
      }
    ).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      clearTimeout(timer);
      map.remove();
    };
  }, [place, origin, hasUserLocation]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content navigator-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <span className="eyebrow">IN-APP ROUTE & NEARBY PREVIEW</span>
        <h2 style={{ color: '#173c38', margin: '6px 0 2px' }}>{place.name}</h2>
        <p className="subtle-text">{place.area} · {place.category}</p>

        <div className="navigator-grid">
          <div className="navigator-map-shell">
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="navigator-info">
            <div>
              <div className="route-estimate-box">
                <span className="tiny" style={{ fontWeight: 800, color: '#276947' }}>
                  DIRECT ROUTE ESTIMATE
                </span>
                <div className="route-estimate-grid">
                  <div className="route-estimate-item">
                    <small>Straight-line</small>
                    <strong>~{distance.toFixed(1)} km</strong>
                  </div>
                  <div className="route-estimate-item">
                    <small>Walking</small>
                    <strong>~{walkMins} mins</strong>
                  </div>
                  <div className="route-estimate-item">
                    <small>Driving / Bike</small>
                    <strong>~{driveMins} mins</strong>
                  </div>
                  <div className="route-estimate-item">
                    <small>Access</small>
                    <strong>{money(place.cost)}</strong>
                  </div>
                </div>
              </div>

              {place.liveStatus && (
                <div className="card" style={{ padding: '14px', background: '#fafbf9', marginBottom: '14px' }}>
                  <small className="tiny" style={{ fontWeight: 700 }}>LIVE SPACE STATUS</small>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.86rem' }}>
                    <span>Occupancy:</span>
                    <strong>{place.liveStatus.occupancy}% ({place.liveStatus.freeDesks} seats free)</strong>
                  </div>
                 
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button onClick={() => { onClose(); onBookDesk(place); }}>
                🎟️ Reserve Desk Now
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.open(directionsUrl(place, hasUserLocation ? origin : null), '_blank')
                }
              >
                Open in Google Maps App ↗
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Mock Seat Reservation & Ticket Modal
 * ------------------------------------------------------------- */
function BookingModal({ place, onClose, onSaveBooking }) {
  const [date, setDate] = useState('Today');
  const [slot, setSlot] = useState('14:00 - 17:00');
  const [deskType, setDeskType] = useState('Silent Focus Desk');
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  const slots = [
    '09:00 - 12:00',
    '12:00 - 15:00',
    '15:00 - 18:00',
    '18:00 - 21:00',
    'Full Day Pass'
  ];

  const deskTypes = [
    { title: 'Silent Focus Desk', desc: 'Acoustic partition + power socket' },
    { title: 'Soundproof Call Booth', desc: 'Isolated for video interviews' },
    { title: 'Collaboration Pod', desc: 'Whiteboard + 4-chair cluster' }
  ];

  function handleConfirm() {
    const bookingId = `QP-HYD-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket = {
      bookingId,
      spaceId: place.id,
      spaceName: place.name,
      area: place.area,
      date,
      slot,
      deskType,
      cost: place.cost === 0 ? 'Free' : `₹${place.cost}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSaveBooking(ticket);
    setConfirmedTicket(ticket);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {!confirmedTicket ? (
          <>
            <span className="eyebrow">RESERVE A WORKSPACE</span>
            <h2 style={{ color: '#173c38', margin: '6px 0 2px' }}>{place.name}</h2>
            <p className="subtle-text">{place.area} · Access Fee: {money(place.cost)}</p>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#173c38' }}>Choose Date</label>
              <div className="segmented" style={{ width: '100%', marginTop: '6px' }}>
                {['Today', 'Tomorrow'].map(d => (
                  <button
                    key={d}
                    className={date === d ? 'active' : ''}
                    onClick={() => setDate(d)}
                    style={{ flex: 1 }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#173c38' }}>Select Time Window</label>
              <div className="slot-grid">
                {slots.map(s => (
                  <button
                    key={s}
                    className={`slot-btn ${slot === s ? 'active' : ''}`}
                    onClick={() => setSlot(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#173c38' }}>Desk Selection</label>
              <div className="desk-type-grid">
                {deskTypes.map(d => (
                  <div
                    key={d.title}
                    className={`desk-type-card ${deskType === d.title ? 'active' : ''}`}
                    onClick={() => setDeskType(d.title)}
                  >
                    <strong>{d.title}</strong>
                    <small>{d.desc}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="notice" style={{ margin: '14px 0' }}>
              <strong>Instant Guarantee:</strong> Your seat is held for 30 minutes after session start. Free cancellation anytime.
            </div>

            <div className="flex between" style={{ marginTop: '20px' }}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Confirm Reservation ({money(place.cost)}) →
              </Button>
            </div>
          </>
        ) : (
          <div>
            <span className="eyebrow" style={{ color: '#27ae60' }}>✓ RESERVATION CONFIRMED</span>
            <h2 style={{ color: '#173c38', margin: '6px 0 10px' }}>Your Pass is Ready!</h2>
            <p>Show this digital pass at the entrance desk.</p>

            <div className="ticket-card">
              <div className="ticket-header">
                <div>
                  <small style={{ opacity: 0.8, letterSpacing: '1px' }}>BOOKING REF</small>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{confirmedTicket.bookingId}</div>
                </div>
                <div className="ticket-qr-mock">
                  <span>QR PASS<br />VERIFIED</span>
                </div>
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                {confirmedTicket.spaceName}
              </div>
              <p style={{ opacity: 0.9, fontSize: '0.82rem', margin: '0 0 14px' }}>
                {confirmedTicket.area}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.82rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
                <div>
                  <small style={{ opacity: 0.7 }}>Date</small>
                  <div><strong>{confirmedTicket.date}</strong></div>
                </div>
                <div>
                  <small style={{ opacity: 0.7 }}>Slot</small>
                  <div><strong>{confirmedTicket.slot}</strong></div>
                </div>
                <div>
                  <small style={{ opacity: 0.7 }}>Desk</small>
                  <div><strong>{confirmedTicket.deskType}</strong></div>
                </div>
              </div>
            </div>

            <div className="flex between" style={{ marginTop: '22px' }}>
              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
              <Button onClick={() => alert('Pass saved to your browser! You can access it anytime from the top bar.')}>
                Download Pass PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Live Check-In Modal
 * ------------------------------------------------------------- */
function CheckinModal({ place, onClose, onUpdateStatus }) {
  const [noise, setNoise] = useState('Whisper Quiet');
  const [occupancy, setOccupancy] = useState('Medium (Around 50%)');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    onUpdateStatus(place.id, {
      noiseDesc: noise,
      noiseDb: noise === 'Whisper Quiet' ? 36 : noise === 'Moderate Hum' ? 48 : 62,
      occupancy: occupancy.includes('Low') ? 30 : occupancy.includes('Medium') ? 60 : 85
    });
    setSubmitted(true);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {!submitted ? (
          <>
            <span className="eyebrow">COMMUNITY CHECK-IN</span>
            <h2 style={{ color: '#173c38', margin: '6px 0 2px' }}>I'm here right now!</h2>
            <p className="subtle-text">{place.name} · Help fellow students & workers know current conditions.</p>

            <div style={{ marginTop: '18px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#173c38' }}>Current Noise Level</label>
              <div className="segmented" style={{ width: '100%', marginTop: '6px' }}>
                {['Whisper Quiet', 'Moderate Hum', 'Lively / Chatty'].map(n => (
                  <button
                    key={n}
                    className={noise === n ? 'active' : ''}
                    onClick={() => setNoise(n)}
                    style={{ flex: 1 }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '18px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#173c38' }}>Seat Availability</label>
              <div className="segmented" style={{ width: '100%', marginTop: '6px' }}>
                {['Low (Lots of seats)', 'Medium (Around 50%)', 'Full / Crowded'].map(o => (
                  <button
                    key={o}
                    className={occupancy === o ? 'active' : ''}
                    onClick={() => setOccupancy(o)}
                    style={{ flex: 1 }}
                  >
                    {o.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex between" style={{ marginTop: '26px' }}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit Check-in (+10 Karma)
              </Button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: '3rem' }}>🌟</span>
            <h2 style={{ color: '#173c38', margin: '12px 0 6px' }}>Thank you, Ajay!</h2>
            <p>Your live update helps maintain honest, accurate data across Hyderabad.</p>
            <div className="badge badge-green" style={{ fontSize: '0.9rem', padding: '8px 16px', margin: '10px 0 20px' }}>
              +10 Community Karma Points
            </div>
            <div>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * My Bookings Drawer / Modal
 * ------------------------------------------------------------- */
function MyBookingsModal({ bookings, onClose, onCancelBooking }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <span className="eyebrow">YOUR ACTIVE PASSES</span>
        <h2 style={{ color: '#173c38', margin: '6px 0 16px' }}>My Desk Reservations</h2>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <p>No active reservations yet. Click "Reserve Desk" on any space to book a seat!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {bookings.map(b => (
              <div key={b.bookingId} className="card" style={{ padding: '16px 20px', borderLeft: '5px solid #173c38' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{b.spaceName}</strong>
                  <span className="badge badge-green">Confirmed</span>
                </div>
                <p className="subtle-text" style={{ margin: '4px 0 8px' }}>
                  {b.area} · Ref: <strong>{b.bookingId}</strong>
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#62756c' }}>
                  <span>📅 {b.date}</span>
                  <span>⏰ {b.slot}</span>
                  <span>🪑 {b.deskType}</span>
                </div>
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <button
                    className="text-button"
                    style={{ color: '#b85c4d', fontSize: '0.8rem' }}
                    onClick={() => onCancelBooking(b.bookingId)}
                  >
                    Cancel Reservation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Detail View (Modal with Reviews & Real-Time Status)
 * ------------------------------------------------------------- */
function DetailView({
  place,
  origin,
  hasUserLocation,
  onClose,
  onFavorite,
  isFavorite,
  onBookDesk,
  onOpenNavigator,
  onAddReview,
  onOpenGallery
}) {
  const [newRating, setNewRating] = useState(5);
  const [newActivity, setNewActivity] = useState('Deep Study');
  const [newComment, setNewComment] = useState('');
  const [showAddReview, setShowAddReview] = useState(false);

  if (!place) return null;

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const review = {
      id: `r-${Date.now()}`,
      user: 'Ajay M. (Verified)',
      role: 'Hackathon Explorer',
      activity: newActivity,
      rating: newRating,
      comment: newComment,
      time: 'Just now'
    };
    onAddReview(place.id, review);
    setNewComment('');
    setShowAddReview(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <CardPhotoCarousel
          place={place}
          onOpenGallery={onOpenGallery}
          style={{ height: '240px' }}
        />

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="flex gap8">
              <span className="kind-chip" style={{ position: 'static' }}>{place.type}</span>
              <StatusBadge place={place} />
              {place.liveStatus && (
                <div className="live-meter-badge">
                  <span className="live-pulse"></span>
                  <span>{place.liveStatus.freeDesks} seats free • {place.liveStatus.noiseDb} dB</span>
                </div>
              )}
            </div>
            <h2 style={{ margin: '8px 0 4px', fontSize: '1.9rem', color: '#173c38' }}>{place.name}</h2>
            <p className="subtle-text">{place.area} • ~{haversineKm(origin, place).toFixed(1)} km straight-line</p>
          </div>
          <Score place={place} />
        </div>

        <p style={{ lineHeight: 1.6, margin: '14px 0' }}>{place.description}</p>

        {/* Workspace Photographs Section */}
        {place.photos && place.photos.length > 0 && (
          <div style={{ margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Photos of the Place ({place.photos.length})</h3>
              <button
                className="text-button"
                style={{ fontSize: '0.82rem' }}
                onClick={() => onOpenGallery(place, 0)}
              >
                Expand Gallery ↗
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {place.photos.map((p, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1.5px solid #dce2dc',
                    background: '#ffffff'
                  }}
                  onClick={() => onOpenGallery(place, i)}
                >
                  <img
                    src={`/images/${p.src}`}
                    alt={p.caption}
                    style={{ width: '100%', height: '95px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '6px 8px', fontSize: '0.72rem', fontWeight: 600, color: '#173c38' }}>
                    {p.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ margin: '20px 0 10px', fontSize: '1.1rem' }}>Facility & Policy Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="card" style={{ padding: '12px', background: '#fafbf9' }}>
            <small className="tiny">Wi-Fi Stability</small>
            <strong>{place.wifi == null ? 'Unverified' : `${place.wifi}/100`}</strong>
          </div>
          <div className="card" style={{ padding: '12px', background: '#fafbf9' }}>
            <small className="tiny">Quietness Score</small>
            <strong>{place.quiet}/100</strong>
          </div>
          <div className="card" style={{ padding: '12px', background: '#fafbf9' }}>
            <small className="tiny">Seating Comfort</small>
            <strong>{place.seating}/100</strong>
          </div>
          <div className="card" style={{ padding: '12px', background: '#fafbf9' }}>
            <small className="tiny">Speaking / Calls</small>
            <strong>{place.calls ? 'Allowed' : 'Strict Quiet Policy'}</strong>
          </div>
          <div className="card" style={{ padding: '12px', background: '#fafbf9' }}>
            <small className="tiny">Charging Sockets</small>
            <strong>{place.charging == null ? 'Unverified' : place.charging ? 'Available' : 'No'}</strong>
          </div>
          <div className="card" style={{ padding: '12px', background: '#fafbf9' }}>
            <small className="tiny">Access Fee</small>
            <strong>{money(place.cost)}</strong>
          </div>
        </div>

        {/* Community Reviews Section */}
        <div className="reviews-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              Community Reviews ({place.reviews ? place.reviews.length : 0})
            </h3>
            <button className="text-button" onClick={() => setShowAddReview(!showAddReview)}>
              {showAddReview ? 'Cancel' : '+ Write a Review'}
            </button>
          </div>

          {showAddReview && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#173c38' }}>Rating</label>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={star <= newRating ? 'active' : ''}
                    onClick={() => setNewRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#173c38' }}>
                  What activity did you do here?
                </label>
                <select
                  value={newActivity}
                  onChange={e => setNewActivity(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d2ded2' }}
                >
                  {ACTIVITIES.map(a => (
                    <option key={a.id} value={a.label}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="Share your experience (e.g., noise level, desk comfort, power plugs)..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #d2ded2',
                  fontSize: '0.86rem'
                }}
              />

              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <Button type="submit" className="btn-sm">
                  Post Review
                </Button>
              </div>
            </form>
          )}

          <div className="reviews-list">
            {place.reviews && place.reviews.length > 0 ? (
              place.reviews.map(rev => (
                <div key={rev.id} className="review-item">
                  <div className="review-item-head">
                    <div>
                      <strong>{rev.user}</strong> <small className="tiny">({rev.role})</small>
                    </div>
                    <span className="review-stars">{'★'.repeat(rev.rating)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      Task: {rev.activity}
                    </span>
                    <small className="tiny">{rev.time}</small>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#2d3e38' }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))
            ) : (
              <p className="tiny">No reviews yet. Be the first to share your experience!</p>
            )}
          </div>
        </div>

        <div className="flex between" style={{ marginTop: '26px' }}>
          <Button
            variant={isFavorite ? 'solid' : 'outline'}
            onClick={() => onFavorite(place.id)}
          >
            {isFavorite ? '♥ Saved in Shortlist' : '♡ Save to Shortlist'}
          </Button>

          <div className="flex gap8">
            <Button variant="outline" onClick={() => onOpenNavigator(place)}>
              ⌖ In-App Route
            </Button>
            <Button onClick={() => onBookDesk(place)}>
              🎟️ Reserve Desk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * How It Works View (Matching Slide 3, 5, 8)
 * ------------------------------------------------------------- */
function HowItWorks({ go }) {
  return (
    <div className="container page-pad">
      <div className="section-head">
        <span className="eyebrow">WORKFIT METHODOLOGY · EXPLAINABLE AI</span>
        <h1>The right place for the right task.</h1>
        <p>WorkFit uses clear rules, transparent criteria and visible limits — not a black box.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '26px' }}>
          <div style={{ fontSize: '2rem', color: '#d99b65', fontFamily: 'Georgia, serif' }}>01</div>
          <h3 style={{ margin: '12px 0 6px' }}>Activity-Driven Need</h3>
          <p>Different tasks demand different environments. An interview requires speaking; exam study requires silence.</p>
        </div>

        <div className="card" style={{ padding: '26px' }}>
          <div style={{ fontSize: '2rem', color: '#d99b65', fontFamily: 'Georgia, serif' }}>02</div>
          <h3 style={{ margin: '12px 0 6px' }}>Rules First, Score Second</h3>
          <p>Must-haves are evaluated first. If a space fails a non-negotiable requirement, it is excluded with an exact explanation.</p>
        </div>

        <div className="card" style={{ padding: '26px' }}>
          <div style={{ fontSize: '2rem', color: '#d99b65', fontFamily: 'Georgia, serif' }}>03</div>
          <h3 style={{ margin: '12px 0 6px' }}>Unknown is Never Yes</h3>
          <p>Missing information is explicitly labeled as Unverified. We never make dangerous guesses on charging or connectivity.</p>
        </div>

        <div className="card" style={{ padding: '26px' }}>
          <div style={{ fontSize: '2rem', color: '#d99b65', fontFamily: 'Georgia, serif' }}>04</div>
          <h3 style={{ margin: '12px 0 6px' }}>Explainable Ranking</h3>
          <p>Preference sliders adjust normalized weights to produce a transparent 0–10 score with side-by-side trade-offs.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '34px', background: '#f5f8f5', border: '1.5px solid #d2e1d5' }}>
        <h2 style={{ color: '#173c38', marginBottom: '14px' }}>Transparent WorkFit Scoring Formula</h2>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #d2e1d5', fontFamily: 'monospace', fontSize: '1.05rem', color: '#173c38', display: 'inline-block', marginBottom: '14px' }}>
          WorkFit Score (0–10) = Σ (Activity Weight × Factor Rating) ÷ 10
        </div>
        <p style={{ margin: 0 }}>
          Only eligible spaces that pass all verified mandatory filters receive this score.
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Button onClick={() => go('guided')}>
          Start Guided Matcher →
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Saved Spaces Shortlist View
 * ------------------------------------------------------------- */
function SavedSpaces({ ids, places, onDetail, onFavorite, goExplore, onBookDesk, onOpenNavigator, onOpenGallery }) {
  const savedPlaces = ids.map(id => places.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="container page-pad">
      <div className="section-head">
        <span className="eyebrow">YOUR SHORTLIST</span>
        <h1>Saved Spaces</h1>
        <p>Workspaces saved in your browser storage for easy comparison.</p>
      </div>

      {savedPlaces.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>No saved spaces yet</h2>
          <p>Click the heart icon on any workspace card to add it to your shortlist.</p>
          <Button onClick={goExplore}>Explore Spaces</Button>
        </div>
      ) : (
        <div className="featured-grid">
          {savedPlaces.map(p => (
            <article key={p.id} className="featured-card">
              <CardPhotoCarousel
                place={p}
                onOpenGallery={onOpenGallery}
                onDetail={() => onDetail(p.id)}
              />
              <div className="featured-card-body">
                <div>
                  <strong>{p.name}</strong>
                  <p>{p.area} · {money(p.cost)}</p>
                </div>
                <div className="flex between" style={{ marginTop: '14px' }}>
                  <Button variant="outline" className="btn-sm" onClick={() => onOpenNavigator(p)}>
                    ⌖ Map
                  </Button>
                  <Button variant="outline" className="btn-sm" onClick={() => onDetail(p.id)}>
                    Details
                  </Button>
                  <Button className="btn-sm" onClick={() => onBookDesk(p)}>
                    Reserve
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
 * User Profile Modal (Team Matla Presentation Info)
 * ------------------------------------------------------------- */
function ProfileModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <span className="eyebrow">CODE VARIANT BUILD 01 · PS03</span>
        <h2 style={{ color: '#173c38', margin: '8px 0 14px' }}>Team Matla</h2>
        <p>Activity-Aware Workspace Finder for Campus & Hyderabad City</p>

        <div className="card" style={{ padding: '16px', background: '#fafbf9', margin: '18px 0' }}>
          <strong>Team Members:</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#62756c' }}>
            <li>Ajay Matla (Lead Developer / UI-UX)</li>
            <li>Harsha (Product Architecture)</li>
            <li>Ganesh (Research & Evaluation)</li>
          </ul>
        </div>

        <div className="notice" style={{ margin: 0 }}>
          <strong>Demo Architecture:</strong> Pure React-first, MERN-ready client prototype. Seeded with 16 curated Hyderabad venues, full explainable WorkFit matching engine, In-App Route Navigator, Mock Seat Reservation, and Community Reviews.
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Root Application Component
 * ------------------------------------------------------------- */
export default function App() {
  const [page, setPage] = useState('home');
  const [guidedStep, setGuidedStep] = useState(1);
  const [activity, setActivity] = useState('study');

  const [form, setForm] = useState({
    location: 'Both',
    category: 'Any',
    must: { wifi: false, charging: false, calls: false, free: false, group: false },
    weights: { quiet: 60, wifi: 15, seating: 25 },
    budget: 350,
    startHour: 14,
    duration: 2
  });

  const [detailId, setDetailId] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quiet-favorites') || '[]');
    } catch {
      return [];
    }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('quiet-bookings') || '[]');
    } catch {
      return [];
    }
  });

  // Dynamic spaces with reviews, photos, and live status support
  const [dynamicSpaces, setDynamicSpaces] = useState(SPACES);

  const [origin, setOrigin] = useState(DEMO_ORIGIN);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);

  // Modals state
  const [bookingPlace, setBookingPlace] = useState(null);
  const [navigatorPlace, setNavigatorPlace] = useState(null);
  const [checkinPlace, setCheckinPlace] = useState(null);
  const [galleryState, setGalleryState] = useState(null);

  // Compute recommendations
  const places = useMemo(() => {
    return recommendSpaces(dynamicSpaces, { ...form, activity });
  }, [dynamicSpaces, form, activity]);

  const selectedPlace = useMemo(() => {
    return places.find(p => p.id === detailId) || null;
  }, [places, detailId]);

  useEffect(() => {
    localStorage.setItem('quiet-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('quiet-bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page, guidedStep]);

  function changeActivity(nextId) {
    const act = activityById(nextId);
    setActivity(nextId);
    setForm(prev => ({
      ...prev,
      weights: { ...act.weights },
      must: {
        ...prev.must,
        calls: nextId === 'meeting' || prev.must.calls,
        group: nextId === 'group' || prev.must.group,
        wifi: nextId === 'meeting' || nextId === 'laptop' || prev.must.wifi
      }
    }));
  }

  function changeForm(patch) {
    setForm(prev => ({ ...prev, ...patch }));
  }

  function toggleCompare(id) {
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) {
        alert('You can compare up to three workspaces side-by-side.');
        return prev;
      }
      return [...prev, id];
    });
  }

  function toggleFavorite(id) {
    setFavorites(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function locateUser() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setOrigin({ lat: coords.latitude, lng: coords.longitude });
        setHasUserLocation(true);
      },
      () => {
        alert('Location access denied. Using demo Hyderabad coordinates.');
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  function resetOrigin() {
    setOrigin(DEMO_ORIGIN);
    setHasUserLocation(false);
  }

  function startGuidedWorkflow() {
    setGuidedStep(1);
    setPage('guided');
  }

  function saveBooking(ticket) {
    setBookings(prev => [ticket, ...prev]);
  }

  function cancelBooking(bookingId) {
    setBookings(prev => prev.filter(b => b.bookingId !== bookingId));
  }

  function handleAddReview(spaceId, newReview) {
    setDynamicSpaces(prev =>
      prev.map(s => {
        if (s.id === spaceId) {
          return {
            ...s,
            reviews: [newReview, ...(s.reviews || [])]
          };
        }
        return s;
      })
    );
  }

  function handleUpdateStatus(spaceId, newStatus) {
    setDynamicSpaces(prev =>
      prev.map(s => {
        if (s.id === spaceId) {
          return {
            ...s,
            liveStatus: {
              ...(s.liveStatus || {}),
              ...newStatus,
              verifiedAgo: 'Just now'
            }
          };
        }
        return s;
      })
    );
  }

  function openGallery(place, index = 0) {
    setGalleryState({ place, index });
  }

  return (
    <>
    

      <Nav
        page={page}
        setPage={setPage}
        activeCount={favorites.length}
        bookingCount={bookings.length}
        onOpenProfile={() => setShowProfile(true)}
        onOpenBookings={() => setShowBookingsModal(true)}
      />

      {page === 'home' && (
        <Home
          activity={activity}
          onActivity={changeActivity}
          go={setPage}
          openDetail={id => setDetailId(id)}
          spaces={places}
          onStartGuided={startGuidedWorkflow}
          onOpenNavigator={place => setNavigatorPlace(place)}
          onOpenGallery={openGallery}
        />
      )}

      {page === 'guided' && guidedStep === 1 && (
        <Step01Preferences
          activity={activity}
          onActivity={changeActivity}
          form={form}
          onFormChange={changeForm}
          onNext={() => setGuidedStep(2)}
          onCancel={() => setPage('home')}
        />
      )}

      {page === 'guided' && guidedStep === 2 && (
        <Step02Results
          activity={activity}
          places={places}
          form={form}
          onBack={() => setGuidedStep(1)}
          onGoCompare={() => setGuidedStep(3)}
          openDetail={id => setDetailId(id)}
          onBookDesk={place => setBookingPlace(place)}
          onOpenNavigator={place => setNavigatorPlace(place)}
          onOpenGallery={openGallery}
        />
      )}

      {page === 'guided' && guidedStep === 3 && (
        <Step03Compare
          activity={activity}
          places={places}
          form={form}
          onBack={() => setGuidedStep(2)}
          goExplore={() => setPage('explore')}
          onBookDesk={place => setBookingPlace(place)}
          onOpenNavigator={place => setNavigatorPlace(place)}
        />
      )}

      {page === 'explore' && (
        <ExploreSpaces
          places={places}
          origin={origin}
          hasUserLocation={hasUserLocation}
          onLocate={locateUser}
          onResetOrigin={resetOrigin}
          form={form}
          onFormChange={changeForm}
          activity={activity}
          onActivity={changeActivity}
          onDetail={id => setDetailId(id)}
          onCompare={toggleCompare}
          compareList={compareList}
          onFavorite={toggleFavorite}
          favorites={favorites}
          onBookDesk={place => setBookingPlace(place)}
          onOpenNavigator={place => setNavigatorPlace(place)}
          onCheckin={place => setCheckinPlace(place)}
          onOpenGallery={openGallery}
        />
      )}

      {page === 'about' && <HowItWorks go={setPage} />}

      {page === 'saved' && (
        <SavedSpaces
          ids={favorites}
          places={places}
          onDetail={id => setDetailId(id)}
          onFavorite={toggleFavorite}
          goExplore={() => setPage('explore')}
          onBookDesk={place => setBookingPlace(place)}
          onOpenNavigator={place => setNavigatorPlace(place)}
          onOpenGallery={openGallery}
        />
      )}

      {/* Detail Modal with Photo Gallery & Reviews */}
      {selectedPlace && (
        <DetailView
          place={selectedPlace}
          origin={origin}
          hasUserLocation={hasUserLocation}
          onClose={() => setDetailId(null)}
          onFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedPlace.id)}
          onBookDesk={place => setBookingPlace(place)}
          onOpenNavigator={place => setNavigatorPlace(place)}
          onAddReview={handleAddReview}
          onOpenGallery={openGallery}
        />
      )}

      {/* Full-Screen Photo Gallery Lightbox */}
      {galleryState && (
        <GalleryModal
          place={galleryState.place}
          initialIndex={galleryState.index}
          onClose={() => setGalleryState(null)}
          onBookDesk={place => setBookingPlace(place)}
          onOpenNavigator={place => setNavigatorPlace(place)}
        />
      )}

      {/* In-App Route & Navigator Modal */}
      {navigatorPlace && (
        <NavigatorModal
          place={navigatorPlace}
          origin={origin}
          hasUserLocation={hasUserLocation}
          onClose={() => setNavigatorPlace(null)}
          onBookDesk={place => setBookingPlace(place)}
        />
      )}

      {/* Mock Desk Reservation Modal */}
      {bookingPlace && (
        <BookingModal
          place={bookingPlace}
          onClose={() => setBookingPlace(null)}
          onSaveBooking={saveBooking}
        />
      )}

      {/* Live Check-in & Noise Level Report Modal */}
      {checkinPlace && (
        <CheckinModal
          place={checkinPlace}
          onClose={() => setCheckinPlace(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* My Bookings Modal */}
      {showBookingsModal && (
        <MyBookingsModal
          bookings={bookings}
          onClose={() => setShowBookingsModal(false)}
          onCancelBooking={cancelBooking}
        />
      )}

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>🍃 The Quiet Place</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>
              Find your space. Find your focus. Activity-aware matching engine.
            </p>
          </div>
          <div>
            Team Matla (Ajay, Harsha, Ganesh) • PS03 • Hyderabad, India
          </div>
        </div>
      </footer>
    </>
  );
}
