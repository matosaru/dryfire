/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {renderToStaticMarkup} from 'react-dom/server';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {PracticeRun} from './PracticeRun.tsx';
// @ts-expect-error Frozen native DOM normalization is the cross-template characterization boundary.
import {semanticTree} from '../../../../tests/helpers/guidePresentation.js';
afterEach(cleanup);
test.each(['','example-'])('released structure and accessible ID references match with prefix %s',prefix=>{const native=document.createElement('div'),actual=document.createElement('div');native.innerHTML=readFileSync(new URL('../../../../tests/fixtures/session-fragments/practice-run.html',import.meta.url),'utf8').replace(/\bid="([^"]+)"/g,(_match,id)=>`id="${prefix}${id}"`).replace(/\b(aria-labelledby|aria-describedby|for)="([^"]+)"/g,(_match,attr,ids)=>`${attr}="${ids.split(' ').map((id:string)=>prefix+id).join(' ')}"`);actual.innerHTML=renderToStaticMarkup(<PracticeRun prefix={prefix}/>);expect(semanticTree(actual)).toEqual(semanticTree(native));});
test('all action dispatch is explicit and shared controls acquire no services',()=>{const action=jest.fn(),view=render(<PracticeRun prefix="example-" onAction={action}/>);const buttons=view.container.querySelectorAll<HTMLButtonElement>('button');buttons.forEach(button=>fireEvent.click(button));expect(action.mock.calls.map(call=>call[0])).toEqual([...buttons].map(button=>button.id.slice(8)));view.rerender(<PracticeRun/>);view.container.querySelectorAll('button').forEach(button=>fireEvent.click(button));expect(action).toHaveBeenCalledTimes(buttons.length);});
