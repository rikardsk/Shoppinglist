export type Category = string;

export const DEFAULT_CATEGORIES: Category[] = ['Frukt & Grönt', 'Mejeri', 'Kött', 'Bageri', 'Skafferi', 'Frysvaror', 'Övrigt'];

export type Unit = 'st' | 'kg' | 'g' | 'l' | 'dl' | 'frp';

export interface GroceryItem {
  id: string;
  name: string;
  category: Category;
  quantity?: number;
  unit?: Unit;
  isCompleted: boolean;
  createdAt: number;
}

export interface QuickItem {
  name: string;
  category: Category;
  icon: string; // emoji string, or '' for no icon
  defaultUnit?: Unit;
}

export const DEFAULT_QUICK_ITEMS: QuickItem[] = [
  { name: 'Mjölk',   category: 'Mejeri',       icon: '🥛', defaultUnit: 'l'   },
  { name: 'Bröd',    category: 'Bageri',        icon: '🍞', defaultUnit: 'st'  },
  { name: 'Ägg',     category: 'Mejeri',        icon: '🥚', defaultUnit: 'st'  },
  { name: 'Kaffe',   category: 'Skafferi',      icon: '☕', defaultUnit: 'frp' },
  { name: 'Bananer', category: 'Frukt & Grönt', icon: '🍌', defaultUnit: 'st'  },
  { name: 'Smör',    category: 'Mejeri',        icon: '🧈', defaultUnit: 'st'  },
  { name: 'Grädde',  category: 'Mejeri',        icon: '🥛', defaultUnit: 'dl'  },
  { name: 'Mjöl',    category: 'Skafferi',      icon: '🌾', defaultUnit: 'kg'  },
  { name: 'Pasta',   category: 'Skafferi',      icon: '🍝', defaultUnit: 'st'  },
];

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  quickItems?: QuickItem[]; // per-list shortcuts; undefined = use DEFAULT_QUICK_ITEMS
  categories?: string[]; // user-customized category names for this list
  categoryColors?: Record<string, string>; // Maps category name -> color string
  templateId?: string; // which template was used to create this list
  createdAt: number;
}

export interface ListTemplate {
  id: string;
  name: string;
  icon: string;
  themeColor: string;
  categories: Category[];
  categoryColors: Record<string, string>;
  quickItems: QuickItem[];
}

export const LIST_TEMPLATES: ListTemplate[] = [
  {
    id: 'grocery',
    name: 'Matlista',
    icon: '🛒',
    themeColor: 'var(--accent-primary)',
    categories: DEFAULT_CATEGORIES,
    categoryColors: { 'Frukt & Grönt': 'green', 'Mejeri': 'blue', 'Kött': 'red', 'Bageri': 'orange', 'Skafferi': 'yellow', 'Frysvaror': 'cyan', 'Övrigt': 'purple' },
    quickItems: DEFAULT_QUICK_ITEMS,
  },
  {
    id: 'systembolaget',
    name: 'Systembolaget',
    icon: '🍾',
    themeColor: '#2E8B57', // SeaGreen
    categories: ['Vin', 'Öl', 'Cider', 'Sprit', 'Alkoholfritt', 'Snacks', 'Övrigt'],
    categoryColors: { 'Vin': 'red', 'Öl': 'yellow', 'Cider': 'orange', 'Sprit': 'purple', 'Alkoholfritt': 'green', 'Snacks': 'cyan' },
    quickItems: [
      { name: 'Ljus lager', category: 'Öl', icon: '🍺', defaultUnit: 'st' },
      { name: 'Rödvin', category: 'Vin', icon: '🍷', defaultUnit: 'st' },
      { name: 'Vitt vin', category: 'Vin', icon: '🥂', defaultUnit: 'st' },
      { name: 'Chips', category: 'Snacks', icon: '🥔', defaultUnit: 'st' },
    ],
  },
  {
    id: 'apotek',
    name: 'Apoteket',
    icon: '💊',
    themeColor: '#D64550', // Apotek heart red/pink
    categories: ['Värk & Feber', 'Förkylning', 'Mage', 'Hudvård', 'Sårvård', 'Övrigt'],
    categoryColors: { 'Värk & Feber': 'red', 'Förkylning': 'cyan', 'Mage': 'yellow', 'Hudvård': 'orange', 'Sårvård': 'green' },
    quickItems: [
      { name: 'Alvedon', category: 'Värk & Feber', icon: '💊', defaultUnit: 'st' },
      { name: 'Ipren', category: 'Värk & Feber', icon: '💊', defaultUnit: 'st' },
      { name: 'Nässpray', category: 'Förkylning', icon: '👃', defaultUnit: 'st' },
      { name: 'Plåster', category: 'Sårvård', icon: '🩹', defaultUnit: 'st' },
      { name: 'Tandkräm', category: 'Hudvård', icon: '🪥', defaultUnit: 'st' },
      { name: 'Plackers', category: 'Hudvård', icon: '🦷', defaultUnit: 'st' },
      { name: 'Tuggummi', category: 'Mage', icon: '🍬', defaultUnit: 'st' },
      { name: 'Munskölj', category: 'Hudvård', icon: '🧪', defaultUnit: 'st' },
      { name: 'D-vitamin', category: 'Värk & Feber', icon: '☀️', defaultUnit: 'st' },
      { name: 'Omega-3', category: 'Värk & Feber', icon: '🐟', defaultUnit: 'st' },
    ],
  },
  {
    id: 'todo',
    name: 'Att göra',
    icon: '✅',
    themeColor: '#9C27B0', // Purple
    categories: ['Hemma', 'Jobbet', 'Trädgård', 'Ärenden', 'Övrigt'],
    categoryColors: { 'Hemma': 'blue', 'Jobbet': 'purple', 'Trädgård': 'green', 'Ärenden': 'orange' },
    quickItems: [
      { name: 'Städa', category: 'Hemma', icon: '🧹', defaultUnit: 'st' },
      { name: 'Tvätta', category: 'Hemma', icon: '🧺', defaultUnit: 'st' },
      { name: 'Handla', category: 'Ärenden', icon: '🛍️', defaultUnit: 'st' },
      { name: 'Klippa gräset', category: 'Trädgård', icon: '🌱', defaultUnit: 'st' },
    ],
  }
];
