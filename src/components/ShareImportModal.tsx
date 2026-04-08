import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import styles from './ShareImportModal.module.css';
import { GroceryItem } from '../types';

interface ShareImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedItems: GroceryItem[];
  onImport: (mode: 'merge' | 'replace') => void;
}

const ShareImportModal: React.FC<ShareImportModalProps> = ({ isOpen, onClose, sharedItems, onImport }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          className={styles.modal} 
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
          
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <Share2 size={24} color="var(--accent-primary)" />
            </div>
            <h2>Delad lista mottagen!</h2>
            <p>Någon har delat en inköpslista med {sharedItems.length} varor.</p>
          </div>

          <div className={styles.preview}>
            <ul>
              {sharedItems.slice(0, 5).map((item, idx) => (
                <li key={idx}>
                  <span className={styles.itemName}>{item.name}</span>
                  {item.quantity && item.quantity > 1 && <span className={styles.itemQty}> ({item.quantity}st)</span>}
                </li>
              ))}
              {sharedItems.length > 5 && (
                <li className={styles.more}>...och {sharedItems.length - 5} till</li>
              )}
            </ul>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.mergeBtn} 
              onClick={() => onImport('merge')}
            >
              <Plus size={18} />
              <span>Lägg till i min lista</span>
            </button>
            <button 
              className={styles.replaceBtn} 
              onClick={() => onImport('replace')}
            >
              <RefreshCw size={18} />
              <span>Ersätt min lista</span>
            </button>
          </div>

          <div className={styles.warning}>
            <AlertTriangle size={14} />
            <span>"Ersätt" tar bort alla dina nuvarande varor.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareImportModal;
