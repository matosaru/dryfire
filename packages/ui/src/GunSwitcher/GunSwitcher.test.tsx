/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { GunSwitcher } from './GunSwitcher.tsx';

test('initial no-gun markup preserves the hidden switcher and unknown artwork',()=>{
  render(<GunSwitcher />);
  expect(document.getElementById('gunSwitcherBtn')).toHaveClass('hidden');
  expect(document.getElementById('gunSwitcherBtn')).toHaveAttribute('aria-label','Choose a gun');
  expect(document.getElementById('activeGunImage')).toHaveAttribute('src','/gun-types/unknown.svg');
});
test('selected names are escaped, custom artwork is decorative and disabled actions stay blocked',async()=>{
  const onSelect=jest.fn(),name='<img src=x onerror=alert(1)>';
  const {rerender}=render(<GunSwitcher hidden={false} name={name} type="Handguns" imageSrc="/gun-types/handgun.svg" onSelect={onSelect} />);
  await userEvent.click(screen.getByRole('button',{name:`Switch gun. Selected: ${name}, Handguns`}));
  expect(onSelect).toHaveBeenCalledTimes(1);expect(document.querySelectorAll('img')).toHaveLength(1);
  rerender(<GunSwitcher hidden={false} name="Gun" disabled title="Finish recording" onSelect={onSelect} />);
  const button=screen.getByRole('button',{name:'Switch gun. Selected: Gun, type not set'});
  await userEvent.click(button);expect(onSelect).toHaveBeenCalledTimes(1);expect(button).toHaveAttribute('title','Finish recording');
});
