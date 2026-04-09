import { Trash2, Check, Plus, Minus, GripVertical, Pencil, X } from 'lucide-react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useRef, useEffect } from 'react';
import styles from './GroceryItem.module.css';
import { GroceryItem as GroceryItemType } from '../types';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRename?: (id: string, newName: string) => void;
  isDraggingPreview?: boolean;
  colorId?: string;
  isLocked?: boolean;
}
const getCategoryStyles = (category: string, colorId?: string) => {
  // If a specific color is chosen from the palette:
  if (colorId) {
    switch (colorId) {
      case 'green': return { '--item-bg': 'rgba(88, 167, 127, 0.15)', '--item-hover-bg': 'rgba(88, 167, 127, 0.25)', '--item-border': '#58a77f' };
      case 'blue': return { '--item-bg': 'rgba(93, 154, 180, 0.15)', '--item-hover-bg': 'rgba(93, 154, 180, 0.25)', '--item-border': '#5d9ab4' };
      case 'red': return { '--item-bg': 'rgba(207, 103, 96, 0.15)', '--item-hover-bg': 'rgba(207, 103, 96, 0.25)', '--item-border': '#cf6760' };
      case 'orange': return { '--item-bg': 'rgba(196, 135, 68, 0.15)', '--item-hover-bg': 'rgba(196, 135, 68, 0.25)', '--item-border': '#c48744' };
      case 'yellow': return { '--item-bg': 'rgba(176, 145, 60, 0.15)', '--item-hover-bg': 'rgba(176, 145, 60, 0.25)', '--item-border': '#b0913c' };
      case 'cyan': return { '--item-bg': 'rgba(67, 154, 194, 0.15)', '--item-hover-bg': 'rgba(67, 154, 194, 0.25)', '--item-border': '#439ac2' };
      case 'purple': return { '--item-bg': 'rgba(142, 115, 201, 0.15)', '--item-hover-bg': 'rgba(142, 115, 201, 0.25)', '--item-border': '#8e73c9' };
      case 'white': return {}; // fallback to default UI variables
    }
  }

  // Fallback for backwards compatibility with existing string names if no color ID is set
  switch (category) {
    case 'Frukt & Grönt': return { '--item-bg': 'rgba(88, 167, 127, 0.15)', '--item-hover-bg': 'rgba(88, 167, 127, 0.25)', '--item-border': '#58a77f' };
    case 'Mejeri': return { '--item-bg': 'rgba(93, 154, 180, 0.15)', '--item-hover-bg': 'rgba(93, 154, 180, 0.25)', '--item-border': '#5d9ab4' };
    case 'Kött': return { '--item-bg': 'rgba(207, 103, 96, 0.15)', '--item-hover-bg': 'rgba(207, 103, 96, 0.25)', '--item-border': '#cf6760' };
    case 'Bageri': return { '--item-bg': 'rgba(196, 135, 68, 0.15)', '--item-hover-bg': 'rgba(196, 135, 68, 0.25)', '--item-border': '#c48744' };
    case 'Skafferi': return { '--item-bg': 'rgba(176, 145, 60, 0.15)', '--item-hover-bg': 'rgba(176, 145, 60, 0.25)', '--item-border': '#b0913c' };
    case 'Frysvaror': return { '--item-bg': 'rgba(67, 154, 194, 0.15)', '--item-hover-bg': 'rgba(67, 154, 194, 0.25)', '--item-border': '#439ac2' };
    case 'Övrigt': return { '--item-bg': 'rgba(142, 115, 201, 0.15)', '--item-hover-bg': 'rgba(142, 115, 201, 0.25)', '--item-border': '#8e73c9' };
    default: return {};
  }
};

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

const GroceryItem: React.FC<GroceryItemProps> = ({ 
  item, onToggle, onDelete, onUpdateQuantity, onRename, isDraggingPreview, colorId, isLocked
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const controls = useAnimation();

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const threshold = -80;
    if (info.offset.x < threshold) {
      await controls.start({ x: -window.innerWidth, transition: { duration: 0.2 } });
      onDelete(item.id);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const startEdit = (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (item.isCompleted) return; // don't allow editing completed items
    setEditValue(item.name);
    setIsEditing(true);
  };

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.name && onRename) {
      onRename(item.id, trimmed);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(item.name);
    setIsEditing(false);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(getCategoryStyles(item.category, colorId) as React.CSSProperties),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDraggingPreview ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.swipeWrapper}
    >
      <motion.div
        className={`${styles.itemContainer} ${item.isCompleted ? styles.completed : ''} ${isDraggingPreview ? styles.preview : ''}`}
        drag={isLocked ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.8, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {!isLocked && (
          <div className={styles.dragHandle} {...attributes} {...listeners}>
            <GripVertical size={18} />
          </div>
        )}
      
      <motion.button
        className={`${styles.checkbox} ${item.isCompleted ? styles.checked : ''}`}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTap={(e) => {
          e.stopPropagation();
          onToggle(item.id);
        }}
        aria-label={item.isCompleted ? "Markera som ej klar" : "Markera som klar"}
      >
        <motion.div
          initial={false}
          animate={{ scale: item.isCompleted ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check size={16} strokeWidth={3} />
        </motion.div>
      </motion.button>

      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.editRow}>
            <input
              ref={inputRef}
              className={styles.editInput}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              onBlur={commitEdit}
              maxLength={80}
              aria-label="Redigera varunamn"
            />
            <button className={styles.editActionBtn} onClick={commitEdit} aria-label="Spara">
              <Check size={14} />
            </button>
            <button className={styles.editActionBtn} onClick={cancelEdit} aria-label="Avbryt">
              <X size={14} />
            </button>
          </div>
        ) : (
            <span className={styles.name}>
              {item.quantity && (item.quantity > 1 || (item.unit && item.unit !== 'st')) ? (
                <span className={styles.quantityBadge}>
                  {item.quantity}{item.unit && item.unit !== 'st' ? item.unit : 'x'}
                </span>
              ) : null}
              {' '}
              {item.name}
            </span>
        )}
        <span className={styles.category}>
          {getCategoryEmoji(item.category)} {item.category}
        </span>
      </div>

      {!isLocked && (
        <div className={styles.actions}>
          <div className={styles.quantityControls}>
            <motion.button 
              className={styles.qtyBtn} 
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTap={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, -1);
              }}
              disabled={!item.quantity || item.quantity <= 1}
              aria-label="Minska antal"
            >
              <Minus size={14} />
            </motion.button>
            <motion.button 
              className={styles.qtyBtn} 
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTap={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, 1);
              }}
              aria-label="Öka antal"
            >
              <Plus size={14} />
            </motion.button>
          </div>

          {!item.isCompleted && onRename && (
            <motion.button
              className={styles.actionBtn}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTap={() => startEdit()}
              aria-label={`Redigera ${item.name}`}
            >
              <Pencil size={18} />
            </motion.button>
          )}

          <motion.button
            className={`${styles.actionBtn} ${styles.danger}`}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTap={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            aria-label="Ta bort vara"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      )}
      </motion.div>
    </div>
  );
};

export default GroceryItem;
