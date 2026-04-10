import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Check, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './QRShareModal.module.css';

interface QRShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  listName: string;
}

const QRShareModal: React.FC<QRShareModalProps> = ({ isOpen, onClose, url, listName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <button className={styles.closeBtn} onClick={onClose} aria-label="Stäng">
            <X size={20} />
          </button>

          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <QrCode size={28} color="var(--accent-primary)" />
            </div>
            <h2>Dela lista</h2>
            <p>Skanna QR-koden med din iPhone för att öppna <strong>{listName}</strong> i appen.</p>
          </div>

          <div className={styles.qrWrapper}>
            <QRCodeSVG
              value={url}
              size={220}
              bgColor="transparent"
              fgColor="var(--text-primary)"
              level="M"
              className={styles.qrCode}
            />
          </div>

          <div className={styles.divider}>
            <span>eller</span>
          </div>

          <button
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
          >
            {copied
              ? <><Check size={18} /><span>Länk kopierad!</span></>
              : <><Link size={18} /><span>Kopiera länk</span></>
            }
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRShareModal;
