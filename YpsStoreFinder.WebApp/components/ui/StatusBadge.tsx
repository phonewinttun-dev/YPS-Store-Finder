import type { HTMLAttributes } from 'react';
import type { UiTone } from './Button';

const toneStyles: Record<UiTone, string> = {
  neutral: 'border-line bg-elevated text-muted',
  brand: 'border-brand/30 bg-brand-soft text-brand',
  store: 'border-store/30 bg-store-soft text-store',
  bus: 'border-bus/30 bg-bus-soft text-bus',
  gps: 'border-gps/30 bg-gps-soft text-gps',
  route: 'border-route/30 bg-route-soft text-route',
  danger: 'border-danger/30 bg-danger-soft text-danger',
};

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: UiTone;
  mono?: boolean;
}

export default function StatusBadge({
  tone = 'neutral',
  mono = false,
  className = '',
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={`ui-badge ${toneStyles[tone]} ${mono ? 'font-mono-meta' : ''} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
