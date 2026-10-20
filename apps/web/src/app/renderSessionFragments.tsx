import {renderToStaticMarkup} from 'react-dom/server';
import {PracticeRun} from '@dryfire/ui/PracticeRun';
import {PracticeReview} from '@dryfire/ui/PracticeReview';
import {SequenceRun} from '@dryfire/ui/SequenceRun';
import {SequenceReview} from '@dryfire/ui/SequenceReview';
/** Live and synthetic examples compile from the same typed structural components. */
export function renderSessionFragments(){return{
 practiceRun:renderToStaticMarkup(<PracticeRun/>),practiceReview:renderToStaticMarkup(<PracticeReview/>),
 sessionRun:renderToStaticMarkup(<SequenceRun/>),sessionReview:renderToStaticMarkup(<SequenceReview/>),
 examplePracticeRun:renderToStaticMarkup(<PracticeRun prefix="example-"/>),examplePracticeReview:renderToStaticMarkup(<PracticeReview prefix="example-"/>),
 exampleSessionRun:renderToStaticMarkup(<SequenceRun prefix="example-"/>),exampleSessionReview:renderToStaticMarkup(<SequenceReview prefix="example-"/>),
};}
