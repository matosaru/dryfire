/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {mountSoundCheckPage} from './soundCheckPage.tsx';

test('mounts the Sound Check form on demand and disposes its root',()=>{
 const host=document.createElement('section');document.body.append(host);
 const page=mountSoundCheckPage(host,'QA Handgun');
 expect(host).toHaveAttribute('data-react-sound-check');
 expect(host.querySelector('#soundCheckStartBtn')).toBeDisabled();
 expect(host).toHaveTextContent('Check the learned trigger profile for QA Handgun.');
 expect(host).toHaveTextContent('Close: under 30 cm');
 page.updateUnits('imperial');
 expect(host).toHaveTextContent('Close: under 1 ft');
 page.dispose();
 page.dispose();
 page.updateUnits('metric');
 expect(host).not.toHaveAttribute('data-react-sound-check');
 expect(host).toBeEmptyDOMElement();
 host.remove();
});
