# 🍃 The Quiet Place — Activity-Aware Workspace Finder

> **"Right location, wrong environment. A map shows where a place is. It can’t tell you whether you can do your work there."**

**The Quiet Place** is an activity-aware workspace finder for campus and Hyderabad city, powered by **WorkFit**, an explainable matching engine that evaluates noise, Wi-Fi, seating, power, calling policies, budget, and hours to connect you with the right place for what you need to do.

---

## 🏆 Hackathon Details
- **Team Name**: Team Matla
- **Problem Statement**: PS03 (Activity-Aware Workspace Finder)
- **Team Members**:
  - **Ajay Matla** (Lead Developer / UI-UX)
  - **Harsha** (System Architecture & Requirements)
  - **Ganesh** (Domain Research & Verification Rules)
- **Target Region**: Campus & Hyderabad City (Hitec City, Gachibowli, Banjara Hills, Jubilee Hills, Kondapur)

---

## 🎯 The Core Philosophy: WorkFit Matching Engine

Traditional map searches only rank places by generic stars and distance. WorkFit inverts this paradigm:
1. **Activity-Driven Need**: Different activities (Deep Study, Online Interview, Laptop Work, Group Discussion, Reading) require completely different physical and acoustic environments.
2. **Rules First, Score Second**: Mandatory requirements (e.g. *calls allowed for interviews*, *charging points*, *Wi-Fi threshold*, *budget*) act as strict filters. If a space violates a non-negotiable condition, it is marked **Incompatible** with an explicit reason—no amount of plush seating or coffee quality can override a quiet-only policy during an interview.
3. **Unknown is Never Yes**: Missing data is explicitly displayed as **Unverified** (amber tag). WorkFit never makes dangerous assumptions about critical work needs.
4. **Transparent Scoring**:
   $$\text{WorkFit Score (0–10)} = \frac{\sum (\text{weight}_i \times \text{rating}_i)}{10}$$
   Eligible spaces display transparent 0–10 scores, breakdown progress bars, and side-by-side trade-offs.

---

## 🚀 Key Features

- **Hero & Activity Selector**: 1-click preset activities with calibrated weights and instant guidance.
- **The 3-Screen Decision Flow**:
  - **01 · Preferences**: Select activity, toggle mandatory conditions, adjust preference sliders (Quietness, Wi-Fi, Seating), set budget and hours.
  - **02 · Results**: Transparent summary pill bar (`X compatible`, `Y excluded`, `Z unverified`), WorkFit ranking badges, and clear exclusion explanations.
  - **03 · Compare & Decide**: Side-by-side comparison matrix of candidates vs alternatives with color-coded trade-offs and instant directions.
- **In-App Route & Nearby Navigator (No External Maps Needed!)**:
  - View straight-line distance, walking time (~mins), driving time, and live occupancy on an embedded interactive map modal.
  - Interactive route preview (dotted polyline) connecting user location directly to the selected workspace.
  - Quick radius distance filters (`< 2 km`, `< 5 km`, `< 10 km`, `All`).
- **Mock Seat Reservation & Digital Pass System**:
  - Book silent focus desks, soundproof interview booths, or collaboration pods.
  - Instant digital boarding pass with Booking Reference (`QP-HYD-XXXX`), QR code mockup, and session time.
  - Stored in browser `localStorage` and managed via the top navigation ("My Bookings").
- **Live Community Check-in & Noise Meter**:
  - Live acoustic noise levels (e.g. `38 dB Whisper Quiet`, `48 dB Moderate Hum`) and occupancy meter.
  - 1-click check-in to report live conditions with community karma points.
- **Activity-Specific Community Reviews**:
  - Verified reviews tied to activities (Deep Study, Online Meeting, Laptop Work).
  - In-app review submission form with interactive 5-star rating.
- **Full Workspace Discovery & Live Map**:
  - Real OpenStreetMap interactive tiles via Leaflet with color-coded WorkFit pins (Green = Eligible, Red = Excluded, Amber = Unverified).
  - Straight-line Haversine distance calculator with HTML5 user geolocation support.
  - Multi-criteria search, category filters, and sorting.
- **16 Curated Hyderabad Venues**: Authentic demo spaces including Central Campus Library, FocusHub Coworking (Hitec City), Roastery Coffee House (Banjara Hills), 91springboard, Academic Block Study Hall, Conçu Café, Collab Commons, Moss Café, T-Hub Phase 2, Lamakaan, and more.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 7
- **Mapping**: Leaflet 1.9 + OpenStreetMap CDN
- **Styling**: Custom CSS3 design system (Forest green `#173c38`, Sage `#789788`, Warm Ivory `#faf8f3`, Amber accents `#d99b65`, DM Serif Display & DM Sans typography)
- **Testing**: Node.js native test runner (`node:test`, `node:assert/strict`)

---

## 💻 Quick Start & Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (http://localhost:5173)
./dev.sh
# or
npm run dev

# 3. Run unit tests for WorkFit matching engine
./test.sh
# or
npm test

# 4. Production build
./build.sh
# or
npm run build
```

---

## 📁 Project Structure

```
the-quiet-place/
├── public/
│   └── images/              # Venue photos & hero photography
├── src/
│   ├── data/
│   │   └── demoSpaces.js    # 16 curated Hyderabad venues & activity presets
│   ├── lib/
│   │   ├── workfit.js       # Pure rules-first WorkFit matching engine & Haversine distance
│   │   └── workfit.test.js  # Automated unit tests
│   ├── App.jsx              # Main React application & views
│   ├── main.jsx             # React entry point
│   └── styles.css           # Responsive design system
├── index.html               # Main HTML entry
├── vite.config.js           # Vite build configuration
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

---

## 📜 License
Developed for Code Variant Build 01 (Hackathon submission).
© 2026 Team Matla (Ajay, Harsha, Ganesh). All demo venue names and coordinates are for prototyping purposes.
