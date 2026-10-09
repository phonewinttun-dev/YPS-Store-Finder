import { useId } from 'react';

export default function AppMark({ className = 'h-11 w-11' }: { className?: string }) {
  const gradientId = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="YPS Tap-to-Route">
      <defs>
        <linearGradient id={gradientId} x1="10" y1="8" x2="55" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1A8" />
          <stop offset="1" stopColor="#F6D867" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="18" fill={`url(#${gradientId})`} />
      <rect x="13" y="15" width="27" height="20" rx="6" fill="none" stroke="#493B00" strokeWidth="3" />
      <path d="M14.5 22.5h24" stroke="#493B00" strokeWidth="3" strokeLinecap="round" />
      <path d="M27 35v5.5c0 5 3.8 8.5 8.5 8.5h4" fill="none" stroke="#6546AD" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M50 40.5c0 5.6-7 11.5-7 11.5s-7-5.9-7-11.5a7 7 0 1 1 14 0Z" fill="#A23F2B" />
      <circle cx="43" cy="40.5" r="2.5" fill="#FFF8F4" />
    </svg>
  );
}
