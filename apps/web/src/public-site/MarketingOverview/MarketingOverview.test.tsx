/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import {render,screen} from '@testing-library/react';
import {MarketingOverview} from './MarketingOverview';
test('retains the marketing overview and all four unique practice manuals inside About',()=>{
 render(<MarketingOverview afterIntro={<p>Feedback welcome</p>}/>);
 expect(screen.getByText('Feedback welcome')).toBeVisible();expect(screen.getByRole('link',{name:'Open the free app'})).toHaveAttribute('href','/');
 expect(screen.getByRole('heading',{name:'A simple practice routine'})).toBeVisible();expect(screen.getByRole('heading',{name:'Four ways to practice'})).toBeVisible();
 const links=screen.getAllByRole('link').filter(node=>node.getAttribute('href')?.endsWith('-guide/'));expect(links).toHaveLength(4);expect(new Set(links.map(node=>node.getAttribute('href'))).size).toBe(4);
});
test('the mode-directory variant reuses links without repeating the introduction',()=>{render(<MarketingOverview variant="links"/>);expect(screen.getAllByRole('link')).toHaveLength(4);expect(screen.queryByText('Dry Fire With Ease')).not.toBeInTheDocument();});
test('Full preview feature summary remains available without changing the free marketing promise',()=>{render(<MarketingOverview full/>);expect(document.getElementById('aboutFeatureSummary')?.textContent).toBe(document.getElementById('aboutFeatureSummary')?.getAttribute('data-full-summary'));});
