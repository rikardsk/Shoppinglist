import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, ChevronUp, Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import GroceryItem from './GroceryItem';
import { GroceryItem as GroceryItemType } from '../types';
import styles from './GroceryList.module.css';
import emptyStateImg from '../assets/empty-state.png';

interface GroceryListProps {
  items: GroceryItemType[];
  categories: string[];
  categoryColors: Record<string, string>;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRename: (id: string, newName: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onAddCategory: (onReady?: (newName: string) => void) => void;
  onDeleteCategory: (name: string) => void;
  onUpdateCategoryColor: (category: string, color: string) => void;
  onRestoreHistory: () => void;
  hasHistory: boolean;
  isLocked?: boolean;
}

const getCategoryEmoji = (cat: string) => {
  switch (cat) {
    case 'Frukt & Grönt': return '🍎';
    case 'Mejeri': return '🥛';
    case 'Kött': return '🥩';
    case 'Bageri': return '🥐';
    case 'Skafferi': return '🥫';
    case 'Frysvaror': return '❄️';
    case 'Övrigt': return '🛍️';
    default: return '🏷️';
  }
};

const AVAILABLE_COLORS = [
  { id: 'white', bg: '#ffffff' },
  { id: 'green', bg: '#58a77f' },
  { id: 'blue', bg: '#5d9ab4' },
  { id: 'red', bg: '#cf6760' },
  { id: 'orange', bg: '#c48744' },
  { id: 'yellow', bg: '#b0913c' },
  { id: 'cyan', bg: '#439ac2' },
  { id: 'purple', bg: '#8e73c9' },
];

const GroceryList: React.FC<GroceryListProps> = ({ 
  items, categories, categoryColors, onToggleComplete, onDelete, onUpdateQuantity, onRename, onRenameCategory, onAddCategory, onDeleteCategory, onUpdateCategoryColor, onRestoreHistory, hasHistory, isLocked 
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const editInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingCategory) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingCategory]);

  const commitCategoryEdit = () => {
    if (editingCategory && editCategoryValue.trim()) {
      onRenameCategory(editingCategory, editCategoryValue.trim());
    }
    setEditingCategory(null);
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      if (a.category !== b.category) return a.category.localeCompare(b.category, 'sv');
      return 0; // Maintain manual order within category/completion groups
    });
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItemType[]> = {};
    categories.forEach(c => groups[c] = []); // ensure order and existence
    sortedItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [sortedItems, categories]);



  const completedCount = items.filter(i => i.isCompleted).length;
  const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

  return (
    <div className={styles.listContainer}>
      {items.length === 0 && (
        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.img
            src={emptyStateImg}
            alt="Din lista är tom"
            className={styles.emptyImage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
          />
          <h3>Listan är tom!</h3>
          <p>Lägg till dina varor ovan för att komma igång. 🛒</p>
          
          {hasHistory && (
            <button onClick={onRestoreHistory} className={styles.restoreBtn}>
              Återställ senaste listan
            </button>
          )}
        </motion.div>
      )}

      
      <div className={styles.itemsWrapper}>
        <AnimatePresence mode='popLayout'>
          {Object.entries(groupedItems).map(([cat, catItems]) => {
             // Hide empty categories unless we are currently actively editing this exact category
             if (catItems.length === 0 && editingCategory !== cat) return null;
             
             const isCollapsed = collapsedCategories.has(cat);
             const isFullyCompleted = catItems.length > 0 && catItems.every(i => i.isCompleted);
             return (
               <motion.div 
                 key={cat} 
                 layout 
                 initial={{opacity: 0, y: 10}} 
                 animate={{opacity: 1, y: 0}} 
                 exit={{opacity: 0, y: -10}} 
                 className={styles.categorySection}
               >
                 <div className={styles.categoryHeaderWrapper}>
                   {editingCategory === cat ? (
                     <div className={styles.categoryEditRow}>
                       <div className={styles.categoryEditInputWrapper}>
                         <input
                           ref={editInputRef}
                           className={styles.categoryEditInput}
                           value={editCategoryValue}
                           onChange={(e) => setEditCategoryValue(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') commitCategoryEdit();
                             if (e.key === 'Escape') setEditingCategory(null);
                           }}
                         />
                         <button className={styles.catActionBtn} onClick={(e) => { e.preventDefault(); commitCategoryEdit(); }}><Check size={16}/></button>
                         <button className={styles.catActionBtn} onClick={(e) => { e.preventDefault(); setEditingCategory(null); }}><X size={16}/></button>
                       </div>
                       <div className={styles.colorPalette}>
                         {AVAILABLE_COLORS.map(color => (
                           <button
                             key={color.id}
                             className={`${styles.colorDot} ${(categoryColors[cat] || 'white') === color.id ? styles.colorDotActive : ''}`}
                             style={{ backgroundColor: color.bg }}
                             onClick={() => onUpdateCategoryColor(cat, color.id)}
                             aria-label={`Välj färg ${color.id}`}
                           />
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className={styles.categoryHeaderInner} onClick={() => toggleCategory(cat)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleCategory(cat)}>
                       <div className={styles.categoryHeaderBtn}>
                          <div className={styles.catTitleWrapper}>
                            <span className={`${styles.catTitle} ${isFullyCompleted ? styles.completedCategory : ''}`}>
                              {getCategoryEmoji(cat)} {cat} <span className={styles.categoryCount}>({catItems.filter(i => i.isCompleted).length}/{catItems.length})</span>
                            </span>
                            {!isLocked && (
                              <div className={styles.categoryActions}>
                                <button className={styles.catActionBtn} onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setEditCategoryValue(cat); }}><Pencil size={14}/></button>
                                {categories.length > 1 && (
                                  <button 
                                    className={styles.catActionBtn} 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const itemCount = catItems.length;
                                      const msg = itemCount > 0 
                                        ? `Ta bort kategorin "${cat}"? Den innehåller ${itemCount} varor som också kommer att raderas.`
                                        : `Ta bort kategorin "${cat}"?`;
                                      if (window.confirm(msg)) {
                                        onDeleteCategory(cat); 
                                      }
                                    }}
                                  >
                                    <Trash2 size={14} className={styles.dangerIcon} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                       </div>
                     </div>
                   )}
                 </div>
                 <AnimatePresence>
                   {!isCollapsed && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className={styles.categoryItems}
                     >
                       <SortableContext 
                          id={cat}
                          items={catItems.map(i => i.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {catItems.map(item => (
                            <GroceryItem 
                              key={item.id} 
                              item={item} 
                              colorId={categoryColors[item.category]}
                              onToggle={onToggleComplete} 
                              onDelete={onDelete} 
                              onUpdateQuantity={onUpdateQuantity}
                              onRename={onRename}
                              isLocked={isLocked}
                            />
                          ))}
                        </SortableContext>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </motion.div>
             );
          })}
        </AnimatePresence>
        
        {!isLocked && (
          <div className={styles.addCategoryWrapper}>
            <button className={styles.addCategoryBtn} onClick={() => {
              onAddCategory((newName) => {
                setEditingCategory(newName);
                setEditCategoryValue(newName);
              });
            }}>
              <Plus size={16} /> Lägg till ny kategori
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryList;
