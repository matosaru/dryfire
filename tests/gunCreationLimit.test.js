import * as storage from '../src/storage.js';
const removeDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('dryfire-sound-trainer'); request.onsuccess = resolve; request.onerror = () => reject(request.error);
});
beforeEach(removeDb); afterAll(removeDb);
const details = name => ({ name, type: 'Handguns' });
test('public creation allows two and rejects a third atomically with selection/data intact', async () => {
  const gun = await storage.createGun(details('First'), { maxGuns: 2 });
  await storage.saveCustomDrill({ id: 'custom-existing', title: 'Saved press', steps: ['trigger'] }, gun.id);
  await storage.createGun(details('Second'), { maxGuns: 2 });
  const before = await storage.exportBackup();
  await expect(storage.createGun(details('Third'), { maxGuns: 2 })).rejects.toThrow('two guns');
  const after = await storage.exportBackup();
  expect({ ...after, exportedAt: before.exportedAt }).toEqual(before);
});
test('concurrent public creations cannot exceed two saved guns', async () => {
  const results = await Promise.allSettled(['A', 'B', 'C'].map(name => storage.createGun(details(name), { maxGuns: 2 })));
  expect(results.filter(row => row.status === 'fulfilled')).toHaveLength(2);
  expect(await storage.getGuns()).toHaveLength(2);
});
test('legacy multi-gun backups restore, edit and export even when new public creation is blocked', async () => {
  const first = await storage.createGun(details('A'));
  await storage.createGun(details('B'));
  await storage.createGun(details('C'));
  const backup = await storage.exportBackup(); await storage.resetLibrary(); await storage.restoreBackup(backup);
  await storage.updateGun(first.id, details('Renamed')); await storage.setActiveGun(first.id);
  await expect(storage.createGun(details('D'), { maxGuns: 2 })).rejects.toThrow('two guns');
  const result = await storage.exportBackup();
  expect(result.guns).toHaveLength(3); expect(result.guns.find(gun => gun.id === first.id).name).toBe('Renamed');
  expect(result.activeGunId).toBe(first.id);
});
test('deleting below the public limit allows a replacement without touching the remaining gun', async () => {
  const first = await storage.createGun(details('A'), { maxGuns: 2 });
  const second = await storage.createGun(details('B'), { maxGuns: 2 });
  await storage.saveCustomDrill({ id: 'custom-existing', title: 'Saved press', steps: ['trigger'] }, first.id);
  await storage.deleteGun(second.id);
  await storage.createGun(details('Replacement'), { maxGuns: 2 });
  expect(await storage.getGuns()).toHaveLength(2);
  expect(await storage.getCustomDrills(first.id)).toMatchObject([{ id: 'custom-existing', title: 'Saved press' }]);
});
test('invalid creation limits cannot expand the physical library capacity', async () => {
  for (const maxGuns of [0, 6, 1.5, '1', null]) await expect(storage.createGun(details('A'), { maxGuns })).rejects.toThrow('creation limit');
  expect(await storage.getGuns()).toHaveLength(0);
});
