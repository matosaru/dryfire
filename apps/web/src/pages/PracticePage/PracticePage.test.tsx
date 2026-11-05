/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {PracticePage} from './PracticePage';
afterEach(cleanup);
test('parent uses the original named Back action and service-free controls',()=>{const back=jest.fn(),guide=jest.fn(),action=jest.fn(),v=render(<PracticePage onBack={back} onGuide={guide} onAction={action}/>);const button=v.getByRole('button',{name:'Back to previous screen'});expect(button).toHaveAttribute('id','practiceBackBtn');expect(button).not.toHaveAttribute('data-back');fireEvent.click(button);fireEvent.click(v.getByRole('link',{name:'About this practice'}));fireEvent.click(v.container.querySelector('#practiceLearnBtn')!);fireEvent.click(v.getByRole('button',{name:'Test start sound'}));expect(back).toHaveBeenCalledTimes(1);expect(guide).toHaveBeenCalledTimes(1);expect(action).toHaveBeenNthCalledWith(1,'practiceLearnBtn');expect(action).toHaveBeenNthCalledWith(2,'practiceTestStartSound');});
test('owned configuration/run/review slots and dynamic context preserve structure and escape saved text',()=>{const v=render(<PracticePage title="Single trigger press" gunName="<script>" contextHidden guideHidden configure={<div data-testid="config"/>} run={<div data-testid="run"/>} review={<div data-testid="review"/>} steps={<span>Trigger pull</span>}/>);for(const id of ['config','run','review'])expect(v.getByTestId(id)).toBeInTheDocument();expect(v.container.querySelector('#practiceConfigForm')).toBeNull();expect(v.container.querySelector('.gun-context')).toHaveClass('hidden');expect(v.container.querySelector('#practiceGuideLink')).toHaveClass('hidden');expect(v.getByText('<script>')).toBeInTheDocument();expect(v.container.querySelector('script')).toBeNull();});

test('trigger setup uses shared Sequence cards and app-only timing/sound remain one visibility region',()=>{const v=render(<PracticePage/>);expect(v.container.querySelector('#practiceCountRow')).toHaveClass('session-repetition-field');expect(v.container.querySelector('#practiceParRow')).toHaveClass('session-repetition-field','hidden');expect(v.container.querySelector('#practiceAppTiming')).toContainElement(v.container.querySelector('#practiceStartSound'));expect(v.container.querySelector('[for="practiceStartSound"]')).toHaveClass('session-sound-toggle');expect(v.container.querySelector('#practiceSteps')?.tagName).toBe('OL');});
