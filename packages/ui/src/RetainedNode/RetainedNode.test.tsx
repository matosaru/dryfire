/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {StrictMode} from 'react';
import {render,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {RetainedNode} from './RetainedNode.tsx';
test('native values and event ownership survive StrictMode, rerenders and replacement',()=>{const input=document.createElement('input'),changed=jest.fn();input.value='Unsaved draft';input.addEventListener('change',changed);const result=render(<StrictMode><RetainedNode node={input}/></StrictMode>);expect(result.container.querySelector('input')).toBe(input);expect(input.value).toBe('Unsaved draft');fireEvent.change(input);expect(changed).toHaveBeenCalledTimes(1);result.rerender(<StrictMode><RetainedNode node={input}/></StrictMode>);expect(result.container.querySelectorAll('input')).toHaveLength(1);const replacement=document.createElement('section');result.rerender(<StrictMode><RetainedNode node={replacement}/></StrictMode>);expect(result.container.querySelector('input')).toBeNull();expect(result.container.firstElementChild).toHaveStyle({display:'contents'});result.unmount();expect(replacement.parentNode).toBeNull();});
test('cleanup leaves a node already moved by its feature owner untouched',()=>{const node=document.createElement('form'),other=document.createElement('div');const result=render(<RetainedNode node={node}/>);other.append(node);result.unmount();expect(node.parentNode).toBe(other);});
