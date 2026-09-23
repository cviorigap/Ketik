interface P {
  className?: string;
}

export const PauseIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <rect x="6" y="4.5" width="4.2" height="15" rx="1.4" />
    <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4" />
  </svg>
);

export const SoundIcon = ({ on, className = "w-5 h-5" }: P & { on: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" fill="currentColor" stroke="none" />
    {on ? (
      <>
        <path d="M15.5 9a4 4 0 0 1 0 6" />
        <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
      </>
    ) : (
      <>
        <path d="M16 9.5l5 5" />
        <path d="M21 9.5l-5 5" />
      </>
    )}
  </svg>
);

export const TrophyIcon = ({ className = "w-4 h-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.35A5 5 0 0 1 13 14.9V17h3v3H8v-3h3v-2.1A5 5 0 0 1 8.35 12H8a4 4 0 0 1-4-4V5h3V3zm0 4H6v1a2 2 0 0 0 1.2 1.83C7.07 9.24 7 8.63 7 8V7zm10 0v1c0 .63-.07 1.24-.2 1.83A2 2 0 0 0 18 8V7h-1z" />
  </svg>
);

export const HelpIcon = ({ className = "w-4 h-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M9.4 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.2-2.6 3.8" />
    <circle cx="12" cy="17.2" r="0.6" fill="currentColor" />
  </svg>
);

export const GrenadeIcon = ({ className = "w-6 h-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <ellipse cx="11" cy="14.5" rx="6.2" ry="7" fill="#4a5c30" />
    <path d="M6 12.5h10M6.4 16.5h9.2M11 7.6v13.8" stroke="#2f3b1d" strokeWidth="1.3" />
    <rect x="8.6" y="5" width="4.8" height="3.2" rx="0.8" fill="#9aa0a6" />
    <path d="M13.4 5.8l4.6-2.3" stroke="#c9ced3" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="18.6" cy="6.4" r="2" fill="none" stroke="#c9ced3" strokeWidth="1.3" />
  </svg>
);

export const SkullIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2.5c-4.7 0-8.3 3.4-8.3 7.9 0 2.7 1.3 4.6 3.1 5.8V19a1.5 1.5 0 0 0 1.5 1.5h7.4a1.5 1.5 0 0 0 1.5-1.5v-2.8c1.8-1.2 3.1-3.1 3.1-5.8 0-4.5-3.6-7.9-8.3-7.9zM8.6 13.6a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zm6.8 0a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM12 14.2l1.3 2.3h-2.6l1.3-2.3z" />
  </svg>
);

export const CloseIcon = ({ className = "w-5 h-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
