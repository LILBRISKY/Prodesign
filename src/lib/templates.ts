export interface TemplateRoom {
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  rooms: TemplateRoom[];
}

function r(type: string, name: string, x: number, y: number, w: number, h: number): TemplateRoom {
  return { type, name, x, y, width: w, height: h };
}

export const TEMPLATES: Template[] = [
  {
    id: '2bed-house',
    name: '2-Bedroom House',
    description: 'Compact family home with open living area',
    rooms: [
      r('living', 'Living Room', 20, 20, 220, 170),
      r('kitchen', 'Kitchen', 250, 20, 160, 120),
      r('dining', 'Dining', 250, 150, 160, 80),
      r('bedroom', 'Master Bedroom', 20, 200, 180, 150),
      r('bedroom', 'Bedroom 2', 210, 200, 160, 150),
      r('bathroom', 'Bathroom', 380, 200, 100, 100),
      r('hallway', 'Hallway', 20, 180, 460, 20),
      r('wc', 'WC', 380, 110, 60, 60),
    ],
  },
  {
    id: '3bed-house',
    name: '3-Bedroom House',
    description: 'Spacious family home with separate living and dining',
    rooms: [
      r('living', 'Living Room', 20, 20, 240, 180),
      r('dining', 'Dining Room', 270, 20, 160, 120),
      r('kitchen', 'Kitchen', 270, 150, 160, 100),
      r('bedroom', 'Master Bedroom', 20, 220, 200, 160),
      r('bedroom', 'Bedroom 2', 230, 220, 150, 160),
      r('bedroom', 'Bedroom 3', 390, 220, 140, 160),
      r('bathroom', 'Bathroom', 390, 100, 80, 100),
      r('hallway', 'Hallway', 20, 200, 510, 20),
      r('wc', 'WC', 470, 20, 60, 60),
    ],
  },
  {
    id: 'open-plan-apt',
    name: 'Open-Plan Apartment',
    description: 'Modern apartment with flowing open spaces',
    rooms: [
      r('living', 'Living Area', 20, 20, 280, 200),
      r('kitchen', 'Kitchen', 310, 20, 160, 100),
      r('dining', 'Dining', 310, 130, 160, 90),
      r('bedroom', 'Bedroom', 20, 240, 200, 140),
      r('study', 'Study', 230, 240, 120, 140),
      r('bathroom', 'Bathroom', 360, 240, 110, 100),
      r('balcony', 'Balcony', 480, 20, 100, 200),
      r('wc', 'WC', 360, 150, 60, 60),
    ],
  },
  {
    id: 'commercial-office',
    name: 'Commercial Office',
    description: 'Professional office with meeting rooms and reception',
    rooms: [
      r('reception', 'Reception', 20, 20, 200, 140),
      r('office', 'Open Office', 230, 20, 280, 200),
      r('office', 'Office 1', 20, 170, 120, 100),
      r('office', 'Office 2', 150, 170, 120, 100),
      r('meeting', 'Meeting Room', 520, 20, 140, 120),
      r('kitchen', 'Break Room', 520, 150, 140, 100),
      r('wc', 'WC', 280, 170, 60, 60),
      r('wc', 'WC 2', 350, 170, 60, 60),
      r('storage', 'Storage', 420, 170, 80, 60),
      r('hallway', 'Hallway', 20, 140, 640, 30),
    ],
  },
  {
    id: 'luxury-villa',
    name: 'Luxury Villa',
    description: 'Premium villa with garden and pool',
    rooms: [
      r('living', 'Grand Living', 20, 20, 300, 200),
      r('dining', 'Formal Dining', 330, 20, 180, 140),
      r('kitchen', 'Gourmet Kitchen', 330, 170, 180, 120),
      r('bedroom', 'Master Suite', 20, 240, 240, 180),
      r('bedroom', 'Bedroom 2', 270, 240, 160, 140),
      r('bedroom', 'Bedroom 3', 440, 240, 160, 140),
      r('bathroom', 'En-Suite', 270, 390, 100, 80),
      r('bathroom', 'Bathroom 2', 380, 390, 100, 80),
      r('study', 'Study', 520, 20, 140, 140),
      r('garden', 'Garden', 520, 170, 140, 200),
      r('pool', 'Pool', 20, 440, 280, 120),
      r('hallway', 'Hallway', 20, 220, 640, 20),
    ],
  },
  {
    id: 'bungalow',
    name: 'Bungalow',
    description: 'Single-story compact bungalow layout',
    rooms: [
      r('living', 'Living Room', 20, 20, 200, 160),
      r('kitchen', 'Kitchen', 230, 20, 140, 100),
      r('dining', 'Dining', 230, 130, 140, 80),
      r('bedroom', 'Bedroom 1', 20, 200, 180, 140),
      r('bedroom', 'Bedroom 2', 210, 200, 160, 140),
      r('bathroom', 'Bathroom', 380, 200, 80, 80),
      r('wc', 'WC', 380, 120, 60, 60),
      r('hallway', 'Hallway', 20, 180, 440, 20),
    ],
  },
];

export interface Preset {
  id: string;
  name: string;
  description: string;
  rooms: TemplateRoom[];
}

export const PRESETS: Preset[] = [
  {
    id: 'residential',
    name: 'Residential Home',
    description: 'Start with a basic residential layout',
    rooms: [
      r('living', 'Living Room', 20, 20, 200, 160),
      r('kitchen', 'Kitchen', 230, 20, 150, 120),
      r('bedroom', 'Master Bedroom', 20, 200, 180, 150),
      r('bathroom', 'Bathroom', 210, 200, 100, 100),
      r('hallway', 'Hallway', 20, 180, 340, 20),
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial Space',
    description: 'Start with a commercial office layout',
    rooms: [
      r('reception', 'Reception', 20, 20, 180, 140),
      r('office', 'Main Office', 210, 20, 260, 180),
      r('meeting', 'Meeting Room', 20, 170, 120, 100),
      r('wc', 'WC', 150, 170, 60, 60),
      r('storage', 'Storage', 210, 170, 80, 60),
    ],
  },
  {
    id: 'apartment',
    name: 'Apartment Unit',
    description: 'Start with an apartment floor plan',
    rooms: [
      r('living', 'Living Area', 20, 20, 240, 180),
      r('kitchen', 'Kitchen', 270, 20, 140, 100),
      r('bedroom', 'Bedroom', 20, 220, 200, 140),
      r('bathroom', 'Bathroom', 230, 220, 100, 80),
      r('hallway', 'Entry', 230, 140, 100, 60),
    ],
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    description: 'Start with a warehouse layout',
    rooms: [
      r('storage', 'Main Floor', 20, 20, 400, 300),
      r('office', 'Office', 430, 20, 140, 120),
      r('wc', 'WC', 430, 150, 60, 60),
      r('utility', 'Utility', 500, 150, 80, 60),
      r('garage', 'Loading Bay', 430, 220, 140, 100),
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant / Cafe',
    description: 'Start with a restaurant layout',
    rooms: [
      r('dining', 'Main Dining', 20, 20, 280, 200),
      r('kitchen', 'Kitchen', 310, 20, 160, 140),
      r('bathroom', 'Restroom', 310, 170, 80, 80),
      r('wc', 'WC', 400, 170, 70, 80),
      r('reception', 'Entrance', 20, 230, 160, 80),
      r('storage', 'Pantry', 470, 20, 80, 80),
    ],
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from a completely empty canvas',
    rooms: [],
  },
];
