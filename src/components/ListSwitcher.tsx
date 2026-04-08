import React, { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroceryList, LIST_TEMPLATES } from '../types';
import styles from './ListSwitcher.module.css';

interface ListSwitcherProps {
  lists: GroceryList[];
  activeListId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string, templateId?: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isLocked?: boolean;
}

const ListSwitcher: React.FC<ListSwitcherProps> = ({
  lists,
  activeListId,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
  isLocked,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) newInputRef.current?.focus();
  }, [isCreating]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const handleCreate = (templateId: string, templateName: string) => {
    onCreate(templateName, templateId);
    setIsCreating(false);
  };

  const handleCreateCustom = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      onCreate(trimmed, 'grocery');
    }
    setNewName('');
    setIsCreating(false);
  };

  const handleRename = (id: string) => {
    const trimmed = editName.trim();
    if (trimmed) {
      onRename(id, trimmed);
    }
    setEditingId(null);
  };

  const handleDeleteConfirm = (id: string, name: string) => {
    if (window.confirm(`Ta bort listan "${name}"? Alla varor i listan försvinner.`)) {
      onDelete(id);
    }
  };

  const startEditing = (list: GroceryList) => {
    setEditingId(list.id);
    setEditName(list.name);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollArea}>
        <AnimatePresence initial={false}>
        {lists.map((list) => {
            const isActive = list.id === activeListId;
            const isEditing = editingId === list.id;
            const tId = list.templateId || 'grocery';
            const template = LIST_TEMPLATES.find(t => t.id === tId) || LIST_TEMPLATES[0];
            const hasCustomColor = true;

            return (
              <motion.div
                key={list.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className={`${styles.chip} ${isActive ? styles.active : ''}`}
                data-has-color={hasCustomColor}
                style={{ '--template-color': template.themeColor } as React.CSSProperties}
              >
                {isEditing ? (
                  <div className={styles.editRow}>
                    <input
                      ref={editInputRef}
                      className={styles.editInput}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(list.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      maxLength={30}
                    />
                    <button className={styles.iconBtn} onClick={() => handleRename(list.id)} aria-label="Spara">
                      <Check size={14} />
                    </button>
                    <button className={styles.iconBtn} onClick={() => setEditingId(null)} aria-label="Avbryt">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.chipInner}>
                    <button
                      className={styles.chipLabel}
                      onClick={() => onSwitch(list.id)}
                      aria-pressed={isActive}
                    >
                      {list.name}
                      <span className={styles.chipCount}>{list.items.length}</span>
                    </button>
                    {isActive && !isLocked && (
                      <div className={styles.chipActions}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => startEditing(list)}
                          aria-label={`Byt namn på ${list.name}`}
                        >
                          <Pencil size={13} />
                        </button>
                        {lists.length > 1 && (
                          <button
                            className={`${styles.iconBtn} ${styles.danger}`}
                            onClick={() => handleDeleteConfirm(list.id, list.name)}
                            aria-label={`Ta bort ${list.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!isLocked && (
          isCreating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${styles.chip} ${styles.createChipExpanded}`}
            >
              <div className={styles.templateOptions}>
                {LIST_TEMPLATES.map(t => (
                  <button 
                     key={t.id} 
                     className={styles.templateBtn} 
                     onClick={() => handleCreate(t.id, t.name)}
                     title={`Skapa mall: ${t.name}`}
                  >
                    <span className={styles.templateIcon}>{t.icon}</span>
                    <span className={styles.templateName}>{t.name}</span>
                  </button>
                ))}
              </div>
              <div className={styles.customListInputRow}>
                <input
                  ref={newInputRef}
                  className={styles.editInput}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Eller egen lista..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCustom();
                    if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
                  }}
                  maxLength={30}
                />
                <button className={styles.iconBtn} onClick={handleCreateCustom} aria-label="Skapa">
                  <Check size={14} />
                </button>
                <button className={styles.iconBtn} onClick={() => { setIsCreating(false); setNewName(''); }} aria-label="Avbryt">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              layout
              className={`${styles.chip} ${styles.addChip}`}
              onClick={() => setIsCreating(true)}
              aria-label="Skapa ny lista"
            >
              <Plus size={15} />
              <span>Ny lista</span>
            </motion.button>
          )
        )}
      </div>
    </div>
  );
};

export default ListSwitcher;
