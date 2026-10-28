import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { BrandHeaderContent } from '@dryfire/ui/BrandHeader';
import { BottomNavigationContent } from '@dryfire/ui/BottomNavigation';
import type { ChromeFactory } from './chromeBridge.ts';

/** Only header and navigation contents transfer. The
 * footer's private status, main, safety and every mounted draft stay untouched. */
export const mountChrome: ChromeFactory = ({ doc, initial, onNavigate }) => {
  const hosts = [doc.querySelector('header.hero'), doc.querySelector('.tabs')];
  if (hosts.some(host => !host)) throw new Error('Shared chrome mounts are missing.');
  const regions = hosts as Element[];
  const active = doc.activeElement as HTMLButtonElement | null;
  const focused = active && regions.some(host => host.contains(active)) ? {id:active.id,view:active.dataset.view,dismissed:active.dataset.tooltipDismissed} : null;
  const restoreFocus = () => {
    if (focused?.id) {const node=doc.getElementById(focused.id);if(node&&focused.dismissed)node.dataset.tooltipDismissed=focused.dismissed;node?.focus();}
    else if (focused?.view) [...regions[1].querySelectorAll<HTMLButtonElement>('.tab')].find(button=>button.dataset.view===focused.view)?.focus();
  };
  const state = { ...initial };
  let backups: Node[][] | undefined = regions.map(host => [...host.childNodes]);
  const roots: Root[] = [];
  let mountFailure: unknown;
  let disposed = false;
  const header = () => roots[0].render(<StrictMode><BrandHeaderContent view={state.view} status={state.status} onNavigate={onNavigate} /></StrictMode>);
  const navigation = () => roots[1].render(<StrictMode><BottomNavigationContent view={state.view} disabled={state.navigationDisabled} onNavigate={onNavigate} /></StrictMode>);
  try {
    regions.forEach(host => roots.push(createRoot(host, { onUncaughtError(error) { mountFailure = error; } })));
    flushSync(() => { header(); navigation(); });
    if (mountFailure) throw mountFailure;
    restoreFocus();
  }
  catch (error) {
    flushSync(()=>roots.forEach(root=>root.unmount()));
    regions.forEach((host,index)=>host.replaceChildren(...backups![index])); restoreFocus(); throw error;
  }
  backups = undefined;
  return {
    update(next) {
      if (disposed) return;
      const viewChanged = state.view !== next.view;
      const statusChanged = state.status !== next.status;
      const disabledChanged = state.navigationDisabled !== next.navigationDisabled;
      Object.assign(state, next);
      flushSync(() => {
        if (viewChanged || statusChanged) header();
        if (viewChanged || disabledChanged) navigation();
      });
    },
    dispose() {
      if (disposed) return;
      disposed=true; flushSync(()=>roots.forEach(root=>root.unmount()));
    },
  };
};
