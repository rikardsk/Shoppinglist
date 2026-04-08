import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Clock, Settings, X, Check } from 'lucide-react';
import styles from './AddItemForm.module.css';
import { Category, GroceryItem, QuickItem, DEFAULT_QUICK_ITEMS } from '../types';
import { Unit } from '../types';

interface AddItemFormProps {
  onAdd: (name: string, category: Category, unit: Unit) => void;
  items: GroceryItem[];
  onToggleQuickAdd: (name: string, category: Category, unit?: Unit) => void;
  categories: string[];
  suggestions: { name: string; category: Category }[];
  quickItems: QuickItem[];
  onUpdateQuickItems: (items: QuickItem[]) => void;
}


const UNITS: Unit[] = ['st', 'kg', 'g', 'l', 'dl', 'frp'];

const EMOJI_OPTIONS = [
  '🍎','🍊','🍋','🍇','🍓','🥝','🍑','🥭','🍌','🫐','🍒',
  '🥦','🥕','🧅','🧄','🍅','🥬','🌽','🥒','🫑','🥑','🥔',
  '🥚','🥛','🧀','🧈','🍦','🫙',
  '🥩','🍗','🥓','🐟','🦐',
  '🍞','🥐','🥖','🧇','🥞',
  '🍝','🍚','🌾','🥫','🧆','🍲',
  '☕','🍵','🧃','🧉','🍺','🥤',
  '🧴','🧹','🧻','🪥','🫧','🧼',
];

const NO_EMOJI = '';

const AddItemForm: React.FC<AddItemFormProps> = ({
  onAdd, items, onToggleQuickAdd, suggestions, quickItems, onUpdateQuickItems, categories
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(categories[0] || 'Övrigt');
  const [unit, setUnit] = useState<Unit>('st');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const emojiGridRef = useRef<HTMLDivElement>(null);



  // Edit-mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddQuick, setShowAddQuick] = useState(false);
  const [newQuickName, setNewQuickName] = useState('');
  const [newQuickCategory, setNewQuickCategory] = useState<Category>('Övrigt');
  const [newQuickIcon, setNewQuickIcon] = useState<string>(NO_EMOJI);
  const [newQuickUnit, setNewQuickUnit] = useState<Unit>('st');
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  const newQuickNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddQuick) newQuickNameRef.current?.focus();
  }, [showAddQuick]);

  // Mouse-wheel → horizontal scroll on desktop
  useEffect(() => {
    const el = chipsScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Close emoji grid on outside click
  useEffect(() => {
    if (!showEmojiGrid) return;
    const handle = (e: MouseEvent) => {
      if (emojiGridRef.current && !emojiGridRef.current.contains(e.target as Node)) {
        setShowEmojiGrid(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showEmojiGrid]);

  const allSuggestions = useMemo(() => {
    const map = new Map<string, { name: string; category: Category; defaultUnit?: Unit; icon?: string }>();
    quickItems.forEach(item => {
      map.set(item.name.toLowerCase(), {
        name: item.name,
        category: item.category,
        defaultUnit: item.defaultUnit,
        icon: item.icon || undefined,
      });
    });
    suggestions.forEach(s => {
      map.set(s.name.toLowerCase(), { name: s.name, category: s.category });
    });
    return Array.from(map.values());
  }, [suggestions, quickItems]);

  const filteredSuggestions = useMemo(() => {
    const search = name.toLowerCase().trim();
    if (!search) return [];
    return allSuggestions.filter(s => s.name.toLowerCase().startsWith(search)).slice(0, 5);
  }, [allSuggestions, name]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) return;
    const match =
      suggestions.find(s => s.name.toLowerCase() === normalizedName) ||
      quickItems.find(s => s.name.toLowerCase() === normalizedName);
    if (match) {
      setCategory(match.category);
      if ('defaultUnit' in match && match.defaultUnit) setUnit(match.defaultUnit as Unit);
    }
  }, [name, suggestions, quickItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), category, unit);
    setName('');
    setUnit('st');
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion: { name: string; category: Category; defaultUnit?: Unit }) => {
    onAdd(suggestion.name, suggestion.category, suggestion.defaultUnit || 'st');
    setName('');
    setUnit('st');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter' && highlightedIndex > -1) {
      e.preventDefault();
      handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  // ── Quick item management ──────────────────────────────────────────────────
  const handleRemoveQuickItem = (itemName: string) => {
    onUpdateQuickItems(quickItems.filter(i => i.name !== itemName));
  };

  const handleAddQuickItem = () => {
    const trimmed = newQuickName.trim();
    if (!trimmed) return;
    onUpdateQuickItems([...quickItems, {
      name: trimmed,
      category: newQuickCategory,
      icon: newQuickIcon,
      defaultUnit: newQuickUnit,
    }]);
    setNewQuickName('');
    setNewQuickIcon(NO_EMOJI);
    setNewQuickCategory('Övrigt');
    setNewQuickUnit('st');
    setShowAddQuick(false);
    setShowEmojiGrid(false);
  };

  const handleCancelAddQuick = () => {
    setShowAddQuick(false);
    setNewQuickName('');
    setNewQuickIcon(NO_EMOJI);
    setShowEmojiGrid(false);
  };

  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);
    setShowAddQuick(false);
    setShowEmojiGrid(false);
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => name.trim().length > 0 && setShowSuggestions(true)}
            placeholder="Vad behöver du?"
            className={styles.textInput}
            autoComplete="off"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className={styles.suggestionsDropdown} ref={suggestionsRef}>
              {filteredSuggestions.map((s, idx) => (
                <div
                  key={s.name}
                  className={`${styles.suggestionItem} ${highlightedIndex === idx ? styles.suggestionItemActive : ''}`}
                  onClick={() => handleSelectSuggestion(s)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <Clock size={14} className={styles.suggestionIcon} />
                  <span className={styles.suggestionName}>{s.name}</span>
                  <span className={styles.suggestionCat}>{s.category}</span>
                </div>
              ))}
            </div>
          )}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={styles.selectInput}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!name.trim()}
            className={styles.submitButton}
            aria-label="Lägg till"
          >
            <Plus size={24} />
            <span className={styles.buttonText}>Lägg till</span>
          </button>
        </div>

        <div className={styles.unitContainer}>
          {UNITS.map(u => (
            <button
              key={u}
              type="button"
              className={`${styles.unitChip} ${unit === u ? styles.unitChipActive : ''}`}
              onClick={() => setUnit(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </form>

      {/* ── Quick-add section ─────────────────────────────────────────────── */}
      <div className={styles.quickAddSection}>
        <div className={styles.quickAddHeader}>
          <span className={styles.quickAddLabel}>Vanliga varor:</span>
          <button
            type="button"
            className={`${styles.editModeBtn} ${isEditMode ? styles.editModeBtnActive : ''}`}
            onClick={toggleEditMode}
            aria-label={isEditMode ? 'Klar med redigering' : 'Redigera genvägar'}
          >
            {isEditMode ? <Check size={15} /> : <Settings size={15} />}
            <span>{isEditMode ? 'Klar' : 'Ändra'}</span>
          </button>
        </div>

        {/* Scrollable chips row — chips are inline so no overflow-clipping on badges */}
        <div className={styles.chipsScroll} ref={chipsScrollRef}>
          {quickItems.map((item) => {
            const isActive = items.some(i => i.name.toLowerCase() === item.name.toLowerCase());
            return (
              <button
                key={item.name}
                type="button"
                onClick={(e) => {
                  if (isEditMode) {
                    e.preventDefault();
                    handleRemoveQuickItem(item.name);
                  } else {
                    onToggleQuickAdd(item.name, item.category, item.defaultUnit);
                  }
                }}
                className={`${styles.chip} ${isActive && !isEditMode ? styles.chipActive : ''} ${isEditMode ? styles.chipEditing : ''}`}
                title={isEditMode ? `Ta bort ${item.name}` : (isActive ? 'Klicka för att ta bort' : 'Klicka för att lägga till')}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.name}
                {isEditMode && (
                  <span className={styles.removeInline} aria-hidden="true">
                    <X size={11} />
                  </span>
                )}
              </button>
            );
          })}

          {isEditMode && !showAddQuick && (
            <button
              type="button"
              className={`${styles.chip} ${styles.addQuickChip}`}
              onClick={() => setShowAddQuick(true)}
            >
              <Plus size={14} />
              Ny genväg
            </button>
          )}
        </div>

        {/* Inline add form */}
        {isEditMode && showAddQuick && (
          <div className={styles.addQuickForm}>
            <div className={styles.addQuickRow}>
              {/* Emoji picker */}
              <div className={styles.emojiPickerWrapper} ref={emojiGridRef}>
                <button
                  type="button"
                  className={styles.emojiDisplay}
                  onClick={() => setShowEmojiGrid(v => !v)}
                  aria-label="Välj emoji"
                >
                  {newQuickIcon || <span className={styles.noEmojiLabel}>–</span>}
                </button>
                {showEmojiGrid && (
                  <div className={styles.emojiGrid}>
                    {/* "No emoji" option first */}
                    <button
                      type="button"
                      className={`${styles.emojiBtn} ${newQuickIcon === NO_EMOJI ? styles.emojiBtnActive : ''}`}
                      onClick={() => { setNewQuickIcon(NO_EMOJI); setShowEmojiGrid(false); }}
                      title="Ingen emoji"
                    >
                      <span className={styles.noEmojiLabel}>–</span>
                    </button>
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className={`${styles.emojiBtn} ${newQuickIcon === emoji ? styles.emojiBtnActive : ''}`}
                        onClick={() => { setNewQuickIcon(emoji); setShowEmojiGrid(false); }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                ref={newQuickNameRef}
                type="text"
                placeholder="Namn..."
                className={styles.addQuickInput}
                value={newQuickName}
                onChange={e => setNewQuickName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddQuickItem(); }
                  if (e.key === 'Escape') handleCancelAddQuick();
                }}
                maxLength={30}
              />

              <select
                className={styles.addQuickSelect}
                value={newQuickCategory}
                onChange={e => setNewQuickCategory(e.target.value as Category)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                className={styles.addQuickSelect}
                value={newQuickUnit}
                onChange={e => setNewQuickUnit(e.target.value as Unit)}
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className={styles.addQuickActions}>
              <button
                type="button"
                className={styles.addQuickConfirm}
                onClick={handleAddQuickItem}
                disabled={!newQuickName.trim()}
              >
                <Check size={15} /> Lägg till genväg
              </button>
              <button
                type="button"
                className={styles.addQuickCancel}
                onClick={handleCancelAddQuick}
              >
                <X size={15} /> Avbryt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddItemForm;
