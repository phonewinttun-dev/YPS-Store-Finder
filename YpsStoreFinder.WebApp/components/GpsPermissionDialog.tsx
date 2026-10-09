'use client';

import { Compass, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import UiButton from './ui/Button';

interface GpsPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function GpsPermissionDialog({ open, onClose, onConfirm }: GpsPermissionDialogProps) {
  const { t } = useLanguage();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-[2000] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className="ui-material ui-card relative w-full max-w-sm p-6 shadow-soft">
        <UiButton type="button" variant="ghost" size="icon" onClick={onClose} className="absolute right-3 top-3" aria-label={t('close')}>
          <X className="h-5 w-5" />
        </UiButton>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-gps-soft text-gps"><Compass className="h-6 w-6" /></div>
        <h2 id={titleId} className="pr-10 text-lg font-bold text-ink">{t('enableGpsTitle')}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-muted">{t('enableGpsMessage')}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <UiButton type="button" size="lg" onClick={onClose}>{t('cancel')}</UiButton>
          <UiButton type="button" size="lg" tone="gps" variant="solid" onClick={onConfirm}>{t('enableGpsBtn')}</UiButton>
        </div>
      </div>
    </div>
  );
}
