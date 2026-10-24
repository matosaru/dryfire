/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
import {RecognitionList} from './RecognitionList';
afterEach(cleanup);
test('initial and empty lists differ; rows retain optional sequence, verification drafts and safe text',()=>{
 const verify=jest.fn(),options=[{value:'',title:'Not verified'},{value:'trigger',title:'Trigger pull'},{value:'other',title:'Other / noise'}];
 const view=render(<RecognitionList options={options}/>);expect(view.container).toBeEmptyDOMElement();view.rerender(<RecognitionList rows={[]} options={options}/>);expect(view.getByText('No recognition events yet.')).toHaveClass('empty-state');
 const rows=[{id:'a',title:'Trigger pull',date:'Today',score:'95/100',actualLabel:'trigger',sequence:'Saved sequence · Step detected'},{id:'b',title:'<script>',date:'Yesterday',score:'0/100',actualLabel:''}];
 view.rerender(<RecognitionList rows={rows} options={options} onVerify={verify}/>);expect(view.container.querySelector('script')).toBeNull();expect(view.getByText(rows[0].sequence!)).toBeInTheDocument();
 const select=view.getByLabelText('Actual sound for Today');expect(select).toHaveValue('trigger');fireEvent.change(select,{target:{value:'other'}});expect(verify).toHaveBeenCalledWith('a','other');
 view.rerender(<RecognitionList rows={rows} options={options} onVerify={verify}/>);expect(view.getByLabelText('Actual sound for Today')).toBe(select);expect(select).toHaveValue('other');
 view.rerender(<RecognitionList rows={[{...rows[0],actualLabel:'other'}]} options={options}/>);expect(view.getByLabelText('Actual sound for Today')).toHaveValue('other');fireEvent.change(view.getByRole('combobox'),{target:{value:''}});
});
