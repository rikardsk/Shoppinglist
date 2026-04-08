import React, { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './InstallPrompt.module.css';

const DISMISSED_KEY = 'install-prompt-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;

const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true;

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed or permanently dismissed
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      setShowIOS(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowAndroid(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroid(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = (permanent = true) => {
    if (permanent) localStorage.setItem(DISMISSED_KEY, '1');
    setShowAndroid(false);
    setShowIOS(false);
  };

  return (
    <AnimatePresence>
      {(showAndroid || showIOS) && (
        <motion.div
          className={styles.banner}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          role="banner"
          aria-label="Installera appen"
        >
          <div className={styles.icon}>🛒</div>
          <div className={styles.text}>
            <p className={styles.title}>Installera Mina Inköp</p>
            {showIOS ? (
              <p className={styles.subtitle}>
                Tryck på <Share size={13} className={styles.inlineIcon} /> och välj{' '}
                <strong>Lägg till på hemskärmen</strong>
              </p>
            ) : (
              <p className={styles.subtitle}>Lägg till på din hemskärm för snabb åtkomst</p>
            )}
          </div>
          <div className={styles.actions}>
            {showAndroid && (
              <button className={styles.installBtn} onClick={handleInstall} id="install-app-btn">
                <Download size={16} />
                Installera
              </button>
            )}
            <button className={styles.dismissBtn} onClick={() => handleDismiss(true)} aria-label="Stäng">
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
