import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function setup(){
 const practice={showRecord:jest.fn()},session={};
 const context={practiceController:null,sessionController:null,createPracticeController:jest.fn(()=>practice),createSessionController:jest.fn(()=>session),
  practiceContext:jest.fn(),titleFor:jest.fn(),ensureSafe:jest.fn(),switchView:jest.fn(),goBack:jest.fn(),showError:jest.fn(),setStatus:jest.fn(),renderLiveButton:jest.fn(),renderClassCards:jest.fn(),reportAudioProcessing:jest.fn(),reportVibration:jest.fn(),vibrationFeedback:true,vibrationRejected:false,drillsPage:null};
 const initialize=vm.runInNewContext(source.slice(source.indexOf('function initializeTimedControllers()'),source.indexOf('async function loadActiveGun('))+'\ninitializeTimedControllers;',context);return{context,practice,session,initialize};
}
test('timing owners are not constructed until requested and are created only once',()=>{
 const s=setup();expect(s.context.createPracticeController).not.toHaveBeenCalled();s.initialize();s.initialize();expect(s.context.createPracticeController).toHaveBeenCalledTimes(1);expect(s.context.createSessionController).toHaveBeenCalledTimes(1);expect(s.context.practiceController).toBe(s.practice);expect(s.context.sessionController).toBe(s.session);
});
test('deferred owners retain context, action, feedback, catalog locks and saved-record ports',()=>{
 const {context:c,practice,initialize}=setup();initialize();const p=c.createPracticeController.mock.calls[0][0],s=c.createSessionController.mock.calls[0][0];expect(p.getContext).toBe(c.practiceContext);expect(s.getContext).toBe(c.practiceContext);p.onBack();expect(c.goBack).toHaveBeenCalledWith('drills');p.onChange();expect(c.renderLiveButton).toHaveBeenCalledTimes(1);expect(c.renderClassCards).not.toHaveBeenCalled();expect(c.renderLiveButton).toHaveBeenCalledWith(false);expect(p.onCatalogLock(true)).toBe(false);c.drillsPage={update:jest.fn()};expect(p.onCatalogLock(true)).toBe(true);expect(c.drillsPage.update).toHaveBeenCalledWith({practiceDisabled:true});expect(p.vibrationEnabled()).toBe(true);c.vibrationRejected=true;expect(s.vibrationEnabled()).toBe(false);const record={id:'saved'};s.onPracticeRecord(record);expect(practice.showRecord).toHaveBeenCalledWith(record);expect(p.onProcessing).toBe(c.reportAudioProcessing);expect(s.onVibration).toBe(c.reportVibration);
});

test('practice feedback does not recursively refresh its already rendered run/review; external changes still refresh it',()=>{
 const context={liveSession:null,sessionController:null,practiceController:{locked:()=>false,refresh:jest.fn()},profileLoading:false,busy:false,livePendingStart:false,drillsPage:{update:jest.fn()},liveText:jest.fn(),liveClass:jest.fn(),liveDisabled:jest.fn(),settingsDisabled:jest.fn(),historyDisabled:jest.fn(),renderLearningLocks:jest.fn(),renderGunControls:jest.fn(),renderPreferences:jest.fn(),profileLocked:()=>false};
 const render=vm.runInNewContext(source.slice(source.indexOf('function renderLiveButton('),source.indexOf('async function stopLive()'))+'\nrenderLiveButton;',context);
 render(false);expect(context.practiceController.refresh).not.toHaveBeenCalled();expect(context.renderGunControls).toHaveBeenCalledTimes(1);expect(context.renderPreferences).toHaveBeenCalledTimes(1);render();expect(context.practiceController.refresh).toHaveBeenCalledTimes(1);
});
