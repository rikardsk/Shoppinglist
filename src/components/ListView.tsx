import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroceryItem } from '../types';
import styles from './ListView.module.css';

interface ListViewProps {
  items: GroceryItem[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  isLocked?: boolean;
}

type SortField = 'name' | 'category' | 'isCompleted';

const ListView: React.FC<ListViewProps> = ({
  items,
  onToggleComplete,
  onDelete,
  onRename,
  onUpdateQuantity,
  isLocked
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let valA: any = a[sortField as keyof GroceryItem];
      let valB: any = b[sortField as keyof GroceryItem];

      if (typeof valA === 'string') {
        const compare = valA.localeCompare(valB, 'sv');
        return sortDir === 'asc' ? compare : -compare;
      }
      
      if (valA === valB) return 0;
      const compare = valA < valB ? -1 : 1;
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [items, sortField, sortDir]);

  const startEdit = (item: GroceryItem) => {
    if (item.isCompleted) return;
    setEditValue(item.name);
    setEditingId(item.id);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className={styles.sortIconInactive} />;
    return sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkCol}></th>
            <th onClick={() => toggleSort('name')} className={styles.sortableHeader}>
              Namn {getSortIcon('name')}
            </th>
            <th onClick={() => toggleSort('category')} className={`${styles.sortableHeader} ${styles.categoryHeader}`}>
              Kategori {getSortIcon('category')}
            </th>
            <th className={styles.qtyCol}>Antal</th>
            {!isLocked && <th className={styles.actionCol}>Val</th>}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode='popLayout'>
            {sortedItems.map((item) => (
              <motion.tr 
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${styles.row} ${item.isCompleted ? styles.completed : ''}`}
              >
                <td className={styles.checkCell}>
                  <button 
                    className={`${styles.checkbox} ${item.isCompleted ? styles.checked : ''}`}
                    onClick={() => onToggleComplete(item.id)}
                  />
                </td>
                <td className={styles.nameCell}>
                   {editingId === item.id ? (
                     <input
                       ref={editInputRef}
                       className={styles.editInput}
                       value={editValue}
                       onChange={(e) => setEditValue(e.target.value)}
                       onBlur={commitEdit}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') commitEdit();
                         if (e.key === 'Escape') cancelEdit();
                       }}
                     />
                   ) : (
                     <span className={styles.itemName} onClick={() => !isLocked && startEdit(item)}>{item.name}</span>
                   )}
                </td>
                <td className={styles.categoryCell}>
                  <span className={styles.categoryBadge}>{item.category}</span>
                </td>
                <td className={styles.qtyCell}>
                  <div className={styles.qtyControls}>
                    {!isLocked && (
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className={styles.qtyBtn}>-</button>
                    )}
                    <span>{item.quantity || 1} {item.unit || 'st'}</span>
                    {!isLocked && (
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className={styles.qtyBtn}>+</button>
                    )}
                  </div>
                </td>
                {!isLocked && (
                  <td className={styles.actionCell}>
                    <div className={styles.rowActions}>
                      <motion.button 
                        onTap={() => startEdit(item)} 
                        className={styles.rowActionBtn}
                        aria-label="Redigera"
                      >
                        <Pencil size={16} />
                      </motion.button>
                      <motion.button 
                        onTap={() => onDelete(item.id)} 
                        className={`${styles.rowActionBtn} ${styles.deleteBtn}`}
                        aria-label="Ta bort"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      
      {items.length === 0 && (
        <div className={styles.empty}>Här var det tomt! Lägg till något i listan.</div>
      )}
    </div>
  );
};

export default ListView;
