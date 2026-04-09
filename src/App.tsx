import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Printer, Sun, Moon, ClipboardCopy, Check, GripVertical, Key, List, LayoutGrid } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  MouseSensor,
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import styles from './App.module.css';
import GroceryItemComponent from './components/GroceryItem';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import AddItemForm from './components/AddItemForm';
import GroceryList from './components/GroceryList';
import ListView from './components/ListView';
import ShareImportModal from './components/ShareImportModal';
import ListSwitcher from './components/ListSwitcher';
import InstallPrompt from './components/InstallPrompt';
import { ShieldAlert, Zap, Loader2, Share2 } from 'lucide-react';
import { encodeList, decodeList } from './utils/sharing';
import { GroceryItem, GroceryList as GroceryListType, Category, Unit, QuickItem, DEFAULT_QUICK_ITEMS, DEFAULT_CATEGORIES, LIST_TEMPLATES } from './types';

// ─── Storage Keys ──────────────────────────────────────────────────────────────
const LISTS_KEY = 'grocery-lists-v2';
const ACTIVE_LIST_KEY = 'grocery-active-list';
const HISTORY_KEY = 'grocery-list-history';
const SUGGESTIONS_KEY = 'grocery-list-suggestions';
const THEME_KEY = 'grocery-list-theme';
const LOCKED_KEY = 'grocery-list-locked';

// Legacy key (used for migration)
const LEGACY_ITEMS_KEY = 'grocery-list-items';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const makeId = () =>
  crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

const makeList = (name: string, templateId?: string, items: GroceryItem[] = []): GroceryListType => {
  const template = templateId ? LIST_TEMPLATES.find(t => t.id === templateId) : LIST_TEMPLATES[0];
  const activeTemplate = template || LIST_TEMPLATES[0];
  return {
    id: makeId(),
    name,
    items,
    quickItems: [...activeTemplate.quickItems],
    categories: [...activeTemplate.categories], 
    categoryColors: { ...activeTemplate.categoryColors },
    templateId: activeTemplate.id,
    createdAt: Date.now(),
  };
};

/** Load lists from localStorage, migrating legacy single-list data if needed */
const loadLists = (): { lists: GroceryListType[]; activeId: string } => {
  // Try new format first
  const savedLists = localStorage.getItem(LISTS_KEY);
  const savedActiveId = localStorage.getItem(ACTIVE_LIST_KEY);

  if (savedLists) {
    try {
      let lists: GroceryListType[] = JSON.parse(savedLists);
      // Migration: Update Pasta's unit from g to st in user's saved lists
      lists = lists.map(l => l.quickItems ? {
        ...l,
        quickItems: l.quickItems.map(q => q.name === 'Pasta' && q.defaultUnit === 'g' ? { ...q, defaultUnit: 'st' as Unit } : q)
      } : l);

      if (lists.length > 0) {
        const activeId = savedActiveId && lists.find(l => l.id === savedActiveId)
          ? savedActiveId
          : lists[0].id;
        return { lists, activeId };
      }
    } catch (e) {
      console.error('Failed to parse lists', e);
    }
  }

  // Migration: load from old key
  const legacy = localStorage.getItem(LEGACY_ITEMS_KEY);
  let items: GroceryItem[] = [];
  if (legacy) {
    try { items = JSON.parse(legacy); } catch {}
  }

  const defaultList = makeList('Min lista', 'grocery', items);
  return { lists: [defaultList], activeId: defaultList.id };
};

// ─── App ───────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [lists, setLists] = useState<GroceryListType[]>(() => loadLists().lists);
  const [activeListId, setActiveListId] = useState<string>(() => loadLists().activeId);

  const [suggestions, setSuggestions] = useState<{name: string, category: Category}[]>(() => {
    const saved = localStorage.getItem(SUGGESTIONS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pwaStatus, setPwaStatus] = useState<'checking' | 'limited' | 'installing' | 'ready'>('checking');
  const [sharedItems, setSharedItems] = useState<GroceryItem[] | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem(LOCKED_KEY) === 'true';
  });
  const [viewMode, setViewMode] = useState<'category' | 'list'>('category');

  // ── Derived: currently active list's items ────────────────────────────────
  const activeList = lists.find(l => l.id === activeListId) ?? lists[0];
  const items = activeList?.items ?? [];
  const activeCategories = activeList?.categories ?? DEFAULT_CATEGORIES;
  const activeCategoryColors = activeList?.categoryColors ?? {};

  const completedCount = items.filter(i => i.isCompleted).length;
  const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);
  const hasHistory = !!localStorage.getItem(HISTORY_KEY);

  // ── Update items for the active list ─────────────────────────────────────
  const setItems = useCallback((updater: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => {
    setLists(prev => prev.map(l => {
      if (l.id !== activeListId) return l;
      const newItems = typeof updater === 'function' ? updater(l.items) : updater;
      return { ...l, items: newItems };
    }));
  }, [activeListId]);

  // ── Persist lists ─────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_LIST_KEY, activeListId);
  }, [activeListId]);

  useEffect(() => {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  }, [suggestions]);

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LOCKED_KEY, isLocked.toString());
  }, [isLocked]);

  // ── Sync suggestions from all items ──────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;
    setSuggestions(prev => {
      let changed = false;
      const next = [...prev];
      items.forEach(item => {
        const exists = next.some(s => s.name.toLowerCase() === item.name.toLowerCase());
        if (!exists) { next.push({ name: item.name, category: item.category }); changed = true; }
      });
      return changed ? next : prev;
    });
  }, [items]);

  // ── PWA service worker ────────────────────────────────────────────────────
  useEffect(() => {
    serviceWorkerRegistration.register({
      onRegistration: (reg) => {
        if (reg.active) setPwaStatus('ready');
        else setPwaStatus('installing');
      },
      onSuccess: () => setPwaStatus('ready'),
      onUpdate: () => setPwaStatus('ready'),
      onInsecure: () => setPwaStatus('limited'),
    });
  }, []);

  // ── Shared list from URL ──────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');
    if (sharedData) {
      const decoded = decodeList(sharedData);
      if (decoded.length > 0) {
        setSharedItems(decoded);
        // Delay clearing URL to ensure state update is processed
        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 100);
      }
    }
  }, []);

  // ── DnD sensors ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 10 },
    })
  );

  // ─── List Management ───────────────────────────────────────────────────────
  const handleCreateList = (name: string, templateId?: string) => {
    const newList = makeList(name, templateId);
    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
  };

  const handleRenameList = (id: string, name: string) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, name } : l));
  };

  const handleDeleteList = (id: string) => {
    setLists(prev => {
      const next = prev.filter(l => l.id !== id);
      if (next.length === 0) {
        const fallback = makeList('Min lista', 'grocery');
        setActiveListId(fallback.id);
        return [fallback];
      }
      if (id === activeListId) setActiveListId(next[0].id);
      return next;
    });
  };

  const handleSwitchList = (id: string) => {
    setActiveListId(id);
  };

  const handleUpdateQuickItems = (updatedItems: QuickItem[]) => {
    setLists(prev => prev.map(l =>
      l.id === activeListId ? { ...l, quickItems: updatedItems } : l
    ));
  };

  const handleAddCategory = (onReady?: (newName: string) => void) => {
    let createdName = '';
    setLists(prev => prev.map(l => {
      if (l.id !== activeListId) return l;
      const cats = l.categories || [...DEFAULT_CATEGORIES];
      let newName = 'Ny kategori 1';
      let count = 1;
      while (cats.includes(newName)) {
        count++;
        newName = `Ny kategori ${count}`;
      }
      createdName = newName;
      return { ...l, categories: [...cats, newName] };
    }));
    if (onReady && createdName) {
      setTimeout(() => onReady(createdName), 0);
    }
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;

    setLists(prev => prev.map(l => {
      if (l.id !== activeListId) return l;
      const cats = l.categories || [...DEFAULT_CATEGORIES];
      if (cats.includes(trimmed)) return l; // Prevent duplicate

      const updatedCats = cats.map(c => c === oldName ? trimmed : c);
      const updatedItems = l.items.map(i => i.category === oldName ? { ...i, category: trimmed } : i);
      const currentQuick = l.quickItems ?? [...DEFAULT_QUICK_ITEMS];
      const updatedQuick = currentQuick.map(q => q.category === oldName ? { ...q, category: trimmed } : q);

      const newColors = { ...(l.categoryColors || {}) };
      if (newColors[oldName]) {
        newColors[trimmed] = newColors[oldName];
        delete newColors[oldName];
      }

      return {
        ...l,
        categories: updatedCats,
        items: updatedItems,
        quickItems: updatedQuick,
        categoryColors: newColors
      };
    }));

    setSuggestions(prev => prev.map(s => s.category === oldName ? { ...s, category: trimmed } : s));

    const historyData = localStorage.getItem(HISTORY_KEY);
    if (historyData) {
      try {
        const historyItems: GroceryItem[] = JSON.parse(historyData);
        let updatedHistory = false;
        const nextHistory = historyItems.map(item => {
          if (item.category === oldName) {
            updatedHistory = true;
            return { ...item, category: trimmed };
          }
          return item;
        });
        if (updatedHistory) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
        }
      } catch (e) {}
    }
  };

  const handleUpdateCategoryColor = (categoryName: string, color: string) => {
    setLists(prev => prev.map(l => {
      if (l.id !== activeListId) return l;
      return {
        ...l,
        categoryColors: { ...(l.categoryColors || {}), [categoryName]: color }
      };
    }));
  };

  const handleDeleteCategory = (categoryName: string) => {
    setLists(prev => prev.map(l => {
      if (l.id !== activeListId) return l;
      const cats = l.categories || [...DEFAULT_CATEGORIES];
      if (cats.length <= 1) return l; // Can't delete last

      const currentQuick = l.quickItems ?? [...DEFAULT_QUICK_ITEMS];

      return {
        ...l,
        categories: cats.filter(c => c !== categoryName),
        items: l.items.filter(i => i.category !== categoryName),
        quickItems: currentQuick.filter(q => q.category !== categoryName)
      };
    }));

    setSuggestions(prev => prev.filter(s => s.category !== categoryName));

    const historyData = localStorage.getItem(HISTORY_KEY);
    if (historyData) {
      try {
        const historyItems: GroceryItem[] = JSON.parse(historyData);
        const filteredHistory = historyItems.filter(item => item.category !== categoryName);
        if (filteredHistory.length !== historyItems.length) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
        }
      } catch (e) {}
    }
  };

  // ─── Item Management ───────────────────────────────────────────────────────
  const handleAddItem = (name: string, category: Category, unit: Unit = 'st') => {
    setSuggestions(prev => {
      const idx = prev.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
      if (idx > -1) {
        if (prev[idx].category === category) return prev;
        const updated = [...prev];
        updated[idx] = { name, category };
        return updated;
      }
      return [...prev, { name, category }];
    });

    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
      if (existingIdx >= 0) {
        const next = [...prev];
        const existing = next[existingIdx];
        next[existingIdx] = { ...existing, quantity: (existing.quantity || 1) + 1 };
        return [next[existingIdx], ...next.filter((_, i) => i !== existingIdx)];
      }
      const newItem: GroceryItem = {
        id: makeId(),
        name,
        category,
        quantity: 1,
        unit,
        isCompleted: false,
        createdAt: Date.now(),
      };
      return [newItem, ...prev];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
          : item
      )
    );
  };

  const handleRenameItem = (id: string, newName: string) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, name: newName } : item)
    );
    // Update suggestion if it matches by old name
    const old = items.find(i => i.id === id);
    if (old) {
      setSuggestions(prev => prev.map(s =>
        s.name.toLowerCase() === old.name.toLowerCase()
          ? { ...s, name: newName }
          : s
      ));
    }
  };

  const handleToggleComplete = (id: string) => {
    setItems(prev => {
      const next = prev.map(item =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      );
      const toggled = prev.find(i => i.id === id);
      const becomingComplete = toggled && !toggled.isCompleted;
      if (becomingComplete && next.length > 0 && next.every(i => i.isCompleted)) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#74b3ce', '#81cda8', '#7dd3fc', '#ea8a82'],
        });
      }
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (items.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
      setItems([]);
    }
    setSuggestions([]);
    localStorage.removeItem(SUGGESTIONS_KEY);
  };

  const handleUncheckAll = () => {
    setItems(prev => prev.map(item => ({ ...item, isCompleted: false })));
  };

  const handleRestoreHistory = () => {
    const history = localStorage.getItem(HISTORY_KEY);
    if (history) {
      try {
        const parsed: GroceryItem[] = JSON.parse(history);
        setItems(parsed.map(item => ({ ...item, isCompleted: false })));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  };

  const handleToggleQuickAdd = (name: string, category: Category, unit?: Unit) => {
    const existing = items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing) handleDelete(existing.id);
    else handleAddItem(name, category, unit || 'st');
  };

  const handleCopyAsText = () => {
    if (items.length === 0) return;
    const date = new Date().toLocaleDateString('sv-SE');
    let text = `🛒 ${activeList.name} (${date})\n`;
    text += `-----------------------\n`;

    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<Category, GroceryItem[]>);

    const categoryNames: Record<Category, string> = {
      'Frukt & Grönt': '🍎 FRUKT & GRÖNT',
      'Mejeri': '🥛 MEJERI',
      'Kött': '🥩 KÖTT',
      'Bageri': '🍞 BAGERI',
      'Skafferi': '🥫 SKAFFERI',
      'Frysvaror': '❄️ FRYSVAROR',
      'Övrigt': '📦 ÖVRIGT',
    };

    (Object.entries(grouped) as [Category, GroceryItem[]][]).forEach(([cat, catItems]) => {
      text += `\n${categoryNames[cat] || cat.toUpperCase()}\n`;
      catItems.forEach(item => {
        const unitDisplay = item.unit && item.unit !== 'st' ? item.unit : '';
        const qty = item.quantity && (item.quantity > 1 || unitDisplay) ? ` (${item.quantity}${unitDisplay})` : '';
        const status = item.isCompleted ? '[x] ' : '- ';
        text += `${status}${item.name}${qty}\n`;
      });
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  const handleShareList = () => {
    if (items.length === 0) return;
    const encoded = encodeList(items);
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    });
  };

  const handleImportShared = (mode: 'merge' | 'replace') => {
    if (!sharedItems) return;
    setItems(prev => {
      if (mode === 'replace') return sharedItems;
      const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
      const newUnique = sharedItems.filter(i => !existingNames.has(i.name.toLowerCase()));
      return [...newUnique, ...prev];
    });
    setSharedItems(null);
  };

  // ─── DnD Handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeItemId = active.id as string;
    const overId = over.id as string;
    const activeItem = items.find(i => i.id === activeItemId);
    if (!activeItem) return;
    const overItem = items.find(i => i.id === overId);
    const overCategory = overItem ? overItem.category : (overId as Category);
    if (activeItem.category !== overCategory) {
      setItems(prev => {
        const activeIndex = prev.findIndex(i => i.id === activeItemId);
        const overIndex = overItem ? prev.findIndex(i => i.id === overId) : prev.length;
        const updatedItem = { ...activeItem, category: overCategory as Category };
        const next = [...prev];
        next.splice(activeIndex, 1);
        next.splice(overIndex >= activeIndex ? overIndex : overIndex, 0, updatedItem);
        return next;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeItemId = active.id as string;
    const overId = over.id as string;
    if (activeItemId !== overId) {
      setItems(prev => {
        const activeIndex = prev.findIndex(i => i.id === activeItemId);
        const overIndex = prev.findIndex(i => i.id === overId);
        const a = prev[activeIndex];
        const b = prev[overIndex];
        if (a && b && a.category === b.category) return arrayMove(prev, activeIndex, overIndex);
        return prev;
      });
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handlePrint = (cols: number) => {
    if (cols === 2) {
      document.body.classList.add('print-cols-2');
    }
    window.print();
    if (cols === 2) {
      setTimeout(() => document.body.classList.remove('print-cols-2'), 1000);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.logo}>
            <ShoppingBag size={32} color="var(--accent-primary)" />
            <h1>Mina Inköp</h1>
          </div>
          <div className={styles.actions}>
            <button 
              onClick={handleCopyAsText} 
              className={styles.headerButton} 
              title="Kopiera som text"
              aria-label="Kopiera som text"
            >
              {copyStatus === 'copied' ? <Check size={20} color="var(--accent-success)" /> : <ClipboardCopy size={20} />}
            </button>
            <button 
              onClick={() => setIsLocked(!isLocked)} 
              className={`${styles.headerButton} ${isLocked ? styles.locked : ''}`} 
              title={isLocked ? 'Lås upp lista (Redigeringsläge)' : 'Lås lista (Shoppingläge)'}
              aria-label={isLocked ? 'Lås upp lista' : 'Lås lista'}
            >
              <Key size={20} className={isLocked ? styles.lockedIcon : ''} />
            </button>
            <button 
              onClick={() => setViewMode(prev => prev === 'category' ? 'list' : 'category')} 
              className={styles.headerButton} 
              title={viewMode === 'category' ? 'Växla till tabellvy' : 'Växla till kategorivy'}
              aria-label="Växla vy"
            >
              {viewMode === 'category' ? <List size={20} /> : <LayoutGrid size={20} />}
            </button>
            <button 
              onClick={toggleTheme} 
              className={styles.headerButton} 
              title={theme === 'light' ? 'Växla till mörkt läge' : 'Växla till ljust läge'}
              aria-label="Växla tema"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className={`${styles.pwaBadge} ${styles[pwaStatus]}`} title={
              pwaStatus === 'ready' ? 'Appen är redo för offline-bruk' :
              pwaStatus === 'limited' ? 'Begränsad: HTTPS krävs för offline-läge' :
              pwaStatus === 'installing' ? 'Förbereder offline-läge...' :
              'Kontrollerar systemet...'
            }>
               {pwaStatus === 'ready' && <Zap size={14} fill="currentColor" />}
               {pwaStatus === 'limited' && <ShieldAlert size={14} />}
               {pwaStatus === 'installing' && <Loader2 size={14} className={styles.spin} />}
               <span>
                 {pwaStatus === 'ready' ? 'Offline' : 
                  pwaStatus === 'limited' ? 'Begränsad' : 
                  pwaStatus === 'installing' ? 'Laddar...' : ''}
               </span>
            </div>
            <button 
              onClick={() => handlePrint(1)} 
              className={styles.headerButton} 
              title="Skriv ut (1 kolumn)"
              aria-label="Skriv ut 1 kolumn"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={() => handlePrint(2)} 
              className={styles.headerButton} 
              title="Skriv ut (2 kolumner)"
              aria-label="Skriv ut 2 kolumner"
            >
              <div style={{ position: 'relative' }}>
                <Printer size={20} />
                <span style={{ 
                  position: 'absolute', 
                  top: -6, 
                  right: -6, 
                  fontSize: '10px', 
                  fontWeight: 'bold',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>2</span>
              </div>
            </button>
            <button 
              onClick={handleShareList} 
              className={`${styles.headerButton} ${shareStatus === 'copied' ? styles.success : ''}`} 
              title="Dela lista (kopierar länk)"
              aria-label="Dela lista"
            >
              {shareStatus === 'copied' ? <Check size={20} color="var(--accent-success)" /> : <Share2 size={20} />}
            </button>
          </div>
        </div>
        <p>Din vackra och enkla inköpslista</p>
      </header>

      <ShareImportModal 
        isOpen={!!sharedItems} 
        onClose={() => setSharedItems(null)} 
        sharedItems={sharedItems || []} 
        onImport={handleImportShared}
      />

      <main className={styles.mainContent}>
        {/* List switcher */}
        <ListSwitcher
          lists={lists}
          activeListId={activeListId}
          onSwitch={handleSwitchList}
          onCreate={handleCreateList}
          onRename={handleRenameList}
          onDelete={handleDeleteList}
          isLocked={isLocked}
        />

        {!isLocked && (
          <AddItemForm 
            onAdd={handleAddItem} 
            items={items}
            categories={activeCategories}
            onToggleQuickAdd={handleToggleQuickAdd}
            suggestions={suggestions}
            quickItems={activeList?.quickItems ?? DEFAULT_QUICK_ITEMS}
            onUpdateQuickItems={handleUpdateQuickItems}
          />
        )}

        {items.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statsLeft}>
              <span>{completedCount} av {items.length} avklarade</span>
              <div className={styles.progressBarBg}>
                <motion.div 
                  className={styles.progressBarFill} 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            {!isLocked && (
              <div className={styles.actionButtons}>
                <button 
                  className={styles.clearAllBtn}
                  onClick={() => {
                    if (window.confirm('Är du säker på att du vill rensa hela listan?')) {
                      handleClearAll();
                    }
                  }}
                >
                  Rensa alla
                </button>
                <button 
                  className={styles.uncheckAllBtn}
                  onClick={handleUncheckAll}
                  disabled={completedCount === 0}
                >
                  Avbocka allt
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'category' ? (
          <DndContext
            sensors={isLocked ? [] : sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <GroceryList 
              items={items} 
              categories={activeCategories}
              categoryColors={activeCategoryColors}
              onToggleComplete={handleToggleComplete} 
              onDelete={handleDelete} 
              onUpdateQuantity={handleUpdateQuantity}
              onRename={handleRenameItem}
              onRenameCategory={handleRenameCategory}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdateCategoryColor={handleUpdateCategoryColor}
              onRestoreHistory={handleRestoreHistory}
              hasHistory={hasHistory}
              isLocked={isLocked}
            />
            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.4' } },
              }),
            }}>
              {activeId ? (
                <div className={styles.dragOverlayItem}>
                  <GroceryItemComponent
                    item={items.find(i => i.id === activeId)!}
                    onToggle={() => {}}
                    onDelete={() => {}}
                    onUpdateQuantity={() => {}}
                    isDraggingPreview
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <ListView 
            items={items}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onRename={handleRenameItem}
            onUpdateQuantity={handleUpdateQuantity}
            isLocked={isLocked}
          />
        )}
      </main>

      {/* Mobile-only PWA install prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;
