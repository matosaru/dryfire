import {createHash} from 'node:crypto';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const library=readFileSync(new URL('./fixtures/library.json',import.meta.url));
async function restore(page){
  await page.goto('/');await page.locator('#restoreGunBackupBtn').click();
  await page.locator('#importFile').setInputFiles({name:'library.json',mimeType:'application/json',buffer:library});
  await expect(page.locator('#homeView')).toBeVisible();
}
async function backup(page){
  await page.locator('#settingsShortcut').click();
  const pending=page.waitForEvent('download');await page.locator('#exportBtn').click();
  return JSON.parse(readFileSync(await (await pending).path(),'utf8'));
}

test('editing a nonselected gun preserves selection and every owned record across refresh',async({page})=>{
  page.on('dialog',dialog=>dialog.accept());await restore(page);
  const before=await backup(page);
  await page.locator('#gunSwitcherBtn').click();await page.locator('[data-edit-gun-id="qa-gun-b"]').click();
  await expect(page.locator('#gunName')).toHaveValue('QA Carbine');
  await page.locator('#gunName').fill('Updated carbine');
  await page.locator('[name="gunTypeChoice"][value="Shotguns"]').check();
  await page.locator('#saveGunBtn').click();await expect(page.locator('#gunsView')).toBeVisible();
  await expect(page.locator('#activeGunName')).toHaveText('QA Handgun');
  const after=await backup(page);
  expect(after.activeGunId).toBe(before.activeGunId);
  for(const key of Object.keys(before).filter(key=>!['guns','exportedAt'].includes(key)))expect(after[key]).toEqual(before[key]);
  expect(after.guns.find(gun=>gun.id==='qa-gun-b')).toMatchObject({name:'Updated carbine',type:'Shotguns'});
  expect(after.guns.filter(gun=>gun.id!=='qa-gun-b')).toEqual(before.guns.filter(gun=>gun.id!=='qa-gun-b'));
  await page.reload();await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('#gunSwitcherBtn').click();await page.locator('[data-edit-gun-id="qa-gun-b"]').click();
  await expect(page.locator('#gunName')).toHaveValue('Updated carbine');
  await expect(page.locator('[name="gunTypeChoice"][value="Shotguns"]')).toBeChecked();
});

test('delete cancellation preserves the library; deleting the final gun clears its owned data and returns to setup',async({page})=>{
  let allowDelete=false;
  page.on('dialog',dialog=>dialog.message().startsWith('Delete ')&&!allowDelete?dialog.dismiss():dialog.accept());
  await restore(page);const before=await backup(page);
  await page.locator('#gunSwitcherBtn').click();await page.locator('[data-delete-gun-id="qa-gun-b"]').click();
  await expect(page.locator('.gun-card')).toHaveCount(3);
  const cancelled=await backup(page);
  for(const key of Object.keys(before).filter(key=>key!=='exportedAt'))expect(cancelled[key]).toEqual(before[key]);
  allowDelete=true;await page.locator('#gunSwitcherBtn').click();
  for(const [index,id] of ['qa-gun-b','qa-gun-c','qa-gun-a'].entries()){
    await page.locator(`[data-delete-gun-id="${id}"]`).click();
    if(index<2)await expect(page.locator('.gun-card')).toHaveCount(2-index);
  }
  await expect(page.locator('#gunSetupView')).toBeVisible();
  await expect(page.locator('#gunSetupTitle')).toHaveText('Add your first gun');
  const cleared=await backup(page);
  expect(cleared.guns).toEqual([]);expect(cleared.activeGunId).toBeNull();
  for(const key of ['gunSettings','examples','events','sessions'])expect(cleared[key]).toEqual([]);
  await page.reload();await expect(page.locator('#gunSetupView')).toBeVisible();
});

test('invalid edit drafts survive About and Contact, then Cancel preserves every saved record',async({page})=>{
  page.on('dialog',dialog=>dialog.accept());await restore(page);const before=await backup(page);
  await page.locator('#gunSwitcherBtn').click();await page.locator('[data-edit-gun-id="qa-gun-b"]').click();
  await page.locator('#gunName').fill('');await page.locator('#saveGunBtn').click();
  await expect(page.locator('#gunSetupView')).toBeVisible();await expect(page.locator('#gunName')).toBeFocused();
  await page.evaluate(()=>{window.__gunDraftField=document.getElementById('gunName');});
  for(const id of ['about','contact']){
    await page.locator(`#${id}Btn`).click();await expect(page.locator(`#${id}View`)).toBeVisible();
    await page.locator(`#${id}View [data-react-back]`).click();await expect(page.locator('#gunSetupView')).toBeVisible();
    await expect(page.locator('#gunName')).toHaveValue('');
    await expect(page.locator('[name="gunTypeChoice"][value="Rifles and Carbines"]')).toBeChecked();
    expect(await page.evaluate(()=>document.getElementById('gunName')===window.__gunDraftField)).toBe(true);
  }
  await page.locator('#cancelGunSetupBtn').click();await expect(page.locator('#gunsView')).toBeVisible();
  const after=await backup(page);
  for(const key of Object.keys(before).filter(key=>key!=='exportedAt'))expect(after[key]).toEqual(before[key]);
});

test('React Settings retains backup picker, disclosure, theme and action ownership across repeated visits',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',dialog=>dialog.accept());
  const loaded=page.waitForResponse(response=>/\/assets\/settingsPage-/.test(response.url()));
  await restore(page);await loaded;
  await page.locator('#settingsShortcut').click();
  await expect(page.locator('#settingsView')).toHaveAttribute('data-react-settings','');
  if(await page.locator('#previewTestMode').count()){await page.locator('#previewTestMode').selectOption('free');await expect(page.locator('#previewModeBadge')).toContainText('Free mode');await page.locator('#previewTestMode').selectOption('full');await expect(page.locator('#previewModeBadge')).toContainText('Full mode');}
  await page.locator('.install-details summary').click();
  await expect(page.locator('.install-details')).toHaveAttribute('open','');
  await page.locator('#appearance').selectOption('light');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  const input=await page.locator('#importFile').elementHandle();
  await page.locator('.tab[data-view="home"]').click();await page.locator('#settingsShortcut').click();
  await expect(page.locator('.install-details')).toHaveAttribute('open','');
  expect(await input.evaluate(node=>node===document.getElementById('importFile'))).toBe(true);
  await expect(page.locator('#appearance')).toHaveValue('light');
  const download=page.waitForEvent('download');await page.locator('#exportBtn').click();
  const saved=JSON.parse(readFileSync(await(await download).path(),'utf8'));expect(saved.guns).toHaveLength(3);
  const picker=page.waitForEvent('filechooser');await page.locator('#importBtn').click();
  await(await picker).setFiles({name:'library.json',mimeType:'application/json',buffer:library});
  await expect(page.locator('#homeView')).toBeVisible();
  await page.locator('#settingsShortcut').click();await page.locator('#resetModelBtn').click();await expect(page.locator('#soundResetOutcome')).toContainText('Saved guns, presets and history were kept.');
  expect(errors).toEqual([]);
});

for(const theme of ['dark','light'])test(`delayed Settings code keeps controls and pixel-identical ${theme} handoff`,async({page})=>{
  let release;const blocked=new Promise(resolve=>{release=resolve;});
  await page.route('**/assets/settingsPage-*.js',async route=>{await blocked;await route.continue();});
  page.on('dialog',dialog=>dialog.accept());await restore(page);
  await page.locator('#settingsShortcut').click();
  await expect(page.locator('#settingsView')).not.toHaveAttribute('data-react-settings');
  await page.locator('#appearance').selectOption(theme);await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  const file=await page.locator('#importFile').elementHandle();
  const before=await page.locator('#settingsView').screenshot({animations:'disabled'});
  const loaded=page.waitForResponse(response=>/\/assets\/settingsPage-/.test(response.url()));release();await loaded;
  expect(await file.evaluate(node=>node===document.getElementById('importFile'))).toBe(true);
  await expect(page.locator('#settingsView')).not.toHaveAttribute('data-react-settings');
  await page.locator('.tab[data-view="home"]').click();await page.locator('#settingsShortcut').click();
  await expect(page.locator('#settingsView')).toHaveAttribute('data-react-settings','');
  expect(await file.evaluate(node=>node===document.getElementById('importFile'))).toBe(true);
  expect(createHash('sha256').update(await page.locator('#settingsView').screenshot({animations:'disabled'})).digest('hex')).toBe(createHash('sha256').update(before).digest('hex'));
});
