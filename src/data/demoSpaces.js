/* The identities, coordinates, scores and policies below are fictional demonstration data.
 * Designed for Hyderabad campus & city prototype demonstration. */

export const DEMO_ORIGIN = { 
  lat: 17.4447, 
  lng: 78.3752, 
  label: 'Hitec City / Campus Junction (Hyderabad)' 
};

export const ACTIVITIES = [
  { 
    id: 'study', 
    label: 'Deep Study', 
    icon: '📖', 
    shortDesc: 'Maximum focus, minimal distractions',
    description: 'Exam preparation, deep research, intense reading where absolute quietness is essential.',
    weights: { quiet: 60, wifi: 15, seating: 25 },
    defaultMust: { calls: false, group: false, charging: false, wifi: false, free: false }
  },
  { 
    id: 'laptop', 
    label: 'Laptop Work', 
    icon: '💻', 
    shortDesc: 'General work, assignments, coding',
    description: 'Solo coding, drafting documents, and homework needing strong Wi-Fi and power outlets.',
    weights: { quiet: 25, wifi: 45, seating: 30 },
    defaultMust: { calls: false, group: false, charging: true, wifi: true, free: false }
  },
  { 
    id: 'group', 
    label: 'Group Discussion', 
    icon: '👥', 
    shortDesc: 'Collaborate with others',
    description: 'Team projects, brainstorms, and group study requiring conversation-friendly seating.',
    weights: { quiet: 15, wifi: 35, seating: 50 },
    defaultMust: { calls: true, group: true, charging: false, wifi: false, free: false }
  },
  { 
    id: 'meeting', 
    label: 'Online Meeting', 
    icon: '📹', 
    shortDesc: 'Calls, interviews, virtual classes',
    description: 'Job interviews, client calls, and video webinars where speaking is strictly required.',
    weights: { quiet: 30, wifi: 45, seating: 25 },
    defaultMust: { calls: true, group: false, charging: true, wifi: true, free: false }
  },
  { 
    id: 'reading', 
    label: 'Reading', 
    icon: '📚', 
    shortDesc: 'Light reading, research',
    description: 'Relaxed reading, casual literature review, and reflective note-taking in comfortable seating.',
    weights: { quiet: 65, wifi: 10, seating: 25 },
    defaultMust: { calls: false, group: false, charging: false, wifi: false, free: false }
  }
];

export const SPACES = [
  {
    id: 'library',
    name: 'Central Campus Library',
    type: 'Campus',
    category: 'Library',
    area: 'North Campus, Hyderabad',
    lat: 17.4445,
    lng: 78.3540,
    quiet: 95,
    wifi: 68,
    seating: 85,
    calls: false,
    charging: true,
    group: false,
    cost: 0,
    opens: 8,
    closes: 22,
    photo: 'library-reading.jpg',
    photos: [
      { src: 'library-reading.jpg', caption: 'Grand Silent Study Hall with Brass Banker Lamps' },
      { src: 'space1.jpg', caption: 'Individual Focused Study Carrels' },
      { src: 'space4.jpg', caption: 'Natural Light Window Desks & Reference Stacks' }
    ],
    tagline: 'Quiet · Study friendly · Free',
    description: 'Dedicated silent study halls, carrels, and natural lighting. Strict zero-noise policy enforced; virtual calls and conversations are strictly prohibited.',
    source: 'Campus Facility Directory · Verified Oct 2026',
    liveStatus: { occupancy: 72, noiseDb: 34, noiseDesc: 'Dead Silent', verifiedAgo: '8m ago', freeDesks: 14 },
    reviews: [
      { id: 'r1', user: 'Sneha R.', role: 'CS Student', activity: 'Deep Study', rating: 5, comment: 'Perfect silence for GRE prep. Arrive before 10 AM to grab a window desk with wall power.', time: 'Today, 2:15 PM' },
      { id: 'r2', user: 'Karthik V.', role: 'Research Scholar', activity: 'Deep Study', rating: 4, comment: 'Very peaceful. Wi-Fi can get a bit slow during peak afternoon hours, but silence is unmatched.', time: 'Yesterday' }
    ]
  },
  {
    id: 'focus',
    name: 'FocusHub Coworking',
    type: 'City',
    category: 'Coworking',
    area: 'Hitec City, Hyderabad',
    lat: 17.4502,
    lng: 78.3870,
    quiet: 82,
    wifi: 94,
    seating: 90,
    calls: true,
    charging: true,
    group: true,
    cost: 299,
    opens: 8,
    closes: 23,
    photo: 'focus-hub.jpg',
    photos: [
      { src: 'focus-hub.jpg', caption: 'Modern Collaborative Open Desks' },
      { src: 'booth-interior.jpg', caption: 'Soundproof Acoustic Phone Booth with Headset & Laptop Desk' },
      { src: 'coworking-lounge.jpg', caption: 'Ergonomic Mesh Seating & Fast Fiber Connectivity' },
      { src: 'hero-office.jpg', caption: 'Lounge Area with Complimentary Espresso Bar' }
    ],
    tagline: 'Soundproof phone booths · Ultra Wi-Fi · Power everywhere',
    description: 'Modern collaborative workspace with soundproof phone booths for interviews, ergonomic mesh chairs, high-speed fiber internet, and complimentary beverages.',
    source: 'Venue Partner Portal · Verified Oct 2026',
    liveStatus: { occupancy: 58, noiseDb: 46, noiseDesc: 'Quiet Office Hum', verifiedAgo: '15m ago', freeDesks: 9 },
    reviews: [
      { id: 'r3', user: 'Pooja M.', role: 'Frontend Engineer', activity: 'Online Meeting', rating: 5, comment: 'Booked the phone booth for my tech interview. Zero background noise and 200 Mbps fiber!', time: 'Today, 11:30 AM' },
      { id: 'r4', user: 'Vikram S.', role: 'Freelancer', activity: 'Laptop Work', rating: 5, comment: 'Ergonomic chairs are so comfortable for 6-hour sprint sessions. Unlimited filter coffee too.', time: '2 days ago' }
    ]
  },
  {
    id: 'roastery',
    name: 'Roastery Coffee House',
    type: 'City',
    category: 'Café',
    area: 'Banjara Hills, Hyderabad',
    lat: 17.4320,
    lng: 78.4350,
    quiet: 62,
    wifi: 84,
    seating: 80,
    calls: true,
    charging: true,
    group: true,
    cost: 220,
    opens: 8,
    closes: 23,
    photo: 'cafe-courtyard.jpg',
    photos: [
      { src: 'cafe-courtyard.jpg', caption: 'Sunlit Courtyard Tables with Potted Greenery & Brick Arches' },
      { src: 'space2.jpg', caption: 'Indoor Perimeter Work Booths with Outlets' },
      { src: 'space5.jpg', caption: 'Artisanal Single-Origin Coffee Bar' }
    ],
    tagline: 'Work-friendly · Good Wi-Fi · ₹ ₹',
    description: 'Spacious artisanal courtyard café with outdoor greenery, reliable Wi-Fi, and laptop-friendly perimeter booths suited for casual meetings and coding.',
    source: 'Community Contributed · Verified Sep 2026',
    liveStatus: { occupancy: 82, noiseDb: 58, noiseDesc: 'Lively Ambient', verifiedAgo: '20m ago', freeDesks: 4 },
    reviews: [
      { id: 'r5', user: 'Arjun T.', role: 'Product Designer', activity: 'Laptop Work', rating: 4, comment: 'The cold brew and courtyard breeze keep creative energy high. Indoor booths have power plugs.', time: '3 days ago' }
    ]
  },
  {
    id: 'springboard',
    name: '91springboard Workspace',
    type: 'City',
    category: 'Coworking',
    area: 'Kondapur, Hyderabad',
    lat: 17.4610,
    lng: 78.3680,
    quiet: 80,
    wifi: 92,
    seating: 88,
    calls: true,
    charging: true,
    group: true,
    cost: 350,
    opens: 7,
    closes: 23,
    photo: 'coworking-lounge.jpg',
    photos: [
      { src: 'coworking-lounge.jpg', caption: 'Spacious Open Coworking Floor with Natural Daylight' },
      { src: 'booth-interior.jpg', caption: 'Acoustic Call Pod for Confidential Video Meetings' },
      { src: 'space3.jpg', caption: 'Meeting & Brainstorming Conference Pods' }
    ],
    tagline: 'Coworking · Meeting rooms · ₹ ₹ ₹',
    description: 'Professional enterprise hub with hot desks, bookable meeting pods, reliable generator backup, and high-security network infrastructure.',
    source: 'Venue Partner Portal · Verified Oct 2026',
    liveStatus: { occupancy: 60, noiseDb: 48, noiseDesc: 'Calm Professional', verifiedAgo: '5m ago', freeDesks: 12 },
    reviews: [
      { id: 'r6', user: 'Divya N.', role: 'Startup Founder', activity: 'Online Meeting', rating: 5, comment: 'Meeting pods are equipped with good lighting and webcams. High reliability.', time: 'Yesterday' }
    ]
  },
  {
    id: 'hall',
    name: 'Academic Block Study Hall',
    type: 'Campus',
    category: 'Study Hall',
    area: 'East Campus, Hyderabad',
    lat: 17.4425,
    lng: 78.3590,
    quiet: 88,
    wifi: 78,
    seating: 83,
    calls: false,
    charging: true,
    group: false,
    cost: 0,
    opens: 9,
    closes: 21,
    photo: 'space4.jpg',
    photos: [
      { src: 'space4.jpg', caption: 'Quiet Air-Conditioned Study Hall Desks' },
      { src: 'library-reading.jpg', caption: 'Polished Wooden Group Study Stacks' },
      { src: 'space1.jpg', caption: 'Dedicated Electrical Sockets on Every Desk' }
    ],
    tagline: 'Spacious · Peaceful · Free',
    description: 'Quiet, air-conditioned study hall with large wooden tables, power outlets on every desk, and peaceful surroundings for uninterrupted exam prep.',
    source: 'Campus Academic Council · Verified Oct 2026',
    liveStatus: { occupancy: 68, noiseDb: 36, noiseDesc: 'Whisper Quiet', verifiedAgo: '18m ago', freeDesks: 16 },
    reviews: [
      { id: 'r7', user: 'Rohan K.', role: 'Engineering Senior', activity: 'Deep Study', rating: 5, comment: 'Always quiet, air conditioning works great, and free for all campus students.', time: 'Today, 9:00 AM' }
    ]
  },
  {
    id: 'concu',
    name: 'Conçu Café & Bakery',
    type: 'City',
    category: 'Café',
    area: 'Jubilee Hills, Hyderabad',
    lat: 17.4355,
    lng: 78.4090,
    quiet: 54,
    wifi: 80,
    seating: 75,
    calls: true,
    charging: false,
    group: true,
    cost: 260,
    opens: 10,
    closes: 22,
    photo: 'space5.jpg',
    photos: [
      { src: 'space5.jpg', caption: 'Chic European Aesthetic Dining & Work Lounge' },
      { src: 'cafe-courtyard.jpg', caption: 'Covered Garden Terrace for Relaxed Reading' },
      { src: 'space2.jpg', caption: 'Banquette Seating with Natural Lighting' }
    ],
    tagline: 'Aesthetic · Laptop friendly · ₹ ₹',
    description: 'Chic European-style pâtisserie and work café with comfortable banquette seating, ambient music, and bright natural lighting for creative laptop work.',
    source: 'Community Contributed · Verified Oct 2026',
    liveStatus: { occupancy: 85, noiseDb: 62, noiseDesc: 'Café Music & Chatter', verifiedAgo: '11m ago', freeDesks: 3 },
    reviews: [
      { id: 'r8', user: 'Ananya S.', role: 'Content Writer', activity: 'Reading', rating: 4, comment: 'Gorgeous aesthetics and great desserts. Charge your laptop beforehand since wall sockets are rare.', time: '4 days ago' }
    ]
  },
  {
    id: 'commons',
    name: 'Collab Commons',
    type: 'Campus',
    category: 'Study Room',
    area: 'Innovation Wing, Campus',
    lat: 17.4389,
    lng: 78.3610,
    quiet: 56,
    wifi: 78,
    seating: 88,
    calls: true,
    charging: true,
    group: true,
    cost: 0,
    opens: 10,
    closes: 19,
    photo: 'space3.jpg',
    photos: [
      { src: 'space3.jpg', caption: 'Modular Seating & Moveable Whiteboards' },
      { src: 'coworking-lounge.jpg', caption: 'Team Sprint Workstation Tables' },
      { src: 'space4.jpg', caption: 'Presentation Area with Video Projection' }
    ],
    tagline: 'Group work · Whiteboards · Free access',
    description: 'Open student collaboration room equipped with rolling whiteboards, modular seating clusters, and call permissions for group presentations.',
    source: 'Student Union Directory · Verified Oct 2026',
    liveStatus: { occupancy: 64, noiseDb: 54, noiseDesc: 'Collaborative Buzz', verifiedAgo: '7m ago', freeDesks: 10 },
    reviews: [
      { id: 'r9', user: 'Team ByteCraft', role: 'Hackathon Team', activity: 'Group Discussion', rating: 5, comment: 'We prepped our hackathon demo here! Rolling whiteboards and modular tables were awesome.', time: 'Today, 1:00 PM' }
    ]
  },
  {
    id: 'moss',
    name: 'Moss Café & Work Bar',
    type: 'City',
    category: 'Café',
    area: 'Madhapur Arts District, Hyderabad',
    lat: 17.4552,
    lng: 78.3850,
    quiet: 48,
    wifi: 82,
    seating: 70,
    calls: true,
    charging: false,
    group: true,
    cost: 160,
    opens: 9,
    closes: 23,
    photo: 'space2.jpg',
    photos: [
      { src: 'space2.jpg', caption: 'Casual Work Bar with High Stools' },
      { src: 'cafe-courtyard.jpg', caption: 'Outdoor Patio with Ambient City Energy' },
      { src: 'space5.jpg', caption: 'Coffee Grinding & Espresso Station' }
    ],
    tagline: 'Lively vibe · Fast drinks · Group banter',
    description: 'Bustling café with great espresso, casual outdoor benches, and upbeat ambient sound. Outlets are limited to perimeter bar tables.',
    source: 'Community Volunteer · Verified Sep 2026',
    liveStatus: { occupancy: 78, noiseDb: 64, noiseDesc: 'Upbeat Music', verifiedAgo: '25m ago', freeDesks: 5 },
    reviews: [
      { id: 'r10', user: 'Harish B.', role: 'UX Designer', activity: 'Laptop Work', rating: 4, comment: 'Good coffee and quick Wi-Fi. Better for brainstorming than quiet focus.', time: '5 days ago' }
    ]
  },
  {
    id: 'riverbend',
    name: 'Riverbend Work Loft',
    type: 'City',
    category: 'Coworking',
    area: 'Gachibowli, Hyderabad',
    lat: 17.4332,
    lng: 78.3960,
    quiet: 86,
    wifi: 91,
    seating: 79,
    calls: true,
    charging: true,
    group: true,
    cost: 220,
    opens: 8,
    closes: 21,
    photo: 'coworking-lounge.jpg',
    photos: [
      { src: 'coworking-lounge.jpg', caption: 'High-Ceiling Loft Desks with Acoustic Ceilings' },
      { src: 'booth-interior.jpg', caption: 'Private Soundproof Single-User Call Booth' },
      { src: 'space3.jpg', caption: 'Quiet Individual Focus Pod' }
    ],
    tagline: 'Calm shared workspace · Great natural light',
    description: 'Loft-style coworking studio with high ceilings, quiet zones, dedicated call booths, and guaranteed power backup for remote professionals.',
    source: 'Venue Partner Portal · Verified Oct 2026',
    liveStatus: { occupancy: 52, noiseDb: 42, noiseDesc: 'Whisper Level', verifiedAgo: '14m ago', freeDesks: 11 },
    reviews: [
      { id: 'r11', user: 'Siddharth G.', role: 'Software Engineer', activity: 'Laptop Work', rating: 5, comment: 'Quiet loft, excellent fiber connection, and reasonable day pass price.', time: 'Yesterday' }
    ]
  },
  {
    id: 'fern',
    name: 'Fern Reading Room',
    type: 'City',
    category: 'Library',
    area: 'Old City Cultural Quarter, Hyderabad',
    lat: 17.4520,
    lng: 78.3780,
    quiet: 93,
    wifi: null, // intentionally unverified
    seating: 87,
    calls: false,
    charging: null, // intentionally unverified
    group: false,
    cost: 80,
    opens: 9,
    closes: 19,
    photo: 'space5.jpg',
    photos: [
      { src: 'space5.jpg', caption: 'Vintage Reading Sanctuary & Wooden Shelves' },
      { src: 'library-reading.jpg', caption: 'Solid Mahogany Reading Desks' }
    ],
    tagline: 'Historic collection · Quiet sanctuary · Unverified Wi-Fi',
    description: 'Quiet sanctuary lined with book stacks and vintage lamps. Wi-Fi and charging socket status are currently unverified by our volunteer field team.',
    source: 'Volunteer Checklist Pending Verification',
    liveStatus: { occupancy: 40, noiseDb: 32, noiseDesc: 'Pin-drop Silence', verifiedAgo: '2h ago', freeDesks: 18 },
    reviews: [
      { id: 'r12', user: 'Mahesh C.', role: 'History Student', activity: 'Reading', rating: 4, comment: 'Pure quiet for offline reading. Note that there is no public Wi-Fi password posted.', time: '1 week ago' }
    ]
  },
  {
    id: 'studio',
    name: 'Studio Lab Hub',
    type: 'Campus',
    category: 'Study Room',
    area: 'Technology Block, Campus',
    lat: 17.4365,
    lng: 78.3460,
    quiet: 63,
    wifi: 90,
    seating: 88,
    calls: true,
    charging: true,
    group: true,
    cost: 0,
    opens: 8,
    closes: 20,
    photo: 'space4.jpg',
    photos: [
      { src: 'space4.jpg', caption: 'Dual-Monitor Developer Sprints Workstation' },
      { src: 'coworking-lounge.jpg', caption: 'Team Hardware & Software Debugging Benches' }
    ],
    tagline: 'Tech project labs · Fast network · Collaboration',
    description: 'Equipped with dual monitors for team sprints, high-bandwidth campus Ethernet, and presentation monitors for engineering teams.',
    source: 'Engineering Dept Facility · Verified Oct 2026',
    liveStatus: { occupancy: 65, noiseDb: 50, noiseDesc: 'Tech Lab Buzz', verifiedAgo: '9m ago', freeDesks: 8 },
    reviews: [
      { id: 'r13', user: 'Naveen K.', role: 'Robotics Team', activity: 'Group Discussion', rating: 5, comment: 'High-speed LAN, big HDMI displays for testing presentations, completely free.', time: '2 days ago' }
    ]
  },
  {
    id: 'pods',
    name: 'Courtyard Study Pods',
    type: 'Campus',
    category: 'Study Hall',
    area: 'Campus Gardens, Hyderabad',
    lat: 17.4488,
    lng: 78.3505,
    quiet: 89,
    wifi: 76,
    seating: 76,
    calls: false,
    charging: true,
    group: false,
    cost: 0,
    opens: 8,
    closes: 18,
    photo: 'space1.jpg',
    photos: [
      { src: 'space1.jpg', caption: 'Individual Acoustic Pod in the Garden Courtyard' },
      { src: 'library-reading.jpg', caption: 'Botanical Garden View from Inside the Focus Pod' }
    ],
    tagline: 'Single occupant pods · Garden views · Zero fee',
    description: 'Compact acoustic pods nestled in the campus botanical garden. Perfect for individual solo reading and focus blocks.',
    source: 'Campus Facilities · Verified Oct 2026',
    liveStatus: { occupancy: 80, noiseDb: 35, noiseDesc: 'Nature & Silence', verifiedAgo: '30m ago', freeDesks: 2 },
    reviews: [
      { id: 'r14', user: 'Meera B.', role: 'Bio Student', activity: 'Reading', rating: 5, comment: 'Looking out at the garden while studying is so calming. Book ahead as there are only 8 pods.', time: '3 days ago' }
    ]
  },
  {
    id: 'brew',
    name: 'Brew & Bloom Coffee',
    type: 'City',
    category: 'Café',
    area: 'Financial District, Hyderabad',
    lat: 17.4429,
    lng: 78.4010,
    quiet: 59,
    wifi: 80,
    seating: 68,
    calls: true,
    charging: true,
    group: true,
    cost: 130,
    opens: 8,
    closes: 23,
    photo: 'space5.jpg',
    photos: [
      { src: 'space5.jpg', caption: 'Corner Work Counter with Wall Plugs' },
      { src: 'cafe-courtyard.jpg', caption: 'Outdoor Garden Tables for Quick Chat Sessions' }
    ],
    tagline: 'Affordable coffees · Quick laptop stops',
    description: 'Fast-paced coffee stop popular among young freelancers and interns. Reliable Wi-Fi with wall socket power at corner counters.',
    source: 'Community Contributed · Verified Oct 2026',
    liveStatus: { occupancy: 75, noiseDb: 56, noiseDesc: 'Upbeat Café', verifiedAgo: '16m ago', freeDesks: 6 },
    reviews: [
      { id: 'r15', user: 'Kunal P.', role: 'Intern', activity: 'Laptop Work', rating: 4, comment: 'Budget-friendly cold coffees and dependable Wi-Fi. Great for a 2-hour afternoon work block.', time: 'Yesterday' }
    ]
  },
  {
    id: 'thub',
    name: 'T-Hub Open Innovation Zone',
    type: 'City',
    category: 'Coworking',
    area: 'Raidurgam, Hyderabad',
    lat: 17.4290,
    lng: 78.3790,
    quiet: 75,
    wifi: 96,
    seating: 92,
    calls: true,
    charging: true,
    group: true,
    cost: 450,
    opens: 7,
    closes: 24,
    photo: 'coworking-lounge.jpg',
    photos: [
      { src: 'coworking-lounge.jpg', caption: 'Gigabit Open Innovation Coworking Floor' },
      { src: 'booth-interior.jpg', caption: 'Pitch & Investor Call Soundproof Booth' },
      { src: 'hero-office.jpg', caption: 'Amphitheater & Startup Community Networking Area' }
    ],
    tagline: 'Premier startup incubator · Gigabit speed · 24/7 access',
    description: 'State-of-the-art startup ecosystem with tier-1 internet, amphitheater seating, private meeting rooms, and active networking environment.',
    source: 'Incubation Partner · Verified Oct 2026',
    liveStatus: { occupancy: 62, noiseDb: 47, noiseDesc: 'Productive Buzz', verifiedAgo: '10m ago', freeDesks: 15 },
    reviews: [
      { id: 'r16', user: 'Tanvi M.', role: 'AI Researcher', activity: 'Laptop Work', rating: 5, comment: 'Gigabit speeds and the energy here is unmatched in Hyderabad.', time: 'Today, 10:15 AM' }
    ]
  },
  {
    id: 'lamakaan',
    name: 'Lamakaan Cultural Space',
    type: 'City',
    category: 'Study Room',
    area: 'Banjara Hills, Hyderabad',
    lat: 17.4240,
    lng: 78.4480,
    quiet: 50,
    wifi: 74,
    seating: 65,
    calls: true,
    charging: false,
    group: true,
    cost: 0,
    opens: 10,
    closes: 21,
    photo: 'space2.jpg',
    photos: [
      { src: 'space2.jpg', caption: 'Open-Air Cultural Verandah with Wooden Benches' },
      { src: 'cafe-courtyard.jpg', caption: 'Tree-Canopied Courtyard for Group Brainstorms' }
    ],
    tagline: 'Open democratic culture · Free entry · Community spirit',
    description: 'Iconic open cultural centre in Hyderabad. Open-air wooden tables, samosas and chai, perfect for community group discussions and casual reading.',
    source: 'Community Contributed · Verified Oct 2026',
    liveStatus: { occupancy: 88, noiseDb: 60, noiseDesc: 'Open Discussion', verifiedAgo: '22m ago', freeDesks: 4 },
    reviews: [
      { id: 'r17', user: 'Zainab A.', role: 'Debate Club Lead', activity: 'Group Discussion', rating: 5, comment: 'Best place in Hyderabad for open discussions over hot samosas and chai.', time: '4 days ago' }
    ]
  },
  {
    id: 'avasa',
    name: 'Avasa Executive Business Lounge',
    type: 'City',
    category: 'Coworking',
    area: 'Hitec City, Hyderabad',
    lat: 17.4470,
    lng: 78.3840,
    quiet: 90,
    wifi: 95,
    seating: 94,
    calls: true,
    charging: true,
    group: false,
    cost: 500,
    opens: 6,
    closes: 23,
    photo: 'hero-office.jpg',
    photos: [
      { src: 'hero-office.jpg', caption: 'Executive Suite Lounge with Concierge Service' },
      { src: 'booth-interior.jpg', caption: 'Ultra-Quiet Private Executive Video Booth' },
      { src: 'coworking-lounge.jpg', caption: 'Leather Ergonomic Armchairs & Floor-to-Ceiling Windows' }
    ],
    tagline: 'Quiet luxury · Premium call comfort · Concierge',
    description: 'Upscale business lounge tailored for confidential executive calls, quiet interview sessions, and luxurious deep work.',
    source: 'Hospitality Partner · Verified Oct 2026',
    liveStatus: { occupancy: 35, noiseDb: 38, noiseDesc: 'Whisper Executive', verifiedAgo: '12m ago', freeDesks: 10 },
    reviews: [
      { id: 'r18', user: 'Sanjay R.', role: 'Engineering Director', activity: 'Online Meeting', rating: 5, comment: 'Impeccable acoustic privacy, high luxury, and exceptional coffee.', time: 'Yesterday' }
    ]
  }
];
