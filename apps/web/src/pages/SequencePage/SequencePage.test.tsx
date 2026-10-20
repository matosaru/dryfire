/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {SequencePage} from './SequencePage';
afterEach(cleanup);
test('parent uses the original named Back action and service-free controls',()=>{const back=jest.fn(),guide=jest.fn(),action=jest.fn(),v=render(<SequencePage onBack={back} onGuide={guide} onAction={action}/>);const button=v.getByRole('button',{name:'Back to previous screen'});expect(button).toHaveAttribute('id','sessionBackBtn');expect(button).not.toHaveAttribute('data-back');fireEvent.click(button);fireEvent.click(v.getByRole('link',{name:'About this practice'}));fireEvent.click(v.container.querySelector('#sessionLearnBtn')!);expect(back).toHaveBeenCalledTimes(1);expect(guide).toHaveBeenCalledTimes(1);expect(action).toHaveBeenCalledWith('sessionLearnBtn');});
test('owned configuration/run/review slots and dynamic context preserve structure and escape saved text',()=>{const v=render(<SequencePage title="Single trigger press" gunName="<script>" contextHidden guideHidden configure={<div data-testid="config"/>} run={<div data-testid="run"/>} review={<div data-testid="review"/>} presetName="One sound" steps={<li>Trigger pull</li>}/>);for(const id of ['config','run','review'])expect(v.getByTestId(id)).toBeInTheDocument();expect(v.container.querySelector('#sessionConfigForm')).toBeNull();expect(v.container.querySelector('.gun-context')).toHaveClass('hidden');expect(v.container.querySelector('#sessionGuideLink')).toHaveClass('hidden');expect(v.getByText('<script>')).toBeInTheDocument();expect(v.container.querySelector('script')).toBeNull();});
