export type Destination = 'home' | 'learn' | 'drills' | 'recognize' | 'history';
export type BottomNavigationProps = { view?: string; disabled?: boolean; onNavigate?: (view: Destination) => void };
const items = [
  { view: 'home', title: 'Home', shape: <path d="m3 11 9-8 9 8v10h-6v-7H9v7H3z" /> },
  { view: 'learn', title: 'Learn', shape: <path d="M3 10v4m4-7v10m5-13v16m5-13v10m4-7v4" /> },
  { view: 'drills', title: 'Drills', shape: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 1v4m0 14v4M1 12h4m14 0h4" /></> },
  { view: 'recognize', title: 'Live Listen', shape: <path d="M3 9v6m4-9v12m5-15v18m5-15v12m4-9v6" /> },
  { view: 'history', title: 'History', shape: <path d="M4 14h3v7H4zm7-6h3v13h-3zm7-5h3v18h-3z" /> },
] satisfies { view: Destination; title: string; shape: React.ReactNode }[];

export function BottomNavigationContent({ view = 'home', disabled = false, onNavigate }: BottomNavigationProps) {
  const selected = ['session', 'practice', 'practiceGuide'].includes(view) ? 'drills' : view;
  return <>
    {items.map(item => <button key={item.view} className={`tab${item.view === selected ? ' active' : ''}`} data-view={item.view} aria-current={item.view === selected ? 'page' : undefined} type="button" disabled={disabled} onClick={() => onNavigate?.(item.view)}>
      <span className="nav-glyph"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{item.shape}</svg></span>{item.title}
    </button>)}
  </>;
}

export function BottomNavigation(props: BottomNavigationProps) {
  return <nav className="tabs" aria-label="Main navigation"><BottomNavigationContent {...props} /></nav>;
}
