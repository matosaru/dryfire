import{test,expect}from'@playwright/test';import{readFileSync}from'node:fs';
import{PUBLIC_ROUTES}from'../site/routes.js';
import{DRILLS}from'../src/drills.js';import{appPathFor,guidePathFor}from'../src/appPaths.js';
const library=JSON.parse(readFileSync(new URL('./fixtures/library.json',import.meta.url)));
async function restore(page,path='/'){page.on('dialog',d=>d.accept());await page.goto(path);await expect(page.locator('#gunSetupView')).toBeVisible();await page.locator('#restoreGunBackupBtn').click();await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(library))});}
test('favicon is available at its conventional URL',async({request})=>{const response=await request.get('/favicon.ico');expect(response.status()).toBe(200);expect((await response.body()).readUInt16LE(2)).toBe(1);});
test('public information is readable without JavaScript; the app root discloses its requirement',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});const page=await context.newPage();
 for(const route of PUBLIC_ROUTES){const response=await page.goto(route.path);await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://easydryfire.com'+route.path);if(route.id==='home'){expect(await response.text()).toContain('Enable JavaScript');}else if(route.appView){await expect(page.locator('#'+route.appView+'View')).toBeVisible();await expect(page.locator('#'+route.appView+'View')).toContainText(route.heading);}else await expect(page.locator('h1')).toHaveText(route.heading);expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(0);}
 await context.close();
});
test('flat app routes preserve profile data, invalid drafts and browser history',async({page})=>{
 await restore(page,'/history/');await expect(page.locator('#historyView')).toBeVisible();
 await page.reload();await expect(page).toHaveURL(/\/history\/$/);await expect(page).toHaveTitle('History — Dry Fire With Ease');
 await page.goto('/');await expect(page.locator('#homeView')).toBeVisible();await expect(page.locator('#homeDrillsBtn')).toBeEnabled();await expect(page).toHaveTitle('Dry Fire With Ease — Free Dry-Fire Practice App');await expect(page.locator('#activeGunName')).toHaveText('QA Handgun');await expect(page.locator('#homeEvents')).toHaveText(String(library.events.filter(row=>row.gunId===library.activeGunId).length));
 await page.locator('.tab[data-view="drills"]').click();await expect(page).toHaveURL(/\/drills\/$/);await page.locator('[data-practice-mode="par"]').click();await expect(page).toHaveURL(/\/par-time-practice\/$/);await expect(page.locator('#practiceGuideLink')).toHaveAttribute('href','/par-time-practice-guide/');await page.locator('#practiceRepetitions').fill('');await page.locator('#practiceGuideLink').click();await expect(page).toHaveURL(/\/par-time-practice-guide\/$/);await page.locator('#practiceGuideBackBtn').click();await expect(page.locator('#practiceRepetitions')).toHaveValue('');await expect(page).toHaveURL(/\/par-time-practice\/$/);
 await page.reload();await expect(page.locator('#practiceConfigure')).toBeVisible();await expect(page.locator('#practice-title')).toHaveText('Par time practice');await expect(page.locator('#activeGunName')).toHaveText('QA Handgun');
 await page.locator('#settingsShortcut').click();await expect(page).toHaveURL(/\/settings\/$/);await page.goBack();await expect(page.locator('#practiceConfigure')).toBeVisible();
});
test('each sequence has a distinct URL and survives cold load, refresh, guide and history navigation',async({page})=>{
 await restore(page);await expect(page.locator('#homeView')).toBeVisible();await expect(page.locator('#appMessage')).not.toBeVisible();
 for(const drill of DRILLS.slice(1)){
  const path=appPathFor({view:'session',preset:drill.id});await page.goto('/drills/');await page.locator("#drillCatalog .preset-card").filter({has:page.getByRole("heading",{name:drill.title,exact:true})}).getByRole("button",{name:"▶ Start Drill",exact:true}).click();await expect(page).toHaveURL(new RegExp(path+'$'));await expect(page.locator('#sessionSteps li')).toHaveCount(drill.steps.length);await expect(page.locator('#sessionGuideLink')).toHaveAttribute('href',guidePathFor('sequence-'+drill.id));await page.reload();await expect(page.locator('#sessionConfigure')).toBeVisible();await expect(page.locator('#sessionSteps')).toContainText(drill.steps[0]==='rack'?'Rack slide':drill.steps[0]==='draw'?'Draw from holster':'Change magazine');await expect(page.locator('#safetyModal')).not.toBeVisible();await expect(page.locator('#sessionRun')).not.toBeVisible();
  await page.locator('#sessionGuideLink').click();await expect(page).toHaveURL(new RegExp(guidePathFor('sequence-'+drill.id)+'$'));await page.goBack();await expect(page).toHaveURL(new RegExp(path+'$'));await expect(page.locator('#sessionConfigure')).toBeVisible();await page.goForward();await expect(page.locator('#practiceGuideView')).toBeVisible();
 }
});
test('public guides read without a gun or microphone and return to their own setup',async({page})=>{
 for(const route of PUBLIC_ROUTES.filter(row=>row.guide)){
  await page.goto(route.path);await expect(page.locator('#statusPill')).toHaveText('Ready');await expect(page.locator('#practiceGuideName')).toHaveText(route.heading);await expect(page.locator('#safetyModal')).not.toBeVisible();await expect(page.locator('#gunSetupView')).not.toBeVisible();await page.locator('#practiceGuideBackBtn').click();await expect(page.locator('#gunSetupView')).toBeVisible();
 }
});
test('legacy bookmarks redirect to flat routes and marketing remains inside About',async({page})=>{
 await page.goto('/app/history/?retained=1');await expect(page).toHaveURL(/\/history\/\?retained=1$/);await expect(page.locator('#gunSetupView')).toBeVisible();
 await page.goto('/welcome/');await expect(page).toHaveURL(/\/about\/$/);await expect(page.locator('#aboutView')).toContainText('Dry-fire practice,');await expect(page.getByRole('link',{name:'Open the free app'})).toBeVisible();await page.getByRole('link',{name:'Open the free app'}).click();await expect(page).toHaveURL(/\/$/);await expect(page.locator('#gunSetupView')).toBeVisible();
});
