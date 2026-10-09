import type { ButtonHTMLAttributes } from 'react';

export type UiTone = 'neutral' | 'brand' | 'store' | 'bus' | 'gps' | 'route' | 'danger';
export type UiButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type UiButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const toneStyles: Record<UiTone, Record<Exclude<UiButtonVariant, 'outline' | 'ghost'>, string>> = {
  neutral: {
    solid: 'bg-ink text-surface hover:bg-ink/90',
    soft: 'bg-elevated text-ink hover:bg-line/25',
  },
  brand: {
    solid: 'bg-brand text-brand-ink hover:bg-brand/90',
    soft: 'bg-brand-soft text-brand hover:bg-brand-soft/75',
  },
  store: {
    solid: 'bg-store-action text-white hover:bg-store-action/90',
    soft: 'bg-store-soft text-store hover:bg-store-soft/75',
  },
  bus: {
    solid: 'bg-bus-action text-white hover:bg-bus-action/90',
    soft: 'bg-bus-soft text-bus hover:bg-bus-soft/75',
  },
  gps: {
    solid: 'bg-gps-action text-white hover:bg-gps-action/90',
    soft: 'bg-gps-soft text-gps hover:bg-gps-soft/75',
  },
  route: {
    solid: 'bg-route-action text-white hover:bg-route-action/90',
    soft: 'bg-route-soft text-route hover:bg-route-soft/75',
  },
  danger: {
    solid: 'bg-danger-action text-white hover:bg-danger-action/90',
    soft: 'bg-danger-soft text-danger hover:bg-danger-soft/75',
  },
};

const sizeStyles: Record<UiButtonSize, string> = {
  sm: 'min-h-11 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
  icon: 'h-11 w-11 p-0',
};

export function buttonStyles({
  tone = 'neutral',
  variant = 'outline',
  size = 'md',
  className = '',
}: {
  tone?: UiTone;
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  className?: string;
} = {}) {
  const variantStyle = variant === 'outline'
    ? 'border border-line bg-surface text-ink hover:border-ink/45 hover:bg-elevated'
    : variant === 'ghost'
      ? 'border border-transparent bg-transparent text-muted hover:bg-elevated hover:text-ink'
      : toneStyles[tone][variant];

  return [
    'ui-button inline-flex items-center justify-center gap-2 font-semibold disabled:pointer-events-none disabled:opacity-45',
    sizeStyles[size],
    variantStyle,
    className,
  ].filter(Boolean).join(' ');
}

interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: UiTone;
  variant?: UiButtonVariant;
  size?: UiButtonSize;
}

export default function UiButton({
  tone = 'neutral',
  variant = 'outline',
  size = 'md',
  className = '',
  children,
  ...props
}: UiButtonProps) {
  return (
    <button type="button" className={buttonStyles({ tone, variant, size, className })} {...props}>
      {children}
    </button>
  );
}
