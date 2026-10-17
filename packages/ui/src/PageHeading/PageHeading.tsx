export interface PageHeadingProps {
  id: string;
  title: string;
  backLabel?: string;
  onBack?: () => void;
}

export function PageHeading({ id, title, backLabel = 'Back to previous screen', onBack }: PageHeadingProps) {
  return <div className="section-head"><button type="button" className="back-button" data-back="" data-react-back="" aria-label={backLabel} onClick={onBack}>‹</button><h2 id={id}>{title}</h2></div>;
}
