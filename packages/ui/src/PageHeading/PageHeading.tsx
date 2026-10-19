export interface PageHeadingProps {
  id: string;
  title: string;
  backLabel?: string;
  eyebrow?: string;
  reactBack?: boolean;
  onBack?: () => void;
}

export function PageHeading({ id, title, backLabel = 'Back to previous screen', eyebrow, reactBack = true, onBack }: PageHeadingProps) {
  return <div className="section-head"><button type="button" className="back-button" data-back="" data-react-back={reactBack?'':undefined} aria-label={backLabel} onClick={onBack}>‹</button>{eyebrow?<div><p className="eyebrow">{eyebrow}</p><h2 id={id}>{title}</h2></div>:<h2 id={id}>{title}</h2>}</div>;
}
