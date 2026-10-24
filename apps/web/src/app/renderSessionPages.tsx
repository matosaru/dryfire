import {renderToStaticMarkup} from 'react-dom/server';
import {PracticePage} from '../pages/PracticePage';
import {SequencePage} from '../pages/SequencePage';
import {PracticeGuidePage} from '../pages/PracticeGuidePage';
/** Trusted build-only numeric slots are expanded by the existing compiler. */
export function renderSessionPage(id:'practice'|'session'|'practiceGuide'){
 if(id==='practice')return renderToStaticMarkup(<PracticePage/>);
 if(id==='session')return renderToStaticMarkup(<SequencePage/>);
 return renderToStaticMarkup(<PracticeGuidePage/>);
}
