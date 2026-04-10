import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Check, QrCode, Smartphone } from 'lucide-react';
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

          <div className={styles.iphoneTip}>
            <Smartphone size={14} />
            <span>Öppnar i Safari? Kopiera länken nedan och öppna din installerade app → Importera.</span>
          </div>

          <div className={styles.divider}>
            <span>kopiera länk</span>
          </div>

          <div className={styles.urlRow}>
            <input
              className={styles.urlInput}
              readOnly
              value={url}
              onFocus={e => e.target.select()}
              aria-label="Delningslänk"
            />
            <button
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopy}
              title="Kopiera länk"
            >
              {copied ? <Check size={18} /> : <Link size={18} />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QRShareModal;
