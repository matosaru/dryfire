/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {PracticePage} from './PracticePage';
afterEach(cleanup);
test('parent uses the original named Back action and service-free controls',()=>{const back=jest.fn(),guide=jest.fn(),action=jest.fn(),v=render(<PracticePage onBack={back} onGuide={guide} onAction={action}/>);const button=v.getByRole('button',{name:'Back to previous screen'});expect(button).toHaveAttribute('id','practiceBackBtn');expect(button).not.toHaveAttribute('data-back');fireEvent.click(button);fireEvent.click(v.getByRole('link',{name:'About this practice'}));fireEvent.click(v.container.querySelector('#practiceLearnBtn')!);expect(back).toHaveBeenCalledTimes(1);expect(guide).toHaveBeenCalledTimes(1);expect(action).toHaveBeenCalledWith('practiceLearnBtn');});
test('owned configuration/run/review slots and dynamic context preserve structure and escape saved text',()=>{const v=render(<PracticePage title="Single trigger press" gunName="<script>" contextHidden guideHidden configure={<div data-testid="config"/>} run={<div data-testid="run"/>} review={<div data-testid="review"/>} steps={<span>Trigger pull</span>}/>);for(const id of ['config','run','review'])expect(v.getByTestId(id)).toBeInTheDocument();expect(v.container.querySelector('#practiceConfigForm')).toBeNull();expect(v.container.querySelector('.gun-context')).toHaveClass('hidden');expect(v.container.querySelector('#practiceGuideLink')).toHaveClass('hidden');expect(v.getByText('<script>')).toBeInTheDocument();expect(v.container.querySelector('script')).toBeNull();});
