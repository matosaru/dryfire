/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,screen} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {InfoFooter} from './InfoFooter.tsx';

test('footer preserves disclosure, copyright and private notice without duplicate information navigation',()=>{
 const {rerender}=render(<InfoFooter notice={<p>Private preview · Full mode</p>}/>);
 expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
 expect(screen.queryByRole('link')).not.toBeInTheDocument();
 expect(screen.getByRole('contentinfo')).toHaveTextContent('No raw audio is saved or uploaded.');
 expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2026 Dry Fire With Ease. All rights reserved.');
 expect(screen.getByText('Private preview · Full mode')).toBeVisible();
 rerender(<InfoFooter/>);expect(screen.queryByText('Private preview · Full mode')).not.toBeInTheDocument();
});

test('footer copyright stays at a readable 14 CSS pixels',()=>{
 const css=readFileSync(new URL('./InfoFooter.css',import.meta.url),'utf8');
 expect(css).toMatch(/\.copyright\s*\{[^}]*font-size:\s*\.875rem/);
});
