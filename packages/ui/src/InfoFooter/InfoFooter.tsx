import type { ReactNode } from 'react';
export type InfoFooterProps = { notice?: ReactNode };

export function InfoFooter({ notice }: InfoFooterProps) {
  return <footer>
    {"Microphone access stops when you stop or pause capture, leave recognition or a drill session, or the page becomes hidden. Gun profiles, numeric learned features, custom drills, recognition results, saved sessions and preferences are stored in this browser's IndexedDB. No raw audio is saved or uploaded. Clearing browser storage erases local data."}
    <p className="copyright">© 2026 Dry Fire With Ease. All rights reserved.</p>
    {notice}
  </footer>;
}
