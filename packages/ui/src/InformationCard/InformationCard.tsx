import type { ReactNode } from 'react';

export interface InformationCardProps {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}

export function InformationCard({ id, title, className = '', children }: InformationCardProps) {
  return <section className={className ? `about-card ${className}` : 'about-card'} aria-labelledby={id}>
    <h3 id={id}>{title}</h3>{children}
  </section>;
}
