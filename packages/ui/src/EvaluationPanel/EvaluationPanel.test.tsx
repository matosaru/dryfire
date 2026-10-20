/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,cleanup} from '@testing-library/react';
import {EvaluationPanel} from './EvaluationPanel';
afterEach(cleanup);
test('startup defaults and unverified state preserve metric copy',()=>{const view=render(<EvaluationPanel/>);expect(view.container.querySelector('#verifiedCount')).toHaveTextContent('0');expect(view.container.querySelector('#confusionTable')).toBeEmptyDOMElement();view.rerender(<EvaluationPanel value={{verified:0,accuracy:'—',falsePositive:'—',actual:[],predicted:[],matrix:{}}}/>);expect(view.getByText('Verify at least one event below to see the confusion matrix.')).toBeInTheDocument();});
test('matrix retains axis order, counts and actual-other/unknown correct cells',()=>{const view=render(<EvaluationPanel value={{verified:3,accuracy:'67%',falsePositive:'50%',actual:['trigger','other'],predicted:['trigger','unknown'],matrix:{trigger:{trigger:1,unknown:0},other:{trigger:1,unknown:1}}}}/>);expect(view.getByRole('table')).toHaveAccessibleName('Actual sound by predicted label (counts)');expect([...view.container.querySelectorAll('thead th')].map(n=>n.textContent)).toEqual(['Actual ↓ / Predicted →','trigger','unknown']);expect([...view.container.querySelectorAll('td.correct')].map(n=>n.textContent)).toEqual(['1','1']);expect(view.container.querySelector('#accuracyPct')).toHaveTextContent('67%');});
