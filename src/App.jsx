
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <div>
            <h2>The Quiet Place</h2>
            <small>Find your space. Find your focus.</small>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#explore">Explore Spaces</a>
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
        </nav>

        <button className="signin-btn">Sign In</button>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">
              CAMPUS AND CITY WORKSPACES
            </p>

            <h1>
              Find the right space
              <br />
              for what you need to do.
            </h1>

            <p className="hero-description">
              Discover quiet, comfortable and suitable
              spaces on campus and across Hyderabad,
              matched to your activity and preferences.
            </p>
            
          </div>
        </section>
      </main>
    </div>
  );
}
