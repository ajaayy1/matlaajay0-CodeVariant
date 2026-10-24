// Intentionally fictional demonstration profiles. Not live venue facts or availability.
// Coordinates are omitted to avoid suggesting that fictional places are real map pins.
export const matcherActivities = [
  { id: 'study', label: 'Deep Study', icon: '📖', desc: 'Maximum focus, minimal distractions', weights: { quiet: 60, wifi: 15, seating: 25 } },
  { id: 'laptop', label: 'Laptop Work', icon: '💻', desc: 'Assignments, coding and general work', weights: { quiet: 25, wifi: 45, seating: 30 } },
  { id: 'group', label: 'Group Discussion', icon: '👥', desc: 'Brainstorming and team collaboration', weights: { quiet: 15, wifi: 35, seating: 50 } },
  { id: 'meeting', label: 'Online Meeting', icon: '📹', desc: 'Interviews, calls and online classes', weights: { quiet: 30, wifi: 45, seating: 25 } },
  { id: 'reading', label: 'Reading', icon: '📚', desc: 'Comfortable, peaceful reading', weights: { quiet: 65, wifi: 10, seating: 25 } }
];

// Matching the Antigravity visual dataset: only demo information is shown.
// Images refer to public/images, already added to your official Vite repository.
export const matcherSpaces = [
  { id: 'library', name: 'Central Campus Library', area: 'North Campus, Hyderabad', type: 'Campus', category: 'Library', image: 'library-reading.jpg', quiet: 95, wifi: 68, seating: 85, calls: false, group: false, charging: true, cost: 0, opens: 8, closes: 22 },
  { id: 'focus', name: 'FocusHub Coworking', area: 'Hitec City, Hyderabad', type: 'City', category: 'Coworking', image: 'focus-hub.jpg', quiet: 82, wifi: 94, seating: 90, calls: true, group: true, charging: true, cost: 299, opens: 8, closes: 23 },
  { id: 'roastery', name: 'Roastery Coffee House', area: 'Banjara Hills, Hyderabad', type: 'City', category: 'Café', image: 'cafe-courtyard.jpg', quiet: 58, wifi: 79, seating: 72, calls: true, group: true, charging: true, cost: 220, opens: 9, closes: 22 },
  { id: 'springboard', name: '91springboard Workspace', area: 'Kondapur, Hyderabad', type: 'City', category: 'Coworking', image: 'coworking-lounge.jpg', quiet: 78, wifi: 92, seating: 87, calls: true, group: true, charging: true, cost: 350, opens: 8, closes: 22 },
  { id: 'hall', name: 'Academic Block Study Hall', area: 'East Campus, Hyderabad', type: 'Campus', category: 'Study Hall', image: 'space4.jpg', quiet: 89, wifi: 60, seating: 76, calls: false, group: false, charging: true, cost: 0, opens: 8, closes: 20 },
  { id: 'garden', name: 'Garden Café Courtyard', area: 'Jubilee Hills, Hyderabad', type: 'City', category: 'Café', image: 'cafe-courtyard.jpg', quiet: 65, wifi: 74, seating: 81, calls: true, group: true, charging: false, cost: 180, opens: 10, closes: 23 },
  { id: 'booth', name: 'Private Call Booths', area: 'Hitec City, Hyderabad', type: 'City', category: 'Phone Booth', image: 'booth-interior.jpg', quiet: 92, wifi: 96, seating: 78, calls: true, group: false, charging: true, cost: 180, opens: 9, closes: 21 },
  { id: 'lounge', name: 'Green Commons Lounge', area: 'Financial District, Hyderabad', type: 'City', category: 'Coworking', image: 'coworking-lounge.jpg', quiet: 72, wifi: 90, seating: 94, calls: true, group: true, charging: true, cost: 280, opens: 8, closes: 22 },
  { id: 'research', name: 'Research Reading Room', area: 'South Campus, Hyderabad', type: 'Campus', category: 'Library', image: 'space1.jpg', quiet: 96, wifi: null, seating: 84, calls: false, group: false, charging: null, cost: 0, opens: 9, closes: 19 },
  { id: 'studio', name: 'Team Collaboration Studio', area: 'West Campus, Hyderabad', type: 'Campus', category: 'Group Room', image: 'hero-office.jpg', quiet: 53, wifi: 87, seating: 83, calls: true, group: true, charging: true, cost: 0, opens: 9, closes: 19 },
  { id: 'atrium', name: 'Open Atrium Desks', area: 'Madhapur, Hyderabad', type: 'City', category: 'Coworking', image: 'hero-panoramic.jpg', quiet: 76, wifi: 84, seating: 86, calls: true, group: true, charging: true, cost: 150, opens: 8, closes: 21 },
  { id: 'quietpod', name: 'Focus Pods', area: 'Central Campus, Hyderabad', type: 'Campus', category: 'Focus Pods', image: 'space3.jpg', quiet: 91, wifi: 86, seating: 80, calls: false, group: false, charging: true, cost: 0, opens: 8, closes: 20 }
];
