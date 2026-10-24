import { useState } from "react";
import "./App.css";


const activities = [
  {
    id: "study",
    icon: "📖",
    label: "Deep Study",
    shortDesc: "Maximum focus, minimal distractions",
  },
  {
    id: "laptop",
    icon: "💻",
    label: "Laptop Work",
    shortDesc: "General work, assignments, coding",
  },
  {
    id: "group",
    icon: "👥",
    label: "Group Discussion",
    shortDesc: "Collaborate with others",
  },
  {
    id: "meeting",
    icon: "📹",
    label: "Online Meeting",
    shortDesc: "Calls, interviews, virtual classes",
  },
  {
    id: "reading",
    icon: "📚",
    label: "Reading",
    shortDesc: "Light reading, research",
  },
];

const heroBackgrounds = {
  panoramic: {
    label: "🌿 Biophilic Workspace",
    url: "/images/hero-panoramic.jpg",
  },
  library: {
    label: "📚 Campus Library",
    url: "/images/library-reading.jpg",
  },
  coworking: {
    label: "🏢 Hitec City Loft",
    url: "/images/coworking-lounge.jpg",
  },
  courtyard: {
    label: "☕ Garden Café",
    url: "/images/cafe-courtyard.jpg",
  },
};


const problemScenarios = {
  study: [
    {
      icon: "📖",
      name: "Campus Library",
      score: "8.8/10",
      status: "Good fit",
      tone: "good",
      description:
        "Quiet, comfortable seating and average Wi-Fi make it suitable for deep study.",
    },
    {
      icon: "🏢",
      name: "FocusHub Coworking",
      score: "8.6/10",
      status: "Good fit",
      tone: "good",
      description:
        "Quiet desk zones and strong connectivity, but costs ₹299 per visit.",
    },
    {
      icon: "☕",
      name: "Corner Café",
      score: "5.9/10",
      status: "Basic fit",
      tone: "warning",
      description:
        "Ambient conversations and music make intense studying difficult.",
    },
  ],
  interview: [
    {
      icon: "❌",
      name: "Campus Library",
      score: "Excluded",
      status: "Not allowed",
      tone: "bad",
      description:
        "Speaking is prohibited. A quiet environment cannot override this rule.",
    },
    {
      icon: "⭐",
      name: "FocusHub Coworking",
      score: "8.9/10",
      status: "Strong fit",
      tone: "good",
      description:
        "Call-friendly phone booths and reliable internet make interviews easier.",
    },
    {
      icon: "☕",
      name: "Corner Café",
      score: "6.9/10",
      status: "Plan B",
      tone: "warning",
      description:
        "Calls are allowed, but background noise may be unpredictable.",
    },
  ],
  group: [
    {
      icon: "👥",
      name: "Collab Commons",
      score: "8.9/10",
      status: "Strong fit",
      tone: "good",
      description:
        "Movable tables, whiteboards and permission for conversations.",
    },
    {
      icon: "❌",
      name: "Silent Reading Room",
      score: "Excluded",
      status: "Not allowed",
      tone: "bad",
      description:
        "Group conversations violate the silent reading room's rules.",
    },
    {
      icon: "☕",
      name: "Roastery Coffee House",
      score: "Good fit",
      status: "Suitable",
      tone: "good",
      description:
        "Casual seating that works well for conversations and group discussions.",
    },
  ],
};


const featuredSpaces = [
  {
    id: "library",
    name: "Central Campus Library",
    category: "Campus Library",
    area: "North Campus, Hyderabad",
    tagline: "Quiet · Study friendly · Free",
    cost: "Free",
    images: ["library-reading.jpg", "space1.jpg", "space4.jpg"],
    description: "Dedicated silent study halls and comfortable reading areas. Calls and conversations are not permitted.",
  },
  {
    id: "focus",
    name: "FocusHub Coworking",
    category: "Coworking",
    area: "Hitec City, Hyderabad",
    tagline: "Phone booths · Wi-Fi · Charging",
    cost: "₹299 / visit",
    images: ["focus-hub.jpg", "booth-interior.jpg", "coworking-lounge.jpg"],
    description: "A modern workspace with desks, connectivity and dedicated spaces for online meetings.",
  },
  {
    id: "roastery",
    name: "Roastery Coffee House",
    category: "Café",
    area: "Banjara Hills, Hyderabad",
    tagline: "Work-friendly · Wi-Fi · Café",
    cost: "₹220 estimated",
    images: ["cafe-courtyard.jpg", "space2.jpg", "space5.jpg"],
    description: "A relaxed café-style setting suited to casual laptop work and discussions.",
  },
  {
    id: "springboard",
    name: "91springboard Workspace",
    category: "Coworking",
    area: "Kondapur, Hyderabad",
    tagline: "Coworking · Meeting rooms",
    cost: "Paid access",
    images: ["coworking-lounge.jpg", "hero-office.jpg", "booth-interior.jpg"],
    description: "Collaborative desks and meeting-friendly areas for individuals and teams.",
  },
  {
    id: "hall",
    name: "Academic Block Study Hall",
    category: "Campus",
    area: "East Campus, Hyderabad",
    tagline: "Spacious · Peaceful · Free",
    cost: "Free",
    images: ["space4.jpg", "space3.jpg", "space1.jpg"],
    description: "A simple campus study environment for individual work and reading.",
  },
];

export default function App() {
  const [selectedActivity, setSelectedActivity] = useState("study");
  const [showSelection, setShowSelection] = useState(false);
  const [heroBg, setHeroBg] = useState("panoramic");
  const [navNotice, setNavNotice] = useState("");
  const [problemTab, setProblemTab] = useState("interview");

const [photoIndexes, setPhotoIndexes] = useState({});
const [savedSpaces, setSavedSpaces] = useState([]);
const [expandedSpace, setExpandedSpace] = useState(null);

function changeSpacePhoto(id, direction, total) {
  setPhotoIndexes((previous) => ({
    ...previous,
    [id]:
      ((previous[id] || 0) + direction + total) % total,
  }));
}

function toggleSaved(id) {
  setSavedSpaces((previous) =>
    previous.includes(id)
      ? previous.filter((item) => item !== id)
      : [...previous, id]
  );
}

  return (
    <div className="app">
      
    <>
      
      <header className="site-header">
        <div className="site-header-inner">

          <a className="site-brand" href="#home">
            <span className="site-logo">🍃</span>
            <span>
              <strong>The Quiet Place</strong>
              <small>Find your space. Find your focus.</small>
            </span>
          </a>

          <nav className="site-navigation" aria-label="Main navigation">
            <a className="site-active" href="#home">Home</a>

            <a href="#explore">3-Step Matcher</a>

            <a href="#explore">Explore Spaces</a>

            <button
              type="button"
              onClick={() =>
                setNavNotice("How It Works is the next section we'll build.")
              }
            >
              How It Works
            </button>

            <button
              type="button"
              onClick={() =>
                setNavNotice("Your Saved Spaces shortlist is coming next.")
              }
            >
              Saved
            </button>
          </nav>

          <div className="site-actions">
            <button
              type="button"
              className="site-outline-btn"
              onClick={() =>
                setNavNotice("Booking management is not connected yet.")
              }
            >
              🎟️ Bookings
            </button>

            <button
              type="button"
              className="site-outline-btn"
              onClick={() =>
                setNavNotice("Team Matla · Code Variant PS03")
              }
            >
              👤 Team Matla (PS03)
            </button>
          </div>

        </div>
      </header>

      {navNotice && (
        <div className="site-notice" role="status">
          <span>{navNotice}</span>
          <button
            type="button"
            onClick={() => setNavNotice("")}
            aria-label="Dismiss notice"
          >
            ×
          </button>
        </div>
      )}
    </>


      <main id="home">
        <section className="hero"
                      style={{
                        "--hero-bg": `url("${heroBackgrounds[heroBg].url}")`,
                      }}>
          <div className="hero-content">
            <p className="eyebrow">
              CAMPUS AND CITY WORKSPACES
            </p>

            <h1>
              Find the right space
              <br />
              for what you need to 
              <br />
              do.
            </h1>

            <p className="hero-description">
              Discover quiet, comfortable and suitable
              spaces on campus and across Hyderabad,
              matched to your activity and preferences.
            </p>
            
            <div className="hero-vibe-bar">
              <span className="hero-vibe-label">
                Background Ambience:
              </span>

              {Object.entries(heroBackgrounds).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className={`hero-vibe-btn ${heroBg === key ? "active" : ""}`}
                  onClick={() => setHeroBg(key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

          </div>

          <div className="hero-note">
            <span className="hero-note-icon">☼</span>

            <div>
              <strong>
                Different tasks. Different environments.
              </strong>

              <small>
                Currently:{" "}
                {heroBackgrounds[heroBg].label.replace(/^[^\s]+ /, "")}
              </small>
            </div>
          </div>

        </section>

        <section className="activity-section" id="explore">
          <div className="activity-panel">
            <div className="activity-panel-head">
              <h2>What are you looking for a space to do?</h2>
              <span>Choose your activity to get started</span>
            </div>

            <div className="activity-row">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  className={`activity-card ${
                    selectedActivity === activity.id ? "chosen" : ""
                  }`}
                  aria-pressed={selectedActivity === activity.id}
                  onClick={() => {
                    setSelectedActivity(activity.id);
                    setShowSelection(false);
                  }}
                >
                  <div className="activity-icon">{activity.icon}</div>
                  <strong>{activity.label}</strong>
                  <small>{activity.shortDesc}</small>
                </button>
              ))}

              <button
                className="find-space-btn"
                type="button"
                onClick={() => setShowSelection(true)}
              >
                Find My Space →
              </button>
            </div>

            {showSelection && (
              <div className="activity-confirmation" role="status">
                Selected:{" "}
                <strong>
                  {activities.find((a) => a.id === selectedActivity)?.label}
                </strong>
                . Next, we'll set your workspace preferences.
              </div>
            )}
          </div>
        </section>


        {/* Four Feature Highlights */}
        <section className="selling-points">
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

        
        <section className="problem-section" id="problem">
          <div className="problem-banner">
            <div className="problem-grid">
              <div className="problem-intro">
                <span className="eyebrow">THE CORE PROBLEM</span>

                <h2>Right location, wrong environment.</h2>

                <p>
                  A map shows where a place is. It can't tell you
                  whether you can do your work there. People piece
                  together noise, Wi-Fi, charging, rules, and
                  budget from reviews.
                </p>

                <div className="problem-tabs">
                  {[
                    ["study", "Deep Study"],
                    ["interview", "Online Interview"],
                    ["group", "Group Discussion"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={problemTab === id ? "active" : ""}
                      aria-pressed={problemTab === id}
                      onClick={() => setProblemTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="problem-cards">
                {problemScenarios[problemTab].map((space) => (
                  <div
                    className={`problem-item ${space.tone}`}
                    key={space.name}
                  >
                    <span className="problem-item-icon">
                      {space.icon}
                    </span>

                    <strong>
                      {space.name}: {space.score}
                    </strong>

                    <span className={`problem-status ${space.tone}`}>
                      {space.status}
                    </span>

                    <p>{space.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="problem-demo-note">
              Illustrative demo scenarios, not live ratings or verified availability.
            </p>
          </div>
        </section>

              
        <section className="popular-section" id="popular-spaces">
          <div className="popular-heading">
            <div>
              <span className="eyebrow">
                HYDERABAD CAMPUS & CITY SPACES
              </span>
              <h2>Popular around you</h2>
            </div>

            <a href="#explore" className="popular-explore">
              Find your best match →
            </a>
          </div>

          <div className="popular-grid">
            {featuredSpaces.map((space) => {
              const photoIndex = photoIndexes[space.id] || 0;
              const isSaved = savedSpaces.includes(space.id);

              return (
                <article className="popular-card" key={space.id}>
                  <div className="popular-photo">
                    <img
                      src={`/images/${space.images[photoIndex]}`}
                      alt={`${space.name} workspace preview`}
                      loading="lazy"
                    />

                    <span className="popular-category">
                      {space.category}
                    </span>

                    <button
                      type="button"
                      className={`popular-save ${isSaved ? "saved" : ""}`}
                      onClick={() => toggleSaved(space.id)}
                      aria-label={
                        isSaved
                          ? `Remove ${space.name} from saved`
                          : `Save ${space.name}`
                      }
                      aria-pressed={isSaved}
                    >
                      {isSaved ? "♥" : "♡"}
                    </button>

                    <div className="popular-photo-controls">
                      <button
                        type="button"
                        aria-label={`Previous photo of ${space.name}`}
                        onClick={() =>
                          changeSpacePhoto(
                            space.id,
                            -1,
                            space.images.length
                          )
                        }
                      >
                        ‹
                      </button>

                      <span>
                        {photoIndex + 1} / {space.images.length}
                      </span>

                      <button
                        type="button"
                        aria-label={`Next photo of ${space.name}`}
                        onClick={() =>
                          changeSpacePhoto(
                            space.id,
                            1,
                            space.images.length
                          )
                        }
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="popular-card-body">
                    <h3>{space.name}</h3>

                    <p className="popular-location">
                      📍 {space.area}
                    </p>

                    <p className="popular-tagline">
                      {space.tagline}
                    </p>

                    <div className="popular-card-bottom">
                      <strong>{space.cost}</strong>

                      <button
                        type="button"
                        className="popular-details-btn"
                        aria-expanded={expandedSpace === space.id}
                        onClick={() =>
                          setExpandedSpace(
                            expandedSpace === space.id
                              ? null
                              : space.id
                          )
                        }
                      >
                        Details →
                      </button>
                    </div>

                    {expandedSpace === space.id && (
                      <p className="popular-description">
                        {space.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="popular-disclaimer">
            * Prototype workspace profiles. Prices, facility details
            and availability are illustrative.
          </p>
        </section>

      </main>
    </div>
  );
}
