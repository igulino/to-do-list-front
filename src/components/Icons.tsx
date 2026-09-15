type IconName = 'arrow' | 'eye' | 'eye-off' | 'lock' | 'check' | 'mail' | 'sparkle' | 'board' | 'chevron-left' | 'chevron-right' | 'refresh' | 'list' | 'alert' | 'grip' | 'plus' | 'close' | 'trash' | 'pencil'

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    pencil: <><path d="m16 3 5 5M4 15 16.5 2.5a1.4 1.4 0 0 1 2 0l3 3a1.4 1.4 0 0 1 0 2L9 20l-6 1 1-6Z" /></>,
    trash: <><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14M10 10v7M14 10v7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    'eye-off': <><path d="m3 3 18 18M10.6 5.1 12 5c6.5 0 10 7 10 7a21 21 0 0 1-3.1 4.1M6.5 6.5A23 23 0 0 0 2 12s3.5 7 10 7c1.7 0 3.3-.5 4.6-1.2M10 10a2.8 2.8 0 0 0 4 4" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
    sparkle: <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" />,
    board: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16M15 4v16M6 8v4M12 8v7M18 8v3" /></>,
    'chevron-left': <path d="m14 6-6 6 6 6" />,
    'chevron-right': <path d="m10 6 6 6-6 6" />,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 6.1A8 8 0 0 1 20 12M4 12a8 8 0 0 0 13.9 5.9" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h7" /><circle cx="4" cy="6" r=".5" /><circle cx="4" cy="12" r=".5" /><circle cx="4" cy="18" r=".5" /></>,
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></>,
    grip: <>{[5, 12, 19].map(y => <g key={y}><circle cx="9" cy={y} r="1" /><circle cx="15" cy={y} r="1" /></g>)}</>,
  }

  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function Brand() {
  return <div className="brand" aria-label="TDL — seu dia mais leve">
    <svg className="brand-mark" width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="m13 13 2-6 5 4 4-7 4 7 5-4 2 6c5 3 8 8 8 14 0 10-8 17-19 17S5 37 5 27c0-6 3-11 8-14Z" fill="#f1f5f7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11 28c0-7 5-12 13-12s13 5 13 12c0 7-6 11-13 11s-13-4-13-11Z" fill="#b4e1f1" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="18" cy="27" rx="2.1" ry="2.8" fill="currentColor" /><ellipse cx="30" cy="27" rx="2.1" ry="2.8" fill="currentColor" />
      <path d="M21 33c2 1.6 4 1.6 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
    <span className="brand-wordmark">TDL<span>.</span></span>
  </div>
}
