export interface RoomType {
  id: string;
  label: string;
  category: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'utility' | 'outdoor' | 'commercial';
  color: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const ROOM_TYPES: RoomType[] = [
  { id: 'living', label: 'Living Room', category: 'living', color: '#3B82F6', defaultWidth: 200, defaultHeight: 160 },
  { id: 'bedroom', label: 'Bedroom', category: 'bedroom', color: '#8B5CF6', defaultWidth: 160, defaultHeight: 140 },
  { id: 'kitchen', label: 'Kitchen', category: 'kitchen', color: '#10B981', defaultWidth: 150, defaultHeight: 120 },
  { id: 'bathroom', label: 'Bathroom', category: 'bathroom', color: '#F59E0B', defaultWidth: 80, defaultHeight: 80 },
  { id: 'dining', label: 'Dining Room', category: 'living', color: '#2563EB', defaultWidth: 140, defaultHeight: 120 },
  { id: 'study', label: 'Study', category: 'living', color: '#6366F1', defaultWidth: 120, defaultHeight: 100 },
  { id: 'garage', label: 'Garage', category: 'utility', color: '#6B7280', defaultWidth: 180, defaultHeight: 140 },
  { id: 'hallway', label: 'Hallway', category: 'utility', color: '#9CA3AF', defaultWidth: 120, defaultHeight: 40 },
  { id: 'storage', label: 'Storage', category: 'utility', color: '#78716C', defaultWidth: 80, defaultHeight: 60 },
  { id: 'garden', label: 'Garden', category: 'outdoor', color: '#34D399', defaultWidth: 200, defaultHeight: 180 },
  { id: 'pool', label: 'Pool', category: 'outdoor', color: '#06B6D4', defaultWidth: 160, defaultHeight: 100 },
  { id: 'balcony', label: 'Balcony', category: 'outdoor', color: '#A7F3D0', defaultWidth: 120, defaultHeight: 40 },
  { id: 'utility', label: 'Utility Room', category: 'utility', color: '#71717A', defaultWidth: 80, defaultHeight: 60 },
  { id: 'wc', label: 'WC', category: 'bathroom', color: '#FBBF24', defaultWidth: 60, defaultHeight: 60 },
  { id: 'office', label: 'Office', category: 'commercial', color: '#0EA5E9', defaultWidth: 140, defaultHeight: 120 },
  { id: 'reception', label: 'Reception', category: 'commercial', color: '#14B8A6', defaultWidth: 180, defaultHeight: 140 },
];

export function getRoomType(id: string): RoomType {
  return ROOM_TYPES.find(t => t.id === id) ?? ROOM_TYPES[0];
}

export const ROOM_CATEGORIES = [
  { id: 'living', label: 'Living Spaces' },
  { id: 'bedroom', label: 'Bedrooms' },
  { id: 'kitchen', label: 'Kitchen & Dining' },
  { id: 'bathroom', label: 'Wet Rooms' },
  { id: 'utility', label: 'Utility' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'commercial', label: 'Commercial' },
] as const;
