import * as storage from '../src/storage.js';
const removeDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('dryfire-sound-trainer'); request.onsuccess = resolve; request.onerror = () => reject(request.error);
});
beforeEach(removeDb); afterAll(removeDb);
const details = name => ({ name, type: 'Handguns' });
test('public creation rejects a second gun atomically and keeps selection/data intact', async () => {
  const gun = await storage.createGun(details('First'), { maxGuns: 1 });
  await storage.saveCustomDrill({ id: 'custom-existing', title: 'Saved press', steps: ['trigger'] }, gun.id);
  const before = await storage.exportBackup();
  await expect(storage.createGun(details('Second'), { maxGuns: 1 })).rejects.toThrow('one gun');
  const after = await storage.exportBackup();
  expect({ ...after, exportedAt: before.exportedAt }).toEqual(before);
});
test('concurrent public creations cannot both pass the capacity check', async () => {
  const results = await Promise.allSettled(['A', 'B'].map(name => storage.createGun(details(name), { maxGuns: 1 })));
  expect(results.filter(row => row.status === 'fulfilled')).toHaveLength(1);
  expect(await storage.getGuns()).toHaveLength(1);
});
test('legacy multi-gun backups restore, edit and export even when new public creation is blocked', async () => {
  const first = await storage.createGun(details('A'));
  await storage.createGun(details('B'));
  const backup = await storage.exportBackup(); await storage.resetLibrary(); await storage.restoreBackup(backup);
  await storage.updateGun(first.id, details('Renamed')); await storage.setActiveGun(first.id);
  await expect(storage.createGun(details('C'), { maxGuns: 1 })).rejects.toThrow('one gun');
  const result = await storage.exportBackup();
  expect(result.guns).toHaveLength(2); expect(result.guns.find(gun => gun.id === first.id).name).toBe('Renamed');
  expect(result.activeGunId).toBe(first.id);
});
test('invalid creation limits cannot expand the physical library capacity', async () => {
  for (const maxGuns of [0, 6, 1.5, '1', null]) await expect(storage.createGun(details('A'), { maxGuns })).rejects.toThrow('creation limit');
  expect(await storage.getGuns()).toHaveLength(0);
});
