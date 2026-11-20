/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { CalibrationCatalog } from './CalibrationCatalog.tsx';
const messages={categories:{reset:{title:'Trigger reset clicks',description:'Examples of clicks that must not count as a shot.'},noise:{title:'Other noise / handling',description:'Background and handling sounds to reject.'},cue:{title:'External start beep',description:'Required only for the External beep start option.'}},train:'Train',reset:'Reset',progress:(description:string,count:number,maximum:number)=>`${description} ${count} / ${maximum} samples.`,limitReached:' Recording limit reached; existing samples are kept.'};

test('the prerendered catalog has all three categories and safe disabled defaults',()=>{
  render(<CalibrationCatalog messages={messages}/>);
  expect(screen.getAllByRole('article')).toHaveLength(3);
  for(const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  expect(screen.getByText(/Examples of clicks.*0 \/ 10 samples/)).toBeInTheDocument();
});
test('counts enforce the cap and reset availability while callbacks retain the category',async()=>{
  const record=jest.fn(),reset=jest.fn();
  const {rerender}=render(<CalibrationCatalog messages={messages} locked={false} counts={{reset:1,cue:10}} onRecord={record} onReset={reset} />);
  const [press,noise,cue]=screen.getAllByRole('article');
  await userEvent.click(within(press).getByRole('button',{name:'Train'}));
  await userEvent.click(within(press).getByRole('button',{name:'Reset'}));
  expect(record).toHaveBeenCalledWith('reset');expect(reset).toHaveBeenCalledWith('reset');
  expect(within(noise).getByRole('button',{name:'Reset'})).toBeDisabled();
  expect(within(cue).getByRole('button',{name:'Train'})).toBeDisabled();
  expect(within(cue).getByText(/limit reached; existing samples are kept/)).toBeInTheDocument();
  rerender(<CalibrationCatalog messages={messages} locked counts={{reset:1}} />);
  for(const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  rerender(<CalibrationCatalog messages={messages} locked={false} counts={{reset:1}} />);
  await userEvent.click(screen.getAllByRole('button',{name:'Train'})[0]);
  await userEvent.click(screen.getAllByRole('button',{name:'Reset'})[0]);
});
