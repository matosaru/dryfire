import {createHash} from 'node:crypto';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {edition} from './catalog.js';
const library=readFileSync(new URL('./fixtures/library.json',import.meta.url));
for(const theme of ['dark','light'])test(`History keeps ${theme} pixels, numeric drafts and graph filters across handoff`,async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());let release;const blocked=new Promise(resolve=>{release=resolve;});await page.route('**/assets/historyPage-*.js',async route=>{await blocked;await route.continue();});
 await page.goto('/');await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:library});await expect(page.locator('#homeView')).toBeVisible();
 if(theme==='light'){await page.locator('#settingsShortcut').click();await page.locator('#appearance').selectOption(theme);await expect(page.locator('html')).toHaveAttribute('data-theme',theme);}
 await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);await expect(page.locator('#historyList .history-item')).toHaveCount(1);
 if(edition==='preview'){await page.locator('#progressRange').selectOption('30');}
 await page.locator('#maxResults').fill('');await page.locator('#maxResults').press('-');expect(await page.locator('#maxResults').evaluate(node=>node.validity.badInput)).toBe(true);await page.locator('#history-title').click();
 // A fresh native entry clears the validation banner just as the later React entry does.
 // Keep the same invalid input node/draft while comparing identical surrounding layout.
 await page.locator('.tab[data-view="home"]').click();await page.locator('.tab[data-view="history"]').click();
 const input=await page.locator('#maxResults').elementHandle(),progress=await page.locator('#progressSection').elementHandle();const before=await page.locator('#historyView').screenshot({animations:'disabled'});
 const loaded=page.waitForResponse(response=>/\/assets\/historyPage-/.test(response.url()));release();await loaded;await expect(page.locator('#historyView')).not.toHaveAttribute('data-react-history');
 await page.locator('.tab[data-view="home"]').click();await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#historyView')).toHaveAttribute('data-react-history','');await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);await page.locator('#history-title').click();
 expect(await input.evaluate(node=>node===document.getElementById('maxResults'))).toBe(true);expect(await input.evaluate(node=>node.validity.badInput)).toBe(true);expect(await progress.evaluate(node=>node===document.getElementById('progressSection'))).toBe(true);
 if(edition==='preview'){await expect(page.locator('#progressRange')).toHaveValue('30');}
 const after=await page.locator('#historyView').screenshot({animations:'disabled'});await testInfo.attach('native',{body:before,contentType:'image/png'});await testInfo.attach('react',{body:after,contentType:'image/png'});expect(createHash('sha256').update(after).digest('hex')).toBe(createHash('sha256').update(before).digest('hex'));
 await page.locator('#maxResults').fill('50');await page.locator('#maxResults').press('Tab');await expect(page.locator('#maxResults')).toHaveValue('50');
 const first=page.locator('#historyList select').first();await first.selectOption('other');await expect(first).toHaveValue('other');
 await page.locator('#savedSessions button').first().click();await expect(page.locator('#practiceReview')).toBeVisible();await page.locator('.tab[data-view="history"]').click();
 await page.locator('#clearHistoryBtn').click();await expect(page.locator('#historyList')).toHaveText('No recognition events yet.');await expect(page.locator('#historyClearOutcome')).toContainText('Saved sessions and learned sounds were kept.');await expect(page.locator('#savedSessions .saved-session-card')).toHaveCount(5);
 await page.locator('#clearSessionsBtn').click();await expect(page.locator('#savedSessions')).toHaveText('No saved drill sessions for this gun yet.');await expect(page.locator('#sessionsClearOutcome')).toContainText('Learned sounds and recognition history were kept.');
 await page.locator('#gunSwitcherBtn').click();await page.locator('[data-gun-id="qa-gun-b"]').click();await page.locator('.tab[data-view="history"]').click();await expect(page.locator('#historyView .gun-context-name')).toHaveText('QA Carbine');await expect(page.locator('#historyClearOutcome')).toBeEmpty();await expect(page.locator('#sessionsClearOutcome')).toBeEmpty();
 expect(errors).toEqual([]);
});
