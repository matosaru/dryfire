/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeading } from './index.ts';

test('Back is a named keyboard action and does not submit a surrounding form', async () => {
  const back = jest.fn(); const submit = jest.fn((e: React.FormEvent) => e.preventDefault());
  render(<form onSubmit={submit}><PageHeading id="test-title" title="Contact" backLabel="Back" onBack={back} /></form>);
  expect(screen.getByRole('heading', { name: 'Contact', level: 2 })).toHaveAttribute('id', 'test-title');
  const user = userEvent.setup(); await user.tab();
  expect(screen.getByRole('button', { name: 'Back' })).toHaveFocus();
  await user.keyboard('{Enter}'); expect(back).toHaveBeenCalledTimes(1); expect(submit).not.toHaveBeenCalled();
});

test('numbered page headings preserve native fallback binding and the shared title structure',()=>{const result=render(<PageHeading id="learn-title" title="Learn Sounds" eyebrow="01 / SOUND PROFILES" reactBack={false}/>);expect(result.getByText('01 / SOUND PROFILES')).toHaveClass('eyebrow');const back=result.getByRole('button',{name:'Back to previous screen'});expect(back).toHaveAttribute('data-back','');expect(back).not.toHaveAttribute('data-r-back');expect(result.container.querySelector('.section-head>div>h2')).toHaveAttribute('id','learn-title');});
