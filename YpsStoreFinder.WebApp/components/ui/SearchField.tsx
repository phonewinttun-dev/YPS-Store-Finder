import { Search, X } from 'lucide-react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  clearLabel?: string;
  className?: string;
}

export default function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel = placeholder,
  clearLabel = `Clear ${ariaLabel}`,
  className = '',
}: SearchFieldProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="ui-search-field pl-11 pr-12"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="ui-button absolute right-0.5 top-1/2 h-11 w-11 -translate-y-1/2 border border-transparent bg-transparent p-0 text-muted hover:bg-elevated hover:text-ink"
          aria-label={clearLabel}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
