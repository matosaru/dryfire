export interface PageHeadingProps {
  id: string;
  title: string;
  backLabel?: string;
  backId?: string;
  sharedBack?: boolean;
  eyebrow?: string;
  reactBack?: boolean;
  onBack?: () => void;
}

export function PageHeading({ id, title, backLabel = 'Back to previous screen', backId, sharedBack=true, eyebrow, reactBack = true, onBack }: PageHeadingProps) {
  return <div className="section-head"><button id={backId} type="button" className="back-button" data-back={sharedBack?'':undefined} data-react-back={reactBack?'':undefined} aria-label={backLabel} onClick={onBack}>‹</button>{eyebrow?<div><p className="eyebrow">{eyebrow}</p><h2 id={id}>{title}</h2></div>:<h2 id={id}>{title}</h2>}</div>;
}
