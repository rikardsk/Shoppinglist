import { GroceryItem, Category, Unit } from '../types';

const CATEGORY_MAP: Record<Category, number> = {
  'Frukt & Grönt': 0,
  'Mejeri': 1,
  'Kött': 2,
  'Bageri': 3,
  'Skafferi': 4,
  'Frysvaror': 5,
  'Övrigt': 6,
};

const REVERSE_CATEGORY_MAP: Record<number, Category> = {
  0: 'Frukt & Grönt',
  1: 'Mejeri',
  2: 'Kött',
  3: 'Bageri',
  4: 'Skafferi',
  5: 'Frysvaror',
  6: 'Övrigt',
};

const UNIT_MAP: Record<Unit, number> = {
  'st': 0,
  'kg': 1,
  'g': 2,
  'l': 3,
  'dl': 4,
  'frp': 5,
};

const REVERSE_UNIT_MAP: Record<number, Unit> = {
  0: 'st',
  1: 'kg',
  2: 'g',
  3: 'l',
  4: 'dl',
  5: 'frp',
};

// Simplified item for sharing to keep URL short
type SharedItem = [string, number, number, number, number]; // [name, catIdx, qty, isCompleted, unitIdx]

export const encodeList = (items: GroceryItem[]): string => {
  const sharedData: SharedItem[] = items.map(item => [
    item.name,
    CATEGORY_MAP[item.category] ?? 6,
    item.quantity || 1,
    item.isCompleted ? 1 : 0,
    UNIT_MAP[item.unit || 'st'] ?? 0
  ]);

  const jsonStr = JSON.stringify(sharedData);
  // Base64 with UTF-8 support for Swedish characters
  const uint8 = new TextEncoder().encode(jsonStr);
  let binString = "";
  for (let i = 0; i < uint8.length; i++) {
    binString += String.fromCharCode(uint8[i]);
  }
  const encoded = btoa(binString);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // URL safe base64
};

export const decodeList = (encoded: string): GroceryItem[] => {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binString = atob(base64);
    const uint8 = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
      uint8[i] = binString.charCodeAt(i);
    }
    
    const jsonStr = new TextDecoder().decode(uint8);
    
    const sharedData: SharedItem[] = JSON.parse(jsonStr);
    
    return sharedData.map(data => ({
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2),
      name: data[0],
      category: REVERSE_CATEGORY_MAP[data[1]] || 'Övrigt',
      quantity: data[2],
      isCompleted: data[3] === 1,
      unit: REVERSE_UNIT_MAP[data[4]] || 'st',
      createdAt: Date.now()
    }));
  } catch (error) {
    console.error('Failed to decode shared list:', error);
    return [];
  }
};
